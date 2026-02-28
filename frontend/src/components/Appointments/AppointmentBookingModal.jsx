import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, Loader, X } from 'lucide-react';
import { requestAppointment } from '../../services/apiService';
import { useUser } from '../../context/UserContext';

const AppointmentBookingModal = ({ isOpen, onClose, doctor, onBookingComplete }) => {
  const { user } = useUser();
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [urgency, setUrgency] = useState('Routine');
  const [issue, setIssue] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  if (!isOpen || !doctor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setErrorStatus("Please select both a date and a time.");
      return;
    }

    setIsSubmitting(true);
    setErrorStatus("");
    try {
      await requestAppointment(user.id, doctor.id, date, time, urgency, issue);
      onBookingComplete();
      onClose();
    } catch (err) {
      setErrorStatus("Failed to request appointment. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Request Appointment</h2>
              <p className="text-sm text-slate-500 mt-1">with {doctor.name}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto">
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Calendar size={14} className="text-healthcare-blue"/> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]} // prevent past dates
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Clock size={14} className="text-healthcare-blue"/> Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue text-sm"
                  />
                </div>
              </div>

              {/* Brief Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-healthcare-blue" style={{ visibility: 'hidden' }}/> Brief Reason / Symptoms
                </label>
                <textarea
                  rows="2"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="E.g., Follow-up on recent blood test, experiencing mild chest pain..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue text-sm resize-none"
                />
              </div>

              {/* Urgency Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-healthcare-blue"/> Urgency Level
                </label>
                <div className="flex flex-col gap-3">
                  {['Routine', 'Urgent', 'Emergency'].map((level) => (
                    <label 
                      key={level}
                      className={`relative flex cursor-pointer rounded-2xl border p-4 shadow-sm focus:outline-none ${
                        urgency === level 
                          ? level === 'Emergency' ? 'border-red-500 bg-red-50'
                          : level === 'Urgent' ? 'border-amber-500 bg-amber-50'
                          : 'border-healthcare-blue bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={urgency === level}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <p className={`font-bold ${
                              urgency === level 
                                ? level === 'Emergency' ? 'text-red-900'
                                : level === 'Urgent' ? 'text-amber-900'
                                : 'text-blue-900'
                                : 'text-slate-900'
                            }`}>
                              {level}
                            </p>
                            <span className="inline text-slate-500 mt-1">
                              {level === 'Routine' && 'Standard checkup or non-urgent follow-up.'}
                              {level === 'Urgent' && 'Needs attention soon, but not life-threatening.'}
                              {level === 'Emergency' && 'Immediate medical attention required.'}
                            </span>
                          </div>
                        </div>
                        {urgency === level && (
                          <div className={`shrink-0 ${
                            level === 'Emergency' ? 'text-red-500'
                            : level === 'Urgent' ? 'text-amber-500'
                            : 'text-healthcare-blue'
                          }`}>
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                              <circle cx={12} cy={12} r={12} fill="currentColor" opacity="0.2" />
                              <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {errorStatus && (
                <p className="text-sm text-red-500 font-medium text-center">{errorStatus}</p>
              )}

            </form>
          </div>

          {/* Footer actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
             <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-100 rounded-xl font-bold transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="booking-form"
                disabled={isSubmitting || !date || !time}
                className="flex-[2] btn-primary flex justify-center items-center py-2 px-4 shadow-sm gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Calendar size={18} /> Send Request
                  </>
                )}
              </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AppointmentBookingModal;
