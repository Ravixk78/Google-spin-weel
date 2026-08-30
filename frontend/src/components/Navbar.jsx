import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, MapPin, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import wheelLogoAsset from '../assets/wheel-logo.png';

const Navbar = () => {
  const { adminUser } = useAuth();
  const { detectedBranch } = useBranch();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gold-400/20 bg-luxury-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={isAdminPage ? "/admin/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 p-0.5 shadow-gold overflow-hidden flex items-center justify-center">
            <img src={wheelLogoAsset} alt="Majlis Al Oud Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-white tracking-wider block leading-tight">
              {t('brandName')}
            </span>
            <span className="text-[10px] text-gold-400 uppercase tracking-widest block">
              {isAdminPage ? t('superAdminPortal') : t('brandSubtitle')}
            </span>
          </div>
        </Link>

        {/* Branch Indicator & Controls */}
        <div className="flex items-center gap-3">
          
          {/* Detected Branch Badge (Only on Customer Pages) */}
          {!isAdminPage && detectedBranch && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-xs font-medium text-emerald-300 shadow-inner">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{detectedBranch.name}</span>
            </div>
          )}

          {/* Language Switcher Toggle Button (Available on all pages) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-400/10 hover:bg-gold-400/20 border border-gold-400/40 text-gold-300 text-xs font-bold transition-all shadow-md active:scale-95"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-4 h-4 text-gold-400" />
            <span>{t('languageBtn')}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-300 hover:text-gold-400 rounded-full transition-colors"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

        </div>

      </div>
    </header>
  );
};

export default Navbar;
