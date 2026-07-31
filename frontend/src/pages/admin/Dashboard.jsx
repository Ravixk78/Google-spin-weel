import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Star, Disc, Trophy, FileText, Award, Receipt, Store, TrendingUp, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { t, lang } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [stats, setStats] = useState(null);
  const [branchStats, setBranchStats] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date Range Filter States
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  useEffect(() => {
    fetchDashboardData();

    // Auto refresh live metrics every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard', {
        params: { startDate, endDate }
      });
      setStats(res.data.stats);
      setBranchStats(res.data.branchStats);
      setRecentWinners(res.data.recentWinners);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (preset) => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayISO);
      setEndDate(todayISO);
    } else if (preset === 'yesterday') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestISO = yest.toISOString().split('T')[0];
      setStartDate(yestISO);
      setEndDate(yestISO);
    } else if (preset === '7days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 6);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayISO);
    } else if (preset === 'reset') {
      setStartDate(todayISO);
      setEndDate(todayISO);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">{lang === 'ar' ? 'جاري تحميل تحليلات البيانات المباشرة...' : 'Loading live dashboard analytics...'}</p>
      </div>
    );
  }

  const isTodayOnly = startDate === todayStr && endDate === todayStr;

  const statCards = [
    { label: isTodayOnly ? t('todaysReviews') : t('filteredReviews'), value: stats?.todaysReviews || 0, icon: Star, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { label: isTodayOnly ? t('todaysSpins') : t('filteredSpins'), value: stats?.todaysSpins || 0, icon: Disc, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: isTodayOnly ? t('todaysWinners') : t('filteredWinners'), value: stats?.todaysWinners || 0, icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/30' },
    { label: isTodayOnly ? t('todayInvoices') : t('filteredInvoices'), value: stats?.rangeInvoices || 0, icon: Receipt, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: t('activeBranchesCount'), value: stats?.activeBranches || 0, icon: Store, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
    { label: t('rewardStock'), value: stats?.prizeStock || 0, icon: Award, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/40' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Date Range Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            {t('dashTitle')} <Sparkles className="w-5 h-5 text-gold-400" />
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-slate-400">
              {isTodayOnly ? t('liveStatusToday') : t('liveStatusRange', { start: startDate, end: endDate })}
            </p>
          </div>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-gold-400/20 shadow-md">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span>{t('fromLabel')}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 text-white px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-gold-400 text-xs"
            />
            <span>{t('toLabel')}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 text-white px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-gold-400 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
            <button
              onClick={() => handleQuickPreset('today')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                isTodayOnly ? 'bg-gold-gradient text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('todayBtn')}
            </button>
            <button
              onClick={() => handleQuickPreset('yesterday')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold"
            >
              {t('yesterdayBtn')}
            </button>
            <button
              onClick={() => handleQuickPreset('7days')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold"
            >
              {t('last7DaysBtn')}
            </button>
            <button
              onClick={() => handleQuickPreset('reset')}
              className="px-2 py-1 text-gold-400 hover:underline text-[11px] font-semibold"
            >
              {t('resetBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* 7 Core KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`glass-panel p-4 rounded-xl border ${card.bg} shadow-md flex items-center gap-4`}>
              <div className={`p-3 rounded-lg bg-black/40 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">{card.label}</span>
                <span className="text-2xl font-bold text-white font-mono">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section & Recent Winners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 glass-panel border-gold-400/20 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-400" /> {t('branchSpinDist')}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchStats}>
                <XAxis dataKey="branch_name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121519', borderColor: '#D4AF37', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="spin_count" radius={[6, 6, 0, 0]}>
                  {branchStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : index === 1 ? '#1E4D45' : '#AA7C11'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Winners Feed */}
        <div className="glass-panel border-gold-400/20 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold-400" /> {t('recentWinnersFeed')}
          </h3>

          <div className="space-y-3">
            {recentWinners.length === 0 ? (
              <p className="text-xs text-slate-500 italic">{t('noSpinsToday')}</p>
            ) : (
              recentWinners.map((w) => (
                <div key={w.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gold-400">{w.prize}</p>
                    <p className="text-slate-300">{w.customer_name} ({w.branch_name})</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{w.invoice_number}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
