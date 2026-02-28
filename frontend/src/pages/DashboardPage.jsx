import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartPulse, Activity, Brain, ShieldAlert, Download, 
  MapPin, Stethoscope, FileText, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Import New Digital Health Twin Components
import TwinIdentity from '../components/TwinLab/TwinIdentity';
import SystemLoadMap from '../components/TwinLab/SystemLoadMap';
import BiologicalAgeCard from '../components/TwinLab/BiologicalAgeCard';
import ProjectionTimeline from '../components/TwinLab/ProjectionTimeline';
import InteractionMatrix from '../components/TwinLab/InteractionMatrix';
import StabilityMeter from '../components/TwinLab/StabilityMeter';

// Import Advanced Intelligence Layers
import HealthTrajectory from '../components/TwinLab/HealthTrajectory';
import PreventiveLeverage from '../components/TwinLab/PreventiveLeverage';
import TwinCompanionChat from '../components/TwinLab/TwinCompanionChat';
import FamilyWebTree from '../components/Family/FamilyWebTree';

// Import API Service
import { getAIInsights } from '../services/apiService';

const CircularProgress = ({ value, color, size = 120, initials, bioAge }) => {
// ... existing circular progress code
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" strokeWidth={strokeWidth} fill="transparent"
          className="text-slate-100"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div 
        className="absolute flex flex-col items-center justify-center bg-slate-50 rounded-full shadow-inner border border-slate-100" 
        style={{ width: size - 35, height: size - 35 }}
      >
        {initials ? (
          <>
            <span className="text-3xl font-bold text-slate-800">{initials}</span>
            {bioAge && <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-1">Bio Age: {bioAge}</span>}
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-slate-800">{value}</span>
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Score</span>
          </>
        )}
      </div>
    </div>
  );
};

const RiskCard = ({ title, risk, icon: Icon, color, delay }) => {
  const isHigh = risk === 'High';
  const isModerate = risk === 'Moderate';
  const badgeColor = isHigh ? 'bg-red-100 text-red-700' : isModerate ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
  const iconColor = isHigh ? 'text-red-500' : isModerate ? 'text-amber-500' : 'text-green-500';
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card flex items-center justify-between p-5"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-slate-50 ${iconColor}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">Risk Assessment</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
        {risk}
      </span>
    </motion.div>
  );
};

