import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';
import { ThemeProvider } from './context/ThemeContext';

import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import CustomerFlow from './pages/customer/CustomerFlow';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BranchManagement from './pages/admin/BranchManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import PrizeManagement from './pages/admin/PrizeManagement';
import Reports from './pages/admin/Reports';
import CustomerHistory from './pages/admin/CustomerHistory';

// Protected Route Guard for Admin
const AdminProtectedRoute = ({ children }) => {
  const { adminUser } = useAuth();
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const MainContentWrapper = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isAdminPage ? 'bg-luxury-dark text-slate-100' : 'bg-gradient-to-b from-[#FAF8F5] via-[#FFFDF9] to-[#F5F0E6] text-slate-900'
    }`}>
      <Navbar />

      <div className="flex-1">
        <Routes>
          {/* Customer Flow (Landing & Spin App) */}
          <Route path="/" element={<CustomerFlow />} />
          <Route path="/spin" element={<CustomerFlow />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Super Admin Protected Panel */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="branches" element={<BranchManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="prizes" element={<PrizeManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customer-history" element={<CustomerHistory />} />
          </Route>

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <footer className={`py-4 border-t text-center text-xs ${
        isAdminPage ? 'border-gold-400/10 text-slate-500 glass-panel' : 'border-amber-200/60 text-slate-600 bg-white/80'
      }`}>
        Majlis Al Oud Perfumes UAE &copy; 2026. All Rights Reserved. Google Review Reward System.
      </footer>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BranchProvider>
            <Router>
              <MainContentWrapper />
            </Router>
          </BranchProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
