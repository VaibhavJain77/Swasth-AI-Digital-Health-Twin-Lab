import axios from 'axios';

/**
 * Utility Service for communicating with the Swasth AI Backend (FastAPI + Ollama)
 */

// We assume the FastAPI backend runs locally on port 8000 by default.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getAIInsights = async (contextPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ai-insight`, contextPayload);
    return response.data;
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    // Return gracefully if backend is unreachable
    return {
      twin_message: "System offline. I'm currently unable to process your biological context.",
      trajectory_explanation: "Trajectory analysis unavailable.",
      amplification_explanation: {},
      leverage_recommendation: { action: "Seek medical advice", scoreImpact: 0, secondaryImpact: "N/A" }
    };
  }
};

export const getQuickScan = async (symptomsText) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/quick-scan`, {
      symptoms_text: symptomsText
    });
    return response.data;
  } catch (error) {
    console.error("Error in Quick Scan:", error);
    return {
      isEmergency: false,
      text: "Error connecting to the triage engine.",
      conditions: ["Connection Offline"],
      severity: "Unknown",
      action: "Please retry in a moment, or consult a doctor directly."
    };
  }
};

export const submitDeepScan = async (formData) => {
  try {
    // We map frontend form to the DeepScanInput Pydantic model. 
    // Fill in defaults for fields the concise UI doesn't collect.
    const payload = {
      age: parseInt(formData.age) || 30,
      sex: formData.sex === 'male' ? 1 : 0,
      height: parseFloat(formData.height) || 170.0,
      weight: parseFloat(formData.weight) || 70.0,
      chest_discomfort: 'No', // Defaulting as uncollected
      resting_bp: parseInt(formData.systolic) || 120, // using systolic as resting_bp
      cholesterol: parseInt(formData.cholesterol) || 200,
      exercise_pain: false,
      max_heart_rate: 150,
      glucose: parseInt(formData.glucose) || 100,
      pregnancies: 0,
      insulin: 80,
      skin_thickness: 20,
      diabetes_pedigree: 0.5
    };
    const response = await axios.post(`${API_BASE_URL}/deep_scan`, payload);
    return response.data;
  } catch (error) {
    console.error("Error in Deep Scan:", error);
    throw error;
  }
};

export const registerPatient = async (patientData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/register/patient`, patientData);
    return response.data;
  } catch (error) {
    console.error("Error registering patient:", error);
    throw error;
  }
};

export const registerFitness = async (fitnessData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/register/fitness`, fitnessData);
    return response.data;
  } catch (error) {
    console.error("Error registering fitness user:", error);
    throw error;
  }
};

export const registerDoctor = async (doctorData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/register/doctor`, doctorData);
    return response.data;
  } catch (error) {
    console.error("Error registering doctor:", error);
    throw error;
  }
};

export const searchDoctors = async (symptoms) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/search-doctors`, { symptoms });
    return response.data;
  } catch (error) {
    console.error("Error searching doctors:", error);
    throw error;
  }
};

export const linkPatient = async (doctorId, patientId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/link-patient`, {
      doctor_id: doctorId,
      patient_id: patientId
    });
    return response.data;
  } catch (error) {
    console.error("Error linking patient:", error);
    throw error;
  }
};

export const getConnections = async (doctorId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/connections/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching connections:", error);
    throw error;
  }
};

export const getPatientConnections = async (patientId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/patient-connections/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient connections:", error);
    throw error;
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/unread-count/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

export const sendMessage = async (senderId, receiverId, text) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/messages`, {
      sender_id: senderId,
      receiver_id: receiverId,
      text: text
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getMessages = async (userA, userB, readerId = null) => {
  try {
    let url = `${API_BASE_URL}/api/messages/${userA}/${userB}`;
    if (readerId) {
      url += `?reader_id=${readerId}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const grantAccess = async (patientId, doctorId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/grant-access`, {
      patient_id: patientId,
      doctor_id: doctorId
    });
    return response.data;
  } catch (error) {
    console.error("Error granting access:", error);
    throw error;
  }
};

export const revokeAccess = async (patientId, doctorId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/revoke-access`, {
      patient_id: patientId,
      doctor_id: doctorId
    });
    return response.data;
  } catch (error) {
    console.error("Error revoking access:", error);
    throw error;
  }
};

// -----------------------
// Appointment API
// -----------------------

export const requestAppointment = async (patientId, doctorId, date, time, urgency, issue = '') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/appointments/request`, {
      patient_id: patientId,
      doctor_id: doctorId,
      date,
      time,
      urgency,
      issue
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting appointment:", error);
    throw error;
  }
};

export const getAppointments = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/appointments/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

// -----------------------
// Family Web Tree API
// -----------------------

export const linkFamilyMember = async (userId, relativeId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/family/link`, {
      user_id: userId,
      relative_id: relativeId
    });
    return response.data;
  } catch (error) {
    console.error("Error linking family member:", error);
    throw error;
  }
};

export const getFamilyTree = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/family/tree/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching family tree:", error);
    throw error;
  }
};