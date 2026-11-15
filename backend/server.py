from fastapi import FastAPI, HTTPException, Depends, Header, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os
import uuid
import hashlib
import jwt
import asyncio
import json
import logging
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
# from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
# from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MedPreneur API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "medpreneur")
JWT_SECRET = os.environ.get("JWT_SECRET", "medpreneur_jwt_secret")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_col = db["users"]
leads_col = db["leads"]
consultation_types_col = db["consultation_types"]
consultation_bookings_col = db["consultation_bookings"]
system_config_col = db["system_config"]
audit_logs_col = db["audit_logs"]
notifications_col = db["notifications"]
payment_transactions_col = db["payment_transactions"]
packages_col = db["packages"]
site_content_col = db["site_content"]

# ============ UTILITY FUNCTIONS ============

def generate_id():
    return str(uuid.uuid4())

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user = await users_col.find_one({"user_id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def now_utc():
    return datetime.now(timezone.utc).isoformat()

def clean_for_json(obj):
    """Remove ObjectId and other non-serializable types from dicts"""
    if isinstance(obj, dict):
        return {k: clean_for_json(v) for k, v in obj.items() if k != '_id'}
    if isinstance(obj, list):
        return [clean_for_json(i) for i in obj]
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

async def create_audit_log(actor_user_id: str, action_type: str, entity_type: str, entity_id: str, before_json: dict = None, after_json: dict = None, reason: str = ""):
    log = {
        "audit_id": generate_id(),
        "actor_user_id": actor_user_id,
        "action_type": action_type,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "before_json": clean_for_json(before_json or {}),
        "after_json": clean_for_json(after_json or {}),
        "reason": reason,
        "created_at": now_utc()
    }
    await audit_logs_col.insert_one(log)

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email via Resend if configured, otherwise log"""
    if RESEND_API_KEY:
        try:
            import resend
            resend.api_key = RESEND_API_KEY
            params = {
                "from": SENDER_EMAIL,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            result = await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Email sent to {to_email}: {result}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    else:
        logger.info(f"[EMAIL MOCK] To: {to_email} | Subject: {subject}")
        return True

async def create_notification(user_id: str, title: str, message: str, channel: str = "email", related_entity_type: str = "", related_entity_id: str = ""):
    notif = {
        "notification_id": generate_id(),
        "user_id": user_id,
        "title": title,
        "message": message,
        "channel": channel,
        "sent_status": "sent",
        "sent_at": now_utc(),
        "related_entity_type": related_entity_type,
        "related_entity_id": related_entity_id,
        "created_at": now_utc()
    }
    await notifications_col.insert_one(notif)

# ============ VALID STATE TRANSITIONS ============

LEAD_STATES = ["new", "contacted", "consultation_scheduled", "consultation_completed", "qualified", "converted", "closed_lost"]
LEAD_TRANSITIONS = {
    "new": ["contacted", "closed_lost"],
    "contacted": ["consultation_scheduled", "closed_lost"],
    "consultation_scheduled": ["consultation_completed", "closed_lost"],
    "consultation_completed": ["qualified", "closed_lost"],
    "qualified": ["converted", "closed_lost"],
    "converted": [],
    "closed_lost": []
}

BOOKING_STATES = ["pending", "confirmed", "completed", "cancelled", "no_show"]
BOOKING_TRANSITIONS = {
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["completed", "cancelled", "no_show"],
    "completed": [],
    "cancelled": [],
    "no_show": []
}

PAYMENT_STATUSES = ["payment_pending", "paid", "waived"]

# ============ PYDANTIC MODELS ============

class LeadSubmission(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    country: str
    profession_category: str
    specialty: Optional[str] = ""
    years_experience: Optional[int] = 0
    pathway_interest: str
    investment_capacity: Optional[str] = ""
    preferred_timeline: Optional[str] = ""
    consultation_interest: Optional[bool] = False
    source: Optional[str] = "website"

class LeadUpdate(BaseModel):
    lead_status: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class ConsultationTypeCreate(BaseModel):
    title: str
    description: str
    duration_minutes: int = 30
    price: float = 0
    currency: str = "AED"

class ConsultationTypeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    active_status: Optional[bool] = None

class ConsultationBookingCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    consultation_type_id: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = ""

class BookingUpdate(BaseModel):
    booking_status: Optional[str] = None
    payment_status: Optional[str] = None
    meeting_link: Optional[str] = None
    summary_notes: Optional[str] = None
    follow_up_action: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SystemConfigUpdate(BaseModel):
    professions: Optional[List[str]] = None
    specialties: Optional[dict] = None
    countries: Optional[List[str]] = None
    pathways: Optional[List[str]] = None
    lead_sources: Optional[List[str]] = None

class PackageCreate(BaseModel):
    package_name: str
    pathway_type: str
    description: str
    price: float = 0
    currency: str = "AED"
    features: Optional[List[str]] = []

class PackageUpdate(BaseModel):
    package_name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    features: Optional[List[str]] = None
    active_status: Optional[bool] = None

class SiteContentUpdate(BaseModel):
    content_key: str
    value: dict

# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "MedPreneur API", "version": "1.0.0"}

# ============ AUTH ROUTES ============

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    user = await users_col.find_one({"email": req.email}, {"_id": 0})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.get("status") != "active":
        raise HTTPException(status_code=403, detail="Account is not active")
    token = create_token(user["user_id"], user["email"], user["role"])
    await create_audit_log(user["user_id"], "login", "user", user["user_id"])
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"]
    }

# ============ PUBLIC ROUTES ============

@app.get("/api/pathways")
async def get_pathways():
    config = await system_config_col.find_one({"config_key": "pathways"}, {"_id": 0})
    if not config:
        return {"pathways": ["career", "franchise", "managed_franchise"]}
    return {"pathways": config.get("value", [])}

@app.get("/api/consultation-types")
async def get_public_consultation_types():
    types = await consultation_types_col.find({"active_status": True}, {"_id": 0}).to_list(100)
    return {"consultation_types": types}

@app.get("/api/system-config/public")
async def get_public_config():
    """Get public-facing configuration for forms"""
    configs = {}
    async for doc in system_config_col.find({}, {"_id": 0}):
        configs[doc["config_key"]] = doc.get("value", [])
    return {
        "professions": configs.get("professions", ["Doctor", "Dentist", "Pharmacist", "Allied Healthcare Professional", "Healthcare Manager"]),
        "specialties": configs.get("specialties", {}),
        "countries": configs.get("countries", ["UAE", "India", "Pakistan", "Bangladesh", "Philippines", "Egypt", "Jordan", "Iraq", "United Kingdom", "United States", "Canada", "Other"]),
        "pathways": configs.get("pathways", ["career", "franchise", "managed_franchise"]),
    }

@app.get("/api/packages")
async def get_public_packages(pathway: Optional[str] = None):
    query = {"active_status": True}
    if pathway:
        query["pathway_type"] = pathway
    packages = await packages_col.find(query, {"_id": 0}).to_list(50)
    return {"packages": packages}

@app.get("/api/site-content/{content_key}")
async def get_site_content(content_key: str):
    doc = await site_content_col.find_one({"content_key": content_key}, {"_id": 0})
    if not doc:
        return {"content_key": content_key, "value": {}}
    return doc

@app.get("/api/site-content")
async def get_all_site_content():
    docs = {}
    async for doc in site_content_col.find({}, {"_id": 0}):
        docs[doc["content_key"]] = doc.get("value", {})
    return {"content": docs}

# ============ LEAD ROUTES ============

@app.post("/api/leads")
async def submit_lead(lead: LeadSubmission):
    existing = await leads_col.find_one({"email": lead.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="A registration with this email already exists")
    
    lead_data = {
        "lead_id": generate_id(),
        "full_name": lead.full_name,
        "email": lead.email,
        "phone": lead.phone,
        "country": lead.country,
        "profession_category": lead.profession_category,
        "specialty": lead.specialty or "",
        "years_experience": lead.years_experience or 0,
        "pathway_interest": lead.pathway_interest,
        "investment_capacity": lead.investment_capacity or "",
        "preferred_timeline": lead.preferred_timeline or "",
        "consultation_interest": lead.consultation_interest or False,
        "source": lead.source or "website",
        "assigned_to": "",
        "lead_status": "new",
        "notes": "",
        "created_at": now_utc(),
        "updated_at": now_utc()
    }
    await leads_col.insert_one(lead_data)
    
    await create_audit_log("system", "lead_created", "lead", lead_data["lead_id"], after_json={"lead_status": "new", "email": lead.email})
    
    # Send confirmation email
    email_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6495ED; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">MedPreneur</h1>
        </div>
        <div style="padding: 30px; background: white;">
            <h2 style="color: #0F172A;">Thank you for your interest, {lead.full_name}!</h2>
            <p style="color: #64748B; line-height: 1.6;">We have received your registration for the <strong>{lead.pathway_interest}</strong> pathway. Our team will review your profile and reach out to you shortly.</p>
            <p style="color: #64748B; line-height: 1.6;">If you selected consultation interest, we will contact you to schedule a session.</p>
            <div style="margin-top: 20px; padding: 15px; background: #F8FAFC; border-radius: 8px;">
                <p style="color: #0F172A; margin: 0;"><strong>What happens next?</strong></p>
                <ul style="color: #64748B;">
                    <li>Our team reviews your profile</li>
                    <li>We match you with the right pathway advisor</li>
                    <li>You receive a personalized consultation invitation</li>
                </ul>
            </div>
        </div>
        <div style="background: #0F172A; padding: 15px; text-align: center;">
            <p style="color: #94A3B8; margin: 0; font-size: 12px;">MedPreneur - From Medical Degree to Healthcare Asset Ownership</p>
        </div>
    </div>
    """
    await send_email(lead.email, "Welcome to MedPreneur - Registration Received", email_html)
    await create_notification("system", "New Lead Registered", f"{lead.full_name} registered interest in {lead.pathway_interest}", "system", "lead", lead_data["lead_id"])
    
    return {"message": "Registration submitted successfully", "lead_id": lead_data["lead_id"]}

# ============ CONSULTATION BOOKING ROUTES ============

@app.post("/api/consultation-bookings")
async def create_booking(booking: ConsultationBookingCreate):
    consultation_type = await consultation_types_col.find_one({"consultation_type_id": booking.consultation_type_id, "active_status": True}, {"_id": 0})
    if not consultation_type:
        raise HTTPException(status_code=404, detail="Consultation type not found or inactive")
    
    booking_data = {
        "booking_id": generate_id(),
        "full_name": booking.full_name,
        "email": booking.email,
        "phone": booking.phone,
        "consultation_type_id": booking.consultation_type_id,
        "consultation_type_title": consultation_type["title"],
        "preferred_date": booking.preferred_date,
        "preferred_time": booking.preferred_time,
        "notes": booking.notes or "",
        "payment_status": "payment_pending" if consultation_type.get("price", 0) > 0 else "waived",
        "booking_status": "pending",
        "meeting_link": "",
        "summary_notes": "",
        "follow_up_action": "",
        "price": consultation_type.get("price", 0),
        "currency": consultation_type.get("currency", "AED"),
        "created_at": now_utc(),
        "updated_at": now_utc()
    }
    await consultation_bookings_col.insert_one(booking_data)
    
    await create_audit_log("system", "booking_created", "consultation_booking", booking_data["booking_id"], after_json={"booking_status": "pending", "email": booking.email})
    
    email_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6495ED; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">MedPreneur</h1>
        </div>
        <div style="padding: 30px; background: white;">
            <h2 style="color: #0F172A;">Consultation Booking Confirmed</h2>
            <p style="color: #64748B;">Dear {booking.full_name},</p>
            <p style="color: #64748B; line-height: 1.6;">Your consultation has been booked successfully.</p>
            <div style="margin-top: 15px; padding: 15px; background: #F8FAFC; border-radius: 8px;">
                <p style="margin: 5px 0; color: #0F172A;"><strong>Type:</strong> {consultation_type['title']}</p>
                <p style="margin: 5px 0; color: #0F172A;"><strong>Date:</strong> {booking.preferred_date}</p>
                <p style="margin: 5px 0; color: #0F172A;"><strong>Time:</strong> {booking.preferred_time}</p>
                <p style="margin: 5px 0; color: #0F172A;"><strong>Duration:</strong> {consultation_type.get('duration_minutes', 30)} minutes</p>
            </div>
            <p style="color: #64748B; margin-top: 15px; line-height: 1.6;">Our team will confirm your appointment and send you the meeting details shortly.</p>
        </div>
        <div style="background: #0F172A; padding: 15px; text-align: center;">
            <p style="color: #94A3B8; margin: 0; font-size: 12px;">MedPreneur - From Medical Degree to Healthcare Asset Ownership</p>
        </div>
    </div>
    """
    await send_email(booking.email, f"MedPreneur Consultation Booking - {consultation_type['title']}", email_html)
    await create_notification("system", "New Consultation Booking", f"{booking.full_name} booked {consultation_type['title']}", "system", "consultation_booking", booking_data["booking_id"])
    
    return {"message": "Consultation booked successfully", "booking_id": booking_data["booking_id"]}

# ============ ADMIN ROUTES ============

@app.get("/api/admin/dashboard")
async def admin_dashboard(user: dict = Depends(require_admin)):
    total_leads = await leads_col.count_documents({})
    new_leads = await leads_col.count_documents({"lead_status": "new"})
    contacted_leads = await leads_col.count_documents({"lead_status": "contacted"})
    qualified_leads = await leads_col.count_documents({"lead_status": "qualified"})
    converted_leads = await leads_col.count_documents({"lead_status": "converted"})
    
    # Leads by pathway
    pipeline = [{"$group": {"_id": "$pathway_interest", "count": {"$sum": 1}}}]
    leads_by_pathway = {}
    async for doc in leads_col.aggregate(pipeline):
        leads_by_pathway[doc["_id"]] = doc["count"]
    
    # Leads by status
    pipeline_status = [{"$group": {"_id": "$lead_status", "count": {"$sum": 1}}}]
    leads_by_status = {}
    async for doc in leads_col.aggregate(pipeline_status):
        leads_by_status[doc["_id"]] = doc["count"]
    
    total_bookings = await consultation_bookings_col.count_documents({})
    pending_bookings = await consultation_bookings_col.count_documents({"booking_status": "pending"})
    confirmed_bookings = await consultation_bookings_col.count_documents({"booking_status": "confirmed"})
    
    recent_leads = await leads_col.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_bookings = await consultation_bookings_col.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "contacted_leads": contacted_leads,
        "qualified_leads": qualified_leads,
        "converted_leads": converted_leads,
        "leads_by_pathway": leads_by_pathway,
        "leads_by_status": leads_by_status,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "confirmed_bookings": confirmed_bookings,
        "recent_leads": recent_leads,
        "recent_bookings": recent_bookings
    }

# --- Admin Lead Management ---

class ManualLeadCreate(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    country: str = ""
    profession_category: str = ""
    pathway_interest: str = ""
    investment_capacity: str = ""
    source: str = "manual"
    notes: str = ""

@app.post("/api/admin/leads")
async def admin_create_lead(lead: ManualLeadCreate, user: dict = Depends(require_admin)):
    lead_data = {
        "lead_id": generate_id(),
        "full_name": lead.full_name,
        "email": lead.email,
        "phone": lead.phone,
        "country": lead.country,
        "profession_category": lead.profession_category,
        "specialty": "",
        "years_experience": 0,
        "pathway_interest": lead.pathway_interest,
        "investment_capacity": lead.investment_capacity,
        "preferred_timeline": "",
        "consultation_interest": False,
        "source": lead.source or "manual",
        "assigned_to": user["user_id"],
        "lead_status": "new",
        "notes": lead.notes,
        "created_at": now_utc(),
        "updated_at": now_utc()
    }
    await leads_col.insert_one(lead_data)
    await create_audit_log(user["user_id"], "lead_created_manual", "lead", lead_data["lead_id"], after_json={"email": lead.email, "source": "manual"})
    return {"message": "Lead created", "lead_id": lead_data["lead_id"]}

@app.get("/api/admin/leads")
async def get_leads(
    status: Optional[str] = None,
    pathway: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    user: dict = Depends(require_admin)
):
    query = {}
    if status:
        query["lead_status"] = status
    if pathway:
        query["pathway_interest"] = pathway
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    total = await leads_col.count_documents(query)
    skip = (page - 1) * limit
    leads = await leads_col.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "leads": leads,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.get("/api/admin/leads/{lead_id}")
async def get_lead_detail(lead_id: str, user: dict = Depends(require_admin)):
    lead = await leads_col.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    bookings = await consultation_bookings_col.find({"email": lead["email"]}, {"_id": 0}).to_list(20)
    logs = await audit_logs_col.find({"entity_type": "lead", "entity_id": lead_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    
    return {"lead": lead, "bookings": bookings, "audit_logs": [clean_for_json(l) for l in logs]}

@app.patch("/api/admin/leads/{lead_id}")
async def update_lead(lead_id: str, update: LeadUpdate, user: dict = Depends(require_admin)):
    lead = await leads_col.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    updates = {}
    before = {}
    
    if update.lead_status and update.lead_status != lead["lead_status"]:
        current_status = lead["lead_status"]
        allowed = LEAD_TRANSITIONS.get(current_status, [])
        if update.lead_status not in allowed:
            raise HTTPException(status_code=400, detail=f"Cannot transition from '{current_status}' to '{update.lead_status}'. Allowed: {allowed}")
        before["lead_status"] = current_status
        updates["lead_status"] = update.lead_status
    
    if update.assigned_to is not None:
        before["assigned_to"] = lead.get("assigned_to", "")
        updates["assigned_to"] = update.assigned_to
    
    if update.notes is not None:
        before["notes"] = lead.get("notes", "")
        updates["notes"] = update.notes
    
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    updates["updated_at"] = now_utc()
    await leads_col.update_one({"lead_id": lead_id}, {"$set": updates})
    
    await create_audit_log(user["user_id"], "lead_updated", "lead", lead_id, before_json=before, after_json=updates)
    
    updated_lead = await leads_col.find_one({"lead_id": lead_id}, {"_id": 0})
    return {"message": "Lead updated", "lead": updated_lead}

# --- Admin Consultation Type Management ---

@app.get("/api/admin/consultation-types")
async def admin_get_consultation_types(user: dict = Depends(require_admin)):
    types = await consultation_types_col.find({}, {"_id": 0}).to_list(100)
    return {"consultation_types": types}

@app.post("/api/admin/consultation-types")
async def create_consultation_type(ct: ConsultationTypeCreate, user: dict = Depends(require_admin)):
    ct_data = {
        "consultation_type_id": generate_id(),
        "title": ct.title,
        "description": ct.description,
        "duration_minutes": ct.duration_minutes,
        "price": ct.price,
        "currency": ct.currency,
        "active_status": True,
        "created_at": now_utc(),
        "updated_at": now_utc()
    }
    await consultation_types_col.insert_one(ct_data)
    await create_audit_log(user["user_id"], "consultation_type_created", "consultation_type", ct_data["consultation_type_id"], after_json=ct_data)
    
    result = {k: v for k, v in ct_data.items() if k != "_id"}
    return {"message": "Consultation type created", "consultation_type": result}

@app.patch("/api/admin/consultation-types/{ct_id}")
async def update_consultation_type(ct_id: str, update: ConsultationTypeUpdate, user: dict = Depends(require_admin)):
    ct = await consultation_types_col.find_one({"consultation_type_id": ct_id}, {"_id": 0})
    if not ct:
        raise HTTPException(status_code=404, detail="Consultation type not found")
    
    updates = {}
    before = {}
    for field in ["title", "description", "duration_minutes", "price", "currency", "active_status"]:
        val = getattr(update, field, None)
        if val is not None:
            before[field] = ct.get(field)
            updates[field] = val
    
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    updates["updated_at"] = now_utc()
    await consultation_types_col.update_one({"consultation_type_id": ct_id}, {"$set": updates})
    await create_audit_log(user["user_id"], "consultation_type_updated", "consultation_type", ct_id, before_json=before, after_json=updates)
    
    updated = await consultation_types_col.find_one({"consultation_type_id": ct_id}, {"_id": 0})
    return {"message": "Consultation type updated", "consultation_type": updated}

# --- Admin Consultation Booking Management ---

@app.get("/api/admin/consultation-bookings")
async def admin_get_bookings(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    user: dict = Depends(require_admin)
):
    query = {}
    if status:
        query["booking_status"] = status
    
    total = await consultation_bookings_col.count_documents(query)
    skip = (page - 1) * limit
    bookings = await consultation_bookings_col.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"bookings": bookings, "total": total, "page": page, "limit": limit}

@app.patch("/api/admin/consultation-bookings/{booking_id}")
async def update_booking(booking_id: str, update: BookingUpdate, user: dict = Depends(require_admin)):
    booking = await consultation_bookings_col.find_one({"booking_id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    updates = {}
    before = {}
    
    if update.booking_status and update.booking_status != booking["booking_status"]:
        current = booking["booking_status"]
        allowed = BOOKING_TRANSITIONS.get(current, [])
        if update.booking_status not in allowed:
            raise HTTPException(status_code=400, detail=f"Cannot transition from '{current}' to '{update.booking_status}'. Allowed: {allowed}")
        before["booking_status"] = current
        updates["booking_status"] = update.booking_status
    
    if update.payment_status and update.payment_status != booking.get("payment_status"):
        if update.payment_status not in PAYMENT_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid payment status. Allowed: {PAYMENT_STATUSES}")
        before["payment_status"] = booking.get("payment_status")
        updates["payment_status"] = update.payment_status
    
    for field in ["meeting_link", "summary_notes", "follow_up_action"]:
        val = getattr(update, field, None)
        if val is not None:
            before[field] = booking.get(field, "")
            updates[field] = val
    
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    updates["updated_at"] = now_utc()
    await consultation_bookings_col.update_one({"booking_id": booking_id}, {"$set": updates})
    await create_audit_log(user["user_id"], "booking_updated", "consultation_booking", booking_id, before_json=before, after_json=updates)
    
    updated = await consultation_bookings_col.find_one({"booking_id": booking_id}, {"_id": 0})
    return {"message": "Booking updated", "booking": updated}

# --- Admin System Configuration ---

@app.get("/api/admin/config")
async def get_system_config(user: dict = Depends(require_admin)):
    configs = {}
    async for doc in system_config_col.find({}, {"_id": 0}):
        configs[doc["config_key"]] = doc.get("value")
    return {"config": configs}

@app.patch("/api/admin/config")
async def update_system_config(update: SystemConfigUpdate, user: dict = Depends(require_admin)):
    updates_made = []
    for field in ["professions", "specialties", "countries", "pathways", "lead_sources"]:
        val = getattr(update, field, None)
        if val is not None:
            before_doc = await system_config_col.find_one({"config_key": field}, {"_id": 0})
            before_val = before_doc.get("value") if before_doc else None
            
            await system_config_col.update_one(
                {"config_key": field},
                {"$set": {"config_key": field, "value": val, "updated_at": now_utc()}},
                upsert=True
            )
            await create_audit_log(user["user_id"], "config_updated", "system_config", field, before_json={"value": before_val}, after_json={"value": val})
            updates_made.append(field)
    
    if not updates_made:
        raise HTTPException(status_code=400, detail="No configuration updates provided")
    
    return {"message": f"Configuration updated: {', '.join(updates_made)}"}

# --- Admin Audit Logs ---

@app.get("/api/admin/audit-logs")
async def get_audit_logs(
    entity_type: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    user: dict = Depends(require_admin)
):
    query = {}
    if entity_type:
        query["entity_type"] = entity_type
    
    total = await audit_logs_col.count_documents(query)
    skip = (page - 1) * limit
    logs = await audit_logs_col.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    cleaned_logs = [clean_for_json(log) for log in logs]
    return {"audit_logs": cleaned_logs, "total": total, "page": page, "limit": limit}

# --- Admin Packages ---

@app.get("/api/admin/packages")
async def admin_get_packages(user: dict = Depends(require_admin)):
    packages = await packages_col.find({}, {"_id": 0}).to_list(100)
    return {"packages": packages}

@app.post("/api/admin/packages")
async def create_package(pkg: PackageCreate, user: dict = Depends(require_admin)):
    data = {
        "package_id": generate_id(),
        "package_name": pkg.package_name,
        "pathway_type": pkg.pathway_type,
        "description": pkg.description,
        "price": pkg.price,
        "currency": pkg.currency,
        "features": pkg.features or [],
        "active_status": True,
        "created_at": now_utc(),
        "updated_at": now_utc()
    }
    await packages_col.insert_one(data)
    await create_audit_log(user["user_id"], "package_created", "package", data["package_id"], after_json={"package_name": pkg.package_name})
    return {"message": "Package created", "package": {k: v for k, v in data.items() if k != "_id"}}

@app.patch("/api/admin/packages/{pkg_id}")
async def update_package(pkg_id: str, update: PackageUpdate, user: dict = Depends(require_admin)):
    pkg = await packages_col.find_one({"package_id": pkg_id}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    updates = {}
    for field in ["package_name", "description", "price", "currency", "features", "active_status"]:
        val = getattr(update, field, None)
        if val is not None:
            updates[field] = val
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    updates["updated_at"] = now_utc()
    await packages_col.update_one({"package_id": pkg_id}, {"$set": updates})
    await create_audit_log(user["user_id"], "package_updated", "package", pkg_id, after_json=updates)
    updated = await packages_col.find_one({"package_id": pkg_id}, {"_id": 0})
    return {"message": "Package updated", "package": updated}

# --- Admin Site Content ---

@app.get("/api/admin/site-content")
async def admin_get_site_content(user: dict = Depends(require_admin)):
    docs = {}
    async for doc in site_content_col.find({}, {"_id": 0}):
        docs[doc["content_key"]] = doc.get("value", {})
    return {"content": docs}

@app.put("/api/admin/site-content")
async def admin_update_site_content(update: SiteContentUpdate, user: dict = Depends(require_admin)):
    await site_content_col.update_one(
        {"content_key": update.content_key},
        {"$set": {"content_key": update.content_key, "value": update.value, "updated_at": now_utc()}},
        upsert=True
    )
    await create_audit_log(user["user_id"], "site_content_updated", "site_content", update.content_key, after_json={"content_key": update.content_key})
    return {"message": f"Site content '{update.content_key}' updated"}

# --- Admin Investment Configuration ---

@app.get("/api/admin/investment-config")
async def get_investment_config(user: dict = Depends(require_admin)):
    config = await site_content_col.find_one({"content_key": "investment_config"}, {"_id": 0})
    if not config:
        return {"config": get_default_investment_config()}
    return {"config": config.get("value", get_default_investment_config())}

@app.put("/api/admin/investment-config")
async def update_investment_config(request: Request, user: dict = Depends(require_admin)):
    body = await request.json()
    await site_content_col.update_one(
        {"content_key": "investment_config"},
        {"$set": {"content_key": "investment_config", "value": body, "updated_at": now_utc()}},
        upsert=True
    )
    await create_audit_log(user["user_id"], "investment_config_updated", "site_content", "investment_config")
    return {"message": "Investment configuration updated"}

@app.get("/api/admin/investment-config/download-excel")
async def download_investment_excel(token: str = None, authorization: str = Header(None)):
    # Accept token via query param or header
    auth_token = token
    if not auth_token and authorization and authorization.startswith("Bearer "):
        auth_token = authorization.split(" ")[1]
    if not auth_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(auth_token)
    user = await users_col.find_one({"user_id": payload["user_id"]}, {"_id": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    import openpyxl
    from io import BytesIO
    
    config_doc = await site_content_col.find_one({"content_key": "investment_config"}, {"_id": 0})
    ic = config_doc.get("value", get_default_investment_config()) if config_doc else get_default_investment_config()
    mf = ic.get("managed_franchise", {})
    fr = ic.get("franchise", {})
    
    wb = openpyxl.Workbook()
    
    # Global sheet
    ws = wb.active
    ws.title = "Global Parameters"
    ws.append(["Parameter", "Value"])
    ws.append(["Managed Franchise - Retainer %", mf.get("franchise_retainer_pct", 15)])
    ws.append(["Managed Franchise - Investor Profit %", mf.get("investor_profit_pct", 60)])
    ws.append(["Managed Franchise - MedPreneur Profit %", mf.get("medpreneur_profit_pct", 40)])
    ws.append(["Managed Franchise - Exit Multiple", mf.get("exit_multiple", 6)])
    ws.append(["Franchise - Fee %", fr.get("franchise_fee_pct", 15)])
    ws.append(["Franchise - Royalty %", fr.get("royalty_pct", 10)])
    ws.column_dimensions['A'].width = 40
    ws.column_dimensions['B'].width = 20
    
    # Tier sheets
    for tier_name in ["basic", "standard", "premium"]:
        t = mf.get("tiers", {}).get(tier_name, {})
        ws2 = wb.create_sheet(tier_name.capitalize())
        ws2.append(["Field", "Value"])
        for field in ["equity_ticket", "annual_revenue_y2", "total_5yr_distributions", "total_5yr_return_with_exit", "roi_5yr_pct", "irr_pct", "payback_years", "y2_cash", "y3_cash", "y4_cash", "y5_cash", "exit_clinic_valuation", "exit_investor_share", "break_even_patients", "size_sqft", "opd_rooms"]:
            ws2.append([field, t.get(field, 0)])
        ws2.append(["description", t.get("description", "")])
        ws2.column_dimensions['A'].width = 30
        ws2.column_dimensions['B'].width = 20
    
    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=medpreneur_investment_config.xlsx"})

@app.post("/api/admin/investment-config/upload-excel")
async def upload_investment_excel(file: UploadFile = File(...), user: dict = Depends(require_admin)):
    import openpyxl
    from io import BytesIO
    
    content = await file.read()
    wb = openpyxl.load_workbook(BytesIO(content))
    
    ic = get_default_investment_config()
    
    # Parse Global
    if "Global Parameters" in wb.sheetnames:
        ws = wb["Global Parameters"]
        for row in ws.iter_rows(min_row=2, values_only=True):
            if row[0] and row[1] is not None:
                key, val = str(row[0]), row[1]
                if "Retainer" in key: ic["managed_franchise"]["franchise_retainer_pct"] = float(val)
                elif "Investor Profit" in key: ic["managed_franchise"]["investor_profit_pct"] = float(val)
                elif "MedPreneur Profit" in key: ic["managed_franchise"]["medpreneur_profit_pct"] = float(val)
                elif "Exit Multiple" in key: ic["managed_franchise"]["exit_multiple"] = float(val)
                elif "Fee %" in key: ic["franchise"]["franchise_fee_pct"] = float(val)
                elif "Royalty" in key: ic["franchise"]["royalty_pct"] = float(val)
    
    # Parse Tiers
    for tier_name in ["basic", "standard", "premium"]:
        sheet_name = tier_name.capitalize()
        if sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            tier_data = {}
            for row in ws.iter_rows(min_row=2, values_only=True):
                if row[0] and row[1] is not None:
                    field = str(row[0])
                    val = row[1]
                    if field == "description":
                        tier_data[field] = str(val)
                    else:
                        try: tier_data[field] = float(val)
                        except: tier_data[field] = val
            ic["managed_franchise"]["tiers"][tier_name] = {**ic["managed_franchise"]["tiers"].get(tier_name, {}), **tier_data}
    
    await site_content_col.update_one(
        {"content_key": "investment_config"},
        {"$set": {"content_key": "investment_config", "value": ic, "updated_at": now_utc()}},
        upsert=True
    )
    await create_audit_log(user["user_id"], "investment_config_uploaded_excel", "site_content", "investment_config")
    return {"message": "Excel template uploaded and configuration updated"}

@app.get("/api/investment-config")
async def get_public_investment_config():
    config = await site_content_col.find_one({"content_key": "investment_config"}, {"_id": 0})
    if not config:
        return get_default_investment_config()
    return config.get("value", get_default_investment_config())

def get_default_investment_config():
    return {
        "managed_franchise": {
            "franchise_retainer_pct": 15,
            "investor_profit_pct": 60,
            "medpreneur_profit_pct": 40,
            "exit_multiple": 6,
            "tiers": {
                "basic": {"equity_ticket": 3000000, "annual_revenue_y2": 4318182, "total_5yr_distributions": 2173492, "total_5yr_return_with_exit": 7095020, "roi_5yr_pct": 236, "irr_pct": 28, "payback_years": 3.5, "y2_cash": 405000, "y3_cash": 425100, "y4_cash": 523137, "y5_cash": 820255, "exit_clinic_valuation": 8200000, "exit_investor_share": 4920000, "break_even_patients": 40, "size_sqft": 2000, "opd_rooms": 4, "description": "Basic Polyclinic - 2,000 sqft, 4 OPD rooms, Mini Lab, Ultrasound"},
                "standard": {"equity_ticket": 5000000, "annual_revenue_y2": 8221154, "total_5yr_distributions": 4371101, "total_5yr_return_with_exit": 14039092, "roi_5yr_pct": 281, "irr_pct": 32, "payback_years": 3, "y2_cash": 825000, "y3_cash": 872700, "y4_cash": 1062069, "y5_cash": 1611332, "exit_clinic_valuation": 16110000, "exit_investor_share": 9670000, "break_even_patients": 56, "size_sqft": 2500, "opd_rooms": 5, "description": "Standard Polyclinic - 2,500 sqft, 5 OPD rooms, Full Lab, 1 Dental Chair"},
                "premium": {"equity_ticket": 8000000, "annual_revenue_y2": 11839080, "total_5yr_distributions": 8334643, "total_5yr_return_with_exit": 26180631, "roi_5yr_pct": 327, "irr_pct": 35, "payback_years": 2.5, "y2_cash": 1600000, "y3_cash": 1709600, "y4_cash": 2050712, "y5_cash": 2974331, "exit_clinic_valuation": 29740000, "exit_investor_share": 17850000, "break_even_patients": 55, "size_sqft": 3200, "opd_rooms": 7, "description": "Premium Polyclinic - 3,200 sqft, 7 OPD rooms, Full Lab, X-ray, 2 Dental Chairs"}
            }
        },
        "franchise": {
            "franchise_fee_pct": 15,
            "royalty_pct": 10,
            "models": {
                "slot": {"ownership_pct_min": 5, "ownership_pct_max": 15, "investment_min": 600000, "investment_max": 900000, "annual_roi_pct": 30},
                "co_franchise": {"ownership_pct_min": 20, "ownership_pct_max": 50, "investment_min": 2000000, "investment_max": 2500000, "annual_roi_pct_min": 28, "annual_roi_pct_max": 40},
                "full_franchise": {"ownership_pct": 100, "basic_investment": "2,000,000-2,500,000", "standard_investment": "5,000,000-6,500,000", "premium_investment": "8,000,000-11,200,000", "basic_annual_revenue": 6552000, "standard_annual_revenue": 11520000, "basic_net_profit": 1396800, "standard_net_profit": 1868000, "premium_net_profit": 2224800}
            }
        }
    }

# ============ ADMIN ANALYTICS ============

@app.get("/api/admin/analytics")
async def get_analytics(user: dict = Depends(require_admin)):
    total_leads = await leads_col.count_documents({})
    
    # Funnel
    consultation_booked = await consultation_bookings_col.count_documents({})
    consultation_completed = await consultation_bookings_col.count_documents({"booking_status": "completed"})
    converted = await leads_col.count_documents({"lead_status": "converted"})
    
    # Leads by pathway
    pipeline_pathway = [{"$group": {"_id": "$pathway_interest", "count": {"$sum": 1}}}]
    leads_by_pathway = {}
    async for doc in leads_col.aggregate(pipeline_pathway):
        leads_by_pathway[doc["_id"] or "unknown"] = doc["count"]
    
    # Leads by profession
    pipeline_prof = [{"$group": {"_id": "$profession_category", "count": {"$sum": 1}}}]
    leads_by_profession = {}
    async for doc in leads_col.aggregate(pipeline_prof):
        leads_by_profession[doc["_id"] or "unknown"] = doc["count"]
    
    # Leads by country
    pipeline_country = [{"$group": {"_id": "$country", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 15}]
    leads_by_country = {}
    async for doc in leads_col.aggregate(pipeline_country):
        leads_by_country[doc["_id"] or "unknown"] = doc["count"]
    
    # Leads by status
    pipeline_status = [{"$group": {"_id": "$lead_status", "count": {"$sum": 1}}}]
    leads_by_status = {}
    async for doc in leads_col.aggregate(pipeline_status):
        leads_by_status[doc["_id"] or "unknown"] = doc["count"]
    
    # Leads by source
    pipeline_source = [{"$group": {"_id": "$source", "count": {"$sum": 1}}}]
    leads_by_source = {}
    async for doc in leads_col.aggregate(pipeline_source):
        leads_by_source[doc["_id"] or "unknown"] = doc["count"]
    
    return {
        "funnel": {
            "total_leads": total_leads,
            "consultations_booked": consultation_booked,
            "consultations_completed": consultation_completed,
            "converted_users": converted
        },
        "leads_by_pathway": leads_by_pathway,
        "leads_by_profession": leads_by_profession,
        "leads_by_country": leads_by_country,
        "leads_by_status": leads_by_status,
        "leads_by_source": leads_by_source
    }

# ============ STRIPE PAYMENT ROUTES ============

class CheckoutRequest(BaseModel):
    booking_id: str
    origin_url: str

@app.post("/api/payments/checkout")
async def create_checkout(req: CheckoutRequest, http_request: Request):
    booking = await consultation_bookings_col.find_one({"booking_id": req.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.get("payment_status") == "paid":
        raise HTTPException(status_code=400, detail="This booking is already paid")
    
    price = float(booking.get("price", 0))
    if price <= 0:
        raise HTTPException(status_code=400, detail="This consultation is free, no payment required")
    
    currency = booking.get("currency", "AED").lower()
    
    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{req.origin_url}/consultation/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/consultation"
    
    metadata = {
        "booking_id": req.booking_id,
        "email": booking.get("email", ""),
        "consultation_type": booking.get("consultation_type_title", "")
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=price,
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    txn = {
        "transaction_id": generate_id(),
        "session_id": session.session_id,
        "booking_id": req.booking_id,
        "email": booking.get("email", ""),
        "amount": price,
        "currency": currency,
        "payment_status": "initiated",
        "metadata": metadata,
        "created_at": now_utc(),
        "updated_at": now_utc()
    }
    await payment_transactions_col.insert_one(txn)
    
    await create_audit_log("system", "payment_initiated", "payment_transaction", txn["transaction_id"], after_json={"amount": price, "booking_id": req.booking_id})
    
    return {"url": session.url, "session_id": session.session_id}

@app.get("/api/payments/status/{session_id}")
async def get_payment_status(session_id: str, http_request: Request):
    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logger.error(f"Stripe status check failed: {e}")
        # if not STRIPE_API_KEY:
        #     raise HTTPException(status_code=500, detail="Stripe not configured")
        
        # checkout = StripeCheckout(STRIPE_API_KEY)
        # req = CheckoutSessionRequest(
        #     success_url=f"{FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
        #     cancel_url=f"{FRONTEND_URL}/payment-cancelled",
        #     customer_email=booking["email"],
        #     line_items=[{
        #         "price_data": {
        #             "currency": booking["currency"].lower(),
        #             "product_data": {"name": f"Consultation: {booking['consultation_type_title']}"},
        #             "unit_amount": int(booking["price"] * 100),
        #         },
        #         "quantity": 1,
        #     }],
        #     metadata={"booking_id": booking_id}
        # )
        # session = await checkout.create_session(req)
        # return {"checkout_url": session.checkout_url}
        return {"checkout_url": "#", "message": "Stripe mock active"}
    
    txn = await payment_transactions_col.find_one({"session_id": session_id}, {"_id": 0})
    
    if txn and txn.get("payment_status") != "paid" and status.payment_status == "paid":
        await payment_transactions_col.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": now_utc()}}
        )
        booking_id = status.metadata.get("booking_id") or (txn.get("booking_id") if txn else None)
        if booking_id:
            await consultation_bookings_col.update_one(
                {"booking_id": booking_id},
                {"$set": {"payment_status": "paid", "updated_at": now_utc()}}
            )
            await create_audit_log("system", "payment_confirmed", "consultation_booking", booking_id, after_json={"payment_status": "paid", "session_id": session_id})
    elif txn and status.status == "expired":
        await payment_transactions_col.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "expired", "updated_at": now_utc()}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "metadata": status.metadata
    }

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        webhook_response = await stripe_checkout.handle_webhook(body, sig)
        
        if webhook_response.payment_status == "paid":
            booking_id = webhook_response.metadata.get("booking_id")
            if booking_id:
                await consultation_bookings_col.update_one(
                    {"booking_id": booking_id},
                    {"$set": {"payment_status": "paid", "updated_at": now_utc()}}
                )
                await payment_transactions_col.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "updated_at": now_utc()}}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ============ AI PLANNER ============

class PlannerInput(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    user_type: str
    specialty: str = ""
    budget: str
    operate_self: str
    ownership_preference: str
    num_units: int = 1
    additional_notes: Optional[str] = ""

@app.post("/api/planner/recommend")
async def generate_plan(inp: PlannerInput):
    """100% rule-based planner - DB-driven config, exact document numbers"""
    
    budget_map = {"Under 600K": 500000, "600K-2M": 1500000, "2M-3M": 2500000, "3M-5M": 4000000, "5M-8M": 6500000, "8M+": 10000000}
    budget_val = budget_map.get(inp.budget, 3000000)
    is_investor = inp.user_type == "investor"
    wants_managed = inp.operate_self == "managed_by_medpreneur"
    is_career_branch = inp.additional_notes and "career_stage:" in (inp.additional_notes or "")
    
    # Fetch configurable investment parameters from DB
    inv_config_doc = await site_content_col.find_one({"content_key": "investment_config"}, {"_id": 0})
    ic = inv_config_doc.get("value", get_default_investment_config()) if inv_config_doc else get_default_investment_config()
    mf = ic.get("managed_franchise", {})
    fr = ic.get("franchise", {})
    
    # Specialty-based salary data for UAE healthcare
    SPECIALTY_SALARIES = {
        "General Practitioner": {"monthly_min": 15000, "monthly_max": 25000, "annual_min": 180000, "annual_max": 300000},
        "Internal Medicine": {"monthly_min": 20000, "monthly_max": 35000, "annual_min": 240000, "annual_max": 420000},
        "Cardiology": {"monthly_min": 35000, "monthly_max": 60000, "annual_min": 420000, "annual_max": 720000},
        "Orthopedics": {"monthly_min": 30000, "monthly_max": 55000, "annual_min": 360000, "annual_max": 660000},
        "Dermatology": {"monthly_min": 25000, "monthly_max": 50000, "annual_min": 300000, "annual_max": 600000},
        "Pediatrics": {"monthly_min": 20000, "monthly_max": 35000, "annual_min": 240000, "annual_max": 420000},
        "OBGYN": {"monthly_min": 25000, "monthly_max": 45000, "annual_min": 300000, "annual_max": 540000},
        "General Dentist": {"monthly_min": 15000, "monthly_max": 30000, "annual_min": 180000, "annual_max": 360000},
        "Orthodontist": {"monthly_min": 25000, "monthly_max": 50000, "annual_min": 300000, "annual_max": 600000},
        "Physiotherapy": {"monthly_min": 12000, "monthly_max": 22000, "annual_min": 144000, "annual_max": 264000},
        "Radiology": {"monthly_min": 30000, "monthly_max": 50000, "annual_min": 360000, "annual_max": 600000},
        "Psychiatry": {"monthly_min": 25000, "monthly_max": 45000, "annual_min": 300000, "annual_max": 540000},
        "Pharmacist": {"monthly_min": 10000, "monthly_max": 20000, "annual_min": 120000, "annual_max": 240000},
        "Nurse": {"monthly_min": 6000, "monthly_max": 12000, "annual_min": 72000, "annual_max": 144000},
        "Healthcare Manager": {"monthly_min": 18000, "monthly_max": 35000, "annual_min": 216000, "annual_max": 420000},
    }
    default_salary = {"monthly_min": 15000, "monthly_max": 25000, "annual_min": 180000, "annual_max": 300000}
    salary = SPECIALTY_SALARIES.get(inp.specialty, default_salary) if inp.specialty else default_salary
    
    why_uae = "The UAE healthcare market is projected to exceed USD 39 billion by 2028 with 85%+ insurance penetration in Dubai and Abu Dhabi. Over 4,000 private clinics operate in a regulated, expanding market backed by strong government support for private sector participation and a growing expatriate population."
    why_mp = "MedPreneur provides a complete operating system - not consultancy. Insurance integration, clinical SOPs, HealthRails technology, central marketing engine, governance dashboards, and a replicable multi-outlet playbook create a competitive advantage no independent operator can match."
    
    # ===== CAREER PATHWAY =====
    if is_career_branch or budget_val < 600000:
        career_pkgs = await packages_col.find({"pathway_type": "career", "active_status": True}, {"_id": 0}).to_list(10)
        career_stage = ""
        if inp.additional_notes and "career_stage:" in inp.additional_notes:
            career_stage = inp.additional_notes.split("career_stage:")[1].strip()
        
        pkg_map = {"student": "Observership Package", "unlicensed": "Foundation Package", "licensed_seeking": "Hunter Package", "employed_growth": "Hunter Package"}
        recommended_name = pkg_map.get(career_stage, "Foundation Package")
        
        matched_pkg = None
        for p in career_pkgs:
            if p.get("package_name") == recommended_name:
                matched_pkg = p
                break
        if not matched_pkg and career_pkgs:
            matched_pkg = career_pkgs[0]
        
        pkg_price = matched_pkg.get("price", 5000) if matched_pkg else 5000
        pkg_name = matched_pkg.get("package_name", recommended_name) if matched_pkg else recommended_name
        pkg_desc = matched_pkg.get("description", "") if matched_pkg else ""
        pkg_features = matched_pkg.get("features", []) if matched_pkg else []
        
        recommendation = {
            "recommended_journey": "Career Pathway", "ownership_model": "Career (No Ownership Yet)", "recommended_tier": "N/A",
            "recommended_package": pkg_name, "clinic_format": f"{pkg_name} - {pkg_desc}" if pkg_desc else pkg_name,
            "package_features": pkg_features, "estimated_units": 0, "ownership_percentage": "N/A",
            "estimated_capital_required": f"AED {pkg_price:,.0f}", "expected_annual_revenue": f"AED {salary['annual_min']:,} - {salary['annual_max']:,} ({inp.specialty or 'Healthcare Professional'} salary in UAE)",
            "revenue_period": "Annual (post-employment)", "expected_roi": "N/A - Career development investment", "expected_irr": "N/A",
            "expected_payback": "N/A", "avg_monthly_return": f"AED {salary['monthly_min']:,} - {salary['monthly_max']:,} (Monthly {inp.specialty or 'healthcare'} salary)",
            "franchise_fee": "N/A", "royalty": "N/A", "managed_by": "Self-directed with MedPreneur career guidance", "risk_level": "Low",
            "risk_summary": f"Career pathway has minimal financial risk. Your investment of AED {pkg_price:,.0f} covers {pkg_name.lower()} including {', '.join(pkg_features[:3]) if pkg_features else 'structured career support'}. This builds the foundation for future healthcare asset ownership.",
            "fit_summary": f"Based on your profile as a {inp.specialty or inp.user_type.replace('_', ' ')} at the {career_stage.replace('_', ' ') if career_stage else 'early'} stage, the {pkg_name} at AED {pkg_price:,.0f} is your ideal starting point. MedPreneur will guide you through structured career progression. Expected salary range: AED {salary['annual_min']:,} - {salary['annual_max']:,} annually in the UAE.",
            "why_uae": why_uae, "why_medpreneur": "MedPreneur Career Pathway provides structured progression from student to licensed professional. Complete pipeline: observership, DataFlow, exam prep, and employment - all leading to healthcare asset ownership.",
            "suggested_next_step": "Book a Career Pathway Consultation", "confidence_level": "High"
        }
    
    # ===== MANAGED FRANCHISE PATHWAY =====
    elif is_investor or wants_managed:
        # Budget-aware combination calculator
        tier_costs = {"basic": 3000000, "standard": 5000000, "premium": 8000000}
        
        def calc_feasible(budget, requested_units):
            '''Calculate feasible clinic combinations within budget'''
            if budget >= 16000000 and requested_units >= 2:
                return {"combo": "1 Premium + 1 Standard", "units": 2, "total": 13000000, "primary": "premium"}
            if budget >= 11000000 and requested_units >= 2:
                return {"combo": "1 Premium + 1 Basic", "units": 2, "total": 11000000, "primary": "premium"}
            if budget >= 10000000 and requested_units >= 2:
                return {"combo": "2 Standard", "units": 2, "total": 10000000, "primary": "standard"}
            if budget >= 8000000 and requested_units >= 2:
                return {"combo": "1 Standard + 1 Basic", "units": 2, "total": 8000000, "primary": "standard"}
            if budget >= 8000000 and requested_units == 1:
                return {"combo": "1 Standard + 1 Basic", "units": 2, "total": 8000000, "primary": "portfolio_sb"}
            if budget >= 8000000:
                return {"combo": "1 Standard + 1 Basic", "units": 2, "total": 8000000, "primary": "portfolio_sb"}
            if budget >= 6000000 and requested_units >= 2:
                return {"combo": "2 Basic", "units": 2, "total": 6000000, "primary": "basic"}
            if budget >= 5000000:
                return {"combo": "1 Standard", "units": 1, "total": 5000000, "primary": "standard"}
            return {"combo": "1 Basic", "units": 1, "total": 3000000, "primary": "basic"}
        
        feasible = calc_feasible(budget_val, inp.num_units)
        primary_tier = feasible["primary"]
        actual_units = feasible["units"]
        
        # Budget adjustment note
        budget_note = ""
        if inp.num_units > actual_units:
            budget_note = f" Note: You requested {inp.num_units} clinics, but based on your {inp.budget} AED budget, the feasible configuration is {feasible['combo']} totaling AED {feasible['total']:,.0f}."
        
        if budget_val >= 16000000 and actual_units >= 2:
            recommendation = {"recommended_journey": "Managed Franchise Pathway", "ownership_model": "Managed Franchise (Multiple Units)", "recommended_tier": feasible["combo"], "clinic_format": f"Multiple Managed Polyclinics: {feasible['combo']} (Total AED {feasible['total']:,.0f})", "estimated_units": actual_units, "ownership_percentage": "100% equity in each SPV", "estimated_capital_required": "AED 13,000,000 - 16,000,000 (for 2 clinics)", "expected_annual_revenue": "AED 20,060,234 (Combined Annual Year 2)", "revenue_period": "Annual (Year 2 steady state)", "expected_roi": "281-327% (5-Year Total per clinic)", "expected_irr": "32-35%", "expected_payback": "~2.5-3 years", "avg_monthly_return": "AED 335,165 (Combined total returns / 60 months)", "franchise_fee": "15% of equity ticket per clinic (one-time)", "royalty": "Profit share: 60% investor / 40% MedPreneur", "managed_by": "Fully managed by MedPreneur", "risk_level": "Medium", "risk_summary": "Multiple managed units diversify risk across locations. MedPreneur handles all operations. 15% retainer per clinic. 60/40 profit split.", "fit_summary": f"With {inp.budget} AED, build a portfolio of managed healthcare assets. Premium + Standard combination maximizes market coverage. Each clinic operates under its own SPV with exit optionality at 6x EBITDA.", "why_uae": why_uae, "why_medpreneur": why_mp, "total_5yr_revenue": "AED 26,180,631 (5-year distributions + exit value)", "exit_valuation_multiple": "6x EBITDA", "exit_clinic_valuation": "AED 29,740,000", "exit_investor_share": "AED 17,850,000", "year2_investor_cash": "AED 1,600,000", "year3_investor_cash": "AED 1,709,600", "year4_investor_cash": "AED 2,050,712", "year5_investor_cash": "AED 2,974,331", "total_5yr_distributions": "AED 8,334,643", "scenarios": [{"name": "Premium (Recommended)", "investment": "AED 8,000,000", "roi_5yr": "327%", "irr": "35%", "managed": "MedPreneur"}, {"name": "Standard (Alternative)", "investment": "AED 5,000,000", "roi_5yr": "281%", "irr": "32%", "managed": "MedPreneur"}, {"name": "Full Franchise (Self-Operate)", "investment": "AED 5,000,000-6,500,000", "roi_5yr": "30-35% annual", "irr": "N/A", "managed": "Self-operated"}], "suggested_next_step": "Book a Managed Franchise Consultation", "confidence_level": "High"}
        elif primary_tier == "portfolio_sb":
            # Portfolio: 1 Standard (5M) + 1 Basic (3M) = 8M total
            combined_monthly = (14039092 + 7095020) / 60  # Combined 5yr returns / 60
            recommendation = {"recommended_journey": "Managed Franchise Pathway", "ownership_model": "Managed Franchise Portfolio", "recommended_tier": "1 Standard + 1 Basic Clinic", "clinic_format": "Portfolio: 1 Standard Polyclinic (2,500 sqft, 5 OPD) + 1 Basic Polyclinic (2,000 sqft, 4 OPD)", "estimated_units": 2, "ownership_percentage": "100% equity in each SPV", "estimated_capital_required": "AED 8,000,000 (AED 5,000,000 Standard + AED 3,000,000 Basic)", "expected_annual_revenue": "AED 12,539,336 (Combined Annual Year 2)", "revenue_period": "Annual (Year 2 steady state)", "expected_roi": "264% (Combined 5-Year Total)", "expected_irr": "30% (Blended)", "expected_payback": "~3 years", "avg_monthly_return": f"AED {combined_monthly:,.0f} (Combined total 5-year returns / 60 months)", "franchise_fee": "15% of equity ticket per clinic", "royalty": "Profit share: 60% investor / 40% MedPreneur per clinic", "managed_by": "Fully managed by MedPreneur - both clinics", "risk_level": "Medium", "risk_summary": "Portfolio approach diversifies risk across two locations and clinic formats. MedPreneur manages both units independently. Each clinic under its own SPV. Combined 5-year return: AED 21,134,112.", "fit_summary": f"For your {inp.budget} AED budget, a portfolio of 1 Standard + 1 Basic clinic optimizes capital across 2 operational units. This gives you geographic and specialty diversification while maximizing your total return. MedPreneur manages both clinics with independent governance dashboards.{budget_note}", "why_uae": why_uae, "why_medpreneur": why_mp, "total_5yr_revenue": "AED 21,134,112 (Combined 5-year returns for both clinics)", "exit_valuation_multiple": "6x EBITDA", "exit_clinic_valuation": "AED 24,310,000 (Combined)", "exit_investor_share": "AED 14,590,000 (Combined)", "scenarios": [{"name": "1 Standard + 1 Basic (Recommended)", "investment": "AED 8,000,000", "roi_5yr": "264% combined", "irr": "30%", "managed": "MedPreneur"}, {"name": "1 Premium Only", "investment": "AED 8,000,000", "roi_5yr": "327%", "irr": "35%", "managed": "MedPreneur"}, {"name": "2 Basic + Buffer", "investment": "AED 6,000,000", "roi_5yr": "236% each", "irr": "28%", "managed": "MedPreneur"}], "suggested_next_step": "Book a Managed Franchise Consultation", "confidence_level": "High"}
        elif primary_tier == "premium":
            recommendation = {"recommended_journey": "Managed Franchise Pathway", "ownership_model": "Managed Franchise", "recommended_tier": "Premium", "clinic_format": "Premium Polyclinic - 3,200 sqft, 7 OPD rooms, Full Lab, Ultrasound + X-ray, 2 Dental Chairs", "estimated_units": actual_units, "ownership_percentage": "100% equity in SPV", "estimated_capital_required": "AED 8,000,000 per clinic", "expected_annual_revenue": "AED 11,839,080 (Annual Year 2)", "revenue_period": "Annual (Year 2 steady state)", "expected_roi": "327% (5-Year Total incl. exit at 6x EBITDA)", "expected_irr": "35%", "expected_payback": "~2.5 years", "avg_monthly_return": "AED 436,344 (Total 5-year return AED 26,180,631 / 60 months)", "franchise_fee": "15% of equity ticket (AED 1,200,000 one-time)", "royalty": "Profit share: 60% investor / 40% MedPreneur", "managed_by": "Fully managed by MedPreneur", "risk_level": "Medium", "risk_summary": "Premium tier offers highest returns. MedPreneur handles all operations. Year 1 stabilization with 6-month buffer. Distributions start Year 2. 5-year total return: AED 26,180,631.", "fit_summary": f"Premium Managed Franchise is the top-tier for your {inp.budget} AED budget.{budget_note} 7 OPD rooms, full diagnostics, dual dental. MedPreneur manages everything. 60% of net profit to you. Exit at 6x EBITDA.", "why_uae": why_uae, "why_medpreneur": why_mp, "total_5yr_revenue": "AED 26,180,631 (5-year distributions + exit value)", "exit_valuation_multiple": "6x EBITDA", "exit_clinic_valuation": "AED 29,740,000", "exit_investor_share": "AED 17,850,000", "year2_investor_cash": "AED 1,600,000", "year3_investor_cash": "AED 1,709,600", "year4_investor_cash": "AED 2,050,712", "year5_investor_cash": "AED 2,974,331", "total_5yr_distributions": "AED 8,334,643", "scenarios": [{"name": "Premium (Recommended)", "investment": "AED 8,000,000", "roi_5yr": "327%", "irr": "35%", "managed": "MedPreneur"}, {"name": "Standard (Alternative)", "investment": "AED 5,000,000", "roi_5yr": "281%", "irr": "32%", "managed": "MedPreneur"}, {"name": "2 Standard (Portfolio)", "investment": "AED 10,000,000", "roi_5yr": "281% each", "irr": "32%", "managed": "MedPreneur"}], "suggested_next_step": "Book a Managed Franchise Consultation", "confidence_level": "High"}
        elif primary_tier == "standard":
            recommendation = {"recommended_journey": "Managed Franchise Pathway", "ownership_model": "Managed Franchise", "recommended_tier": "Standard", "clinic_format": "Standard Polyclinic - 2,500 sqft, 5 OPD rooms, Full Lab, Ultrasound, 1 Dental Chair", "estimated_units": actual_units, "ownership_percentage": "100% equity in SPV", "estimated_capital_required": "AED 5,000,000 per clinic", "expected_annual_revenue": "AED 8,221,154 (Annual Year 2)", "revenue_period": "Annual (Year 2 steady state)", "expected_roi": "281% (5-Year Total incl. exit at 6x EBITDA)", "expected_irr": "32%", "expected_payback": "~3 years", "avg_monthly_return": "AED 233,985 (Total 5-year return AED 14,039,092 / 60 months)", "franchise_fee": "15% of equity ticket (AED 750,000 one-time)", "royalty": "Profit share: 60% investor / 40% MedPreneur", "managed_by": "Fully managed by MedPreneur", "risk_level": "Medium", "risk_summary": "Standard tier balances investment with returns. MedPreneur manages everything. Year 1 stabilization. 5-year total return: AED 14,039,092.", "fit_summary": f"Standard Managed Franchise is the most popular for {inp.budget} AED.{budget_note} 5 OPD rooms, full lab, dental. 60% of net profit. Exit at 6x EBITDA.", "why_uae": why_uae, "why_medpreneur": why_mp, "total_5yr_revenue": "AED 14,039,092 (5-year distributions + exit value)", "exit_valuation_multiple": "6x EBITDA", "exit_clinic_valuation": "AED 16,110,000", "exit_investor_share": "AED 9,670,000", "scenarios": [{"name": "Standard (Recommended)", "investment": "AED 5,000,000", "roi_5yr": "281%", "irr": "32%", "managed": "MedPreneur"}, {"name": "Premium (Upgrade)", "investment": "AED 8,000,000", "roi_5yr": "327%", "irr": "35%", "managed": "MedPreneur"}, {"name": "Basic (Lighter)", "investment": "AED 3,000,000", "roi_5yr": "236%", "irr": "28%", "managed": "MedPreneur"}], "suggested_next_step": "Book a Managed Franchise Consultation", "confidence_level": "High"}
        else:
            recommendation = {"recommended_journey": "Managed Franchise Pathway", "ownership_model": "Managed Franchise", "recommended_tier": "Basic", "clinic_format": "Basic Polyclinic - 2,000 sqft, 4 OPD rooms, Mini Lab, Ultrasound", "estimated_units": actual_units, "ownership_percentage": "100% equity in SPV", "estimated_capital_required": "AED 3,000,000 per clinic", "expected_annual_revenue": "AED 4,318,182 (Annual Year 2)", "revenue_period": "Annual (Year 2 steady state)", "expected_roi": "236% (5-Year Total incl. exit at 6x EBITDA)", "expected_irr": "28%", "expected_payback": "~3.5 years", "avg_monthly_return": "AED 118,250 (Total 5-year return AED 7,095,020 / 60 months)", "franchise_fee": "15% of equity ticket (AED 450,000 one-time)", "royalty": "Profit share: 60% investor / 40% MedPreneur", "managed_by": "Fully managed by MedPreneur", "risk_level": "Medium", "risk_summary": "Basic tier is the entry managed investment. Break-even: 40 patients/day. Year 1 stabilization. 5-year total return: AED 7,095,020.", "fit_summary": f"Basic Managed Franchise is the entry point for {inp.budget} AED.{budget_note} 4 OPD rooms, core specialties. MedPreneur manages everything. 60% of net profit to you.", "why_uae": why_uae, "why_medpreneur": why_mp, "total_5yr_revenue": "AED 7,095,020 (5-year distributions + exit value)", "exit_valuation_multiple": "6x EBITDA", "exit_clinic_valuation": "AED 8,200,000", "exit_investor_share": "AED 4,920,000", "year2_investor_cash": "AED 405,000", "year3_investor_cash": "AED 425,100", "year4_investor_cash": "AED 523,137", "year5_investor_cash": "AED 820,255", "total_5yr_distributions": "AED 2,173,492", "scenarios": [{"name": "Basic (Recommended)", "investment": "AED 3,000,000", "roi_5yr": "236%", "irr": "28%", "managed": "MedPreneur"}, {"name": "Standard (Upgrade)", "investment": "AED 5,000,000", "roi_5yr": "281%", "irr": "32%", "managed": "MedPreneur"}, {"name": "Full Franchise (Self-Operate)", "investment": "AED 2,000,000-2,500,000", "roi_5yr": "28-40% annual", "irr": "N/A", "managed": "Self-operated"}], "suggested_next_step": "Book a Managed Franchise Consultation", "confidence_level": "High"}
    
    # ===== FRANCHISE PATHWAY (Self-operated) =====
    elif budget_val >= 8000000:
        # Portfolio: 1 Standard + 1 Basic for 8M+ self-operated
        combined_annual_rev = 11520000 + 6552000  # Standard + Basic
        combined_net_profit = 1868000 + 1396800  # After royalty
        combined_monthly = combined_net_profit / 12
        combined_5yr = combined_net_profit * 5
        recommendation = {"recommended_journey": "Franchise Pathway", "ownership_model": "Full Franchise Portfolio", "recommended_tier": "1 Standard + 1 Basic Clinic", "clinic_format": "Portfolio: 1 Standard Polyclinic (5+ OPD, Full Lab, Dental) + 1 Basic Polyclinic (4 OPD, Mini Lab)", "estimated_units": 2, "ownership_percentage": "100% each clinic", "estimated_capital_required": f"AED 8,000,000 (AED 5,500,000 Standard + AED 2,500,000 Basic)", "expected_annual_revenue": f"AED {combined_annual_rev:,.0f} (Combined Annual Year 2)", "revenue_period": "Annual (Year 2 steady state)", "expected_roi": f"30-35% (Annual Owner ROI per clinic)", "expected_irr": "N/A - Owner-operated", "expected_payback": "~2-3 years", "avg_monthly_return": f"AED {combined_monthly:,.0f} (Combined monthly net profit / 12 months)", "franchise_fee": "15% of CAPEX per clinic (one-time)", "royalty": "10% of gross revenue per clinic (ongoing)", "managed_by": "Self-operated with MedPreneur operating system for both clinics", "risk_level": "Medium", "feasibility": {"standard": {"monthly_revenue": "AED 960,000", "monthly_profit": "AED 155,667", "annual_revenue": "AED 11,520,000", "annual_net_profit": "AED 1,868,000", "ebitda": "AED 3,020,000", "royalty_annual": "AED 1,152,000"}, "basic": {"monthly_revenue": "AED 546,000", "monthly_profit": "AED 116,400", "annual_revenue": "AED 6,552,000", "annual_net_profit": "AED 1,396,800", "ebitda": "AED 2,052,000", "royalty_annual": "AED 655,200"}}, "risk_summary": f"Portfolio approach diversifies risk across two clinics with different scales and specialties. MedPreneur operating system supports both. Combined annual net profit: AED {combined_net_profit:,.0f}. Total 5-year net: AED {combined_5yr:,.0f}.", "fit_summary": f"With your {inp.budget} AED budget, a portfolio of 1 Standard + 1 Basic clinic maximizes your operational footprint. You operate both using MedPreneur's franchise system. Combined monthly net profit after royalty: AED {combined_monthly:,.0f}.", "why_uae": why_uae, "why_medpreneur": why_mp, "scenarios": [{"name": "1 Standard + 1 Basic (Recommended)", "investment": "AED 8,000,000", "roi_5yr": "30-35% annual", "irr": "N/A", "managed": "Self-operated"}, {"name": "1 Standard Only", "investment": "AED 5,500,000", "roi_5yr": "30-35% annual", "irr": "N/A", "managed": "Self-operated"}, {"name": "Switch to Managed", "investment": "AED 8,000,000", "roi_5yr": "264% (5-Year)", "irr": "30%", "managed": "MedPreneur"}], "suggested_next_step": "Book a Franchise Ownership Consultation", "confidence_level": "High"}
    elif budget_val >= 5000000:
        recommendation = {"recommended_journey": "Franchise Pathway", "ownership_model": "Full Franchise", "recommended_tier": "Standard Polyclinic", "clinic_format": "Polyclinic with Pharmacy and Lab - 5+ OPD rooms, Full Lab, 1 Dental Chair", "estimated_units": 1, "ownership_percentage": "100%", "estimated_capital_required": "AED 5,000,000 - 6,500,000", "expected_annual_revenue": "AED 11,520,000 (Annual steady state)", "revenue_period": "Annual (Year 2)", "expected_roi": "30-35% (Annual Owner ROI after royalty)", "expected_irr": "N/A - Owner-operated", "expected_payback": "~2-3 years", "avg_monthly_return": "AED 155,667 (Annual net profit / 12 months)", "franchise_fee": "15% of CAPEX (one-time: ~AED 412,500)", "royalty": "10% of gross revenue (ongoing)", "managed_by": "Self-operated with MedPreneur operating system", "risk_level": "Medium", "feasibility": {"clinic": {"monthly_revenue": "AED 960,000", "monthly_profit": "AED 155,667", "annual_revenue": "AED 11,520,000", "annual_net_profit": "AED 1,868,000", "ebitda": "AED 3,020,000", "royalty_annual": "AED 1,152,000", "payback": "~2-3 years"}}, "risk_summary": "Full franchise with MedPreneur operating system. Insurance, marketing, SOPs all provided. Annual net profit: AED 1,868,000 after 10% royalty.", "fit_summary": f"Full Franchise Polyclinic for {inp.budget} AED. 100% ownership, you operate. After 10% royalty, annual net profit AED 1,868,000. Monthly: AED 155,667.", "why_uae": why_uae, "why_medpreneur": why_mp, "scenarios": [{"name": "Standard (Recommended)", "investment": "AED 5,500,000", "roi_5yr": "30-35% annual", "irr": "N/A", "managed": "Self-operated"}, {"name": "Basic (Lighter)", "investment": "AED 2,500,000", "roi_5yr": "28-40% annual", "irr": "N/A", "managed": "Self-operated"}, {"name": "Switch to Managed", "investment": "AED 5,000,000", "roi_5yr": "281% (5-Year)", "irr": "32%", "managed": "MedPreneur"}], "suggested_next_step": "Book a Franchise Ownership Consultation", "confidence_level": "High"}
    elif budget_val >= 2000000:
        model = "Full Franchise" if inp.ownership_preference == "full_ownership" else "Co-Franchise"
        pct = "100%" if inp.ownership_preference == "full_ownership" else "20-50%"
        recommendation = {"recommended_journey": "Franchise Pathway", "ownership_model": model, "recommended_tier": "Basic Polyclinic", "clinic_format": "Individual GP Clinic or Co-Franchise Polyclinic", "estimated_units": 1, "ownership_percentage": pct, "estimated_capital_required": "AED 2,000,000 - 2,500,000", "expected_annual_revenue": "AED 6,552,000 (Annual steady state)", "revenue_period": "Annual (Year 2)", "expected_roi": "28-40% (Annual Owner ROI)", "expected_irr": "N/A - Owner-operated", "expected_payback": "~2-3 years", "avg_monthly_return": "AED 116,400 (Annual net profit / 12 months)", "franchise_fee": "15% of CAPEX (one-time: ~AED 315,000)", "royalty": "10% of gross revenue (ongoing)", "managed_by": "Self-operated with MedPreneur operating system", "risk_level": "Medium", "risk_summary": f"{model} with MedPreneur support. Insurance, marketing, compliance centralized.", "fit_summary": f"{model} for {inp.budget} AED. {pct} ownership as a {inp.user_type.replace('_', ' ')}. MedPreneur operating system included.", "why_uae": why_uae, "why_medpreneur": why_mp, "suggested_next_step": "Book a Franchise Ownership Consultation", "confidence_level": "High"}
    else:
        # Slot Franchise: Calculate real numbers based on equity share
        # Using Basic clinic as reference: annual revenue 6,552,000, net profit ~1,396,800
        # At 10% equity: monthly profit = 1,396,800 * 0.10 / 12 = 11,640
        equity_pct = 10  # midpoint of 5-15%
        base_clinic_revenue = 6552000
        base_net_profit = 1396800
        investor_annual = base_net_profit * equity_pct / 100
        investor_monthly = investor_annual / 12
        investor_5yr = investor_annual * 5
        recommendation = {"recommended_journey": "Franchise Pathway", "ownership_model": "Slot Franchise", "recommended_tier": "Co-Franchise Room", "clinic_format": "Own a room within a larger MedPreneur polyclinic - revenue tracked independently, royalty applied proportionally", "estimated_units": 1, "ownership_percentage": "5-15% (estimated 10%)", "estimated_capital_required": "AED 600,000 - 900,000 per room", "expected_annual_revenue": f"AED {base_clinic_revenue:,.0f} (Full clinic annual revenue)", "revenue_period": "Annual (Year 2 steady state)", "expected_roi": "30%+ (Annual)", "expected_irr": "N/A", "expected_payback": "~2-3 years", "avg_monthly_return": f"AED {investor_monthly:,.0f} (at 10% equity: clinic net profit x equity share / 12)", "franchise_fee": "Included in room investment", "royalty": "Applied proportionally to room revenue", "managed_by": "Shared clinic infrastructure with MedPreneur operating system", "risk_level": "Low-Medium", "investor_annual_profit": f"AED {investor_annual:,.0f}", "investor_5yr_total": f"AED {investor_5yr:,.0f}", "risk_summary": f"Slot franchise is the lowest capital entry to healthcare asset ownership. At 10% equity your estimated annual profit is AED {investor_annual:,.0f} based on clinic net profit of AED {base_net_profit:,.0f}. Shared infrastructure reduces overhead and risk.", "fit_summary": f"With {inp.budget} AED, the Slot Franchise gives you immediate healthcare asset ownership at 5-15% equity. At 10% equity in a Basic polyclinic, your estimated monthly return is AED {investor_monthly:,.0f}. This is MedPreneur's structured entry ladder - scale to co-franchise or full ownership as you grow.", "why_uae": why_uae, "why_medpreneur": why_mp, "suggested_next_step": "Book a Franchise Ownership Consultation", "confidence_level": "High"}
    
    plan_record = {"plan_id": generate_id(), "input": inp.dict(), "recommendation": recommendation, "created_at": now_utc()}
    await db["planner_results"].insert_one(plan_record)
    await create_audit_log("system", "plan_generated", "planner", plan_record["plan_id"], after_json={"user_type": inp.user_type, "budget": inp.budget})
    
    # Auto-create lead if contact info provided
    if inp.full_name and inp.email:
        existing_lead = await leads_col.find_one({"email": inp.email})
        pathway_map = {"career": "career", "franchise": "franchise", "managed_franchise": "managed_franchise"}
        pathway = "career"
        if inp.additional_notes and "career_stage:" in inp.additional_notes:
            pathway = "career"
        elif inp.operate_self == "managed_by_medpreneur" or inp.user_type == "investor":
            pathway = "managed_franchise"
        else:
            pathway = "franchise"
        
        if not existing_lead:
            lead_data = {
                "lead_id": generate_id(),
                "full_name": inp.full_name,
                "email": inp.email,
                "phone": inp.phone,
                "country": "",
                "profession_category": inp.user_type.replace("_", " ").title() if inp.user_type != "investor" else "Investor",
                "specialty": "",
                "years_experience": 0,
                "pathway_interest": pathway,
                "investment_capacity": inp.budget,
                "preferred_timeline": "",
                "consultation_interest": True,
                "source": "report_generator",
                "assigned_to": "",
                "lead_status": "new",
                "notes": f"REPORT GENERATED: {recommendation.get('recommended_journey', '')} | Model: {recommendation.get('ownership_model', '')} | Tier: {recommendation.get('recommended_tier', recommendation.get('recommended_package', ''))} | Capital: {recommendation.get('estimated_capital_required', '')} | ROI: {recommendation.get('expected_roi', '')} | Units: {recommendation.get('estimated_units', 1)} | Managed: {recommendation.get('managed_by', '')}",
                "report_id": plan_record["plan_id"],
                "report_recommendation": recommendation.get('recommended_journey', ''),
                "report_tier": recommendation.get('recommended_tier', recommendation.get('recommended_package', '')),
                "report_capital": recommendation.get('estimated_capital_required', ''),
                "created_at": now_utc(),
                "updated_at": now_utc()
            }
            await leads_col.insert_one(lead_data)
            await create_audit_log("system", "lead_created_from_planner", "lead", lead_data["lead_id"], after_json={"source": "report_generator", "email": inp.email, "recommendation": recommendation.get('recommended_journey', '')})
    
    return {"plan_id": plan_record["plan_id"], "recommendation": recommendation}

# ============ SEED DATA ============

@app.post("/api/seed")
async def seed_data():
    # Check if already seeded
    admin = await users_col.find_one({"email": "admin@medpreneur.com"})
    if admin:
        return {"message": "Data already seeded"}
    
    # Create admin user
    admin_user = {
        "user_id": generate_id(),
        "full_name": "MedPreneur Admin",
        "email": "admin@medpreneur.com",
        "password_hash": hash_password("admin123"),
        "phone": "+971500000000",
        "country": "UAE",
        "user_type": "admin",
        "profession_category": "",
        "specialty": "",
        "years_experience": 0,
        "role": "admin",
        "status": "active",
        "created_at": now_utc(),
        "updated_at": now_utc()
    }
    await users_col.insert_one(admin_user)
    
    # Seed system config
    configs = [
        {"config_key": "professions", "value": ["Doctor", "Dentist", "Pharmacist", "Allied Healthcare Professional", "Healthcare Manager"], "updated_at": now_utc()},
        {"config_key": "specialties", "value": {
            "Doctor": ["General Practitioner", "Cardiologist", "Dermatologist", "OBGYN", "Pediatrician", "Orthopedic", "ENT", "Ophthalmologist", "Neurologist", "Psychiatrist", "Surgeon", "Internal Medicine", "Other"],
            "Dentist": ["General Dentist", "Orthodontist", "Periodontist", "Endodontist", "Oral Surgeon", "Prosthodontist", "Pediatric Dentist", "Other"],
            "Pharmacist": ["Hospital Pharmacist", "Community Pharmacist", "Clinical Pharmacist", "Retail Pharmacist", "Other"],
            "Allied Healthcare Professional": ["Nurse", "Physiotherapist", "Lab Technician", "Radiographer", "Dietitian", "Psychologist", "Other"],
            "Healthcare Manager": ["Hospital Administrator", "Clinic Manager", "Healthcare Consultant", "Operations Manager", "Other"]
        }, "updated_at": now_utc()},
        {"config_key": "countries", "value": ["UAE", "India", "Pakistan", "Bangladesh", "Philippines", "Egypt", "Jordan", "Iraq", "United Kingdom", "United States", "Canada", "Saudi Arabia", "Qatar", "Bahrain", "Kuwait", "Oman", "Other"], "updated_at": now_utc()},
        {"config_key": "pathways", "value": ["career", "franchise", "managed_franchise"], "updated_at": now_utc()},
        {"config_key": "lead_sources", "value": ["website", "referral", "social_media", "event", "direct", "other"], "updated_at": now_utc()},
    ]
    for config in configs:
        await system_config_col.update_one({"config_key": config["config_key"]}, {"$set": config}, upsert=True)
    
    # Seed consultation types
    consultation_types = [
        {
            "consultation_type_id": generate_id(),
            "title": "Career Pathway Consultation",
            "description": "Discuss your healthcare career options in the UAE including licensing, employment pathways, and professional development opportunities.",
            "duration_minutes": 30,
            "price": 0,
            "currency": "AED",
            "active_status": True,
            "created_at": now_utc(),
            "updated_at": now_utc()
        },
        {
            "consultation_type_id": generate_id(),
            "title": "Franchise Ownership Consultation",
            "description": "Explore clinic ownership opportunities including franchise models, co-franchise options, and clinic setup pathways.",
            "duration_minutes": 45,
            "price": 500,
            "currency": "AED",
            "active_status": True,
            "created_at": now_utc(),
            "updated_at": now_utc()
        },
        {
            "consultation_type_id": generate_id(),
            "title": "Managed Franchise Consultation",
            "description": "Learn about managed franchise opportunities, clinic templates, investment tiers, and projected returns for healthcare investors.",
            "duration_minutes": 60,
            "price": 0,
            "currency": "AED",
            "active_status": True,
            "created_at": now_utc(),
            "updated_at": now_utc()
        },
    ]
    for ct in consultation_types:
        await consultation_types_col.insert_one(ct)
    
    # Seed sample leads
    sample_leads = [
        {
            "lead_id": generate_id(), "full_name": "Dr. Ahmed Hassan", "email": "ahmed.hassan@example.com",
            "phone": "+971501234567", "country": "UAE", "profession_category": "Doctor",
            "specialty": "Cardiologist", "years_experience": 12, "pathway_interest": "franchise",
            "investment_capacity": "5M-8M AED", "preferred_timeline": "3-6 months",
            "consultation_interest": True, "source": "website", "assigned_to": "",
            "lead_status": "new", "notes": "", "created_at": now_utc(), "updated_at": now_utc()
        },
        {
            "lead_id": generate_id(), "full_name": "Sarah Al-Maktoum", "email": "sarah.m@example.com",
            "phone": "+971502345678", "country": "UAE", "profession_category": "Dentist",
            "specialty": "Orthodontist", "years_experience": 8, "pathway_interest": "franchise",
            "investment_capacity": "2M-3M AED", "preferred_timeline": "6-12 months",
            "consultation_interest": True, "source": "referral", "assigned_to": "",
            "lead_status": "contacted", "notes": "Interested in dental clinic franchise", "created_at": now_utc(), "updated_at": now_utc()
        },
        {
            "lead_id": generate_id(), "full_name": "Rajesh Patel", "email": "rajesh.p@example.com",
            "phone": "+917890123456", "country": "India", "profession_category": "Doctor",
            "specialty": "General Practitioner", "years_experience": 5, "pathway_interest": "career",
            "investment_capacity": "", "preferred_timeline": "1-3 months",
            "consultation_interest": True, "source": "social_media", "assigned_to": "",
            "lead_status": "new", "notes": "", "created_at": now_utc(), "updated_at": now_utc()
        },
        {
            "lead_id": generate_id(), "full_name": "Mohammed Al-Rashid", "email": "mohammed.r@example.com",
            "phone": "+971503456789", "country": "UAE", "profession_category": "Healthcare Manager",
            "specialty": "Hospital Administrator", "years_experience": 15, "pathway_interest": "managed_franchise",
            "investment_capacity": "8M+ AED", "preferred_timeline": "3-6 months",
            "consultation_interest": True, "source": "event", "assigned_to": "",
            "lead_status": "new", "notes": "", "created_at": now_utc(), "updated_at": now_utc()
        },
    ]
    for lead in sample_leads:
        await leads_col.insert_one(lead)
    
    # Seed career packages
    career_packages = [
        {"package_id": generate_id(), "package_name": "Observership Package", "pathway_type": "career", "description": "For students and fresh graduates seeking clinical observership placement and structured career planning in the UAE.", "price": 2500.0, "currency": "AED", "features": ["Profile assessment", "Observership placement guidance", "Documentation readiness", "Structured pathway planning"], "active_status": True, "created_at": now_utc(), "updated_at": now_utc()},
        {"package_id": generate_id(), "package_name": "Foundation Package", "pathway_type": "career", "description": "Licensing readiness program for healthcare professionals preparing for UAE practice.", "price": 5000.0, "currency": "AED", "features": ["Eligibility confirmation", "DataFlow verification guidance", "Exam preparation roadmap", "Study resources access", "Booking coordination"], "active_status": True, "created_at": now_utc(), "updated_at": now_utc()},
        {"package_id": generate_id(), "package_name": "Hunter Package", "pathway_type": "career", "description": "Employment pathway for healthcare professionals seeking positions in the UAE healthcare sector.", "price": 7500.0, "currency": "AED", "features": ["UAE visit visa guidance", "Accommodation support", "Job application management", "Interview facilitation", "Placement support"], "active_status": True, "created_at": now_utc(), "updated_at": now_utc()},
    ]
    for pkg in career_packages:
        await packages_col.insert_one(pkg)
    
    # Seed site content
    site_contents = [
        {"content_key": "contact_info", "value": {"phone_numbers": ["+971 54 539 8962", "+971 50 660 3525"], "email": "info@medpreneur.com", "address": "Dubai, United Arab Emirates"}, "updated_at": now_utc()},
        {"content_key": "hero_images", "value": {"homepage": {"image_url": "", "quote": "From Medical Degree to Healthcare Asset Ownership"}, "career": {"image_url": "", "quote": "Launch Your Healthcare Career in the UAE"}, "franchise": {"image_url": "", "quote": "Own a Healthcare Asset, Operate with Intelligence"}, "managed_franchise": {"image_url": "", "quote": "Invest in Healthcare Infrastructure with Professional Management"}, "about": {"image_url": "", "quote": "Building the Future of Healthcare Ownership"}, "consultation": {"image_url": "", "quote": "Book a Personalized Consultation"}}, "updated_at": now_utc()},
        {"content_key": "testimonials", "value": {"video_testimonials": [{"name": "Dr. Fatima Al-Zahra", "role": "Cardiologist, Dubai", "video_url": "", "thumbnail": "", "quote": "MedPreneur gave me a clear pathway from being a practicing cardiologist to owning my own polyclinic. The operating system handles everything I never had time to learn."}, {"name": "Dr. Khalid Rahman", "role": "General Practitioner, Abu Dhabi", "video_url": "", "thumbnail": "", "quote": "The franchise model reduced my risk significantly. I went from dreaming about clinic ownership to actually running one within 8 months."}], "written_testimonials": [{"name": "Dr. Sarah Al-Maktoum", "role": "Orthodontist, Sharjah", "quote": "The co-franchise model was perfect for me. Lower capital, shared infrastructure, and I still have ownership from day one. MedPreneur made it simple.", "rating": 5}, {"name": "Ahmed Al-Rashid", "role": "Healthcare Investor, Dubai", "quote": "As an investor, the managed franchise model gives me exposure to healthcare assets with transparent governance. The 60/40 profit share is fair and the dashboards give me real-time visibility.", "rating": 5}, {"name": "Dr. Priya Sharma", "role": "Dermatologist, Dubai", "quote": "From India to owning a clinic in Dubai - MedPreneur handled the licensing, insurance panel onboarding, and even patient acquisition. I just focus on my patients.", "rating": 5}, {"name": "Mohammed Al-Faisal", "role": "Family Office, Abu Dhabi", "quote": "We were looking for healthcare exposure in our portfolio. MedPreneur offered a structured SPV model with clear exit optionality. Professional management and monthly reporting sealed the deal.", "rating": 5}]}, "updated_at": now_utc()},
        {"content_key": "homepage_media", "value": {"images": [], "videos": []}, "updated_at": now_utc()},
    ]
    for sc in site_contents:
        await site_content_col.update_one({"content_key": sc["content_key"]}, {"$set": sc}, upsert=True)
    
    await create_audit_log("system", "seed_data", "system", "seed", after_json={"message": "Initial data seeded"})
    
    return {"message": "Seed data created successfully", "admin_email": "admin@medpreneur.com", "admin_password": "admin123"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
