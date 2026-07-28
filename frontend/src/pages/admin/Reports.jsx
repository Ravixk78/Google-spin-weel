import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { exportToExcel, exportToPDF, exportToCSV } from '../../services/exportUtils';
import { FileBarChart, Filter, Search, RotateCcw, Download, Calendar, Receipt, Store, Gift, PieChart } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [prizeDistribution, setPrizeDistribution] = useState([]);
  const [branches, setBranches] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State (Default is_today_only = true)
  const [filters, setFilters] = useState({
    invoice_number: '',
    startDate: '',
    endDate: '',
    branch_id: '',
    prize_id: '',
    is_today_only: true
  });

  useEffect(() => {
    fetchMetadata();
    fetchReports(true);
  }, []);

  const fetchMetadata = async () => {
    try {
      const [bRes, pRes] = await Promise.all([
        api.get('/branches'),
        api.get('/admin/prizes')
      ]);
      setBranches(bRes.data.branches);
      setPrizes(pRes.data.prizes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async (isTodayDefault = false) => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (isTodayDefault) {
        params.is_today_only = 'true';
      } else {
        delete params.is_today_only;
      }

      const res = await api.get('/admin/reports', { params });
      setReports(res.data.records);
      setPrizeDistribution(res.data.prizeDistribution);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports(false);
  };

  const handleReset = () => {
    const resetState = {
      invoice_number: '',
      startDate: '',
      endDate: '',
      branch_id: '',
      prize_id: '',
      is_today_only: true
    };
    setFilters(resetState);
    fetchReports(true);
  };

  // Export Handlers
  const handleExportExcel = () => {
    const dataToExport = reports.map(r => ({
      'Invoice Number': r.invoice_number,
      'Branch': r.branch_name,
      'Prize Won': r.prize_won,
      'Review Date': new Date(r.review_date).toLocaleString(),
      'Spin Date': new Date(r.spin_date).toLocaleString(),
      'Customer Name': r.customer_name,
      'Customer Email': r.customer_email,
      'IP Address': r.ip_address
    }));
    exportToExcel(dataToExport, 'Majlis_Al_Oud_Review_Rewards_Report');
  };

  const handleExportCSV = () => {
    const dataToExport = reports.map(r => ({
      'Invoice Number': r.invoice_number,
      'Branch': r.branch_name,
      'Prize Won': r.prize_won,
      'Review Date': new Date(r.review_date).toLocaleString(),
      'Spin Date': new Date(r.spin_date).toLocaleString()
    }));
    exportToCSV(dataToExport, 'Majlis_Al_Oud_Review_Rewards_Report');
  };

  const handleExportPDF = () => {
    const headers = ['Invoice Number', 'Branch', 'Prize Won', 'Review Date', 'Spin Date'];
    const rows = reports.map(r => [
      r.invoice_number,
      r.branch_name,
      r.prize_won,
      new Date(r.review_date).toLocaleString(),
      new Date(r.spin_date).toLocaleString()
    ]);
    exportToPDF(headers, rows, 'Google Review Reward System Audit Report', 'Majlis_Al_Oud_Report');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            System Reports <FileBarChart className="w-5 h-5 text-gold-400" />
          </h1>
          <p className="text-xs text-slate-400">
            {filters.is_today_only ? "Showing ONLY today's records by default." : "Filtered reports overview."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Excel (.xlsx)
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700/50 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gold-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Filter Form Card */}
      <div className="glass-panel border-gold-400/20 rounded-2xl p-5 shadow-lg">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            
            {/* Invoice Filter */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Invoice Number</label>
              <input
                type="text"
                placeholder="INV-KALBA-1001"
                value={filters.invoice_number}
                onChange={(e) => setFilters({ ...filters, invoice_number: e.target.value, is_today_only: false })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
              />
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, is_today_only: false })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, is_today_only: false })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
              />
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch</label>
              <select
                value={filters.branch_id}
                onChange={(e) => setFilters({ ...filters, branch_id: e.target.value, is_today_only: false })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
              >
                <option value="">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Prize Filter */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prize</label>
              <select
                value={filters.prize_id}
                onChange={(e) => setFilters({ ...filters, prize_id: e.target.value, is_today_only: false })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
              >
                <option value="">All Prizes</option>
                {prizes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset (Today Only)
            </button>

            <button
              type="submit"
              className="btn-gold px-6 py-2 rounded-xl text-xs font-bold shadow-gold flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Search Filters
            </button>
          </div>
        </form>
      </div>

      {/* REPORT TABLE */}
      <div className="glass-panel border-gold-400/20 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Report Records ({reports.length})</span>
          {filters.is_today_only && (
            <span className="px-2.5 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-300 text-[10px] font-semibold">
              Default Mode: Today's Records Only
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-gold-400 uppercase font-bold text-[11px] border-b border-gold-400/20">
              <tr>
                <th className="p-3.5">Invoice Number</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Prize Won</th>
                <th className="p-3.5">Review Date</th>
                <th className="p-3.5">Spin Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Generating report...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 italic">No records found for the selected filters.</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.spin_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">{r.invoice_number}</td>
                    <td className="p-3.5 text-slate-300">{r.branch_name}</td>
                    <td className="p-3.5 font-bold text-gold-300">{r.prize_won}</td>
                    <td className="p-3.5 font-mono text-slate-400">{new Date(r.review_date).toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-400">{new Date(r.spin_date).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY SECTION: PRIZE DISTRIBUTION */}
      <div className="glass-panel border-gold-400/30 rounded-2xl p-6 shadow-gold">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-slate-800 pb-3">
          <PieChart className="w-4 h-4 text-gold-400" /> Summary Section: Prize Distribution
        </h3>

        <p className="text-xs text-slate-400 mb-4">
          Totals according to applied filters:
        </p>

        {prizeDistribution.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No prize distribution counts available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {prizeDistribution.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] font-semibold text-slate-400 block truncate">{item.prize_name}</span>
                <span className="text-xl font-bold font-mono text-gold-400">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Reports;
