import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LayoutDashboard, Store, Receipt, Gift, FileBarChart, Users, LogOut, ShieldCheck } from 'lucide-react';

const AdminLayout = () => {
  const { adminUser, logoutAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { label: t('adminDashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('branchManagement'), path: '/admin/branches', icon: Store },
    { label: t('invoiceManagement'), path: '/admin/invoices', icon: Receipt },
    { label: t('prizeManagement'), path: '/admin/prizes', icon: Gift },
    { label: t('reports'), path: '/admin/reports', icon: FileBarChart },
    { label: t('customerHistory'), path: '/admin/customer-history', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-luxury-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel bg-white/90 dark:bg-slate-900/60 border-r border-amber-300/40 dark:border-gold-400/20 p-4 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          <div className="px-3 py-4 border-b border-amber-300/40 dark:border-gold-400/20 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-gold-400" />
              <div>
                <h2 className="font-serif font-bold text-slate-900 dark:text-white text-sm">{t('superAdminPortal')}</h2>
                <p className="text-[10px] text-amber-700 dark:text-gold-400 font-bold tracking-wider">{t('brandName')}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#F9E498] via-[#E6C687] to-[#C5A059] text-slate-950 shadow-md font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-amber-100/60 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin User Card */}
        <div className="pt-4 border-t border-amber-200 dark:border-slate-800 mt-6">
          <div className="flex items-center justify-between px-3 py-2 bg-amber-50/80 dark:bg-slate-900/60 rounded-xl border border-amber-200 dark:border-slate-800">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{adminUser?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{adminUser?.email}</p>
            </div>
            <button
              onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
