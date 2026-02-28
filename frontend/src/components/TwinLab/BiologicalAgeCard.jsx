import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { Calendar, ArrowDownCircle } from 'lucide-react';

const BiologicalAgeCard = ({ data }) => {
  const { user } = useUser();
  const isDoctor = user?.role === 'doctor';
  const isFitness = user?.role === 'fitness';

  const diff = data.biologicalAge - data.chronologicalAge;
  const isOlder = diff > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
      className="card flex flex-col justify-between h-full bg-slate-900 text-white border-none relative overflow-hidden"
    >
       {/* Background accent */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full mix-blend-overlay filter blur-3xl opacity-50 ${isOlder ? 'bg-red-500' : 'bg-green-500'}`}></div>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-slate-400" size={20} />
          <h3 className="text-lg font-bold">Age Analysis</h3>
        </div>

        <div className="flex items-end gap-6 mb-8">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Chronological</p>
            <p className="text-4xl font-light text-slate-300">{data.chronologicalAge}</p>
          </div>
          <div className="h-12 w-px bg-slate-700"></div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Biological <span className="text-[#3b82f6]">*</span></p>
            <p className="text-5xl font-bold">{data.biologicalAge}</p>
          </div>
        </div>
      </div>

      <div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold mb-3 ${isOlder ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
          {isOlder ? `+${Math.abs(diff)} Years Accelerating` : `-${Math.abs(diff)} Years Decelerating`}
        </div>
        
        {isDoctor ? (
          <p className="text-xs text-slate-400 leading-relaxed">
            * Epigenetic age estimate derived from multidimensional systemic risk burden and metabolic strain indicators. Variance: ±1.2 yrs.
          </p>
        ) : isFitness ? (
           <div className="mt-2 p-3 bg-white/10 rounded-xl border border-white/5">
             <div className="flex items-center gap-2 text-sm font-medium mb-1 text-green-300">
               <ArrowDownCircle size={16} /> Optimization Potential
             </div>
             <p className="text-xs text-slate-300">Through targeted cardiovascular endurance and glucose stabilization, potential biological age reduction is <span className="font-bold text-white">4.5 years</span>.</p>
           </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">
            * Biological age is an AI-based preventive estimate showing how fast your body is aging internally based on health metrics, not just your birth date.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default BiologicalAgeCard;
