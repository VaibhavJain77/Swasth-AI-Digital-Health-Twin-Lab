import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { getFamilyTree, linkFamilyMember } from '../../services/apiService';
import { Users, UserPlus, ShieldAlert, Activity, Heart, ArrowUpRight, ArrowDownRight, Loader, X } from 'lucide-react';

const FamilyWebTree = () => {
  const { user } = useUser();
  const [relatives, setRelatives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRelativeId, setNewRelativeId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  const fetchTree = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await getFamilyTree(user.id);
      if (res.status === 'success') {
        setRelatives(res.tree || []);
      }
    } catch (err) {
      console.error("Failed to fetch family tree", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [user]);

  const handleAddRelative = async (e) => {
    e.preventDefault();
    if (!newRelativeId.trim()) return;
    
    setIsLinking(true);
    setLinkError('');
    try {
      await linkFamilyMember(user.id, newRelativeId.trim().toUpperCase());
      setNewRelativeId('');
      setShowAddModal(false);
      fetchTree(); // refresh the map
    } catch (err) {
      setLinkError(err.response?.data?.detail || "Failed to link relative. Ensure the ID is correct.");
    } finally {
      setIsLinking(false);
    }
  };

  // Helper colors based on risk score
  const getRiskColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', glow: 'shadow-emerald-500/20' };
    if (score >= 60) return { text: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', glow: 'shadow-yellow-500/20' };
    if (score >= 40) return { text: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', glow: 'shadow-orange-500/20' };
    return { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', glow: 'shadow-red-500/20' };
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between z-10 bg-white/80 backdrop-blur-md sticky top-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Users className="text-healthcare-teal" /> Family Web Tree
          </h2>
          <p className="text-sm text-slate-500 mt-1">Monitor the collective health stability of your linked relatives.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 shadow-sm"
        >
          <UserPlus size={16} /> <span className="hidden sm:inline">Add Relative</span>
        </button>
      </div>

      {/* Hub Visualization */}
      <div className="flex-1 relative bg-slate-50/50 p-6 sm:p-12 flex items-center justify-center overflow-auto">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {isLoading ? (
          <div className="flex flex-col items-center text-slate-400">
            <Loader size={32} className="animate-spin mb-4 text-healthcare-teal" />
            <p>Mapping family network...</p>
          </div>
        ) : (
          <div className="relative w-full max-w-4xl min-h-[400px] flex items-center justify-center">
            
            {/* The Central Node (You) */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute z-20 w-32 h-32 bg-white rounded-full shadow-[0_0_40px_rgba(45,212,191,0.2)] border-4 border-healthcare-teal flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-healthcare-teal mb-1">
                <ShieldAlert size={20} />
              </div>
              <span className="text-xs font-bold text-slate-slate-900 uppercase tracking-wider">You</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">{user?.id}</span>
            </motion.div>

            {/* Empty State */}
            {relatives.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-24 text-center mt-8 w-64"
              >
                <div className="text-sm font-medium text-slate-500 border border-slate-200 border-dashed rounded-xl p-4 bg-white/50 backdrop-blur-sm">
                  Your web is empty. Click <strong className="text-healthcare-teal">Add Relative</strong> to link your family's health profiles.
                </div>
              </motion.div>
            )}

            {/* Orbiting Relative Nodes */}
            {relatives.map((rel, index) => {
              // Calculate positional orbit
              const angle = (index / relatives.length) * (2 * Math.PI) - (Math.PI / 2); // Start at top
              const radius = window.innerWidth < 640 ? 120 : 180; // responsive radius
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              const colors = getRiskColor(rel.swasth_score);

              return (
                <React.Fragment key={rel.id}>
                  {/* Connecting Line */}
                  <motion.svg 
                    className="absolute top-1/2 left-1/2 w-full h-full overflow-visible pointer-events-none z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                  >
                    <line 
                      x1="0" y1="0" 
                      x2={x} y2={y} 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="text-slate-200 stroke-dasharray-4" 
                      strokeDasharray="4 4"
                    />
                  </motion.svg>

                  {/* Node Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, x, y, scale: 1 }}
                    transition={{ 
                      type: "spring", stiffness: 100, damping: 15,
                      delay: 0.2 + (index * 0.1) 
                    }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-44 bg-white rounded-2xl p-3 shadow-lg border ${colors.border} ${colors.glow} hover:scale-105 transition-transform cursor-default group`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
                        <span className="text-sm font-bold">{rel.name.charAt(0)}</span>
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate" title={rel.name}>{rel.name}</p>
                        <p className="text-[10px] text-slate-500">{rel.role}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 mb-2">
                       <div className="bg-slate-50 rounded p-1.5 text-center">
                         <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
                         <span className={`text-sm font-black ${colors.text}`}>{rel.swasth_score}</span>
                       </div>
                       <div className="bg-slate-50 rounded p-1.5 text-center">
                         <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Bio Age</span>
                         <span className="text-sm font-black text-slate-700">{rel.biological_age}</span>
                       </div>
                    </div>

                    <div className="bg-slate-50 w-full rounded py-1 px-2 flex justify-between items-center">
                       <span className="text-[9px] text-slate-400 uppercase font-bold">Trajectory</span>
                       <div className="flex items-center gap-1">
                          {rel.trajectory_status === "Improving" ? <ArrowUpRight size={10} className="text-emerald-500" /> : 
                           rel.trajectory_status === "Accelerating" ? <ArrowDownRight size={10} className="text-red-500" /> : 
                           <Activity size={10} className="text-slate-400" />}
                          <span className="text-[10px] font-semibold text-slate-600">{rel.trajectory_status}</span>
                       </div>
                    </div>

                    {/* Hover detail */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      ID: {rel.id}
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Relative Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Add Family Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <div className="p-5">
              <form onSubmit={handleAddRelative}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relative's ID</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newRelativeId}
                  onChange={(e) => setNewRelativeId(e.target.value)}
                  placeholder="FID-XXXX or PID-XXXX"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-teal/20 focus:border-healthcare-teal mb-3 font-mono text-sm"
                />
                {linkError && <p className="text-xs text-red-500 mb-3">{linkError}</p>}
                
                <button 
                  type="submit" 
                  disabled={isLinking || !newRelativeId}
                  className="w-full btn-primary flex justify-center items-center gap-2 py-2 shadow-sm"
                >
                  {isLinking ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  Link Account
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FamilyWebTree;
