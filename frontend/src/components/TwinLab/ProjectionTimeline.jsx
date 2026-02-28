import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ActivitySquare } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const ProjectionTimeline = ({ data }) => {
  const { user } = useUser();
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="card col-span-1 md:col-span-2 relative overflow-hidden"
    >
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] text-healthcare-blue pointer-events-none">
         <TrendingUp size={200} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Risk Projection Timeline</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            {isDoctor 
              ? "12-month trajectory variance model comparing current baseline against optimized physiological parameters." 
              : "See how your health score changes over time with and without recommended lifestyle improvements."}
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div> No Change
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500"></div> Optimized
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full mt-8 z-10">
         {/* Simple CSS-based mock graph for visual impact without heavy chart libraries */}
         <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 font-mono pb-6">
            <div className="flex items-end w-full border-b border-slate-100 pb-1"><span>100</span></div>
            <div className="flex items-end w-full border-b border-slate-100 pb-1"><span>80</span></div>
            <div className="flex items-end w-full border-b border-slate-100 pb-1"><span>60</span></div>
            <div className="flex items-end w-full border-b border-slate-100 pb-1"><span>40</span></div>
         </div>

         <div className="absolute bottom-0 left-8 right-0 h-full flex items-end">
            {/* Base line (No change) */}
            <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <motion.path 
                 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                 d={`M 0 ${100 - data.current} C 30 ${100 - data.base6m}, 70 ${100 - data.base12m}, 100 ${100 - data.base12m}`}
                 fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="4 4"
              />
              {/* Optimized line */}
              <motion.path 
                 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                 d={`M 0 ${100 - data.current} C 30 ${100 - data.opt6m}, 70 ${100 - data.opt12m}, 100 ${100 - data.opt12m}`}
                 fill="none" stroke="#10b981" strokeWidth="3"
              />
              
              {/* Nodes */}
              <circle cx="0" cy={100 - data.current} r="3" fill="#slate-800" />
              <circle cx="50" cy={100 - data.base6m} r="2" fill="#f87171" />
              <circle cx="100" cy={100 - data.base12m} r="2" fill="#f87171" />
              <circle cx="50" cy={100 - data.opt6m} r="3" fill="#10b981" />
              <circle cx="100" cy={100 - data.opt12m} r="3" fill="#10b981" />
            </svg>
         </div>

         {/* X-Axis labels */}
         <div className="absolute -bottom-2 left-8 right-0 flex justify-between text-xs font-semibold text-slate-500">
           <span>Now</span>
           <span>6 Months</span>
           <span>1 Year</span>
         </div>
      </div>

      {isPatient && (
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3 relative z-10">
          <ActivitySquare className="text-healthcare-blue shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900 leading-relaxed">
            <strong>7-Day Preventive Plan:</strong> Start with replacing processed snacks with whole foods and adding a 15-minute daily walk. This small change acts as the primary driver for the <span className="text-green-600 font-bold max-w-max">Optimized Scenario</span> curve above.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectionTimeline;
