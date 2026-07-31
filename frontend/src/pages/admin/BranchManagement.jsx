import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import QRCodeModal from '../../components/QRCodeModal';
import { useLanguage } from '../../context/LanguageContext';
import { Store, Plus, QrCode, Edit2, Trash2, CheckCircle, XCircle, MapPin, ExternalLink, RefreshCw } from 'lucide-react';

const BranchManagement = () => {
  const { t } = useLanguage();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', address: '', google_review_url: '', status: 'ACTIVE' });

  // QR Modal State
  const [qrModalBranch, setQrModalBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches');
      setBranches(res.data.branches);
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setFormData({ name: '', code: '', address: '', google_review_url: '', status: 'ACTIVE' });
    setShowModal(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      google_review_url: branch.google_review_url,
      status: branch.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`/admin/branches/${editingBranch.id}`, formData);
      } else {
        await api.post('/admin/branches', formData);
      }
      setShowModal(false);
      fetchBranches();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save branch.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`/admin/branches/${id}`);
        fetchBranches();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete branch.');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            {t('branchTitle')} <Store className="w-5 h-5 text-gold-400" />
          </h1>
          <p className="text-xs text-slate-400">{t('branchSubtitle')}</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-gold px-4 py-2 rounded-xl text-xs font-bold shadow-gold flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> {t('addBranchBtn')}
        </button>
      </div>

      {/* Branch Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading branch list...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="glass-panel border-gold-400/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between relative group">
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    branch.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' : 'bg-rose-950 text-rose-400 border border-rose-700/50'
                  }`}>
                    {branch.status === 'ACTIVE' ? t('branchActive') : branch.status}
                  </span>
                  <span className="text-xs font-mono text-gold-400">ID: {branch.code}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{branch.name}</h3>
                <p className="text-xs text-slate-400 flex items-start gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  {branch.address || 'No address specified'}
                </p>

                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 truncate mb-4">
                  <a href={branch.google_review_url} target="_blank" rel="noreferrer" className="hover:text-gold-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 shrink-0" /> {branch.google_review_url}
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setQrModalBranch(branch)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gold-400/10 hover:bg-gold-400/20 border border-gold-400/30 text-gold-300 rounded-lg text-xs font-semibold transition-all"
                >
                  <QrCode className="w-3.5 h-3.5" /> QR Code & PDF
                </button>

                <button
                  onClick={() => handleOpenEdit(branch)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                  title="Edit Branch"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(branch.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg transition-colors"
                  title="Delete Branch"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel bg-luxury-card border-gold-400/40 rounded-2xl p-6 shadow-gold-lg">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingBranch ? 'Edit Physical Branch' : 'Add New Branch'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kalba Branch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
                  required
                />
              </div>

              {!editingBranch && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Branch Unique Code ID</label>
                  <input
                    type="text"
                    placeholder="e.g. kalba, rak, sharjah"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs font-mono"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address Location</label>
                <input
                  type="text"
                  placeholder="Street address in UAE"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Google Business Review URL</label>
                <input
                  type="url"
                  placeholder="https://g.page/r/..."
                  value={formData.google_review_url}
                  onChange={(e) => setFormData({ ...formData, google_review_url: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-xs"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 rounded-xl font-bold shadow-gold"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code & PDF Generator Modal */}
      <QRCodeModal
        isOpen={!!qrModalBranch}
        branch={qrModalBranch}
        onClose={() => setQrModalBranch(null)}
        onRefresh={fetchBranches}
      />

    </div>
  );
};

export default BranchManagement;
