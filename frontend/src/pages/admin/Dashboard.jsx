import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Star, Disc, Trophy, FileText, Award, Receipt, Store, TrendingUp, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [branchStats, setBranchStats] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.stats);
      setBranchStats(res.data.branchStats);
      setRecentWinners(res.data.recentWinners);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading enterprise dashboard analytics...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Today's Reviews", value: stats?.todaysReviews || 0, icon: Star, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { label: "Today's Spins", value: stats?.todaysSpins || 0, icon: Disc, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { label: "Today's Winners", value: stats?.todaysWinners || 0, icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/30' },
    { label: 'Total Reviews', value: stats?.totalReviews || 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40' },
    { label: 'Total Winners', value: stats?.totalWinners || 0, icon: Award, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
    { label: 'Total Invoices', value: stats?.totalInvoices || 0, icon: Receipt, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
    { label: 'Total Branches', value: stats?.totalBranches || 0, icon: Store, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/40' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            Executive Analytics Dashboard <Sparkles className="w-5 h-5 text-gold-400" />
          </h1>
          <p className="text-xs text-slate-400">Live operational overview for Majlis Al Oud UAE branches</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gold-300 rounded-lg text-xs font-semibold border border-slate-700 self-start sm:self-auto"
        >
          Refresh Live Metrics
        </button>
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
            <TrendingUp className="w-4 h-4 text-gold-400" /> Branch Spin Distribution
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
            <Trophy className="w-4 h-4 text-gold-400" /> Recent Winners
          </h3>

          <div className="space-y-3">
            {recentWinners.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No spins recorded yet today.</p>
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
