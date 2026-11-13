import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { DemoScenarioBar } from './components/common/DemoScenarioBar.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { StudentDashboard } from './pages/StudentDashboard.js';
import { JourneyPlannerPage } from './pages/JourneyPlannerPage.js';
import { LiveTrackingPage } from './pages/LiveTrackingPage.js';
import { AlternativeFinderPage } from './pages/AlternativeFinderPage.js';
import { ReportProblemPage } from './pages/ReportProblemPage.js';
import { DemandPredictionPage } from './pages/DemandPredictionPage.js';
import { AIAssistantPage } from './pages/AIAssistantPage.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { OperatorDashboard } from './pages/OperatorDashboard.js';
import { LoginPage } from './pages/LoginPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AboutPage } from './pages/AboutPage.js';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-navy-900 font-sans selection:bg-brand-blue selection:text-white">
            {/* Top Hackathon Demo Bar */}
            <DemoScenarioBar />

            {/* Main Navigation */}
            <Navbar />

            {/* Page View */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/planner" element={<JourneyPlannerPage />} />
                <Route path="/tracking" element={<LiveTrackingPage />} />
                <Route path="/alternatives" element={<AlternativeFinderPage />} />
                <Route path="/report" element={<ReportProblemPage />} />
                <Route path="/demand" element={<DemandPredictionPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/operator" element={<OperatorDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
