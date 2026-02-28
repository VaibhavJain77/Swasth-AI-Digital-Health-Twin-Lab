import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import MainLayout from './components/Layout/MainLayout';
import LandingPage from './pages/LandingPage';
import DeepScanPage from './pages/DeepScanPage';
import QuickScanPage from './pages/QuickScanPage';
import DashboardPage from './pages/DashboardPage';
import ReportPage from './pages/ReportPage';
import OnboardingPage from './pages/OnboardingPage';
import MapPage from './pages/MapPage';
import DoctorDashboard from './pages/DoctorDashboard';
import ChatBox from './pages/ChatBox';
import MessagesPage from './pages/MessagesPage';
import KinematicScanPage from './pages/KinematicScanPage';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="deep-scan" element={<DeepScanPage />} />
            <Route path="quick-scan" element={<QuickScanPage />} />
            <Route path="results" element={<DashboardPage />} />
            <Route path="find-doctor" element={<MapPage />} />
            <Route path="doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="chat/:targetId" element={<ChatBox />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="vision-scan" element={<KinematicScanPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;

