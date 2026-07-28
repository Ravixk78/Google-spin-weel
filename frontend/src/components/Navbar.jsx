import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Sun, Moon, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { adminUser, logoutAdmin } = useAuth();
  const { detectedBranch } = useBranch();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gold-400/20 bg-luxury-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 p-0.5 shadow-gold">
            <div className="w-full h-full bg-luxury-dark rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-white tracking-wider block leading-tight">
              MAJLIS AL OUD
            </span>
            <span className="text-[10px] text-gold-400 uppercase tracking-widest block">
              Google Review Rewards
            </span>
          </div>
        </Link>

        {/* Branch Indicator & Controls */}
        <div className="flex items-center gap-4">
          
          {/* Detected Branch Badge */}
          {detectedBranch && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-xs font-medium text-emerald-300 shadow-inner">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{detectedBranch.name}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-300 hover:text-gold-400 rounded-full transition-colors"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin Navigation Button */}
          {adminUser ? (
            <div className="flex items-center gap-3">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs font-semibold hover:bg-gold-400/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Panel
              </Link>
              <button
                onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Logout Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="text-xs text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Login
            </Link>
          )}

        </div>

      </div>
    </header>
  );
};

export default Navbar;
