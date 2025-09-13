from fastapi import FastAPI, HTTPException, Depends, APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.websockets import WebSocketState
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import json
import asyncio
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'investaz-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(title="InvestAZ API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, is_admin: bool = False):
        await websocket.accept()
        if is_admin:
            self.admin_connections.append(websocket)
        else:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, is_admin: bool = False):
        if is_admin and websocket in self.admin_connections:
            self.admin_connections.remove(websocket)
        elif not is_admin and websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.send_text(message)

    async def broadcast_to_admins(self, message: str):
        dead_connections = []
        for connection in self.admin_connections:
            try:
                if connection.client_state == WebSocketState.CONNECTED:
                    await connection.send_text(message)
                else:
                    dead_connections.append(connection)
            except:
                dead_connections.append(connection)
        
        for dead_conn in dead_connections:
            self.admin_connections.remove(dead_conn)

    async def broadcast_to_users(self, message: str):
        dead_connections = []
        for connection in self.active_connections:
            try:
                if connection.client_state == WebSocketState.CONNECTED:
                    await connection.send_text(message)
                else:
                    dead_connections.append(connection)
            except:
                dead_connections.append(connection)
        
        for dead_conn in dead_connections:
            self.active_connections.remove(dead_conn)

manager = ConnectionManager()

# Enums
class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class MessageType(str, Enum):
    SUPPORT = "support"
    NOTIFICATION = "notification"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: str
    balance: float = 10.0  # 10 AZN registration bonus
    total_invested: float = 0.0
    total_earned: float = 0.0
    is_admin: bool = False
    join_date: datetime = Field(default_factory=datetime.utcnow)
    has_seen_welcome: bool = False

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    balance: float
    total_invested: float
    total_earned: float
    join_date: datetime
    has_seen_welcome: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class InvestmentPackage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    package_type: str  # platinum, titanium, gold
    invested_amount: float
    multiplier: float
    duration_days: int
    start_date: datetime = Field(default_factory=datetime.utcnow)
    accumulated_earnings: float = 0.0
    is_active: bool = True

class InvestmentPackageCreate(BaseModel):
    package_type: str
    invested_amount: float

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: TransactionType
    amount: float
    status: TransactionStatus = TransactionStatus.PENDING
    card_name: Optional[str] = None
    card_number: Optional[str] = None
    receipt_filename: Optional[str] = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
    processed_date: Optional[datetime] = None
    admin_notes: Optional[str] = None

class TransactionCreate(BaseModel):
    type: TransactionType
    amount: float
    card_name: Optional[str] = None
    card_number: Optional[str] = None

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    admin_id: Optional[str] = None
    message_type: MessageType = MessageType.SUPPORT
    content: str
    is_from_admin: bool = False
    created_date: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False

class MessageCreate(BaseModel):
    content: str
    message_type: MessageType = MessageType.SUPPORT

class AdminApproveTransaction(BaseModel):
    transaction_id: str
    approve: bool
    admin_notes: Optional[str] = None

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token required")
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_data = await db.users.find_one({"id": user_id})
    if user_data is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_data)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Package definitions
PACKAGE_DEFINITIONS = {
    "platinum": {"name": "Platinum Paket", "min_amount": 50, "max_amount": 250, "multiplier": 3.0, "duration": 30},
    "titanium": {"name": "Titanium Paket", "min_amount": 250, "max_amount": 500, "multiplier": 4.0, "duration": 45},
    "gold": {"name": "Gold Paket", "min_amount": 500, "max_amount": 1000, "multiplier": 4.5, "duration": 60}
}

# Authentication endpoints
@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_data: UserLogin):
    user_doc = await db.users.find_one({"email": user_data.email})
    if not user_doc or not verify_password(user_data.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_doc["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

# Package endpoints
@api_router.get("/packages")
async def get_package_definitions():
    return PACKAGE_DEFINITIONS

@api_router.post("/packages/purchase", response_model=InvestmentPackage)
async def purchase_package(
    package_data: InvestmentPackageCreate,
    current_user: User = Depends(get_current_user)
):
    if package_data.package_type not in PACKAGE_DEFINITIONS:
        raise HTTPException(status_code=400, detail="Invalid package type")
    
    pkg_def = PACKAGE_DEFINITIONS[package_data.package_type]
    
    if not (pkg_def["min_amount"] <= package_data.invested_amount <= pkg_def["max_amount"]):
        raise HTTPException(
            status_code=400, 
            detail=f"Investment amount must be between {pkg_def['min_amount']} and {pkg_def['max_amount']} AZN"
        )
    
    if current_user.balance < package_data.invested_amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Deactivate existing packages
    await db.investment_packages.update_many(
        {"user_id": current_user.id, "is_active": True},
        {"$set": {"is_active": False}}
    )
    
    # Create new package
    investment_package = InvestmentPackage(
        user_id=current_user.id,
        package_type=package_data.package_type,
        invested_amount=package_data.invested_amount,
        multiplier=pkg_def["multiplier"],
        duration_days=pkg_def["duration"]
    )
    
    await db.investment_packages.insert_one(investment_package.dict())
    
    # Update user balance and stats
    new_balance = current_user.balance - package_data.invested_amount
    new_total_invested = current_user.total_invested + package_data.invested_amount
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"balance": new_balance, "total_invested": new_total_invested}}
    )
    
    # Notify admins
    await manager.broadcast_to_admins(json.dumps({
        "type": "package_purchase",
        "user_name": current_user.name,
        "package_type": package_data.package_type,
        "amount": package_data.invested_amount
    }))
    
    return investment_package

