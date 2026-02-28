import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const StabilityMeter = ({ value }) => {
  // SVG gauge constants
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="card flex flex-col items-center justify-center h-full relative"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-2 w-full text-center">System Stability</h3>
      <p className="text-xs text-slate-500 mb-8 text-center max-w-[200px]">
        Overall systemic resilience against physiological stressors.
      </p>

      <div className="relative flex items-center justify-center overflow-hidden h-[110px] w-[200px]">
        <svg width={size} height={size} className="absolute top-0 transform rotate-180">
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <motion.path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="transparent"
            stroke={value > 75 ? "#10b981" : value > 50 ? "#3b82f6" : "#f59e0b"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-4xl font-bold text-slate-900 leading-none">{value}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1">Index / 100</span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-xs font-medium text-slate-600">
        <ShieldCheck size={16} className={value > 75 ? "text-green-500" : value > 50 ? "text-blue-500" : "text-amber-500"} />
        {value >= 75 ? "Highly Resilient" : value >= 50 ? "Moderately Stable" : "Vulnerable State"}
      </div>
    </motion.div>
  );
};

export default StabilityMeter;
