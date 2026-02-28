import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, User as UserIcon, Loader, MessageCircle, Navigation } from 'lucide-react';
import { searchDoctors, linkPatient } from '../services/apiService';
import { useUser } from '../context/UserContext';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically change map view based on search results
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [symptomQuery, setSymptomQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const markerRefs = useRef({});
  
  // Default Map Center (JK Lakshmipat University, Jaipur)
  const defaultCenter = [26.8361, 75.6499];
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Load all available doctors initially (by sending empty symptom)
  useEffect(() => {
    handleSearch(new Event('submit'), '');
  }, []);

  const handleSearch = async (e, query = symptomQuery) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setSelectedDoctor(null);

    try {
      const response = await searchDoctors(query);
      if (response && response.matches) {
        setDoctors(response.matches);
        
        // Center map to the first result if available
        if (response.matches.length > 0) {
          const firstDoc = response.matches[0];
          setMapCenter([firstDoc.lat, firstDoc.lng]);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to reach the medical routing engine.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] w-full relative">
      
      {/* Sidebar Search Panel */}
      <div className="w-full md:w-96 bg-white border-r border-slate-200 shadow-xl z-20 flex flex-col h-1/2 md:h-full shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Find a Specialist</h2>
          <p className="text-sm text-slate-500 mb-6">Describe your symptoms to find the highly relevant doctors near you.</p>
          
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={symptomQuery}
              onChange={(e) => setSymptomQuery(e.target.value)}
              placeholder="e.g. Sharp chest pain"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue/20 focus:border-healthcare-blue transition-all"
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <button
              type="submit" disabled={isSearching}
              className="mt-3 w-full btn-primary py-2.5 flex justify-center items-center gap-2"
            >
              {isSearching ? <><Loader className="animate-spin" size={18} /> Analyzing...</> : "Search Symptoms"}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {doctors.map((doctor, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              key={doctor.id}
              onClick={() => {
                setSelectedDoctor(doctor);
                setMapCenter([doctor.lat, doctor.lng]);
                
                // Open the marker's popup programmatically
                const marker = markerRefs.current[doctor.id];
                if (marker) {
                    marker.openPopup();
                }
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedDoctor?.id === doctor.id 
                  ? 'border-healthcare-blue bg-blue-50/30 shadow-md ring-1 ring-healthcare-blue/20' 
                  : 'border-slate-200 bg-white hover:border-healthcare-blue/50 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-900">{doctor.name}</h3>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                  {doctor.specialization}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                <MapPin size={14} className="text-healthcare-blue" />
                {doctor.clinic_address.substring(0, 40)}{doctor.clinic_address.length > 40 ? '...' : ''}
              </p>
            </motion.div>
          ))}

          {!isSearching && doctors.length === 0 && (
            <div className="text-center p-8 text-slate-400 text-sm">
              <UserIcon size={40} className="mx-auto text-slate-200 mb-3" />
              No doctors found matching those symptoms. Try a broader search.
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative h-1/2 md:h-full z-10 bg-slate-100">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          zoomControl={false}
          className="w-full h-full"
        >
          <ChangeView center={mapCenter} zoom={13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {doctors.map((doctor) => (
            <Marker 
              key={doctor.id} 
              position={[doctor.lat, doctor.lng]}
              ref={(ref) => {
                if (ref) markerRefs.current[doctor.id] = ref;
              }}
            >
              <Popup className="swasth-popup">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-lg text-slate-900 border-b pb-2 mb-2">{doctor.name}</h3>
                  <div className="space-y-2 text-sm">
                     <p className="flex items-center gap-2 text-slate-700">
                        <span className="font-semibold px-2 py-0.5 bg-blue-50 text-healthcare-blue rounded text-xs">{doctor.specialization}</span>
                     </p>
                     <p className="flex items-start gap-2 text-slate-600">
                        <MapPin size={16} className="shrink-0 mt-0.5" />
                        <span>{doctor.clinic_address}</span>
                     </p>
                     <div className="flex gap-2 w-full mt-4">
                       <button 
                         onClick={async () => {
                           if (!user) {
                             alert("Please sign in as a patient to message this doctor.");
                             navigate('/onboarding');
                             return;
                           }
                           try {
                             // Automatically link the patient to the doctor when they initiate chat
                             await linkPatient(doctor.id, user.id);
                             navigate(`/chat/${doctor.id}`);
                           } catch (err) {
                             console.error("Link error", err);
                             navigate(`/chat/${doctor.id}`);
                           }
                         }}
                         className="flex-1 flex items-center justify-center gap-1 bg-healthcare-blue text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                       >
                         <MessageCircle size={14} /> Message
                       </button>
                       <a 
                         href={`tel:${doctor.mobile_number}`}
                         className="flex-1 flex items-center justify-center gap-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors"
                       >
                         <Phone size={14} /> Call
                       </a>
                     </div>
                     <div className="mt-2 text-center">
                       <a 
                         href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lng}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 text-healthcare-blue text-sm font-semibold hover:underline"
                       >
                         <Navigation size={14} /> Get Directions
                       </a>
                     </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Detail Overlay Card (Mobile only) */}
        <AnimatePresence>
          {selectedDoctor && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-4 left-4 right-4 md:hidden bg-white p-5 rounded-2xl shadow-2xl border border-slate-200 z-[1000]"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{selectedDoctor.name}</h3>
                  <span className="text-sm font-semibold text-healthcare-blue">{selectedDoctor.specialization}</span>
                </div>
                <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 p-2 -mr-2 -mt-2">✕</button>
              </div>
              <p className="text-sm text-slate-600 flex items-start gap-2 mt-4 mb-5">
                <MapPin size={18} className="shrink-0 text-slate-400" />
                <span>{selectedDoctor.clinic_address}</span>
              </p>
              
              <div className="flex gap-3 w-full border-t border-slate-100 pt-4">
                <a 
                   href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDoctor.lat},${selectedDoctor.lng}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-1/2 flex flex-col items-center justify-center gap-1 bg-slate-100 text-slate-700 rounded-xl py-3 hover:bg-slate-200 transition-colors text-xs font-semibold"
                 >
                   <Navigation size={18} className="text-healthcare-blue" />
                   Directions
                 </a>
                 <a 
                   href={`tel:${selectedDoctor.mobile_number}`}
                   className="w-1/2 flex flex-col items-center justify-center gap-1 bg-healthcare-blue text-white rounded-xl py-3 shadow-md hover:bg-blue-700 transition-colors text-xs font-semibold"
                 >
                   <Phone size={18} />
                   Call Clinic
                 </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default MapPage;
