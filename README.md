# 🫀 Swasth AI: Digital Health Twin Lab

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.9.0-5C3EE8.svg?logo=opencv)](https://opencv.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.11-0082FB.svg?logo=google)](https://developers.google.com/mediapipe)

**Swasth AI** is a fully automated, multimodal clinical triage platform designed to instantly analyze a patient's health profile before they ever see a doctor. 

By combining **local Large Language Models (Llama 3)** for conversational symptom checking, **predictive Machine Learning (LightGBM/XGBoost)** for instant cardiovascular disease risk profiling, and a **zero-latency Computer Vision pipeline** that optically tracks respiratory vitals via standard webcams, Swasth AI generates a complete, clinical-grade "Digital Health Twin" and printable health report in seconds—drastically slashing clinic wait times and catching chronic illnesses early.

---

## ✨ Core Features

### 1. The Quick Scan (Conversational AI Triage)
Instead of static clipboard forms, patients chat with an empathetic, entirely local AI agent powered by **Llama 3 (via Ollama)**. The agent dynamically probes for symptoms, parses natural language, provides an immediate severity assessment, and routes the patient to the correct medical department. Because the model runs locally, 100% HIPAA-level privacy is maintained.

### 2. The Deep Scan & Digital Health Twin
Behind a cinematic, Framer Motion-powered React frontend sits a high-speed Python FastAPI backend running custom LightGBM/XGBoost models. Patients enter basic demographics, blood pressure, and glucose levels to generate their **Digital Health Twin**. The dashboard calculates precise, real-time risk scores for:
- Heart Disease
- Stroke
- Diabetes
- Hypertension

It also features a **Lifestyle Simulator**, allowing patients to dynamically adjust metrics (like weight or blood pressure) and watch their ML risk probabilities recalculate in real-time.

### 3. Contactless Vision Triage (The Wow Factor)
Swasth AI captures vitals without any specialized medical hardware. Using a standard HD webcam, our zero-latency computer vision pipeline utilizes **OpenCV** and **Google MediaPipe** over WebSockets. The system maps the patient's skeletal structure dynamically, calculating respiratory distress (via chest expansion tracking) and kinematic stability completely contact-free.

### 4. Doctor Portal & Printable Reports
By the time the nurse calls the patient's name, the physician already has a cleanly formatted, printable PDF summary waiting for them on the **Doctor Portal**. The doctor sees the symptom summary, the AI's departmental routing, the exact exact Machine Learning risk percentages, and custom dynamic medical recommendations. 

---

## 🏗️ Technology Stack

**Frontend (The Interface):**
*   **React (Vite)**
*   **Tailwind CSS** (for cinematic, responsive layouts)
*   **Framer Motion** (for fluid animations)
*   **Lucide React** (Icons)
*   **React Router** (Navigation)
*   **React Webcam** (Optical sensing)

**Backend (The Brains):**
*   **Python (FastAPI)** (High-performance asynchronous server)
*   **Uvicorn** (ASGI server)
*   **WebSockets** (For real-time 1080p video frame streaming)
*   **OpenCV & Google MediaPipe Tasks API** (Computer Vision & Skeletal Tracking)
*   **LightGBM, XGBoost, CatBoost** (Predictive ML models)
*   **Ollama (Llama 3.1:8b)** (Local LLM reasoning engine)
*   **Pandas & NumPy** (Data structuring and manipulation)

---

## 🚀 Installation & Setup

To run Swasth AI locally, you need three main components running simultaneously: the React Frontend, the Python Backend, and the Ollama LLM service.

### Prerequisites:
1.  **Node.js** (v18+)
2.  **Python** (3.12 or 3.13)
3.  **Ollama** installed locally (with the `llama3.1:8b` model pulled: `ollama run llama3.1:8b`)

### 1. Setup the Python Backend
Open a terminal in the root project directory (`/HACKS`):
```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate # On Windows

# Install Python dependencies
pip install fastapi uvicorn websockets opencv-python mediapipe numpy pandas lightgbm xgboost catboost scikit-learn ollama

# Start the FastAPI Server
python -m uvicorn main:app --reload
```
*The backend will run on `http://127.0.0.1:8000`.*

### 2. Setup the React Frontend
Open a *new* terminal window, navigate into the `frontend` directory:
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

### 3. Ensure Ollama is Running
Ensure the Ollama service is running in the background. If you haven't opened the Ollama desktop app, you can test it by running:
```bash
ollama serve
```

---

## 📖 How to Use the Demo
1.  Navigate to `http://localhost:5173` in your browser.
2.  Follow the **Onboarding** flow (select "Patient" role).
3.  Click **Quick Symptom Scan** to mock a conversation with the Llama 3 assistant (e.g., "I have sharp chest pain.").
4.  Navigate back and click **Comprehensive Scan**. Provide mock medical data (e.g., BP 140/90, Glucose 125) and hit Analyze.
5.  Explore the **Dashboard**, play with the **Lifestyle Simulator** sliders, and view your dynamic ML score.
6.  Click **Vision Triage (Camera)** to launch the WebSockets OpenCV tracking environment. Step back so your shoulders are visible, take a deep breath, and hold still for the phases.
7.  Click **View Full Health Report** to see the generated printable summary.

---

## 🤝 Contributing
*Swasth AI was rapidly prototyped for a Hackathon.* If you would like to contribute, feel free to fork the repository and submit a Pull Request! Please ensure your code follows the existing Tailwind UI aesthetic and Python architectural patterns.

## 📄 License
MIT License. See `LICENSE` for more information.
