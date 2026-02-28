from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import pickle
import pandas as pd
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
import ollama
import json
import cv2
import cv2
import base64
import numpy as np
import asyncio

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Initialize PoseLandmarker (Tasks API)
base_options = python.BaseOptions(model_asset_path='pose_landmarker.task')
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=False)
detector = vision.PoseLandmarker.create_from_options(options)

app = FastAPI()

# -----------------------
# In-Memory DB (Simulated)
# -----------------------
db_patients = {}
db_doctors = {}
db_fitness = {}
db_connections = {}  # DID -> [PID1, PID2]
db_messages = []
db_permissions = {}  # PID -> [DID1, DID2]
db_appointments = [] # Array of appointment dicts
db_family_trees = {} # UserID -> [Rel1, Rel2]

# Allow CORS for local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
@app.get("/ui", response_class=HTMLResponse)
def get_ui(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# -----------------------
# Load All Models
# -----------------------
heart_model = pickle.load(open("heart_model.pkl", "rb"))
diabetes_model = pickle.load(open("diabetes_model.pkl", "rb"))
hypertension_model = pickle.load(open("hypertension_model.pkl", "rb"))
stroke_model = pickle.load(open("stroke_model.pkl", "rb"))


# -----------------------
# Unified Deep Scan Input
# -----------------------
class DeepScanInput(BaseModel):
    # Basic
    age: int
    sex: int
    height: float
    weight: float

    # Heart-related
    chest_discomfort: str  # "No", "Mild", "Severe"
    resting_bp: int
    cholesterol: int
    exercise_pain: bool
    max_heart_rate: int
    glucose: int

    # Diabetes-related
    pregnancies: int = 0
    insulin: int = 80
    skin_thickness: int = 20
    diabetes_pedigree: float = 0.5

# -----------------------
# AI Insight Input Model
# -----------------------
class InsightRequest(BaseModel):
    user_role: str
    swasth_score: int
    risk_probabilities: dict = {}
    trajectory_status: str = "Unknown"
    worst_metric: str = "Unknown"
    amplification_pairs: list = []
    chat_prompt: str = None

class QuickScanRequest(BaseModel):
    symptoms_text: str

# -----------------------
# Doctor / Patient Registration Models
# -----------------------
class PatientRegistration(BaseModel):
    name: str
    age: int
    gender: str
    height: float
    weight: float
    blood_pressure: str = ""
    diseases: list[str] = []
    
class DoctorRegistration(BaseModel):
    name: str
    specialization: str
    mobile_number: str
    clinic_address: str
    lat: float = 0.0
    lng: float = 0.0
    can_cure: list[str] = []

class FitnessRegistration(BaseModel):
    name: str
    age: int = 30
    gender: str = ""
    height: float = 170.0
    weight: float = 70.0
    activity_level: str = ""
    goal: str = ""


@app.get("/")
def home():
    return {"message": "Multi-Disease AI Deep Scan Running"}

def align_features(model, input_df):
    # Create empty dataframe with training feature names
    aligned_df = pd.DataFrame(columns=model.feature_names_in_)
    
    # Fill available columns
    for col in input_df.columns:
        if col in aligned_df.columns:
            aligned_df[col] = input_df[col]
    
    # Fill missing columns with 0
    aligned_df = aligned_df.fillna(0)
    
    return aligned_df
# -----------------------
# Deep Scan Endpoint
# -----------------------

@app.post("/deep_scan")
def deep_scan(data: DeepScanInput):

    # Calculate BMI
    bmi = data.weight / ((data.height / 100) ** 2)

    # ---------------- HEART ----------------
    if data.chest_discomfort == "No":
        cp = 3
    elif data.chest_discomfort == "Mild":
        cp = 1
    else:
        cp = 0

    heart_input = pd.DataFrame([{
        "age": data.age,
        "sex": data.sex,
        "cp": cp,
        "trestbps": data.resting_bp,
        "chol": data.cholesterol,
        "fbs": 1 if data.glucose > 120 else 0,
        "restecg": 0,
        "thalach": data.max_heart_rate,
        "exang": 1 if data.exercise_pain else 0,
        "oldpeak": 1.0,
        "slope": 1,
        "ca": 0,
        "thal": 1
    }])

    heart_prob = heart_model.predict_proba(heart_input)[0][1]

    heart_risk = "Low" if heart_prob < 0.3 else "Moderate" if heart_prob < 0.6 else "High"

    # ---------------- DIABETES ----------------
    diabetes_input = pd.DataFrame([{
        "Pregnancies": data.pregnancies,
        "Glucose": data.glucose,
        "BloodPressure": data.resting_bp,
        "SkinThickness": data.skin_thickness,
        "Insulin": data.insulin,
        "BMI": bmi,
        "DiabetesPedigreeFunction": data.diabetes_pedigree,
        "Age": data.age
    }])

    diabetes_prob = diabetes_model.predict_proba(diabetes_input)[0][1]

    diabetes_risk = "Low" if diabetes_prob < 0.3 else "Moderate" if diabetes_prob < 0.6 else "High"

    # ---------------- HYPERTENSION ----------------
    hyper_input = pd.DataFrame([{
        "age": data.age * 365,  # cardio dataset often stores age in days
        "gender": data.sex,
        "height": data.height,
        "weight": data.weight,
        "ap_hi": data.resting_bp,
        "ap_lo": 80,
        "cholesterol": 1,
        "gluc": 1,
        "smoke": 0,
        "alco": 0,
        "active": 1
    }])

    hyper_input = align_features(hypertension_model, hyper_input)
    hyper_prob = hypertension_model.predict_proba(hyper_input)[0][1]

    hyper_risk = "Low" if hyper_prob < 0.3 else "Moderate" if hyper_prob < 0.6 else "High"

    # ---------------- STROKE ----------------
    stroke_input = pd.DataFrame([{
        "age": data.age,
        "hypertension": 1 if hyper_prob > 0.5 else 0,
        "heart_disease": 1 if heart_prob > 0.5 else 0,
        "avg_glucose_level": data.glucose,
        "bmi": bmi,
        "ever_married_Yes": 1,
        "work_type_Private": 1,
        "Residence_type_Urban": 1,
        "smoking_status_never smoked": 1
    }])

    stroke_input = align_features(stroke_model, stroke_input)
    stroke_prob = stroke_model.predict_proba(stroke_input)[0][1]

    stroke_risk = "Low" if stroke_prob < 0.3 else "Moderate" if stroke_prob < 0.6 else "High"

    # ---------------- SWASTH SCORE ----------------
    overall_risk = (heart_prob + diabetes_prob + hyper_prob + stroke_prob) / 4
    swasth_score = round(100 - (overall_risk * 100), 1)
    # Emergency alert logic
    emergency_alert = None

    if (
      heart_prob > 0.65
      or stroke_prob > 0.55
      or hyper_prob > 0.7
      or swasth_score < 50
    ):
      emergency_alert = "⚠ High health risk detected. Immediate medical consultation recommended."
    

    return {
        "heart": {
            "probability": round(float(heart_prob), 3),
            "risk_level": heart_risk
        },
        "diabetes": {
            "probability": round(float(diabetes_prob), 3),
            "risk_level": diabetes_risk
        },
        "hypertension": {
            "probability": round(float(hyper_prob), 3),
            "risk_level": hyper_risk
        },
        "stroke": {
            "probability": round(float(stroke_prob), 3),
            "risk_level": stroke_risk
        },
        "overall_swasth_score": swasth_score,
        "emergency_alert": emergency_alert
    }

# -----------------------
# Advanced Intelligence API
# -----------------------

@app.post("/api/ai-insight")
async def generate_insight(request: InsightRequest):
    sys_prompt = f"""
    You are the AI engine for Swasth AI, a digital health twin platform. 
    You are analyzing a {request.user_role} with a Swasth Score of {request.swasth_score}/100.
    Their worst metric is {request.worst_metric} and their health trajectory is {request.trajectory_status}.
    
    You must output ONLY a valid JSON object matching this exact structure. Do not wrap it in markdown backticks or add any conversational text outside the JSON.
    {{
      "twin_message": "A short empathetic message. If the user asked a question, answer it here.",
      "trajectory_explanation": "Short interpretation of WHY they are {request.trajectory_status}.",
      "amplification_explanation": {{
        "Heart Risk_Hypertension": "Explanation of how these two interact..."
      }},
      "leverage_recommendation": {{
        "action": "What should they do about {request.worst_metric}?",
        "scoreImpact": 5,
        "secondaryImpact": "Secondary benefit of this action"
      }}
    }}
    """
    
    if request.chat_prompt:
        sys_prompt += f"\nThe user says: '{request.chat_prompt}'. Reply directly to them in the 'twin_message' field."

    try:
        response = ollama.chat(model='llama3.1:8b', format='json', messages=[
            {
                'role': 'system',
                'content': sys_prompt
            }
        ])
        
        data = json.loads(response['message']['content'])
        return data
        
    except Exception as e:
        print(f"Ollama Error: {e}")
        return {
             "twin_message": "I encountered an error trying to process your biological data.",
             "trajectory_explanation": "Error analyzing trajectory.",
             "amplification_explanation": {},
             "leverage_recommendation": { "action": "Consult dashboard", "scoreImpact": 0, "secondaryImpact": "N/A" }
        }

@app.post("/api/quick-scan")
async def quick_scan_triage(request: QuickScanRequest):
    sys_prompt = f"""
    You are Swasth AI, a medical triage assistant. Analyze this user input: "{request.symptoms_text}"
    
    You must output ONLY a valid JSON object matching this exact structure:
    {{
      "isEmergency": true/false (boolean),
      "text": "A brief, professional summary of your assessment.",
      "conditions": ["Condition 1", "Condition 2", "Condition 3"],
      "severity": "CRITICAL" or "High" or "Moderate" or "Low",
      "action": "Clear, direct instruction on what the user should do next."
    }}
    """
    
    try:
        response = ollama.chat(model='llama3.1:8b', format='json', messages=[
            {
                'role': 'system',
                'content': sys_prompt
            }
        ])
        
        data = json.loads(response['message']['content'])
        return data
        
    except Exception as e:
        print(f"Ollama Quick Scan Error: {e}")
        return {
            "isEmergency": False,
            "text": "System error analyzing symptoms.",
            "conditions": ["Unknown"],
            "severity": "Unknown",
            "action": "Please consult a healthcare professional directly."
        }


# -----------------------
# Doctor & Patient Registration APIs
# -----------------------

@app.post("/api/register/patient")
def register_patient(patient: PatientRegistration):
    # Generate unique PID
    short_uuid = str(uuid.uuid4()).split("-")[0].upper()
    pid = f"PID-{short_uuid}"
    
    patient_data = patient.dict()
    patient_data["id"] = pid
    
    # Store in mock DB
    db_patients[pid] = patient_data
    
    return {"status": "success", "id": pid, "data": patient_data}


@app.post("/api/register/doctor")
def register_doctor(doctor: DoctorRegistration):
    # Generate unique DID
    short_uuid = str(uuid.uuid4()).split("-")[0].upper()
    did = f"DID-{short_uuid}"
    
    doctor_data = doctor.dict()
    doctor_data["id"] = did
    
    # Store in mock DB
    db_doctors[did] = doctor_data
    
    return {"status": "success", "id": did, "data": doctor_data}

@app.post("/api/register/fitness")
def register_fitness(fitness: FitnessRegistration):
    # Generate unique FID (Fitness ID)
    short_uuid = str(uuid.uuid4()).split("-")[0].upper()
    fid = f"FID-{short_uuid}"
    
    fitness_data = fitness.dict()
    fitness_data["id"] = fid
    
    # Store in mock DB
    db_fitness[fid] = fitness_data
    
    return {"status": "success", "id": fid, "data": fitness_data}

# -----------------------
# Messaging & Connection APIs
# -----------------------
# Format: { "DID-123": ["PID-456", "PID-789"] }
db_connections = {} 

# Format: [ {"sender": "DID-...", "receiver": "PID-...", "text": "Hello", "timestamp": "..."} ]
db_messages = []

class LinkRequest(BaseModel):
    doctor_id: str
    patient_id: str

class MessageRequest(BaseModel):
    sender_id: str
    receiver_id: str
    text: str

class ConsentRequest(BaseModel):
    patient_id: str
    doctor_id: str

class AppointmentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    date: str
    time: str
    urgency: str # 'Routine', 'Urgent', 'Emergency'
    issue: str = "" # Optional brief reason

class AppointmentStatusUpdate(BaseModel):
    status: str # 'Pending', 'Accepted', 'Declined'

class FamilyLinkRequest(BaseModel):
    user_id: str
    relative_id: str

@app.post("/api/link-patient")
async def link_patient(req: LinkRequest):
    did = req.doctor_id
    pid = req.patient_id
    
    if did not in db_doctors:
        raise HTTPException(status_code=404, detail="Doctor ID not found.")
    if pid not in db_patients:
        raise HTTPException(status_code=404, detail="Patient ID not found.")
        
    if did not in db_connections:
        db_connections[did] = []
        
    if pid not in db_connections[did]:
        db_connections[did].append(pid)
        
    return {"status": "success", "message": f"Successfully linked {pid} to your practice."}

@app.get("/api/connections/{doctor_id}")
async def get_connections(doctor_id: str):
    if doctor_id not in db_connections:
        return {"status": "success", "patients": []}
        
    linked_pids = db_connections[doctor_id]
    patients_data = []
    
    for pid in linked_pids:
        if pid in db_patients:
            patient_full = db_patients[pid]
            # Check consent
            has_consent = doctor_id in db_permissions.get(pid, [])
            
            if has_consent:
                patient_full["access_granted"] = True
                patients_data.append(patient_full)
            else:
                # Scrubbed profile
                patients_data.append({
                    "id": patient_full["id"],
                    "name": patient_full["name"],
                    "age": patient_full.get("age"),
                    "gender": patient_full.get("gender"),
                    "access_granted": False
                })
            
    return {"status": "success", "patients": patients_data}

@app.post("/api/grant-access")
async def grant_access(req: ConsentRequest):
    if req.patient_id not in db_permissions:
        db_permissions[req.patient_id] = []
    if req.doctor_id not in db_permissions[req.patient_id]:
        db_permissions[req.patient_id].append(req.doctor_id)
    return {"status": "success", "message": "Access granted."}

@app.post("/api/revoke-access")
async def revoke_access(req: ConsentRequest):
    if req.patient_id in db_permissions and req.doctor_id in db_permissions[req.patient_id]:
        db_permissions[req.patient_id].remove(req.doctor_id)
    return {"status": "success", "message": "Access revoked."}

@app.get("/api/patient-connections/{patient_id}")
async def get_patient_connections(patient_id: str):
    # Reverse search: Find all doctors who have this patient_id in their list
    assigned_doctors = []
    for did, pids in db_connections.items():
        if patient_id in pids and did in db_doctors:
            doc = dict(db_doctors[did])
            # Check if patient granted consent
            doc["access_granted"] = did in db_permissions.get(patient_id, [])
            assigned_doctors.append(doc)
            
    return {"status": "success", "doctors": assigned_doctors}

from datetime import datetime

@app.post("/api/messages")
async def send_message(req: MessageRequest):
    new_msg = {
        "sender": req.sender_id,
        "receiver": req.receiver_id,
        "text": req.text,
        "timestamp": datetime.now().isoformat(),
        "is_read": False
    }
    db_messages.append(new_msg)
    return {"status": "success", "message": new_msg}

@app.get("/api/messages/{user_a}/{user_b}")
async def get_messages(user_a: str, user_b: str, reader_id: str = None):
    # Retrieve all messages between A and B, in order
    chat_log = []
    for m in db_messages:
        is_match = (m["sender"] == user_a and m["receiver"] == user_b) or \
                   (m["sender"] == user_b and m["receiver"] == user_a)
        
        if is_match:
            # If the person fetching the messages is the receiver, mark as read
            if reader_id and reader_id == m["receiver"]:
                m["is_read"] = True
            chat_log.append(m)
            
    return {"status": "success", "messages": chat_log}

@app.get("/api/unread-count/{user_id}")
async def get_unread_count(user_id: str):
    total = 0
    by_sender = {}
    
    for m in db_messages:
        # Check if the message is destined for user_id and is unread (or missing is_read flag for safety)
        if m["receiver"] == user_id and not m.get("is_read", False):
            total += 1
            sender = m["sender"]
            by_sender[sender] = by_sender.get(sender, 0) + 1
            
    return {
        "status": "success", 
        "total": total,
        "by_sender": by_sender
    }

# -----------------------
# Appointment System API
# -----------------------
import uuid

@app.post("/api/appointments/request")
async def request_appointment(req: AppointmentRequest):
    new_apt = {
        "id": f"APT-{uuid.uuid4().hex[:8].upper()}",
        "patient_id": req.patient_id,
        "doctor_id": req.doctor_id,
        "date": req.date,
        "time": req.time,
        "urgency": req.urgency,
        "issue": req.issue,
        "status": "Pending",
        "created_at": datetime.now().isoformat()
    }
    db_appointments.append(new_apt)
    return {"status": "success", "appointment": new_apt}

@app.get("/api/appointments/{user_id}")
async def get_appointments(user_id: str):
    user_apts = []
    for apt in db_appointments:
        if apt["patient_id"] == user_id or apt["doctor_id"] == user_id:
            # Attach user details for context
            enrich = dict(apt)
            if apt["patient_id"] in db_patients:
                enrich["patient_name"] = db_patients[apt["patient_id"]]["name"]
            else:
                 enrich["patient_name"] = "Unknown Patient"
                 
            if apt["doctor_id"] in db_doctors:
                enrich["doctor_name"] = db_doctors[apt["doctor_id"]]["name"]
            else:
                 enrich["doctor_name"] = "Unknown Doctor"
                    
            user_apts.append(enrich)
            
    # Sort by created date descending
    user_apts.sort(key=lambda x: x["created_at"], reverse=True)
    return {"status": "success", "appointments": user_apts}

@app.put("/api/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, req: AppointmentStatusUpdate):
    for apt in db_appointments:
        if apt["id"] == appointment_id:
            apt["status"] = req.status
            return {"status": "success", "appointment": apt}
            
    raise HTTPException(status_code=404, detail="Appointment not found")

# -----------------------
# Family Web Tree API
# -----------------------

@app.post("/api/family/link")
async def link_family_member(req: FamilyLinkRequest):
    # Determine if relative exists in any DB
    relative_exists = (req.relative_id in db_patients) or (req.relative_id in db_fitness) or (req.relative_id in db_doctors)
    if not relative_exists:
        raise HTTPException(status_code=404, detail="Relative ID not found.")
        
    if req.user_id not in db_family_trees:
        db_family_trees[req.user_id] = []
        
    if req.relative_id in db_family_trees[req.user_id]:
        raise HTTPException(status_code=400, detail="Relative is already in your Family Web Tree.")
        
    db_family_trees[req.user_id].append(req.relative_id)
    
    # Bi-directional link
    if req.relative_id not in db_family_trees:
        db_family_trees[req.relative_id] = []
    if req.user_id not in db_family_trees[req.relative_id]:
        db_family_trees[req.relative_id].append(req.user_id)
        
    return {"status": "success", "message": "Family member linked successfully"}

@app.get("/api/family/tree/{user_id}")
async def get_family_tree(user_id: str):
    if user_id not in db_family_trees:
        return {"status": "success", "tree": []}
        
    tree_nodes = []
    for rel_id in db_family_trees[user_id]:
        # Search for relative data
        rel_data = None
        role = ""
        
        if rel_id in db_patients:
            rel_data = db_patients[rel_id]
            role = "Patient"
        elif rel_id in db_fitness:
            rel_data = db_fitness[rel_id]
            role = "Fitness"
        elif rel_id in db_doctors:
            rel_data = db_doctors[rel_id]
            role = "Doctor"
            
        if rel_data:
            # We only expose public metrics for the web tree
            public_node = {
                "id": rel_id,
                "name": rel_data["name"],
                "role": role,
                "swasth_score": rel_data.get("swasth_score", 85), # Default if not computed
                "trajectory_status": rel_data.get("trajectory_status", "Stable"),
                "biological_age": rel_data.get("age", 30) # approximation if missing
            }
            tree_nodes.append(public_node)
            
    return {"status": "success", "tree": tree_nodes}

# -----------------------
# Doctor Search Engine API
# -----------------------

class SymptomMatchRequest(BaseModel):
    symptoms: str

@app.post("/api/search-doctors")
async def search_doctors(request: SymptomMatchRequest):
    # Always include mock doctors for demonstration along with registered ones
    mock_doctors = [{
        "id": "DID-MOCK",
        "name": "Dr. Sarah Chen",
        "specialization": "Cardiologist",
        "mobile_number": "+91 9876543210",
        "clinic_address": "Ajmer Road, Near Mahapura, Jaipur",
        "lat": 26.8361,
        "lng": 75.6499,
        "can_cure": ["chest pain", "high blood pressure", "palpitations"]
    }, {
        "id": "DID-MOCK2",
        "name": "Dr. James Wilson",
        "specialization": "General Physician",
        "mobile_number": "+91 9876543211",
        "clinic_address": "Bhankrota Circle, Jaipur",
        "lat": 26.8461,
        "lng": 75.6599,
        "can_cure": ["fever", "headache", "cold", "flu", "body ache"]
    }, {
         "id": "DID-MOCK3",
         "name": "Dr. Emily Stone",
         "specialization": "Neurologist",
         "mobile_number": "+91 9876543212",
         "clinic_address": "Mansarovar Extension, Jaipur",
         "lat": 26.8261,
         "lng": 75.7399,
         "can_cure": ["migraine", "dizziness", "nerve pain", "concussion"]
    }]
    
    available_doctors = list(db_doctors.values()) + mock_doctors

    # We will use Ollama to rank the doctors based on the patient symptoms
    doctor_profiles_str = json.dumps([
        {"id": d["id"], "specialization": d["specialization"], "can_cure": d.get("can_cure", [])} 
        for d in available_doctors
    ])

    sys_prompt = f"""
    You are an intelligent medical routing engine.
    The patient has the following symptoms: "{request.symptoms}"
    
    Here is a list of available doctors in JSON format: {doctor_profiles_str}
    
    Your job is to match the patient's symptoms against the doctors' specializations and "can_cure" lists.
    Return ONLY a JSON object containing a "matches" array of the doctor IDs ordered from MOST relevant to LEAST relevant.
    Example output format exactly like this:
    {{
      "matches": ["DID-123", "DID-456"]
    }}
    """
    
    try:
        response = ollama.chat(model='llama3.1:8b', format='json', messages=[
            {
                'role': 'system',
                'content': sys_prompt
            }
        ])
        
        # Parse the JSON object and extract the array
        parsed = json.loads(response['message']['content'])
        ranked_ids = parsed.get("matches", [])
        
        # Ensure it's a list
        if not isinstance(ranked_ids, list):
            ranked_ids = []
            
        # Map the IDs back to the full doctor profiles
        matched_doctors = []
        for did in ranked_ids:
            # Find in our available list (mock or real)
            doc_data = next((d for d in available_doctors if d["id"] == did), None)
            if doc_data:
                matched_doctors.append(doc_data)
                
        # If AI returns nothing, show all doctors as a fallback
        if len(matched_doctors) == 0:
            return {"status": "fallback", "matches": available_doctors}
            
        return {"status": "success", "matches": matched_doctors}
        
    except Exception as e:
        print(f"Ollama Symptom Search Error: {e}")
        return {"status": "fallback", "matches": available_doctors}


# ----------------------------------------------------------------------
# WEBSOCKET: CUSTOM OPENCV VISION SCANNER
# ----------------------------------------------------------------------
@app.websocket("/ws/vision-scan")
async def websocket_vision_scan(websocket: WebSocket):
    await websocket.accept()
    baseline_dist = 0.0
    phase_1_started = False
    
    try:
        while True:
            # Drain the websocket queue to get ONLY the most recent frame
            # This prevents the backend from lagging behind the frontend if React sends frames too fast
            data = None
            try:
                # Keep replacing `data` with the newest frame until the queue is empty
                while True:
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
            except asyncio.TimeoutError:
                pass # Queue is empty, `data` now holds the freshest frame
            
            # If no new frame arrived in this tick, yield and wait for one
            if data is None:
                data = await websocket.receive_text()
            
            # Decode base64 to OpenCV format (numpy array)
            # data format: {"frame": "data:image/jpeg;base64,...", "phase": 1}
            try:
                payload = json.loads(data)
                frame_data = payload.get("frame", "")
                current_phase = payload.get("phase", 0)
            except:
                continue # Ignore malformed packets
                
            # If Phase 1 just triggered, reset the baseline so it's fresh!
            if current_phase == 1 and not phase_1_started:
                 baseline_dist = 0.0
                 phase_1_started = True
            elif current_phase != 1:
                 phase_1_started = False
            
            encoded_data = frame_data.split(',')[1] if ',' in frame_data else frame_data
            if not encoded_data:
                 continue
                 
            try:
                img_data = base64.b64decode(encoded_data)
                np_arr = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue
            except Exception as e:
                print(f"Vision Scan Decode Error: {e}")
                continue

            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            
            # Detect Pose
            detection_result = detector.detect(mp_image)

            progress = 0
            chest_dist = 0

            # Draw Custom Graphics using OpenCV
            if detection_result.pose_landmarks and len(detection_result.pose_landmarks) > 0:
                h, w, c = frame.shape
                # The Tasks API returns a list of poses, each pose is a list of landmarks
                landmarks = detection_result.pose_landmarks[0]
                
                # Extract Shoulders (Indices: 11 for Left, 12 for Right according to standard MP Pose topology)
                l_sh = landmarks[11]
                r_sh = landmarks[12]
                
                # In Tasks API, visibility is often replaced by presence/score, check presence > 0.5
                if getattr(l_sh, 'presence', 1.0) > 0.5 and getattr(r_sh, 'presence', 1.0) > 0.5:
                    # Pixel coordinates
                    l_sh_idx = (int(l_sh.x * w), int(l_sh.y * h))
                    r_sh_idx = (int(r_sh.x * w), int(r_sh.y * h))
                    
                    # Calculate distance
                    chest_dist = np.linalg.norm(np.array(l_sh_idx) - np.array(r_sh_idx))
                    
                    if baseline_dist == 0.0 or chest_dist < baseline_dist:
                        baseline_dist = chest_dist
                        
                    # Calculate target expansion (e.g. strict 7% chest expansion required)
                    if baseline_dist > 0 and current_phase == 1:
                        expansion = max(0, chest_dist - baseline_dist)
                        target = baseline_dist * 0.07 
                        if target > 0:
                            progress = min(100.0, (expansion / target) * 100.0)

                    # --- DRAW CUSTOM HUD on FULL HD FRAME ---
                    # 1. Glowing Line between shoulders (Thicker for 1080p)
                    cv2.line(frame, l_sh_idx, r_sh_idx, (0, 255, 255), 8)
                    cv2.circle(frame, l_sh_idx, 16, (0, 255, 255), -1)
                    cv2.circle(frame, r_sh_idx, 16, (0, 255, 255), -1)
                    
                    # 2. Text Overlay for Telemetry (Larger font for 1080p)
                    cv2.putText(
                        frame, 
                        f"SHOULDER_DIST: {int(chest_dist)}px", 
                        (l_sh_idx[0], l_sh_idx[1] - 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3
                    )
            
            # --- Encode FRAME back to Base64 ---
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            out_b64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send back JSON with image frame and math
            await websocket.send_json({
                "frame": "data:image/jpeg;base64," + out_b64,
                "progress": float(progress),
                "chest_dist": float(chest_dist)
            })

    except WebSocketDisconnect:
        print("Vision Scan Client Disconnected")
    except Exception as e:
        print(f"Vision Scan Error: {e}")