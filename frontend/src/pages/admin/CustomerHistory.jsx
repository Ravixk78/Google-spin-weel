import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel, exportToPDF, exportToCSV } from '../../services/exportUtils';
import { Users, Search, ShieldAlert, Globe, MapPin, Receipt, Gift, Calendar, QrCode, Download } from 'lucide-react';

const CustomerHistory = () => {
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchHistory();
  }, [selectedBranch, startDate, endDate]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.branches);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customer-history', {
        params: { search, branch_id: selectedBranch, start_date: startDate, end_date: endDate }
      });
      setHistory(res.data.history);
    } catch (err) {
      console.error('Error fetching customer history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleExportExcel = () => {
    const dataToExport = history.map(h => ({
      'Customer Name': h.customer_name,
      'Google Account ID': h.google_account_id,
      'Branch': h.branch_name,
      'Invoice Number': h.invoice_number,
      'Prize Won': h.prize_won,
      'Review Date': new Date(h.review_date).toLocaleString(),
      'Spin Date': new Date(h.spin_date).toLocaleString(),
      'IP Address': h.ip_address || '127.0.0.1'
    }));
    exportToExcel(dataToExport, 'Customer_Google_Review_History');
  };

  const handleExportCSV = () => {
    const dataToExport = history.map(h => ({
      'Customer Name': h.customer_name,
      'Branch': h.branch_name,
      'Invoice Number': h.invoice_number,
      'Prize Won': h.prize_won,
      'Spin Date': new Date(h.spin_date).toLocaleString()
    }));
    exportToCSV(dataToExport, 'Customer_Google_Review_History');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            {t('customerHistoryTitle')} <Users className="w-5 h-5 text-gold-400" />
          </h1>
          <p className="text-xs text-slate-400">{t('customerHistorySubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Excel (.xlsx)
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gold-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel border-gold-400/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400 font-medium"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-800 text-gold-300 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-700">
            {t('searchBtn')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-mono text-xs font-medium cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-mono text-xs font-medium cursor-pointer"
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-2.5 py-1.5 bg-rose-950 text-rose-300 rounded-xl text-[11px] font-bold border border-rose-800 hover:bg-rose-900"
            >
              Clear Dates
            </button>
          )}

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400 font-medium"
          >
            <option value="">{t('allBranches')}</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* Audit History Table */}
      <div className="glass-panel border-gold-400/20 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-gold-400 uppercase font-bold text-[11px] border-b border-gold-400/20">
              <tr>
                <th className="p-3.5">{t('thCustomerName')}</th>
                <th className="p-3.5">{t('thGoogleId')}</th>
                <th className="p-3.5">{t('thBranch')}</th>
                <th className="p-3.5">{t('thInvoiceRef')}</th>
                <th className="p-3.5">{t('thPrizeWon')}</th>
                <th className="p-3.5">{t('thReviewDate')}</th>
                <th className="p-3.5">{t('thSpinDate')}</th>
                <th className="p-3.5">{t('thQrCode')}</th>
                <th className="p-3.5">{t('thIpAddress')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500 font-sans">{t('loadingAuditLogs')}</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500 italic font-sans">{t('noCustomerHistory')}</td></tr>
              ) : (
                history.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white">{row.customer_name}</td>
                    <td className="p-3.5 text-slate-400 text-[10px]">{row.google_account_id}</td>
                    <td className="p-3.5 font-sans text-emerald-400">{row.branch_name}</td>
                    <td className="p-3.5 font-bold text-gold-300">{row.invoice_number}</td>
                    <td className="p-3.5 font-sans font-bold text-white">{row.prize_won}</td>
                    <td className="p-3.5 text-slate-400">{new Date(row.review_date).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-400">{new Date(row.spin_date).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-400 text-[10px]">{row.qr_code_used || 'N/A'}</td>
                    <td className="p-3.5 text-slate-400">{row.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CustomerHistory;
