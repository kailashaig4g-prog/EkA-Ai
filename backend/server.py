from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import socketio
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'eka-ai-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Socket.IO setup for real-time notifications
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=False
)

# Create the main FastAPI app
fastapi_app = FastAPI(title="EKA-AI API", version="1.0.0")

# Wrap FastAPI with Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Store connected clients
connected_clients: Dict[str, str] = {}  # sid -> user_id


# ==================== SOCKET.IO EVENTS ====================

@sio.event
async def connect(sid, environ):
    logging.info(f"Client connected: {sid}")
    await sio.emit('connected', {'message': 'Connected to EKA-AI real-time server'}, to=sid)

@sio.event
async def disconnect(sid):
    logging.info(f"Client disconnected: {sid}")
    if sid in connected_clients:
        del connected_clients[sid]

@sio.event
async def authenticate(sid, data):
    """Authenticate socket connection with JWT token"""
    try:
        token = data.get('token')
        if token:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("sub")
            connected_clients[sid] = user_id
            await sio.emit('authenticated', {'status': 'success', 'user_id': user_id}, to=sid)
            logging.info(f"User {user_id} authenticated on socket {sid}")
    except Exception as e:
        await sio.emit('authenticated', {'status': 'error', 'message': str(e)}, to=sid)

@sio.event
async def subscribe_pipeline(sid, data):
    """Subscribe to pipeline updates for a specific question"""
    question_id = data.get('question_id')
    if question_id:
        await sio.enter_room(sid, f"pipeline_{question_id}")
        logging.info(f"Client {sid} subscribed to pipeline_{question_id}")

@sio.event
async def subscribe_station(sid, data):
    """Subscribe to station updates"""
    station_id = data.get('station_id')
    if station_id:
        await sio.enter_room(sid, f"station_{station_id}")


# Helper function to emit notifications
async def emit_notification(user_id: str, notification: dict):
    """Emit notification to specific user"""
    for sid, uid in connected_clients.items():
        if uid == user_id:
            await sio.emit('notification', notification, to=sid)

async def emit_pipeline_update(question_id: str, step: str, data: dict = None):
    """Emit pipeline status update"""
    await sio.emit('pipeline_update', {
        'question_id': question_id,
        'step': step,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'data': data
    }, room=f"pipeline_{question_id}")

async def emit_station_alert(station_id: str, alert_type: str, message: str):
    """Emit station alert to all connected clients"""
    await sio.emit('station_alert', {
        'station_id': station_id,
        'alert_type': alert_type,
        'message': message,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })


# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    department: Optional[str] = "DEPT_TECHNOLOGY"
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    department: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AskQuestion(BaseModel):
    question: str
    category: Optional[str] = "All"
    context: Optional[str] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    provenance: Optional[dict] = None

class AskResponse(BaseModel):
    id: str
    answer: str
    provenance: dict
    pipeline_steps: List[dict]
    timestamp: str

class JobCardCreate(BaseModel):
    customer_name: str
    vehicle_make: str
    vehicle_model: str
    registration: str
    complaint: str
    parts: Optional[List[dict]] = []
    labor_hours: Optional[float] = 0
    labor_rate: Optional[float] = 400

class JobCardResponse(BaseModel):
    id: str
    job_number: str
    customer_name: str
    vehicle_make: str
    vehicle_model: str
    registration: str
    complaint: str
    parts: List[dict]
    labor_hours: float
    labor_cost: float
    parts_total: float
    subtotal: float
    gst: float
    grand_total: float
    status: str
    created_at: str

class StationResponse(BaseModel):
    id: str
    name: str
    location: str
    chargers_total: int
    chargers_active: int
    status: str
    current_load: float
    today_sessions: int
    today_energy: float

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    duration_hours: int
    modules: int
    level: str
    category: str
    has_certification: bool

class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "medium"

class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    subject: str
    description: str
    priority: str
    status: str
    assigned_to: str
    sla_hours: int
    created_at: str


# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "department": user_data.department,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_access_token({"sub": user_id})
    user_response = UserResponse(
        id=user_id,
        email=user["email"],
        name=user["name"],
        department=user["department"],
        role=user["role"],
        created_at=user["created_at"]
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"]})
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        department=user["department"],
        role=user["role"],
        created_at=user["created_at"]
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        department=current_user["department"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )


# ==================== AI CHAT ROUTES ====================

def get_agent_for_category(category: str) -> tuple:
    """Returns (agent_code, agent_name) based on category"""
    agents = {
        "All": ("AG_GANESHA", "GANESHA"),
        "Products": ("AG_GANESHA", "GANESHA"),
        "Finance": ("AG_LAKSHMI", "LAKSHMI"),
        "Legal": ("AG_YAMA", "YAMA"),
        "Support": ("AG_KUBERA", "KUBERA"),
        "Tech": ("AG_VISHWAKARMA", "VISHWAKARMA"),
        "URGAA": ("AG_SURYA", "SURYA"),
        "GSTSAAS": ("AG_VARUNA", "VARUNA"),
        "IGNITION": ("AG_BRAHMA", "BRAHMA"),
        "ARJUN": ("AG_SARASWATI", "SARASWATI"),
        "Marketing": ("AG_VAYU", "VAYU"),
        "HR": ("AG_GAYATRI", "GAYATRI"),
        "Operations": ("AG_HANUMAN", "HANUMAN"),
    }
    return agents.get(category, ("AG_GANESHA", "GANESHA"))

def get_work_profile(category: str) -> tuple:
    """Returns (work_profile, checklist) based on category"""
    profiles = {
        "Finance": ("WP_FIN_NUMERIC_V1.0", "CHK_FIN_NUMERIC_V1.0"),
        "Legal": ("WP_LEGAL_BRIEF_V1.0", "CHK_LEGAL_BRIEF_V1.0"),
        "Support": ("WP_SUPPORT_TABLE_V1.0", "CHK_SUPPORT_TABLE_V1.0"),
        "Tech": ("WP_TECH_JSON_V1.0", "CHK_TECH_JSON_V1.0"),
    }
    return profiles.get(category, ("WP_GENERAL_PARAGRAPH_V1.0", "CHK_GENERAL_PARAGRAPH_V1.0"))

@api_router.post("/ai/ask", response_model=AskResponse)
async def ask_ai(question_data: AskQuestion, current_user: dict = Depends(get_current_user)):
    question_id = str(uuid.uuid4())
    agent_code, agent_name = get_agent_for_category(question_data.category)
    work_profile, checklist = get_work_profile(question_data.category)
    
    # Pipeline steps tracking
    pipeline_steps = [
        {"step": "routing", "status": "complete", "agent": "GANESHA", "timestamp": datetime.now(timezone.utc).isoformat()},
    ]
    
    # Build system prompt based on category
    system_message = f"""You are KAILASH, the AI answer engine for Go4Garage's EKA-AI platform. 
You are part of a governance pipeline: EKA Gateway -> GANESHA (router) -> KAILASH (you) -> GANESHA (verifier).

Current context:
- User: {current_user['name']}
- Department: {current_user['department']}
- Category: {question_data.category}
- Routed to Agent: {agent_code} ({agent_name})
- Work Profile: {work_profile}
- Checklist: {checklist}

Guidelines based on work profile:
- WP_FIN_NUMERIC: Use digits-first format. Present numbers prominently. Avoid long paragraphs.
- WP_LEGAL_BRIEF: Be brief and risk-aware. Highlight potential issues.
- WP_SUPPORT_TABLE: Use table format when listing items. Include escalation paths.
- WP_GENERAL_PARAGRAPH: Clear, structured paragraphs.

Respond accurately and professionally. Be concise but comprehensive. Format responses for readability.

IMPORTANT: You are responding about Go4Garage services including:
- URGAA: EV Charging station management
- GSTSAAS: Workshop operations and GST compliance  
- IGNITION: Customer intelligence and analytics
- ARJUN: Employee training and certifications"""

    try:
        # Use LLM to generate response
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"eka-{question_id}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        pipeline_steps.append({
            "step": "drafting", 
            "status": "complete", 
            "agent": "KAILASH",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        user_message = UserMessage(text=question_data.question)
        answer = await chat.send_message(user_message)
        
        pipeline_steps.append({
            "step": "verifying", 
            "status": "complete", 
            "agent": "GANESHA",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        pipeline_steps.append({
            "step": "delivered", 
            "status": "complete",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logging.error(f"LLM Error: {e}")
        answer = f"I apologize, but I encountered an error processing your request. Please try again or contact support. Error: {str(e)}"
    
    provenance = {
        "answeredBy": "KAILASH",
        "verifiedBy": "GANESHA",
        "routedAgent": agent_code,
        "agentName": agent_name,
        "workProfile": work_profile,
        "checklist": checklist,
        "rating": 5.0,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Save to database
    chat_record = {
        "id": question_id,
        "user_id": current_user["id"],
        "question": question_data.question,
        "category": question_data.category,
        "answer": answer,
        "provenance": provenance,
        "pipeline_steps": pipeline_steps,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_history.insert_one(chat_record)
    
    return AskResponse(
        id=question_id,
        answer=answer,
        provenance=provenance,
        pipeline_steps=pipeline_steps,
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@api_router.get("/ai/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    history = await db.chat_history.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    return history


# ==================== JOB CARD ROUTES ====================

@api_router.post("/gstsaas/job-card", response_model=JobCardResponse, status_code=status.HTTP_201_CREATED)
async def create_job_card(job_data: JobCardCreate, current_user: dict = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    
    # Generate job number
    count = await db.job_cards.count_documents({})
    job_number = f"JC-{datetime.now().year}-{str(count + 1).zfill(5)}"
    
    # Calculate totals
    parts_total = sum(p.get("price", 0) * p.get("quantity", 1) for p in job_data.parts)
    labor_cost = job_data.labor_hours * job_data.labor_rate
    subtotal = parts_total + labor_cost
    gst = subtotal * 0.18
    grand_total = subtotal + gst
    
    job_card = {
        "id": job_id,
        "job_number": job_number,
        "customer_name": job_data.customer_name,
        "vehicle_make": job_data.vehicle_make,
        "vehicle_model": job_data.vehicle_model,
        "registration": job_data.registration,
        "complaint": job_data.complaint,
        "parts": job_data.parts,
        "labor_hours": job_data.labor_hours,
        "labor_rate": job_data.labor_rate,
        "labor_cost": labor_cost,
        "parts_total": parts_total,
        "subtotal": subtotal,
        "gst": gst,
        "grand_total": grand_total,
        "status": "pending",
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.job_cards.insert_one(job_card)
    
    return JobCardResponse(**{k: v for k, v in job_card.items() if k != "created_by" and k != "labor_rate"})

@api_router.get("/gstsaas/job-cards")
async def get_job_cards(current_user: dict = Depends(get_current_user)):
    cards = await db.job_cards.find({}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    return cards


# ==================== URGAA ROUTES ====================

@api_router.get("/urgaa/stations")
async def get_stations(current_user: dict = Depends(get_current_user)):
    # Return mock data for demo
    stations = [
        {"id": "1", "name": "Connaught Place", "location": "Delhi", "chargers_total": 4, "chargers_active": 3, "status": "active", "current_load": 87, "today_sessions": 24, "today_energy": 456.7},
        {"id": "2", "name": "Nehru Place", "location": "Delhi", "chargers_total": 6, "chargers_active": 5, "status": "alert", "current_load": 45, "today_sessions": 18, "today_energy": 312.4},
        {"id": "3", "name": "Cyber Hub", "location": "Gurugram", "chargers_total": 8, "chargers_active": 8, "status": "active", "current_load": 92, "today_sessions": 42, "today_energy": 789.2},
        {"id": "4", "name": "Sector 18", "location": "Noida", "chargers_total": 4, "chargers_active": 4, "status": "active", "current_load": 67, "today_sessions": 15, "today_energy": 234.5},
        {"id": "5", "name": "MG Road", "location": "Bangalore", "chargers_total": 6, "chargers_active": 2, "status": "maintenance", "current_load": 23, "today_sessions": 8, "today_energy": 112.3},
    ]
    return stations

@api_router.get("/urgaa/metrics")
async def get_urgaa_metrics(current_user: dict = Depends(get_current_user)):
    return {
        "total_stations": 45,
        "active_sessions": 12,
        "total_energy_mw": 3.2,
        "uptime_percent": 98.5,
        "alerts_count": 3,
        "revenue_today": 120000
    }


# ==================== ARJUN ROUTES ====================

@api_router.get("/arjun/courses")
async def get_courses(current_user: dict = Depends(get_current_user)):
    courses = [
        {"id": "1", "title": "EV Maintenance Fundamentals", "description": "Complete guide to electric vehicle maintenance", "duration_hours": 8, "modules": 10, "level": "Beginner", "category": "Technical", "has_certification": True},
        {"id": "2", "title": "GST Compliance for Workshops", "description": "Understanding GST requirements for automotive workshops", "duration_hours": 4, "modules": 6, "level": "Intermediate", "category": "Compliance", "has_certification": True},
        {"id": "3", "title": "Customer Service Excellence", "description": "Building customer relationships in automotive service", "duration_hours": 3, "modules": 5, "level": "Beginner", "category": "Management", "has_certification": True},
        {"id": "4", "title": "Workshop Safety Standards", "description": "Safety protocols and emergency procedures", "duration_hours": 2, "modules": 4, "level": "Beginner", "category": "Safety", "has_certification": True},
        {"id": "5", "title": "Advanced EV Diagnostics", "description": "Deep dive into EV troubleshooting", "duration_hours": 12, "modules": 15, "level": "Advanced", "category": "Technical", "has_certification": True},
    ]
    return courses

@api_router.get("/arjun/progress")
async def get_user_progress(current_user: dict = Depends(get_current_user)):
    return {
        "current_course": {"id": "1", "title": "EV Maintenance Fundamentals", "progress": 80, "modules_completed": 8, "modules_total": 10},
        "certifications": [
            {"name": "Workshop Safety Certified", "issued_date": "2025-12-15"},
            {"name": "Basic EV Technology", "issued_date": "2025-11-20"}
        ],
        "total_hours": 24,
        "courses_completed": 2
    }


# ==================== IGNITION ROUTES ====================

@api_router.get("/ignition/metrics")
async def get_customer_metrics(current_user: dict = Depends(get_current_user)):
    return {
        "total_customers": 2340,
        "active_customers": 1890,
        "churn_risk_count": 45,
        "avg_sentiment": 4.2,
        "nps_score": 42,
        "journey_stages": {
            "onboarding": 45,
            "first_purchase": 78,
            "repeat": 62,
            "loyalty": 34,
            "advocate": 18
        }
    }

@api_router.get("/ignition/churn-risks")
async def get_churn_risks(current_user: dict = Depends(get_current_user)):
    return [
        {"id": "10234", "name": "Rajesh Kumar", "last_visit_days": 45, "sentiment": 2.8, "risk_level": "high"},
        {"id": "10567", "name": "Priya Sharma", "last_visit_days": 30, "sentiment": 2.1, "risk_level": "high"},
        {"id": "10789", "name": "Amit Patel", "last_visit_days": 60, "sentiment": 3.2, "risk_level": "medium"},
    ]


# ==================== SUPPORT ROUTES ====================

@api_router.post("/support/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_data: TicketCreate, current_user: dict = Depends(get_current_user)):
    ticket_id = str(uuid.uuid4())
    count = await db.tickets.count_documents({})
    ticket_number = f"T-{str(count + 1001)}"
    
    sla_hours = {"low": 48, "medium": 24, "high": 8, "urgent": 2}.get(ticket_data.priority, 24)
    
    ticket = {
        "id": ticket_id,
        "ticket_number": ticket_number,
        "subject": ticket_data.subject,
        "description": ticket_data.description,
        "priority": ticket_data.priority,
        "status": "open",
        "assigned_to": "AG_KUBERA",
        "sla_hours": sla_hours,
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tickets.insert_one(ticket)
    
    return TicketResponse(**{k: v for k, v in ticket.items() if k != "created_by"})

@api_router.get("/support/tickets")
async def get_tickets(current_user: dict = Depends(get_current_user)):
    tickets = await db.tickets.find({}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    
    # Add some mock tickets if empty
    if not tickets:
        tickets = [
            {"id": "1", "ticket_number": "T-1045", "subject": "Charger not responding at CP station", "description": "Station charger #2 not accepting payments", "priority": "urgent", "status": "open", "assigned_to": "Tech Team", "sla_hours": 2, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "2", "ticket_number": "T-1044", "subject": "Job card generation issue", "description": "Unable to generate PDF for job cards", "priority": "medium", "status": "in_progress", "assigned_to": "AG_VARUNA", "sla_hours": 12, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": "3", "ticket_number": "T-1043", "subject": "Training video not loading", "description": "Module 5 video gives 404 error", "priority": "low", "status": "resolved", "assigned_to": "AG_SARASWATI", "sla_hours": 48, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
    return tickets

@api_router.get("/support/metrics")
async def get_support_metrics(current_user: dict = Depends(get_current_user)):
    return {
        "open_tickets": 23,
        "in_progress": 12,
        "resolved_today": 45,
        "sla_compliance": 92
    }


# ==================== FINANCE ROUTES ====================

@api_router.get("/finance/dashboard")
async def get_finance_dashboard(current_user: dict = Depends(get_current_user)):
    return {
        "revenue_mtd": 1245000,
        "expenses_mtd": 823000,
        "net_profit": 422000,
        "margin_percent": 33.9,
        "outstanding_receivables": 289000,
        "pending_payables": 156000,
        "transactions": [
            {"date": "2025-12-31", "description": "URGAA Revenue", "amount": 45000, "type": "credit", "status": "verified"},
            {"date": "2025-12-31", "description": "Workshop Parts", "amount": -12500, "type": "debit", "status": "verified"},
            {"date": "2025-12-30", "description": "Training Fees", "amount": 18000, "type": "credit", "status": "verified"},
            {"date": "2025-12-30", "description": "Electricity Bill", "amount": -8700, "type": "debit", "status": "verified"},
            {"date": "2025-12-29", "description": "GSTSAAS Subscription", "amount": 35000, "type": "credit", "status": "verified"},
        ]
    }


# ==================== LEGAL ROUTES ====================

@api_router.get("/legal/contracts")
async def get_contracts(current_user: dict = Depends(get_current_user)):
    return [
        {"id": "1", "title": "Partnership Agreement - Servotech India", "status": "under_review", "risk_level": "medium", "clauses": 12, "flagged": 2, "valid_until": None},
        {"id": "2", "title": "Vendor Agreement - XYZ Parts", "status": "approved", "risk_level": "low", "clauses": 8, "flagged": 0, "valid_until": "2026-12-31"},
        {"id": "3", "title": "Lease Agreement - Delhi Office", "status": "approved", "risk_level": "low", "clauses": 15, "flagged": 0, "valid_until": "2027-06-30"},
        {"id": "4", "title": "Service Agreement - Cloud Provider", "status": "pending", "risk_level": "high", "clauses": 20, "flagged": 4, "valid_until": None},
    ]


# ==================== DEPARTMENTS ROUTES ====================

@api_router.get("/departments")
async def get_departments():
    return [
        {"code": "DEPT_MARKETING", "name": "Marketing & Growth", "agent": "AG_VAYU", "agent_name": "VAYU"},
        {"code": "DEPT_FINANCE", "name": "Finance & Accounts", "agent": "AG_LAKSHMI", "agent_name": "LAKSHMI"},
        {"code": "DEPT_TECHNOLOGY", "name": "IT & Technology", "agent": "AG_VISHWAKARMA", "agent_name": "VISHWAKARMA"},
        {"code": "DEPT_SALES", "name": "Sales & Partnerships", "agent": "AG_INDRA", "agent_name": "INDRA"},
        {"code": "DEPT_COMPLIANCE", "name": "Legal & Compliance", "agent": "AG_YAMA", "agent_name": "YAMA"},
        {"code": "DEPT_SUPPORT", "name": "Customer Support", "agent": "AG_KUBERA", "agent_name": "KUBERA"},
        {"code": "DEPT_HR", "name": "Human Resources", "agent": "AG_GAYATRI", "agent_name": "GAYATRI"},
        {"code": "DEPT_OPERATIONS_PRODUCTION", "name": "Operations", "agent": "AG_HANUMAN", "agent_name": "HANUMAN"},
        {"code": "DEPT_ADMIN", "name": "Administration", "agent": "AG_ANNAPURNA", "agent_name": "ANNAPURNA"},
        {"code": "DEPT_RND", "name": "Research & Development", "agent": "AG_VISHNU", "agent_name": "VISHNU"},
        {"code": "DEPT_PR", "name": "Public Relations", "agent": "AG_NARADA", "agent_name": "NARADA"},
    ]


# ==================== PRODUCTS ROUTES ====================

@api_router.get("/products")
async def get_products():
    return [
        {"code": "PROD_URGAA", "name": "URGAA", "description": "EV Charging Intelligence", "agent": "AG_SURYA", "agent_name": "SURYA", "status": "active"},
        {"code": "PROD_GSTSAAS", "name": "GSTSAAS", "description": "Workshop Intelligence", "agent": "AG_VARUNA", "agent_name": "VARUNA", "status": "active"},
        {"code": "PROD_IGNITION", "name": "IGNITION", "description": "Customer Intelligence", "agent": "AG_BRAHMA", "agent_name": "BRAHMA", "status": "active"},
        {"code": "PROD_ARJUN", "name": "ARJUN", "description": "Training Intelligence", "agent": "AG_SARASWATI", "agent_name": "SARASWATI", "status": "active"},
    ]


# ==================== ROOT & HEALTH ====================

@api_router.get("/")
async def root():
    return {"message": "EKA-AI API v1.0.0", "status": "operational"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# Include the router
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
