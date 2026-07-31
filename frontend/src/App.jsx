import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BranchProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-luxury-dark text-slate-100 font-sans">
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

                <footer className="py-4 border-t border-gold-400/10 text-center text-xs text-slate-500 glass-panel">
                  Majlis Al Oud Perfumes UAE &copy; 2026. All Rights Reserved. Google Review Reward System.
                </footer>
              </div>
            </Router>
          </BranchProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
