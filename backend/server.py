from fastapi import FastAPI, HTTPException, Depends, APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from fastapi.websockets import WebSocketState
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, BeforeValidator, PlainSerializer, WithJsonSchema
from typing import List, Optional, Dict, Any, Annotated
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import json
import asyncio
from enum import Enum
import random
from bson import ObjectId

# Fix MongoDB ObjectId serialization
def check_object_id(value: ObjectId | str | None) -> ObjectId | None:
    if value is None:
        return None
    if isinstance(value, (ObjectId, str)) and ObjectId.is_valid(value):
        return ObjectId(value)
    raise ValueError(f"{value} is not a valid ObjectId")

# Custom ObjectId type for Pydantic
OID = Annotated[
    ObjectId | str | None,
    Field(None),
    BeforeValidator(check_object_id),
    PlainSerializer(func=lambda x: None if x is None else str(x), return_type=str | None),
    WithJsonSchema({"type": "string"}, mode="validation"),
    WithJsonSchema({"type": "string"}, mode="serialization"),
]

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.admin_connections: List[WebSocket] = []

    async def connect_user(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_connections.append(websocket)

    def disconnect_user(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    def disconnect_admin(self, websocket: WebSocket):
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)

    async def send_to_user(self, user_id: str, message: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_text(message)
            except:
                self.disconnect_user(user_id)

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
    user_code: str = Field(default_factory=lambda: generate_user_code())
    balance: float = 10.0  # 10 AZN registration bonus
    total_invested: float = 0.0
    total_earned: float = 0.0
    is_admin: bool = False
    join_date: datetime = Field(default_factory=datetime.utcnow)
    has_seen_welcome: bool = False

def generate_user_code():
    """Generate unique user code starting with AZ"""
    # Get next sequential number
    import time
    timestamp = int(time.time())
    random_part = random.randint(100, 999)
    return f"AZ{timestamp % 100000}{random_part}"

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
    user_code: str
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
    last_collection_time: Optional[datetime] = None  # NEW: Track when earnings were last collected
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

class AdminUpdateBalance(BaseModel):
    user_id: str
    new_balance: float
    notes: Optional[str] = None

class AdminStats(BaseModel):
    total_users: int
    active_packages: int
    total_deposits: float
    total_withdrawals: float
    pending_transactions: int

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

# Package definitions - Updated limits per user requirements
PACKAGE_DEFINITIONS = {
    "gold": {"name": "Gold Paket", "min_amount": 50, "max_amount": 250, "multiplier": 4.5, "duration": 60},
    "titanium": {"name": "Titanium Paket", "min_amount": 250, "max_amount": 500, "multiplier": 4.0, "duration": 45},
    "platinum": {"name": "Platinum Paket", "min_amount": 500, "max_amount": 2000, "multiplier": 3.0, "duration": 30}
}

# Collection cooldown time (30 minutes)
COLLECTION_COOLDOWN_MINUTES = 30

# Authentication endpoints
@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate unique user code
    user_code = generate_user_code()
    
    # Ensure code is unique
    while await db.users.find_one({"user_code": user_code}):
        user_code = generate_user_code()
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password,
        user_code=user_code
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    # Notify admins
    await manager.broadcast_to_admins(json.dumps({
        "type": "new_user_registration",
        "user_name": user.name,
        "user_code": user.user_code,
        "email": user.email
    }))
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_data: UserLogin):
    # Check for admin credentials first
    if user_data.email == "admin@investaz.com" and user_data.password == "18061999":
        # Create or get admin user
        admin_user = await db.users.find_one({"email": "admin@investaz.com"})
        if not admin_user:
            # Create admin user with proper fields
            admin_user_obj = User(
                email="admin@investaz.com",
                name="Admin Batuhan",
                password_hash=get_password_hash("18061999"),
                user_code="ADMIN001",
                balance=0.0,
                is_admin=True,
                total_invested=0.0,
                total_earned=0.0
            )
            await db.users.insert_one(admin_user_obj.dict())
            admin_user = admin_user_obj.dict()
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": admin_user["id"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    # Regular user login
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
        duration_days=pkg_def["duration"],
        last_collection_time=None  # No collections yet
    )
    
    await db.investment_packages.insert_one(investment_package.dict())
    
    # Update user balance and stats
    new_balance = current_user.balance - package_data.invested_amount
    new_total_invested = current_user.total_invested + package_data.invested_amount
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"balance": new_balance, "total_invested": new_total_invested}}
    )
    
    # Notify admins and user
    await manager.broadcast_to_admins(json.dumps({
        "type": "package_purchase",
        "user_name": current_user.name,
        "user_code": current_user.user_code,
        "package_type": package_data.package_type,
        "amount": package_data.invested_amount
    }))
    
    # Send real-time balance update to user
    await manager.send_to_user(current_user.id, json.dumps({
        "type": "balance_update",
        "new_balance": new_balance
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
    
    # Check if package is active
    if not package.get("is_active", False):
        raise HTTPException(status_code=400, detail="Package is not active")
    
    # Check 30-minute cooldown
    now = datetime.utcnow()
    last_collection = package.get("last_collection_time")
    
    if last_collection:
        time_since_last = now - last_collection
        cooldown_remaining = timedelta(minutes=COLLECTION_COOLDOWN_MINUTES) - time_since_last
        
        if cooldown_remaining.total_seconds() > 0:
            minutes_remaining = int(cooldown_remaining.total_seconds() / 60)
            seconds_remaining = int(cooldown_remaining.total_seconds() % 60)
            raise HTTPException(
                status_code=400, 
                detail=f"Cooldown active. Wait {minutes_remaining} minutes {seconds_remaining} seconds"
            )
    
    if package["accumulated_earnings"] < 0.01:
        raise HTTPException(status_code=400, detail="No earnings to collect")
    
    earnings = package["accumulated_earnings"]
    
    # Update user balance and stats
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"balance": earnings, "total_earned": earnings}}
    )
    
    # Reset package earnings and set collection time
    await db.investment_packages.update_one(
        {"id": package_id},
        {"$set": {
            "accumulated_earnings": 0.0,
            "last_collection_time": now
        }}
    )
    
    # Get updated balance
    user_doc = await db.users.find_one({"id": current_user.id})
    new_balance = user_doc["balance"]
    
    # Send real-time update to user
    await manager.send_to_user(current_user.id, json.dumps({
        "type": "earnings_collected",
        "collected_amount": earnings,
        "new_balance": new_balance,
        "next_collection_time": (now + timedelta(minutes=COLLECTION_COOLDOWN_MINUTES)).isoformat()
    }))
    
    return {
        "collected_amount": earnings, 
        "new_balance": new_balance, 
        "message": "Earnings collected successfully",
        "next_collection_time": (now + timedelta(minutes=COLLECTION_COOLDOWN_MINUTES)).isoformat()
    }

