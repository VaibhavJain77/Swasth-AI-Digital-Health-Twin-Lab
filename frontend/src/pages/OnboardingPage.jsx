import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, Stethoscope, Activity, ArrowRight, CheckCircle2, MapPin, Loader, Navigation } from 'lucide-react';

// API services
import { registerPatient, registerDoctor, registerFitness } from '../services/apiService';

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', details: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Live Map Autocomplete State
  const [addressSearch, setAddressSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  
  const { saveUser } = useUser();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedLat(lat);
          setSelectedLng(lng);
          
          try {
            const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const revData = await revRes.json();
            const displayName = revData?.display_name || "GPS Verified Address";
            setAddressSearch(displayName);
            setFormData({...formData, clinic_address: displayName});
          } catch (e) {
            setAddressSearch("GPS Verified Address");
            setFormData({...formData, clinic_address: "GPS Verified Address"});
          }
          
          setGpsSuccess(true);
          setShowAddressDropdown(false);
          setGpsLoading(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not detect location. Please type your address manually.");
          setGpsLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Debounced OpenStreetMap Nominatim Fetch
  useEffect(() => {
    if (!addressSearch || addressSearch.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    // Skip fetch if text perfectly matches the current strict form address (meaning user just clicked an item)
    if (formData.clinic_address === addressSearch) return;

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}&limit=5`);
        const data = await res.json();
        setAddressSuggestions(data);
        setShowAddressDropdown(true);
      } catch (err) {
        console.error("Address autocomplete error:", err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [addressSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    
    try {
      if (role === 'patient') {
        const result = await registerPatient({
          name: formData.name,
          age: parseInt(formData.age) || 30,
          gender: formData.gender || "Unknown",
          height: parseFloat(formData.height) || 0,
          weight: parseFloat(formData.weight) || 0,
          blood_pressure: formData.blood_pressure || "",
          diseases: formData.diseases ? formData.diseases.split(',').map(d => d.trim()) : []
        });
        saveUser({ role, ...result.data });
      } 
      else if (role === 'doctor') {
        let lat = selectedLat || 26.8361; // Default to Jaipur
        let lng = selectedLng || 75.6499; // Default to Jaipur
        
        // Fallback geocode only if they typed a string but never selected from dropdown
        if (formData.clinic_address && !selectedLat) {
          try {
            let geocodeRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.clinic_address)}`);
            let geocodeData = await geocodeRes.json();
            
            // If strict search fails, try a broader keyword search
            if (!geocodeData || geocodeData.length === 0) {
               const broaderQuery = formData.clinic_address.replace(/,/g, ' ').replace(/\s+/g, ' ');
               geocodeRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(broaderQuery)}`);
               geocodeData = await geocodeRes.json();
            }

            if (geocodeData && geocodeData.length > 0) {
              lat = parseFloat(geocodeData[0].lat);
              lng = parseFloat(geocodeData[0].lon);
            } else {
               // Fallback random offset around Jaipur
               lat += (Math.random() - 0.5) * 0.05;
               lng += (Math.random() - 0.5) * 0.05;
            }
          } catch (geoError) {
            console.warn("Geocoding failed, using default coordinates.", geoError);
            lat += (Math.random() - 0.5) * 0.05;
            lng += (Math.random() - 0.5) * 0.05;
          }
        }

        const result = await registerDoctor({
          name: formData.name,
          specialization: formData.specialization || "General",
          mobile_number: formData.mobile_number || "",
          clinic_address: formData.clinic_address || "Unknown Address",
          lat: lat,
          lng: lng,
          can_cure: formData.can_cure ? formData.can_cure.split(',').map(d => d.trim()) : []
        });
         saveUser({ role, ...result.data });
      } else if (role === 'fitness') {
        const result = await registerFitness({
          name: formData.name,
          age: parseInt(formData.age) || 30,
          gender: formData.gender || "",
          height: parseFloat(formData.height) || 170.0,
          weight: parseFloat(formData.weight) || 70.0,
          activity_level: formData.activity_level || "",
          goal: formData.goal || ""
        });
        saveUser({ role, ...result.data });
      }
      
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Registration failed. Are you sure the backend server is running?");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Welcome to Swasth AI</h1>
            <p className="text-slate-600 mb-8">How will you be using the platform?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => handleRoleSelect('patient')} className="card flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-healthcare-blue hover:shadow-lg transition-all group">
                <div className="p-4 rounded-full bg-blue-50 text-healthcare-blue mb-4 group-hover:scale-110 transition-transform">
                  <User size={32} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Patient</h3>
                <p className="text-xs text-slate-500">I want to check my symptoms and health risks</p>
              </button>
              
              <button onClick={() => handleRoleSelect('fitness')} className="card flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-healthcare-teal hover:shadow-lg transition-all group">
                <div className="p-4 rounded-full bg-teal-50 text-healthcare-teal mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={32} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Fitness User</h3>
                <p className="text-xs text-slate-500">I want to track and optimize my metrics</p>
              </button>

              <button onClick={() => handleRoleSelect('doctor')} className="card flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-indigo-500 hover:shadow-lg transition-all group">
                <div className="p-4 rounded-full bg-indigo-50 text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope size={32} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Doctor</h3>
                <p className="text-xs text-slate-500">I use this to triage and monitor patients</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700">← Back</button>
              <h2 className="text-xl font-bold text-slate-900">
                {role === 'patient' && 'Patient Registration'}
                {role === 'fitness' && 'Fitness Profile Setup'}
                {role === 'doctor' && 'Doctor Verification'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue" 
                  placeholder={role === 'doctor' ? "Dr. Jane Doe" : "Your name"}
                />
              </div>

              {role === 'patient' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                      <input type="number" value={formData.age || ''} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20" placeholder="Years" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select value={formData.gender || ''} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label><input type="number" value={formData.height || ''} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label><input type="number" value={formData.weight || ''} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">BP (mmHg)</label><input type="text" value={formData.blood_pressure || ''} onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})} placeholder="120/80" className="w-full px-3 py-2 border border-slate-200 rounded-xl" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Known Diseases (Comma separated)</label>
                    <input type="text" value={formData.diseases || ''} onChange={(e) => setFormData({...formData, diseases: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl" placeholder="Diabetes, Hypertension..." />
                  </div>
                </>
              )}

              {role === 'doctor' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label><input type="text" required value={formData.specialization || ''} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl" placeholder="Cardiologist" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label><input type="tel" required value={formData.mobile_number || ''} onChange={(e) => setFormData({...formData, mobile_number: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl" placeholder="+1..." /></div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Clinic / Hospital Address</label>
                    <div className="relative mb-3 flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" required
                          value={addressSearch}
                          onChange={(e) => {
                            setAddressSearch(e.target.value);
                            setFormData({...formData, clinic_address: e.target.value});
                            setGpsSuccess(false);
                          }}
                          onFocus={() => { if(addressSuggestions.length > 0) setShowAddressDropdown(true); }}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue pr-10" 
                          placeholder="Start typing clinic location..." 
                        />
                        {isSearchingAddress && (
                          <div className="absolute right-3 top-2.5 text-slate-400">
                            <Loader className="animate-spin" size={18} />
                          </div>
                        )}
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={handleGetLocation} 
                        className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${gpsSuccess ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'}`}
                      >
                        {gpsLoading ? <Loader className="animate-spin" size={16} /> : <Navigation size={16} />}
                        <span className="hidden sm:inline">{gpsSuccess ? 'Secured' : 'Use GPS'}</span>
                      </button>
                    </div>
                    
                    {/* Autocomplete Dropdown */}
                    {showAddressDropdown && addressSuggestions.length > 0 && !gpsSuccess && (
                      <div className="absolute z-50 w-full top-[70px] bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {addressSuggestions.map((place, idx) => (
                          <div 
                            key={idx}
                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-start gap-3 transition-colors"
                            onClick={() => {
                              setAddressSearch(place.display_name);
                              setFormData({...formData, clinic_address: place.display_name});
                              setSelectedLat(parseFloat(place.lat));
                              setSelectedLng(parseFloat(place.lon));
                              setShowAddressDropdown(false);
                            }}
                          >
                            <MapPin size={18} className="text-healthcare-blue shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700 leading-tight">{place.display_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">"Can Cure" Symptoms (Comma separated)</label>
                    <textarea rows="2" value={formData.can_cure || ''} onChange={(e) => setFormData({...formData, can_cure: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl" placeholder="headache, chest pain, fever..."></textarea>
                  </div>
                </>
              )}

              {role === 'fitness' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Fitness Goal</label>
                  <textarea rows="3" value={formData.details || ''} onChange={(e) => setFormData({...formData, details: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl" placeholder="Weight loss, marathon prep..."></textarea>
                </div>
              )}

              <button type="submit" disabled={isRegistering} className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
                {isRegistering ? "Registering..." : <>Complete Profile <ArrowRight size={18} /></>}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
