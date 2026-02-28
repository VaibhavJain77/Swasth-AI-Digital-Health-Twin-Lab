import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Shield, Clock, Search, Dumbbell, Stethoscope, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LandingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  if (!user) return null; // Or a loading spinner while redirecting

  const getPersonalizedContent = () => {
    switch (user.role) {
      case 'doctor':
        return {
          badge: "Clinical Dashboard",
          badgeIcon: <Stethoscope size={16} />,
          title: `Welcome, Dr. ${user.name.split(' ')[0]}`,
          subtitle: "Access your AI-powered triage assistant. Review patient scans, analyze risks, and verify reports efficiently.",
          primaryBtn: { text: "View Patient Queue", path: "/doctor-dashboard", icon: <Users size={20} /> },
          secondaryBtn: { text: "AI Diagnostic Tool", path: "/quick-scan", icon: <Search size={20} /> }
        };
      case 'fitness':
        return {
          badge: "Performance & Wellness",
          badgeIcon: <Dumbbell size={16} />,
          title: `Optimize Your Performance`,
          subtitle: `Track your metrics and reach your goal: "${user.details}". Analyze cardiovascular health and optimize your lifestyle.`,
          primaryBtn: { text: "Lifestyle Simulator", path: "/results", icon: <Activity size={20} /> },
          secondaryBtn: { text: "Deep Health Scan", path: "/deep-scan", icon: <Shield size={20} /> }
        };
      case 'patient':
      default:
        return {
          badge: "AI-Powered Preventive Care",
          badgeIcon: <Shield size={16} />,
          title: `Welcome, ${user.name}`,
          subtitle: `Your AI-powered health assistant. We notice your top concern is "${user.details}". Identify risks early and make informed decisions.`,
          primaryBtn: { text: "Quick Symptom Scan", path: "/quick-scan", icon: <Clock size={20} /> },
          secondaryBtn: { text: "Comprehensive Scan", path: "/deep-scan", icon: <Activity size={20} /> },
          tertiaryBtn: { text: "Vision Triage (Camera)", path: "/vision-scan", icon: <Search size={20} /> }
        };
    }
  };

  const content = getPersonalizedContent();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden flex flex-col items-center justify-center min-h-[90vh] px-4">
        {/* Background Gradients */}
        <div className="absolute top-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-healthcare-light rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center max-w-4xl mx-auto mt-20 md:mt-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <img 
              src="/logo.png" 
              alt="Swasth AI Logo" 
              className="h-32 md:h-40 w-auto object-contain drop-shadow-xl"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-healthcare-blue mb-8 font-medium text-sm"
          >
            {content.badgeIcon}
            <span>{content.badge}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6"
          >
            {user.role === 'patient' || user.role === 'doctor' ? (
              <>{content.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-healthcare-blue to-healthcare-teal"></span></>
            ) : (
               <><span className="text-transparent bg-clip-text bg-gradient-to-r from-healthcare-blue to-healthcare-teal">{content.title}</span></>
            )}
            {user.role === 'patient' && <><br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-healthcare-blue to-healthcare-teal text-4xl md:text-5xl mt-2 block">Swasth AI is Here.</span></>}
            {user.role === 'doctor' && <><br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-healthcare-blue to-healthcare-teal text-4xl md:text-5xl mt-2 block">Swasth Clinical is Ready.</span></>}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 mb-8 font-light"
          >
            {content.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4"
          >
            <Link to={content.primaryBtn.path} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4 bg-gradient-to-r from-healthcare-blue to-blue-700">
              {content.primaryBtn.icon}
              {content.primaryBtn.text}
            </Link>
            <Link to={content.secondaryBtn.path} className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4 border-2">
              {content.secondaryBtn.icon}
              {content.secondaryBtn.text}
            </Link>
            {content.tertiaryBtn && (
                <Link to={content.tertiaryBtn.path} className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4 border-2 shadow-sm shadow-healthcare-teal/20 border-healthcare-teal/30 hover:border-healthcare-teal bg-teal-50/50">
                  {content.tertiaryBtn.icon}
                  {content.tertiaryBtn.text}
                </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

