import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import api from './api';

// Layouts
import MarketingLayout from './layouts/MarketingLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import CareerPathway from './pages/public/CareerPathway';
import FranchisePathway from './pages/public/FranchisePathway';
import ManagedFranchise from './pages/public/ManagedFranchise';
import ConsultationPage from './pages/public/ConsultationPage';
import RegisterInterest from './pages/public/RegisterInterest';
import FranchiseCommercials from './pages/public/FranchiseCommercials';
import PaymentSuccess from './pages/public/PaymentSuccess';
import PlannerPage from './pages/public/PlannerPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import LeadManagement from './pages/admin/LeadManagement';
import LeadDetail from './pages/admin/LeadDetail';
import ConsultationManagement from './pages/admin/ConsultationManagement';
import SystemConfig from './pages/admin/SystemConfig';
import AuditLogs from './pages/admin/AuditLogs';
import Analytics from './pages/admin/Analytics';
import ContentManagement from './pages/admin/ContentManagement';
import InvestmentConfig from './pages/admin/InvestmentConfig';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

function AppContent() {
  useEffect(() => {
    api.post('/seed').catch(() => {});
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/career-pathway" element={<CareerPathway />} />
        <Route path="/franchise-pathway" element={<FranchisePathway />} />
        <Route path="/managed-franchise" element={<ManagedFranchise />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/consultation/payment-success" element={<PaymentSuccess />} />
        <Route path="/register-interest" element={<RegisterInterest />} />
        <Route path="/franchise-commercials" element={<FranchiseCommercials />} />
        <Route path="/planner" element={<PlannerPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/leads" element={<LeadManagement />} />
        <Route path="/admin/leads/:leadId" element={<LeadDetail />} />
        <Route path="/admin/consultations" element={<ConsultationManagement />} />
        <Route path="/admin/config" element={<SystemConfig />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/content" element={<ContentManagement />} />
        <Route path="/admin/investment-config" element={<InvestmentConfig />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
