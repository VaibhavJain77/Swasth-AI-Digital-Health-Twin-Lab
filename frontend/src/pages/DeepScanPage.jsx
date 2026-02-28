import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Loader, Heart, Droplet, Ruler, Weight, UserCircle2, 
  Activity, ArrowRight
} from 'lucide-react';

import { useUser } from '../context/UserContext';
import { submitDeepScan } from '../services/apiService';

const InputField = ({ icon: Icon, label, name, type, placeholder, formData, handleChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-healthcare-blue">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required
        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue transition-all bg-slate-50 hover:bg-white"
      />
    </div>
  </div>
);

const DeepScanPage = () => {
  const navigate = useNavigate();
  const { user, saveScanResults } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: user?.age || '', 
    sex: user?.gender?.toLowerCase() || '', 
    height: user?.height || '', 
    weight: user?.weight || '',
    systolic: '', diastolic: '', cholesterol: '', 
    glucose: '', 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call the ML Models backend
      const result = await submitDeepScan(formData);
      // Save it globally for the Dashboard
      saveScanResults(result);
      navigate('/results');
    } catch (err) {
      console.error(err);
      alert("Failed to connect to ML Deep Scan server.");
    } finally {
      setLoading(false);
    }
  };

  // InputField was moved outside the component body to prevent re-mount focus bugs

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Deep Health Scan</h1>
        <p className="text-slate-600">Enter your medical metrics for a comprehensive AI risk analysis.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <UserCircle2 className="text-healthcare-blue" />
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InputField icon={User} label="Age" name="age" type="number" placeholder="Years" formData={formData} handleChange={handleChange} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Sex</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-healthcare-blue">
                  <User size={18} />
                </div>
                <select
                  name="sex" value={formData.sex} onChange={handleChange} required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue transition-all bg-slate-50 appearance-none"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <InputField icon={Ruler} label="Height (cm)" name="height" type="number" placeholder="cm" formData={formData} handleChange={handleChange} />
            <InputField icon={Weight} label="Weight (kg)" name="weight" type="number" placeholder="kg" formData={formData} handleChange={handleChange} />
          </div>
        </motion.div>

        {/* Cardiovascular */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Heart className="text-healthcare-danger" />
            <h2 className="text-xl font-semibold">Cardiovascular Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField icon={Activity} label="Systolic BP" name="systolic" type="number" placeholder="mmHg" formData={formData} handleChange={handleChange} />
            <InputField icon={Activity} label="Diastolic BP" name="diastolic" type="number" placeholder="mmHg" formData={formData} handleChange={handleChange} />
            <InputField icon={Droplet} label="Cholesterol Level" name="cholesterol" type="number" placeholder="mg/dL" formData={formData} handleChange={handleChange} />
          </div>
        </motion.div>

        {/* Diabetes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Activity className="text-healthcare-warn" />
            <h2 className="text-xl font-semibold">Diabetes Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField icon={Droplet} label="Fasting Blood Glucose" name="glucose" type="number" placeholder="mg/dL" formData={formData} handleChange={handleChange} />
            {/* Can add more if needed like HbA1c */}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex justify-end pt-4"
        >
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Analyzing Metrics...
              </>
            ) : (
              <>
                Generate Health Report
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default DeepScanPage;