const DashboardPage = () => {
  const { user, scanResults } = useUser();
  const baseScore = scanResults ? Math.round(scanResults.overall_swasth_score) : 68;
  const [swasthScore, setSwasthScore] = useState(baseScore);
  const [simulatorParams, setSimulatorParams] = useState({
    weight: 85,
    bloodPressure: 135,
    glucose: 110
  });

  // AI State
  const [aiData, setAiData] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  // Fetch AI Insights on mount (or when core metrics change)
  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoadingAI(true);
      
      // Construct context payload based on current user / mock metrics
      const payload = {
        user_role: user?.role || 'patient',
        swasth_score: swasthScore,
        risk_probabilities: scanResults ? { 
            heart: scanResults.heart.risk_level, 
            diabetes: scanResults.diabetes.risk_level, 
            stroke: scanResults.stroke.risk_level 
        } : { heart: 'Moderate', diabetes: 'Low', stroke: 'High' },
        trajectory_status: 'Drifting', // Calculated status
        worst_metric: scanResults ? 'Based on latest deep scan' : 'Systolic Blood Pressure (135 mmHg)',
        amplification_pairs: ["Heart Risk", "Hypertension", "Diabetes", "Hypertension"]
      };

      const data = await getAIInsights(payload);
      setAiData(data);
      setIsLoadingAI(false);
    };

    fetchInsights();
  }, [user, swasthScore]);

  const handleSimulatorChange = (e) => {
    const { name, value } = e.target;
    setSimulatorParams(prev => ({ ...prev, [name]: parseInt(value) }));
    const newScore = Math.min(100, Math.max(0, baseScore + ((85 - value) * (name === 'weight' ? 0.5 : 0)) + ((135 - value) * (name === 'bloodPressure' ? 0.3 : 0)) + ((110 - value) * (name === 'glucose' ? 0.2 : 0))));
    setSwasthScore(Math.round(newScore));
  };

  const openMap = (query) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        window.open(`https://www.google.com/maps/search/${query}/@${latitude},${longitude},14z`);
      }, () => { window.open(`https://www.google.com/maps/search/${query}`); });
    } else { window.open(`https://www.google.com/maps/search/${query}`);}
  };

  // ----------------------------------------------------------------------
  // DIGITAL HEALTH TWIN - DYNAMIC DATA BINDING
  // ----------------------------------------------------------------------
  // If scanResults exist (Deep Scan completed), use ML values.
  // Otherwise, use Onboarding user values or placeholders to prevent crash.
  
  const sysCardio = scanResults ? parseFloat(scanResults.heart.probability) : 0.45;
  const sysMetabolic = scanResults ? parseFloat(scanResults.diabetes.probability) : 0.60;
  const sysNeuro = scanResults ? parseFloat(scanResults.stroke.probability) : 0.20;
  const sysVascular = scanResults ? parseFloat(scanResults.hypertension.probability) : 0.55;

  const liveTwinData = {
    identity: {
      twinType: scanResults ? "Biometric Strain Twin" : "Baseline Registration Twin",
      explanation: scanResults 
        ? `Your physical profile indicates ${scanResults.heart.risk_level.toLowerCase()} cardiac risk and ${scanResults.diabetes.risk_level.toLowerCase()} metabolic load.`
        : "Your digital profile is currently running on baseline onboarding metrics. Complete a Deep Scan for ML-driven insights.",
      systemStress: scanResults ? (swasthScore < 60 ? "High" : swasthScore < 80 ? "Moderate" : "Low") : "Unknown"
    },
    systemLoad: {
      cardio: { value: Math.round(sysCardio * 100), exact: sysCardio },
      metabolic: { value: Math.round(sysMetabolic * 100), exact: sysMetabolic },
      neuro: { value: Math.round(sysNeuro * 100), exact: sysNeuro },
      vascular: { value: Math.round(sysVascular * 100), exact: sysVascular }
    },
    biologicalAge: {
      chronologicalAge: user?.age || 30, // Fallback to 30 if age wasn't provided
      biologicalAge: scanResults ? (user?.age || 30) + (100 - swasthScore > 30 ? 4 : 0) : (user?.age || 30)
    },
    projection: {
      current: swasthScore,
      base6m: swasthScore - 4, 
      base12m: swasthScore - 10,
      opt6m: Math.min(100, swasthScore + 7), 
      opt12m: Math.min(100, swasthScore + 14)
    },
    interactions: scanResults ? [
      { factors: ["Heart Risk", "Hypertension"], multiplier: 2.4, outcome: "Stroke Risk Amplification" },
      { factors: ["Diabetes", "Hypertension"], multiplier: 3.1, outcome: "Vascular Complication" },
    ] : [],
    stability: scanResults ? swasthScore - 5 : 85
  };

  const mockTrajectoryData = {
    direction: scanResults ? (swasthScore > 75 ? "Improving" : swasthScore > 50 ? "Drifting" : "Accelerating") : "Stable",
    clinicalExplanation: aiData?.trajectory_explanation || "Analyzing trajectory...",
    userExplanation: aiData?.trajectory_explanation || "Analyzing trajectory..."
  };

  const mockLeverageData = {
    action: aiData?.leverage_recommendation?.action || "Analyzing highest impact action...",
    scoreImpact: aiData?.leverage_recommendation?.scoreImpact || "?",
    secondaryImpact: aiData?.leverage_recommendation?.secondaryImpact || "Calculating benefits..."
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* -------------------------------------------------------------
          DIGITAL HEALTH TWIN LAB
          ------------------------------------------------------------- */}
      <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 flex items-center gap-3">
        <Activity className="text-healthcare-blue" /> Digital Health Twin Lab
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Top Row: Identity spanning 2 cols, Stability spanning 1 col */}
         <div className="col-span-1 md:col-span-2">
            <TwinIdentity data={liveTwinData.identity} />
         </div>
         <div className="col-span-1">
            <StabilityMeter value={liveTwinData.stability} />
         </div>
         
         {/* Middle Row: System Load, Biological Age, Interaction Matrix */}
         <div className="col-span-1 lg:col-span-1">
            <SystemLoadMap data={liveTwinData.systemLoad} />
         </div>
         <div className="col-span-1 lg:col-span-1">
            <BiologicalAgeCard data={liveTwinData.biologicalAge} />
         </div>
         <div className="col-span-1 lg:col-span-1 md:col-span-2 relative">
            {isLoadingAI && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-healthcare-blue font-medium"><Activity className="animate-spin" size={20}/> Analyzing Amplifications...</div>
              </div>
            )}
            <InteractionMatrix data={liveTwinData.interactions} aiContext={aiData?.amplification_explanation} />
         </div>

         {/* Advanced Intelligence: Health Trajectory Status */}
         <div className="col-span-1 md:col-span-2 lg:col-span-3 relative">
            {isLoadingAI && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                 <div className="flex items-center gap-2 text-healthcare-blue font-medium"><Activity className="animate-spin" size={20}/> Computing Trajectory...</div>
              </div>
            )}
            <HealthTrajectory data={mockTrajectoryData} />
         </div>

         {/* Bottom Row: Projection Timeline */}
         <ProjectionTimeline data={liveTwinData.projection} />
      </div>

      {user?.role && (user.role === 'fitness' || user.role === 'patient') && (
        <div className="pt-8">
          <FamilyWebTree />
        </div>
      )}

      {/* -------------------------------------------------------------
          STANDARD DASHBOARD METRICS (Adapted based on role)
          ------------------------------------------------------------- */}
      <div className="pt-12 mt-4 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Standard Metrics & Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 card bg-gradient-to-br from-healthcare-blue/5 to-transparent border-healthcare-blue/10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold mb-4">
                  <ShieldAlert size={14} /> ACTION REQUIRED
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                  {user?.role === 'doctor' ? "Patient Output Overview" : "Your Health Overview"}
                </h1>
                <p className="text-slate-600 mb-6">
                  {scanResults 
                    ? `Based on recent scans, your Swasth Index indicates ${swasthScore > 75 ? 'a strong' : swasthScore > 50 ? 'a moderate' : 'an elevated'} health risk profile.` 
                    : "Complete a Deep Scan to generate your full biometric profile and unlock personalized AI insights."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/vision-scan" className="btn-secondary text-healthcare-teal border-healthcare-teal py-2.5 px-5 text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]">
                    <Activity size={16} /> Run Vision Triage
                  </Link>
                  <Link to="/report" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-900">
                    <Download size={16} /> Full Report
                  </Link>
                </div>
              </div>
              
              <div className="shrink-0 flex flex-col items-center">
                <CircularProgress 
                  value={swasthScore} 
                  color={swasthScore > 80 ? '#10B981' : swasthScore > 60 ? '#F59E0B' : '#DC2626'} 
                  size={160} 
                  initials={user?.name ? user.name.substring(0,2).toUpperCase() : 'ME'}
                  bioAge={liveTwinData.biologicalAge.biologicalAge}
                />
                <p className="text-sm font-medium text-slate-500 mt-4 text-center">Swasth Index</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {scanResults?.emergency_alert && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-red-800 text-sm font-semibold flex items-start gap-2">
                <ShieldAlert className="shrink-0 text-red-600" size={18} />
                {scanResults.emergency_alert}
              </div>
            )}
            <RiskCard title="Heart Risk" risk={scanResults ? scanResults.heart.risk_level : "Unknown"} icon={HeartPulse} color="text-red-500" delay={0.1} />
            <RiskCard title="Diabetes Risk" risk={scanResults ? scanResults.diabetes.risk_level : "Unknown"} icon={Activity} color="text-amber-500" delay={0.2} />
            <RiskCard title="Stroke Risk" risk={scanResults ? scanResults.stroke.risk_level : "Unknown"} icon={Brain} color="text-rose-500" delay={0.3} />
          </div>
        </div>
      </div>

      {/* Simulator & Actions */}
      {user?.role !== 'doctor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
               {user?.role === 'fitness' ? "Performance Optimization Simulator" : "Lifestyle Simulator"}
            </h2>
            <p className="text-sm text-slate-500 mb-8">Move the sliders to see how changes affect the Swasth Score.</p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-slate-700">Weight (kg)</label>
                  <span className="text-healthcare-blue font-bold">{simulatorParams.weight} kg</span>
                </div>
                <input type="range" name="weight" min="50" max="150" value={simulatorParams.weight} onChange={handleSimulatorChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-healthcare-blue" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-slate-700">Systolic BP (mmHg)</label>
                  <span className="text-healthcare-blue font-bold">{simulatorParams.bloodPressure}</span>
                </div>
                <input type="range" name="bloodPressure" min="90" max="200" value={simulatorParams.bloodPressure} onChange={handleSimulatorChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-healthcare-blue" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-slate-700">Fasting Glucose (mg/dL)</label>
                  <span className="text-healthcare-blue font-bold">{simulatorParams.glucose}</span>
                </div>
                <input type="range" name="glucose" min="70" max="250" value={simulatorParams.glucose} onChange={handleSimulatorChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-healthcare-blue" />
              </div>
            </div>

            {/* Advanced Intelligence: Preventive Leverage Engine */}
            <div className="relative">
              {isLoadingAI && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                   <div className="flex items-center gap-2 text-healthcare-blue font-medium"><Activity className="animate-spin" size={20}/> Calculating Leverage...</div>
                </div>
              )}
              <PreventiveLeverage data={mockLeverageData} />
            </div>
          </motion.div>

          {user?.role === 'patient' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Healthcare Access</h2>
              <p className="text-sm text-slate-500 mb-8">Find the nearest medical facilities based on your current location.</p>
              
              <div className="space-y-4">
                <button onClick={() => openMap('Hospitals near me')} className="w-full p-4 rounded-xl border border-slate-200 hover:border-healthcare-blue hover:bg-healthcare-light transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-healthcare-blue"><Stethoscope size={20} /></div>
                    <div className="text-left"><h4 className="font-semibold text-slate-800">Find Hospitals</h4><p className="text-xs text-slate-500">Emergency & General Care</p></div>
                  </div>
                  <ChevronRight className="text-slate-400 group-hover:text-healthcare-blue" />
                </button>
                <button onClick={() => openMap('Pharmacies near me')} className="w-full p-4 rounded-xl border border-slate-200 hover:border-healthcare-blue hover:bg-healthcare-light transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-healthcare-blue"><FileText size={20} /></div>
                    <div className="text-left"><h4 className="font-semibold text-slate-800">Find Pharmacies</h4><p className="text-xs text-slate-500">Medication & Supplies</p></div>
                  </div>
                  <ChevronRight className="text-slate-400 group-hover:text-healthcare-blue" />
                </button>
                <button onClick={() => openMap('Clinics near me')} className="w-full p-4 rounded-xl border border-slate-200 hover:border-healthcare-blue hover:bg-healthcare-light transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-healthcare-blue"><MapPin size={20} /></div>
                    <div className="text-left"><h4 className="font-semibold text-slate-800">Find Clinics</h4><p className="text-xs text-slate-500">Checkups & Primary Care</p></div>
                  </div>
                  <ChevronRight className="text-slate-400 group-hover:text-healthcare-blue" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
    
    {/* Advanced Intelligence: Floating Companion Chat */}
    <TwinCompanionChat aiMessage={aiData?.twin_message} />
    </>
  );
};

export default DashboardPage;

// Content was duplicated due to regex matching error, dropping bottom half
