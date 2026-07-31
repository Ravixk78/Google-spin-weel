import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Store, Receipt, Gift, FileBarChart, Users, LogOut, ShieldCheck } from 'lucide-react';

const AdminLayout = () => {
  const { adminUser, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Branch Management', path: '/admin/branches', icon: Store },
    { label: 'Invoice Management', path: '/admin/invoices', icon: Receipt },
    { label: 'Spin Prize Management', path: '/admin/prizes', icon: Gift },
    { label: 'Reports', path: '/admin/reports', icon: FileBarChart },
    { label: 'Customer History', path: '/admin/customer-history', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-luxury-dark text-slate-100 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel border-r border-gold-400/20 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-4 border-b border-gold-400/20 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-gold-400" />
              <div>
                <h2 className="font-serif font-bold text-white text-sm">SUPER ADMIN</h2>
                <p className="text-[10px] text-gold-400 tracking-wider">MAJLIS AL OUD</p>
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
                        ? 'bg-gold-gradient text-black shadow-gold font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
        <div className="pt-4 border-t border-slate-800 mt-6">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-white truncate">{adminUser?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{adminUser?.email}</p>
            </div>
            <button
              onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
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