@api_router.get("/packages/{package_id}/collection-status")
async def get_collection_status(package_id: str, current_user: User = Depends(get_current_user)):
    package = await db.investment_packages.find_one({"id": package_id, "user_id": current_user.id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    now = datetime.utcnow()
    last_collection = package.get("last_collection_time")
    
    if not last_collection:
        return {
            "can_collect": True,
            "cooldown_remaining_seconds": 0,
            "next_collection_time": None
        }
    
    time_since_last = now - last_collection
    cooldown_remaining = timedelta(minutes=COLLECTION_COOLDOWN_MINUTES) - time_since_last
    
    if cooldown_remaining.total_seconds() <= 0:
        return {
            "can_collect": True,
            "cooldown_remaining_seconds": 0,
            "next_collection_time": None
        }
    
    return {
        "can_collect": False,
        "cooldown_remaining_seconds": int(cooldown_remaining.total_seconds()),
        "next_collection_time": (last_collection + timedelta(minutes=COLLECTION_COOLDOWN_MINUTES)).isoformat()
    }

# Transaction endpoints
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user)
):
    # Validate withdrawal amount limits
    if transaction_data.type == TransactionType.WITHDRAW:
        if transaction_data.amount < 500 or transaction_data.amount > 6500:
            raise HTTPException(status_code=400, detail="Withdrawal amount must be between 500-6500 AZN")
        
        if current_user.balance < transaction_data.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Deduct from balance immediately
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"balance": -transaction_data.amount}}
        )
    
    # Validate deposit amount limits - Updated per user requirements
    if transaction_data.type == TransactionType.DEPOSIT:
        if transaction_data.amount < 50 or transaction_data.amount > 2000:
            raise HTTPException(status_code=400, detail="Deposit amount must be between 50-2000 AZN")
    
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
        "user_code": current_user.user_code,
        "amount": transaction_data.amount,
        "transaction_id": transaction.id
    }))
    
    # Send real-time update to user if balance changed
    if transaction_data.type == TransactionType.WITHDRAW:
        user_doc = await db.users.find_one({"id": current_user.id})
        await manager.send_to_user(current_user.id, json.dumps({
            "type": "balance_update",
            "new_balance": user_doc["balance"]
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
    
    # Notify admins with enhanced data
    await manager.broadcast_to_admins(json.dumps({
        "type": "receipt_uploaded",
        "transaction_id": transaction_id,
        "user_name": current_user.name,
        "user_code": current_user.user_code,
        "filename": filename,
        "amount": transaction["amount"],
        "file_extension": file_extension
    }))
    
    return {"message": "Receipt uploaded successfully", "filename": filename}

@api_router.get("/transactions/my", response_model=List[Transaction])
async def get_my_transactions(current_user: User = Depends(get_current_user)):
    # Remove _id from results to prevent serialization issues
    transactions = await db.transactions.find(
        {"user_id": current_user.id}, 
        {"_id": 0}  # Exclude _id field
    ).sort("created_date", -1).to_list(100)
    return [Transaction(**txn) for txn in transactions]

# Message endpoints
@api_router.post("/messages", response_model=Message)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    # Check if user has any pending/unanswered messages
    user_messages = await db.messages.find({"user_id": current_user.id, "is_from_admin": False}).to_list(None)
    admin_replies = await db.messages.find({"user_id": current_user.id, "is_from_admin": True}).to_list(None)
    
    # If user has sent messages but no admin has replied, block new message
    if user_messages and not admin_replies:
        raise HTTPException(
            status_code=400, 
            detail="Admin cavab verənə qədər yeni mesaj göndərə bilməzsiniz."
        )
    
    # If user has messages and admin replies exist, check if latest user message has a reply
    if user_messages and admin_replies:
        # Get the latest user message
        latest_user_message = max(user_messages, key=lambda x: x["created_date"])
        
        # Check if there's an admin reply after this message
        admin_reply_after = any(
            reply["created_date"] > latest_user_message["created_date"] 
            for reply in admin_replies
        )
        
        if not admin_reply_after:
            raise HTTPException(
                status_code=400, 
                detail="Admin cavab verənə qədər yeni mesaj göndərə bilməzsiniz."
            )
    
    message = Message(
        user_id=current_user.id,
        content=message_data.content,
        message_type=message_data.message_type,
        is_from_admin=False
    )
    
    await db.messages.insert_one(message.dict())
    
    # Notify admins with enhanced data
    await manager.broadcast_to_admins(json.dumps({
        "type": "new_message",
        "user_name": current_user.name,
        "user_code": current_user.user_code,
        "user_id": current_user.id,
        "content": message_data.content,
        "message_id": message.id,
        "timestamp": message.created_date.isoformat()
    }))
    
    return message

@api_router.get("/messages/my", response_model=List[Message])
async def get_my_messages(current_user: User = Depends(get_current_user)):
    # Remove _id from results to prevent serialization issues
    messages = await db.messages.find(
        {"user_id": current_user.id}, 
        {"_id": 0}  # Exclude _id field
    ).sort("created_date", -1).to_list(100)
    return [Message(**msg) for msg in messages]

# Admin endpoints
@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(current_admin: User = Depends(get_current_admin)):
    total_users = await db.users.count_documents({"is_admin": False})
    active_packages = await db.investment_packages.count_documents({"is_active": True})
    
    # Get transaction stats
    approved_deposits = await db.transactions.find(
        {"type": "deposit", "status": "approved"}, 
        {"_id": 0}
    ).to_list(None)
    approved_withdrawals = await db.transactions.find(
        {"type": "withdraw", "status": "approved"}, 
        {"_id": 0}
    ).to_list(None)
    pending_transactions = await db.transactions.count_documents({"status": "pending"})
    
    total_deposits = sum(t["amount"] for t in approved_deposits)
    total_withdrawals = sum(t["amount"] for t in approved_withdrawals)
    
    return AdminStats(
        total_users=total_users,
        active_packages=active_packages,
        total_deposits=total_deposits,
        total_withdrawals=total_withdrawals,
        pending_transactions=pending_transactions
    )

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_admin: User = Depends(get_current_admin)):
    # Remove _id from results to prevent serialization issues
    users = await db.users.find(
        {"is_admin": False}, 
        {"_id": 0}  # Exclude _id field
    ).to_list(1000)
    
    # Handle missing user_code field for existing users
    user_responses = []
    for user in users:
        if 'user_code' not in user or not user['user_code']:
            user['user_code'] = generate_user_code()
            # Update user in database
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"user_code": user['user_code']}}
            )
        user_responses.append(UserResponse(**user))
    
    return user_responses

