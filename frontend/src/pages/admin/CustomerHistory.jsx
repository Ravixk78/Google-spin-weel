import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, ShieldAlert, Globe, MapPin, Receipt, Gift, Calendar, QrCode } from 'lucide-react';

const CustomerHistory = () => {
  const [history, setHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchHistory();
  }, [selectedBranch]);

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
        params: { search, branch_id: selectedBranch }
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            Customer History Audit Log <Users className="w-5 h-5 text-gold-400" />
          </h1>
          <p className="text-xs text-slate-400">Complete historical audit trail of customer Google accounts, scanned QR codes, and prize allocations</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel border-gold-400/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer name, email, Google ID, or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-800 text-gold-300 text-xs font-bold rounded-xl border border-slate-700">
            Search
          </button>
        </form>

        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
        >
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Audit History Table */}
      <div className="glass-panel border-gold-400/20 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-gold-400 uppercase font-bold text-[11px] border-b border-gold-400/20">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Google Email</th>
                <th className="p-3.5">Google Account ID</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Invoice Ref</th>
                <th className="p-3.5">Prize Won</th>
                <th className="p-3.5">Review Date</th>
                <th className="p-3.5">Spin Date</th>
                <th className="p-3.5">QR Code Used</th>
                <th className="p-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={10} className="p-8 text-center text-slate-500 font-sans">Loading customer audit logs...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-slate-500 italic font-sans">No customer history records found.</td></tr>
              ) : (
                history.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white">{row.customer_name}</td>
                    <td className="p-3.5 text-slate-300">{row.google_email}</td>
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
