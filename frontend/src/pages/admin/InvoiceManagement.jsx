import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Receipt, Plus, Upload, Search, Filter, CheckCircle, XCircle, Trash2, Edit2, ToggleLeft, ToggleRight, FileSpreadsheet, Calendar } from 'lucide-react';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const InvoiceManagement = () => {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters - Default to Today's Date
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Single Form State
  const [formData, setFormData] = useState({ invoice_number: '', branch_id: '', amount: 0, expiry_date: '' });

  // Bulk CSV Text Area State
  const [csvRawText, setCsvRawText] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchInvoices();
  }, [selectedBranch, selectedStatus, startDate, endDate]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.branches);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/invoices', {
        params: { branch_id: selectedBranch, status: selectedStatus, search, start_date: startDate, end_date: endDate }
      });
      setInvoices(res.data.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/invoices', formData);
      setShowCreateModal(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create invoice.');
    }
  };

  const handleToggleUsed = async (inv) => {
    try {
      await api.patch(`/admin/invoices/${inv.id}/toggle-status`, { is_used: inv.is_used === 1 ? 0 : 1 });
      fetchInvoices();
    } catch (err) {
      alert('Failed to update invoice status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/admin/invoices/${id}`);
        fetchInvoices();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete invoice.');
      }
    }
  };

  // Process CSV Upload / Text Parser
  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvRawText.trim()) return;

    // Parse CSV lines: invoice_number, branch_id, amount
    const lines = csvRawText.split('\n');
    const parsedInvoices = [];

    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const invNum = parts[0].trim();
        const branchId = parts[1].trim();
        const amt = parts[2] ? parseFloat(parts[2].trim()) : 0;
        if (invNum && branchId) {
          parsedInvoices.push({
            invoice_number: invNum,
            branch_id: parseInt(branchId, 10),
            amount: amt
          });
        }
      }
    });

    if (parsedInvoices.length === 0) {
      alert('No valid invoice rows found in CSV data. Format: INV-NUM, BRANCH_ID, AMOUNT');
      return;
    }

    try {
      const res = await api.post('/admin/invoices/import-csv', { invoices: parsedInvoices });
      alert(res.data.message);
      setShowImportModal(false);
      setCsvRawText('');
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || 'Bulk import failed.');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to CLEAR ALL INVOICES? This will delete all current invoice records from the system.')) {
      try {
        const res = await api.delete('/admin/invoices/clear-all');
        alert(res.data.message || 'All invoices cleared successfully.');
        fetchInvoices();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to clear invoices.');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-300/40 dark:border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t('invoiceTitle')} <Receipt className="w-5 h-5 text-amber-600 dark:text-gold-400" />
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t('invoiceSubtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-700/50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Clear All Invoices
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-gold-300 rounded-xl text-xs font-bold border border-amber-300 dark:border-slate-700 flex items-center gap-2 shadow-xs"
          >
            <Upload className="w-4 h-4" /> {t('bulkUploadBtn')}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-gold px-4 py-2 rounded-xl text-xs font-bold shadow-gold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t('addInvoiceBtn')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel bg-white/90 dark:bg-slate-900/60 border border-amber-200/80 dark:border-gold-400/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search invoice number or customer email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-gold-400 font-medium"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-gold-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-slate-700 hover:bg-amber-200">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => { setStartDate(getTodayString()); setEndDate(getTodayString()); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              startDate === getTodayString() && endDate === getTodayString()
                ? 'bg-amber-500 text-slate-950 shadow-sm border border-amber-400'
                : 'bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-gold-300 border border-amber-300 dark:border-slate-700 hover:bg-amber-200'
            }`}
          >
            Today
          </button>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-gold-400 shrink-0" />
            <span className="text-[11px] text-slate-500 font-semibold shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white focus:outline-none font-mono text-xs font-medium cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-gold-400 shrink-0" />
            <span className="text-[11px] text-slate-500 font-semibold shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white focus:outline-none font-mono text-xs font-medium cursor-pointer"
            />
          </div>

          {(startDate || endDate) ? (
            <button
              type="button"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold border border-slate-300 dark:border-slate-700"
              title="View all historical invoices across all dates"
            >
              Show All Invoices
            </button>
          ) : null}

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="ELIGIBLE">ELIGIBLE</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="glass-panel bg-white/90 dark:bg-slate-900/60 border border-amber-200/80 dark:border-gold-400/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-amber-50/80 dark:bg-slate-900/90 text-amber-900 dark:text-gold-400 uppercase font-bold text-[11px] border-b border-amber-200 dark:border-gold-400/20">
              <tr>
                <th className="p-3.5">Invoice Number</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Amount (AED)</th>
                <th className="p-3.5">Used Status</th>
                <th className="p-3.5">Used By Customer</th>
                <th className="p-3.5">Used Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No invoices found for {startDate && startDate === endDate && startDate === getTodayString() ? 'Today' : 'selected filters'}.
                    {(startDate || endDate) && (
                      <button
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="ml-2 underline font-bold text-amber-600 dark:text-gold-400 not-italic hover:text-amber-700"
                      >
                        Click to view all historical invoices
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{inv.invoice_number}</td>
                    <td className="p-3.5 text-slate-800 dark:text-slate-300 font-medium">{inv.branch_name}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-800 dark:text-gold-300">AED {inv.amount}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inv.is_used === 1 ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/40' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40'
                      }`}>
                        {inv.is_used === 1 ? 'USED' : 'UNUSED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-800 dark:text-slate-300 font-medium">{inv.used_by_name ? `${inv.used_by_name} (${inv.used_by_email})` : '—'}</td>
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{inv.used_at ? new Date(inv.used_at).toLocaleString() : '—'}</td>
                    <td className="p-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleUsed(inv)}
                        className="px-2.5 py-1 bg-amber-100 dark:bg-slate-800 hover:bg-amber-200 dark:hover:bg-slate-700 rounded text-[11px] font-bold text-amber-900 dark:text-gold-300 border border-amber-300 dark:border-slate-700"
                        title="Toggle Used / Unused"
                      >
                        {inv.is_used === 1 ? 'Mark Unused' : 'Mark Used'}
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Single Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel bg-white dark:bg-luxury-card border border-amber-300/80 dark:border-gold-400/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create Single Invoice</h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Invoice Number (4 Digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 5879"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Store Branch</label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-xs font-medium"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name} (ID: {b.id})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Amount (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono text-xs font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 rounded-xl font-bold shadow-gold"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel bg-white dark:bg-luxury-card border border-amber-300/80 dark:border-gold-400/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-600 dark:text-gold-400" /> Bulk CSV Invoice Import
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Paste CSV rows below. Format: <span className="font-mono font-bold text-amber-800 dark:text-gold-300">4_DIGIT_INVOICE, BRANCH_ID, AMOUNT</span>
            </p>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs">
              <textarea
                rows={8}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                placeholder="5879, 1, 450&#10;5880, 2, 720&#10;5881, 3, 310"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono text-xs font-medium"
                required
              />

              <div className="p-3 bg-amber-50 dark:bg-slate-900/60 rounded-xl border border-amber-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-400">
                <span className="font-bold text-amber-800 dark:text-gold-400">Branch IDs:</span> {branches.map(b => `${b.name} = ${b.id}`).join(' | ')}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 rounded-xl font-bold shadow-gold"
                >
                  Upload & Import CSV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvoiceManagement;
