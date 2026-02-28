import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { MessageCircle, Search, Loader, ShieldCheck, MapPin, Phone, User as UserIcon, Lock, Unlock, Calendar, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { getPatientConnections, getUnreadCount, grantAccess, revokeAccess, getAppointments } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import AppointmentBookingModal from '../components/Appointments/AppointmentBookingModal';

const MessagesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Only patients can access the Messages Hub
    if (!user || user.role !== 'patient') {
      navigate('/onboarding');
      return;
    }
    fetchConnections();
  }, [user]);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const res = await getPatientConnections(user.id);
      if (res.status === 'success') {
        setDoctors(res.doctors || []);
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
      console.error("Failed to fetch doctor connections", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleConsent = async (doctorId, currentStatus) => {
    try {
      if (currentStatus) {
        await revokeAccess(user.id, doctorId);
      } else {
        await grantAccess(user.id, doctorId);
      }
      fetchConnections(); // refresh the list to show updated status
    } catch (err) {
      console.error("Failed to update consent:", err);
    }
  };

  if (!user || user.role !== 'patient') return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-healthcare-blue/10 text-healthcare-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Secure Communications
            </span>
            <span className="font-mono text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" /> E2E Encrypted
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Messages Hub
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Your active conversations with connected healthcare providers.</p>
        </div>

        {/* Doctor Roster */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-healthcare-blue rounded-lg">
                <MessageCircle size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Connected Doctors</h2>
            </div>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-sm font-semibold">
              {doctors.length} Active
            </span>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader size={32} className="animate-spin mx-auto mb-4 text-healthcare-blue/30" />
                <p>Loading your secure connections...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No active conversations</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  You haven't connected with any doctors yet. Go to Find Doctor to search for a specialist and send them a message.
                </p>
                <button 
                  onClick={() => navigate('/find-doctor')}
                  className="btn-primary py-2 px-6"
                >
                  Find a Doctor
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {doctors.map((doctor, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={doctor.id}
                    className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                    onClick={() => navigate(`/chat/${doctor.id}`)}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-xl font-bold text-healthcare-blue shrink-0 border border-blue-100">
                        {doctor.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-healthcare-blue transition-colors">{doctor.name}</h3>
                          <span className="text-[10px] bg-blue-50 text-healthcare-blue px-2 py-0.5 rounded font-semibold border border-blue-100">
                            {doctor.specialization}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1 font-mono text-xs"><ShieldCheck size={12}/>{doctor.id}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} className="shrink-0"/> <span className="truncate max-w-[200px]">{doctor.clinic_address.split(',')[0]}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                      
                      {/* Consent Toggle */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 text-sm">
                        <span className={`flex items-center gap-1 font-semibold ${doctor.access_granted ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {doctor.access_granted ? <Unlock size={14} /> : <Lock size={14} />}
                          Data {doctor.access_granted ? 'Shared' : 'Locked'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={doctor.access_granted || false}
                            onChange={(e) => {
                              // Prevent div click from firing
                              e.stopPropagation();
                              handleToggleConsent(doctor.id, doctor.access_granted);
                            }}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto mt-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doctor);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 sm:flex-none btn-secondary py-2 px-6 shadow-sm flex justify-center items-center gap-2 border border-slate-200"
                        >
                          <Calendar size={16} className="text-slate-500" /> Book
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/chat/${doctor.id}`);
                          }}
                          className="relative flex-1 sm:w-auto btn-primary py-2 px-6 shadow-sm flex justify-center items-center gap-2"
                        >
                          <MessageCircle size={16} /> Open Chat
                        {unreadCounts[doctor.id] > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {unreadCounts[doctor.id]}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient Appointments */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                <Calendar size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
            </div>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-sm font-semibold">
              {appointments.length} Appointments
            </span>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader size={32} className="animate-spin mx-auto mb-4 text-amber-500/30" />
                <p>Loading your schedule...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Calendar size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No appointments yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Click 'Book' on any connected doctor above to request a new appointment.
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
                          <h3 className="font-bold text-slate-900">Dr. {apt.doctor_name}</h3>
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
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border w-full sm:w-auto ${
                        apt.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        apt.status === 'Declined' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {apt.status === 'Accepted' ? <CheckCircle2 size={16}/> : 
                         apt.status === 'Declined' ? <XCircle size={16}/> : <Clock size={16}/>}
                        {apt.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <AppointmentBookingModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        onBookingComplete={() => {
          fetchConnections(); // refresh appointments
        }}
      />
    </div>
  );
};

export default MessagesPage;