@api_router.get("/packages/my", response_model=List[InvestmentPackage])
async def get_my_packages(current_user: User = Depends(get_current_user)):
    packages = await db.investment_packages.find({"user_id": current_user.id}).to_list(100)
    return [InvestmentPackage(**pkg) for pkg in packages]

@api_router.post("/packages/{package_id}/collect")
async def collect_earnings(package_id: str, current_user: User = Depends(get_current_user)):
    package = await db.investment_packages.find_one({"id": package_id, "user_id": current_user.id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    if package["accumulated_earnings"] < 0.01:
        raise HTTPException(status_code=400, detail="No earnings to collect")
    
    earnings = package["accumulated_earnings"]
    
    # Update user balance and stats
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"balance": earnings, "total_earned": earnings}}
    )
    
    # Reset package earnings
    await db.investment_packages.update_one(
        {"id": package_id},
        {"$set": {"accumulated_earnings": 0.0}}
    )
    
    return {"collected_amount": earnings, "message": "Earnings collected successfully"}

# Transaction endpoints
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user)
):
    if transaction_data.type == TransactionType.WITHDRAW:
        if current_user.balance < transaction_data.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Deduct from balance immediately
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"balance": -transaction_data.amount}}
        )
    
    transaction = Transaction(
        user_id=current_user.id,
        type=transaction_data.type,
        amount=transaction_data.amount,
        card_name=transaction_data.card_name,
        card_number=transaction_data.card_number
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    # Notify admins
    await manager.broadcast_to_admins(json.dumps({
        "type": "new_transaction",
        "transaction_type": transaction_data.type,
        "user_name": current_user.name,
        "amount": transaction_data.amount,
        "transaction_id": transaction.id
    }))
    
    return transaction

@api_router.post("/transactions/{transaction_id}/upload-receipt")
async def upload_receipt(
    transaction_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    transaction = await db.transactions.find_one({"id": transaction_id, "user_id": current_user.id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["type"] != "deposit":
        raise HTTPException(status_code=400, detail="Receipts are only for deposits")
    
    # Save file
    upload_dir = Path("/app/uploads")
    upload_dir.mkdir(exist_ok=True)
    
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{transaction_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = upload_dir / filename
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update transaction
    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {"receipt_filename": filename}}
    )
    
    # Notify admins
    await manager.broadcast_to_admins(json.dumps({
        "type": "receipt_uploaded",
        "transaction_id": transaction_id,
        "user_name": current_user.name,
        "filename": filename
    }))
    
    return {"message": "Receipt uploaded successfully"}

@api_router.get("/transactions/my", response_model=List[Transaction])
async def get_my_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({"user_id": current_user.id}).sort("created_date", -1).to_list(100)
    return [Transaction(**txn) for txn in transactions]

# Message endpoints
@api_router.post("/messages", response_model=Message)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    message = Message(
        user_id=current_user.id,
        content=message_data.content,
        message_type=message_data.message_type,
        is_from_admin=False
    )
    
    await db.messages.insert_one(message.dict())
    
    # Notify admins
    await manager.broadcast_to_admins(json.dumps({
        "type": "new_message",
        "user_name": current_user.name,
        "user_id": current_user.id,
        "content": message_data.content,
        "message_id": message.id
    }))
    
    return message

@api_router.get("/messages/my", response_model=List[Message])
async def get_my_messages(current_user: User = Depends(get_current_user)):
    messages = await db.messages.find({"user_id": current_user.id}).sort("created_date", -1).to_list(100)
    return [Message(**msg) for msg in messages]

# Admin endpoints
@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_admin: User = Depends(get_current_admin)):
    users = await db.users.find({"is_admin": False}).to_list(1000)
    return [UserResponse(**user) for user in users]

@api_router.get("/admin/transactions", response_model=List[Transaction])
async def get_all_transactions(current_admin: User = Depends(get_current_admin)):
    transactions = await db.transactions.find().sort("created_date", -1).to_list(1000)
    return [Transaction(**txn) for txn in transactions]

@api_router.post("/admin/transactions/approve")
async def approve_transaction(
    approval_data: AdminApproveTransaction,
    current_admin: User = Depends(get_current_admin)
):
    transaction = await db.transactions.find_one({"id": approval_data.transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] != "pending":
        raise HTTPException(status_code=400, detail="Transaction already processed")
    
    new_status = TransactionStatus.APPROVED if approval_data.approve else TransactionStatus.REJECTED
    
    # Update transaction
    await db.transactions.update_one(
        {"id": approval_data.transaction_id},
        {"$set": {
            "status": new_status,
            "processed_date": datetime.utcnow(),
            "admin_notes": approval_data.admin_notes
        }}
    )
    
    # If deposit approved, add to user balance
    if approval_data.approve and transaction["type"] == "deposit":
        await db.users.update_one(
            {"id": transaction["user_id"]},
            {"$inc": {"balance": transaction["amount"]}}
        )
    
    # If withdrawal rejected, refund the balance
    if not approval_data.approve and transaction["type"] == "withdraw":
        await db.users.update_one(
            {"id": transaction["user_id"]},
            {"$inc": {"balance": transaction["amount"]}}
        )
    
    return {"message": "Transaction processed successfully"}

@api_router.post("/admin/messages/{message_id}/reply", response_model=Message)
async def reply_to_message(
    message_id: str,
    reply_content: dict,
    current_admin: User = Depends(get_current_admin)
):
    original_message = await db.messages.find_one({"id": message_id})
    if not original_message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    reply_message = Message(
        user_id=original_message["user_id"],
        admin_id=current_admin.id,
        content=reply_content["content"],
        message_type=MessageType.SUPPORT,
        is_from_admin=True
    )
    
    await db.messages.insert_one(reply_message.dict())
    
    return reply_message

@api_router.get("/admin/messages", response_model=List[Message])
async def get_all_messages(current_admin: User = Depends(get_current_admin)):
    messages = await db.messages.find().sort("created_date", -1).to_list(1000)
    return [Message(**msg) for msg in messages]

# WebSocket endpoints
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle real-time updates for users
            await manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/admin/{admin_id}")
async def admin_websocket_endpoint(websocket: WebSocket, admin_id: str):
    await manager.connect(websocket, is_admin=True)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle admin real-time updates
            await manager.send_personal_message(f"Admin Echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, is_admin=True)

# Background task for updating package earnings
async def update_package_earnings():
    while True:
        try:
            packages = await db.investment_packages.find({"is_active": True}).to_list(1000)
            
            for package in packages:
                pkg_def = PACKAGE_DEFINITIONS.get(package["package_type"])
                if not pkg_def:
                    continue
                
                start_date = package["start_date"]
                now = datetime.utcnow()
                seconds_passed = (now - start_date).total_seconds()
                
                total_earnings = package["invested_amount"] * pkg_def["multiplier"]
                earnings_per_second = (total_earnings - package["invested_amount"]) / (pkg_def["duration"] * 24 * 60 * 60)
                
                new_accumulated = min(
                    earnings_per_second * seconds_passed,
                    total_earnings - package["invested_amount"]
                )
                
                await db.investment_packages.update_one(
                    {"id": package["id"]},
                    {"$set": {"accumulated_earnings": max(0, new_accumulated)}}
                )
            
            await asyncio.sleep(1)  # Update every second
            
        except Exception as e:
            print(f"Error updating package earnings: {e}")
            await asyncio.sleep(5)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create default admin user if not exists
    admin_exists = await db.users.find_one({"email": "admin@investaz.com"})
    if not admin_exists:
        admin_user = User(
            email="admin@investaz.com",
            name="Batu",
            password_hash=get_password_hash("18061999"),
            is_admin=True,
            balance=0
        )
        await db.users.insert_one(admin_user.dict())
        print("Default admin user created: admin@investaz.com / 18061999")
    
    # Start background task
    asyncio.create_task(update_package_earnings())

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Add uploads directory endpoint
@api_router.get("/uploads/{filename}")
async def get_upload(filename: str):
    file_path = Path(f"/app/uploads/{filename}")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return {"message": "File found", "filename": filename}