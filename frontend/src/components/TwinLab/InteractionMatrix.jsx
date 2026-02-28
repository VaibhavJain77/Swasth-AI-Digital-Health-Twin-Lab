import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRightCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const InteractionMatrix = ({ data, aiContext }) => {
  const { user } = useUser();
  const isDoctor = user?.role === 'doctor';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
      className="card h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightCircle size={20} className="text-healthcare-blue" /> Comorbidity Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-1">
             {isDoctor ? "Multi-disease interaction risk multipliers." : "How different health factors combine to increase risk."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-soft transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-slate-800 text-sm">
                {item.factors.join(' + ')}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                item.multiplier > 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isDoctor ? `${item.multiplier}x Multiplier` : 'High Amplification'}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-slate-500">Drives</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                {item.outcome}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isDoctor && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <HelpCircle size={14} /> Clustering variance identified in metabolic pathways.
        </div>
      )}
    </motion.div>
  );
};

export default InteractionMatrix;