@api_router.get("/admin/users/search")
async def search_users(
    query: str = Query(..., description="Search by user code (AZ prefix) or name"),
    current_admin: User = Depends(get_current_admin)
):
    try:
        # Search by user code or name - exclude _id field to prevent serialization issues
        users = await db.users.find({
            "$or": [
                {"user_code": {"$regex": query, "$options": "i"}},
                {"name": {"$regex": query, "$options": "i"}}
            ],
            "is_admin": False
        }, {"_id": 0}).to_list(50)  # Exclude _id field
        
        result = []
        for user in users:
            # Get user's active package
            active_package = await db.investment_packages.find_one({
                "user_id": user["id"], 
                "is_active": True
            }, {"_id": 0})  # Exclude _id field
            
            # Get user's recent transactions
            recent_transactions = await db.transactions.find({
                "user_id": user["id"]
            }, {"_id": 0}).sort("created_date", -1).limit(5).to_list(5)  # Exclude _id field
            
            user_info = {
                **UserResponse(**user).dict(),
                "active_package": active_package,
                "recent_transactions": recent_transactions
            }
            result.append(user_info)
        
        return {"users": result, "total_found": len(result)}
        
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@api_router.post("/admin/users/update-balance")
async def update_user_balance(
    update_data: AdminUpdateBalance,
    current_admin: User = Depends(get_current_admin)
):
    # Update user balance
    result = await db.users.update_one(
        {"id": update_data.user_id},
        {"$set": {"balance": update_data.new_balance}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Send real-time update to user
    await manager.send_to_user(update_data.user_id, json.dumps({
        "type": "admin_balance_update",
        "new_balance": update_data.new_balance,
        "notes": update_data.notes or "Admin balance adjustment"
    }))
    
    return {"message": "Balance updated successfully"}

@api_router.get("/admin/transactions", response_model=List[Transaction])
async def get_all_transactions(current_admin: User = Depends(get_current_admin)):
    # Remove _id from results to prevent serialization issues
    transactions = await db.transactions.find(
        {}, 
        {"_id": 0}  # Exclude _id field
    ).sort("created_date", -1).to_list(1000)
    return [Transaction(**txn) for txn in transactions]

@api_router.post("/admin/transactions/approve")
async def approve_transaction(
    approval_data: AdminApproveTransaction,
    current_admin: User = Depends(get_current_admin)
):
    transaction = await db.transactions.find_one({"id": approval_data.transaction_id}, {"_id": 0})
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
        result = await db.users.update_one(
            {"id": transaction["user_id"]},
            {"$inc": {"balance": transaction["amount"]}}
        )
        
        # Get updated balance and send real-time update
        user_doc = await db.users.find_one({"id": transaction["user_id"]}, {"_id": 0})
        await manager.send_to_user(transaction["user_id"], json.dumps({
            "type": "deposit_approved",
            "amount": transaction["amount"],
            "new_balance": user_doc["balance"]
        }))
    
    # If withdrawal rejected, refund the balance
    if not approval_data.approve and transaction["type"] == "withdraw":
        result = await db.users.update_one(
            {"id": transaction["user_id"]},
            {"$inc": {"balance": transaction["amount"]}}
        )
        
        # Get updated balance and send real-time update
        user_doc = await db.users.find_one({"id": transaction["user_id"]}, {"_id": 0})
        await manager.send_to_user(transaction["user_id"], json.dumps({
            "type": "withdrawal_rejected",
            "amount": transaction["amount"],
            "new_balance": user_doc["balance"],
            "reason": approval_data.admin_notes
        }))
    
    # If withdrawal approved, send notification
    if approval_data.approve and transaction["type"] == "withdraw":
        await manager.send_to_user(transaction["user_id"], json.dumps({
            "type": "withdrawal_approved",
            "amount": transaction["amount"]
        }))
    
    return {"message": "Transaction processed successfully"}

@api_router.get("/admin/receipts/{filename}")
async def get_receipt(filename: str, current_admin: User = Depends(get_current_admin)):
    file_path = Path(f"/app/uploads/{filename}")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Determine media type based on file extension
    file_extension = filename.split('.')[-1].lower()
    media_types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg', 
        'png': 'image/png',
        'pdf': 'application/pdf'
    }
    media_type = media_types.get(file_extension, 'application/octet-stream')
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )

