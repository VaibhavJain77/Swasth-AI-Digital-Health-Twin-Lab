import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import NotificationBadge from './NotificationBadge';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Quick Scan', path: '/quick-scan' },
    { name: 'Deep Scan', path: '/deep-scan' },
    { name: 'Find Doctor', path: '/find-doctor' },
  ];

  if (user?.role === 'patient') {
    navLinks.push({ name: 'Messages', path: '/messages' });
  }

  navLinks.push({ 
    name: user?.role === 'doctor' ? 'Provider Portal' : 'Twin Dashboard', 
    path: user?.role === 'doctor' ? '/doctor-dashboard' : '/results' 
  });

  const handleLogout = () => {
    logout();
    navigate('/onboarding');
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Swasth AI Logo" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback if logo.png is missing */}
            <div className="hidden items-center gap-2">
              <div className="bg-healthcare-blue/10 p-2 rounded-lg text-healthcare-blue">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-healthcare-blue to-healthcare-teal">
                Swasth AI
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-healthcare-blue ${
                  location.pathname === link.path ? 'text-healthcare-blue' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <div className="flex items-center gap-4 ml-6 border-l border-slate-200 pl-6">
                <NotificationBadge />
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1.5 rounded-full text-slate-500">
                    <UserIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none">{user.name || 'User'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-[10px] uppercase font-semibold text-healthcare-blue">{user.role}</p>
                      {user.id && (
                        <>
                          <span className="text-[10px] text-slate-300">•</span>
                          <p 
                            className="text-[10px] font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600 cursor-copy hover:bg-slate-200 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(user.id);
                              alert(`Copied ID: ${user.id}`);
                            }}
                            title="Click to copy your ID"
                          >
                            {user.id}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
            {!user && location.pathname !== '/onboarding' && (
               <Link to="/onboarding" className="text-sm font-medium text-healthcare-blue ml-6 border-l pl-6 border-slate-200">
                 Sign In
               </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
             {user && (
               <button onClick={handleLogout} className="text-slate-400"><LogOut size={18} /></button>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

