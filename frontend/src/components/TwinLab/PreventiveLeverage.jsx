import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, ActivitySquare } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const PreventiveLeverage = ({ data }) => {
  const { user } = useUser();
  const isDoctor = user?.role === 'doctor';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-healthcare-blue to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mt-8"
    >
       <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
         <Target size={150} />
       </div>

       <div className="relative z-10">
         <div className="flex items-center gap-2 mb-4">
           <Zap className="text-yellow-300" size={20} fill="currentColor" />
           <h3 className="font-bold text-lg uppercase tracking-wide text-blue-50">Highest Impact Action</h3>
         </div>
         
         <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ActivitySquare size={20} className="text-blue-200" />
              {data.action}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-black/20 rounded-lg p-3">
                 <p className="text-xs text-blue-200 uppercase font-semibold mb-1">Swasth Score Impact</p>
                 <p className="text-2xl font-bold text-green-400">+{data.scoreImpact} pts</p>
               </div>
               <div className="bg-black/20 rounded-lg p-3">
                 <p className="text-xs text-blue-200 uppercase font-semibold mb-1">
                   {isDoctor ? "Systemic Risk Reduction" : "Secondary Benefit"}
                 </p>
                 <p className="text-sm font-medium leading-tight text-white">
                   {data.secondaryImpact}
                 </p>
               </div>
            </div>
         </div>
         
         {isDoctor && (
           <p className="text-[10px] text-blue-200 mt-4 text-right opacity-80 uppercase tracking-widest font-mono">
             Derived via multi-variable leverage sensitivity analysis
           </p>
         )}
       </div>
    </motion.div>
  );
};

export default PreventiveLeverage;