# NEW: Get receipt as base64 for inline display
@api_router.get("/admin/receipts/{filename}/base64")
async def get_receipt_base64(filename: str, current_admin: User = Depends(get_current_admin)):
    file_path = Path(f"/app/uploads/{filename}")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    import base64
    
    try:
        with open(file_path, "rb") as f:
            file_content = f.read()
            base64_content = base64.b64encode(file_content).decode('utf-8')
            
            file_extension = filename.split('.')[-1].lower()
            media_types = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg', 
                'png': 'image/png',
                'pdf': 'application/pdf'
            }
            media_type = media_types.get(file_extension, 'application/octet-stream')
            
            return {
                "filename": filename,
                "content": base64_content,
                "media_type": media_type,
                "data_url": f"data:{media_type};base64,{base64_content}"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@api_router.post("/admin/messages/{message_id}/reply", response_model=Message)
async def reply_to_message(
    message_id: str,
    reply_content: dict,
    current_admin: User = Depends(get_current_admin)
):
    original_message = await db.messages.find_one({"id": message_id}, {"_id": 0})
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
    
    # Send real-time update to user
    await manager.send_to_user(original_message["user_id"], json.dumps({
        "type": "admin_reply",
        "message": reply_content["content"],
        "message_id": reply_message.id,
        "timestamp": reply_message.created_date.isoformat()
    }))
    
    return reply_message

@api_router.delete("/admin/messages/{message_id}")
async def delete_message(
    message_id: str,
    current_admin: User = Depends(get_current_admin)
):
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message deleted successfully"}

@api_router.get("/admin/messages", response_model=List[Message])
async def get_all_messages(current_admin: User = Depends(get_current_admin)):
    # Remove _id from results to prevent serialization issues
    messages = await db.messages.find(
        {}, 
        {"_id": 0}  # Exclude _id field
    ).sort("created_date", -1).to_list(1000)
    return [Message(**msg) for msg in messages]

# WebSocket endpoints
@app.websocket("/ws/user/{user_id}")
async def user_websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect_user(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo received data (for testing)
            await manager.send_to_user(user_id, f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect_user(user_id)

@app.websocket("/ws/admin")
async def admin_websocket_endpoint(websocket: WebSocket):
    await manager.connect_admin(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo received data (for testing)
            await websocket.send_text(f"Admin Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)

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
                
                if new_accumulated != package["accumulated_earnings"]:
                    await db.investment_packages.update_one(
                        {"id": package["id"]},
                        {"$set": {"accumulated_earnings": max(0, new_accumulated)}}
                    )
                    
                    # Send real-time earnings update to user
                    await manager.send_to_user(package["user_id"], json.dumps({
                        "type": "earnings_update",
                        "package_id": package["id"],
                        "accumulated_earnings": max(0, new_accumulated)
                    }))
            
            await asyncio.sleep(10)  # Update every 10 seconds for better performance
            
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
            user_code="AZ000000",  # Special admin code
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