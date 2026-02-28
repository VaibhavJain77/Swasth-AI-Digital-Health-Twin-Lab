import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { 
  Users, UserPlus, MessageCircle, Activity, 
  Search, ShieldAlert, Loader, ChevronRight, Lock, Unlock,
  Calendar, Clock, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { getConnections, linkPatient, getUnreadCount, getAppointments, updateAppointmentStatus } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Link Patient State
  const [newPatientId, setNewPatientId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState({ text: "", type: "" });
  
  const [unreadCounts, setUnreadCounts] = useState({});
  const [expandedPatient, setExpandedPatient] = useState(null);

  // New Tab & Appointment State
  const [activeTab, setActiveTab] = useState('Overview');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Security check: Only doctors allowed
    if (!user || user.role !== 'doctor') {
      navigate('/onboarding');
      return;
    }
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await getConnections(user.id);
      if (res.status === 'success') {
        setPatients(res.patients || []);
      }
      
      const unreadRes = await getUnreadCount(user.id);
      if (unreadRes.status === 'success') {
        setUnreadCounts(unreadRes.by_sender || {});
      }

      const aptsRes = await getAppointments(user.id);
      if (aptsRes.status === 'success') {
        setAppointments(aptsRes.appointments || []);
      }
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkPatient = async (e) => {
    e.preventDefault();
    if (!newPatientId.trim().startsWith("PID-")) {
      setLinkMessage({ text: "Patient ID must start with PID-", type: "error" });
      return;
    }

    setIsLinking(true);
    setLinkMessage({ text: "", type: "" });
    try {
      const res = await linkPatient(user.id, newPatientId.trim().toUpperCase());
      setLinkMessage({ text: "Patient successfully linked!", type: "success" });
      setNewPatientId("");
      fetchPatients(); // Refresh list
    } catch (err) {
      setLinkMessage({ 
        text: err.response?.data?.detail || "Failed to link patient. Check ID.", 
        type: "error" 
      });
    } finally {
      setIsLinking(false);
    }
  };

  if (!user || user.role !== 'doctor') return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-healthcare-blue/10 text-healthcare-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Provider Portal
            </span>
            <span className="font-mono text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
              ID: {user.id}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Dr. {user.name.replace('Dr. ', '')}
          </h1>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto gap-4 mb-8 border-b border-slate-200 pb-px hide-scrollbar">
          {['Overview', 'Appointments', 'Patients'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-bold whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-healthcare-blue' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'Overview' && <Activity size={16} />}
                {tab === 'Appointments' && <Calendar size={16} />}
                {tab === 'Patients' && <Users size={16} />}
                {tab}
                {tab === 'Appointments' && appointments.filter(a => a.status === 'Pending').length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {appointments.filter(a => a.status === 'Pending').length}
                  </span>
                )}
              </div>
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-healthcare-blue rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 text-healthcare-blue rounded-full flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
                  <h3 className="text-3xl font-black text-slate-900">{patients.length}</h3>
                </div>
              </div>
            </div>

            <div className={`bg-white p-6 rounded-3xl border shadow-sm ${appointments.filter(a => a.status === 'Pending').length > 0 ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${appointments.filter(a => a.status === 'Pending').length > 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'}`}>
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Requests</p>
                  <h3 className="text-3xl font-black text-slate-900">{appointments.filter(a => a.status === 'Pending').length}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Unread Messages</p>
                  <h3 className="text-3xl font-black text-slate-900">{Object.values(unreadCounts).reduce((a, b) => a + b, 0)}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- APPOINTMENTS TAB --- */}
        {activeTab === 'Appointments' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                  <Calendar size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Appointment Requests</h2>
              </div>
            </div>
            <div className="p-0">
              {appointments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">All caught up</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    You have no pending appointment requests at this time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map((apt, idx) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          apt.urgency === 'Emergency' ? 'bg-red-50 text-red-500' :
                          apt.urgency === 'Urgent' ? 'bg-amber-50 text-amber-500' :
                          'bg-blue-50 text-healthcare-blue'
                        }`}>
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900">{apt.patient_name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                              apt.urgency === 'Emergency' ? 'bg-red-50 text-red-600 border-red-100' :
                              apt.urgency === 'Urgent' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-blue-50 text-healthcare-blue border-blue-100'
                            }`}>
                              {apt.urgency}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {apt.date}</span>
                            <span className="flex items-center gap-1"><Clock size={14}/> {apt.time}</span>
                          </div>
                          {apt.issue && (
                            <div className="mt-2 text-sm text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-700 block mb-0.5 text-xs">Reason:</span>
                              {apt.issue}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        {apt.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={async () => {
                                await updateAppointmentStatus(apt.id, 'Declined');
                                const apts = await getAppointments(user.id);
                                setAppointments(apts.appointments);
                              }}
                              className="flex-1 sm:flex-none py-2 px-4 shadow-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-red-600 hover:border-red-200 rounded-xl transition-all flex justify-center items-center gap-2 text-sm font-bold"
                            >
                              <XCircle size={16} /> Decline
                            </button>
                            <button 
                              onClick={async () => {
                                await updateAppointmentStatus(apt.id, 'Accepted');
                                const apts = await getAppointments(user.id);
                                setAppointments(apts.appointments);
                              }}
                              className="flex-1 sm:flex-none btn-primary py-2 px-6 shadow-sm flex justify-center items-center gap-2"
                            >
                              <CheckCircle2 size={16} /> Accept
                            </button>
                          </>
                        ) : (
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${
                            apt.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {apt.status === 'Accepted' ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                            {apt.status}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Patients' && (
          <>
            {/* Quick Add Form */}
            <form onSubmit={handleLinkPatient} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 w-full">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <UserPlus size={20} className="text-healthcare-blue"/> Add New Patient
              </h2>
              <p className="text-slate-500 text-sm mb-4">Ask the patient for their Unique ID (e.g. PID-1234) and enter it to request data pipeline access.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter PID-XXXX"
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue text-sm uppercase"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLinking || !newPatientId}
                  className="btn-primary py-3 px-8 whitespace-nowrap flex justify-center items-center gap-2"
                >
                  {isLinking ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  <span>Connect</span>
                </button>
              </div>
              {linkMessage.text && (
                <p className={`text-xs mt-3 font-medium ${linkMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {linkMessage.text}
                </p>
              )}
            </form>

            {/* Patient Roster */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                    <Users size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Your Pipeline</h2>
                </div>
                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-sm font-semibold">
                  {patients.length} Total Patients
                </span>
              </div>

          <div className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader size={32} className="animate-spin mx-auto mb-4 text-healthcare-blue/30" />
                <p>Loading patient database securely...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <UserPlus size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No patients linked yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Ask your patients for their Unique ID (PID-XXXX) located in their navigation bar to connect their health twin to your portal.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {patients.map((patient, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={patient.id}
                    className="p-0 border-b border-slate-100 last:border-b-0 group"
                  >
                    <div className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold text-slate-400 shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{patient.name}</h3>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            {patient.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          {patient.access_granted ? (
                            <>
                              <span>{patient.age} yrs • {patient.gender}</span>
                              {patient.blood_pressure && <span>BP: {patient.blood_pressure}</span>}
                              {patient.diseases && patient.diseases.length > 0 && (
                                <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 rounded-sm border border-amber-100">
                                  <ShieldAlert size={10} />
                                  {patient.diseases.join(', ')}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-emerald-600 font-medium ml-auto">
                                <Unlock size={12} /> Data Shared
                              </span>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400 font-medium italic">
                              <Lock size={12} /> Health Data Locked by Patient
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button 
                        onClick={() => navigate(`/chat/${patient.id}`)}
                        className="flex-1 relative sm:flex-none btn-secondary py-2 px-4 shadow-sm flex justify-center items-center gap-2 text-sm"
                      >
                        <MessageCircle size={16} /> Chat
                        {unreadCounts[patient.id] > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {unreadCounts[patient.id]}
                          </span>
                        )}
                      </button>
                      <button 
                         disabled={!patient.access_granted}
                         onClick={() => setExpandedPatient(expandedPatient === patient.id ? null : patient.id)}
                         className={`flex-1 sm:flex-none border py-2 px-4 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 text-sm font-medium ${
                           patient.access_granted 
                             ? expandedPatient === patient.id
                               ? 'border-healthcare-blue bg-healthcare-blue/5 text-healthcare-blue'
                               : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300'
                             : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                         }`}
                      >
                        <Activity size={16} /> Twin
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Inline Twin */}
                  <AnimatePresence>
                    {expandedPatient === patient.id && patient.access_granted && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                          
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Swasth Score</h4>
                            <div className="flex items-end gap-2">
                              <span className="text-3xl font-black text-indigo-600">84</span>
                              <span className="text-sm font-medium text-emerald-500 mb-1">+2 pts</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                              <div className="bg-indigo-500 h-full w-[84%] rounded-full"></div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biological Age</h4>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-slate-800">{parseInt(patient.age) + 2}</span>
                              <span className="text-sm text-slate-500">Chronological: {patient.age}</span>
                            </div>
                            <p className="text-xs font-medium text-amber-600 mt-2 bg-amber-50 inline-block px-2 py-1 rounded">
                              +2 years accelerated aging
                            </p>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Risk Trajectory</h4>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Activity size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">Stable</p>
                                <p className="text-xs text-slate-500">Preventive plan active</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
           </div>
         </div>
         </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
