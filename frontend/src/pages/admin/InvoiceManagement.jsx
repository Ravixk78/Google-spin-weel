import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Receipt, Plus, Upload, Search, Filter, CheckCircle, XCircle, Trash2, Edit2, ToggleLeft, ToggleRight, FileSpreadsheet } from 'lucide-react';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

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
  }, [selectedBranch, selectedStatus]);

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
        params: { branch_id: selectedBranch, status: selectedStatus, search }
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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            Invoice Management <Receipt className="w-5 h-5 text-gold-400" />
          </h1>
          <p className="text-xs text-slate-400">Manage 4-digit store sales invoices, bulk CSV uploads, and double-spin eligibility</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold border border-rose-700/50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Clear All Invoices
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-gold-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import CSV / Bulk
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-gold px-4 py-2 rounded-xl text-xs font-bold shadow-gold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Single Invoice
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel border-gold-400/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search invoice number or customer email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-800 text-gold-300 text-xs font-bold rounded-xl border border-slate-700">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
          >
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
          >
            <option value="">All Statuses</option>
            <option value="ELIGIBLE">ELIGIBLE</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="glass-panel border-gold-400/20 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-gold-400 uppercase font-bold text-[11px] border-b border-gold-400/20">
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
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500 italic">No invoices found matching criteria.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">{inv.invoice_number}</td>
                    <td className="p-3.5 text-slate-300">{inv.branch_name}</td>
                    <td className="p-3.5 font-mono text-gold-300">AED {inv.amount}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inv.is_used === 1 ? 'bg-rose-950 text-rose-400 border border-rose-800/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      }`}>
                        {inv.is_used === 1 ? 'USED' : 'UNUSED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{inv.used_by_name ? `${inv.used_by_name} (${inv.used_by_email})` : '—'}</td>
                    <td className="p-3.5 font-mono text-slate-400">{inv.used_at ? new Date(inv.used_at).toLocaleString() : '—'}</td>
                    <td className="p-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleUsed(inv)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-gold-300 border border-slate-700"
                        title="Toggle Used / Unused"
                      >
                        {inv.is_used === 1 ? 'Mark Unused' : 'Mark Used'}
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel bg-luxury-card border-gold-400/40 rounded-2xl p-6 shadow-gold-lg">
            <h2 className="text-xl font-bold text-white mb-4">Create Single Invoice</h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Invoice Number (4 Digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 5879"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store Branch</label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name} (ID: {b.id})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel bg-luxury-card border-gold-400/40 rounded-2xl p-6 shadow-gold-lg">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-gold-400" /> Bulk CSV Invoice Import
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Paste CSV rows below. Format: <span className="font-mono text-gold-300">4_DIGIT_INVOICE, BRANCH_ID, AMOUNT</span>
            </p>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs">
              <textarea
                rows={8}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                placeholder="5879, 1, 450&#10;5880, 2, 720&#10;5881, 3, 310"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 font-mono text-xs"
                required
              />

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-gold-400">Branch IDs:</span> {branches.map(b => `${b.name} = ${b.id}`).join(' | ')}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-medium"
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
