from fastapi import FastAPI, APIRouter, HTTPException, Header
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
    contact_phone: str = "+994 50 123 45 67"
    contact_email: str = "info@azpay.az"
    contact_address: str = "Bakı, Azərbaycan"
    about_text: str = "AzPay - Azərbaycanda rəqəmsal maliyyə xidmətləri sahəsində fəaliyyət göstərən innovativ şirkətdir."
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    deposit_amount: Optional[float] = None
    whatsapp_link: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    about_text: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "AzPay Kredit Sistemi API"}

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
    # Pre-defined credit offers with monthly payments
    offers = [
        CreditOffer(amount=1000, duration_months=12, interest_rate=18.0, monthly_payment=91.68),
        CreditOffer(amount=2000, duration_months=12, interest_rate=18.0, monthly_payment=183.36),
        CreditOffer(amount=3000, duration_months=12, interest_rate=18.0, monthly_payment=275.04),
        CreditOffer(amount=4000, duration_months=12, interest_rate=18.0, monthly_payment=366.72),
        CreditOffer(amount=5000, duration_months=12, interest_rate=17.0, monthly_payment=460.85),
        CreditOffer(amount=6000, duration_months=12, interest_rate=17.0, monthly_payment=553.02),
        CreditOffer(amount=7000, duration_months=12, interest_rate=17.0, monthly_payment=645.19),
        CreditOffer(amount=8000, duration_months=12, interest_rate=17.0, monthly_payment=737.36),
        CreditOffer(amount=9000, duration_months=12, interest_rate=17.0, monthly_payment=829.53),
        CreditOffer(amount=10000, duration_months=18, interest_rate=16.5, monthly_payment=633.40),
        CreditOffer(amount=11000, duration_months=18, interest_rate=16.5, monthly_payment=696.74),
        CreditOffer(amount=12000, duration_months=18, interest_rate=16.5, monthly_payment=760.08),
        CreditOffer(amount=13000, duration_months=18, interest_rate=16.5, monthly_payment=823.42),
        CreditOffer(amount=14000, duration_months=24, interest_rate=16.0, monthly_payment=677.90),
        CreditOffer(amount=15000, duration_months=24, interest_rate=16.0, monthly_payment=725.60),
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
async def update_settings(update: SettingsUpdate, admin_password: str = Header(...)):
    if admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Yanlış admin şifrəsi")
    
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    
    if not settings:
        settings = Settings().model_dump()
        settings['updated_at'] = settings['updated_at'].isoformat()
        await db.settings.insert_one(settings)
    
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