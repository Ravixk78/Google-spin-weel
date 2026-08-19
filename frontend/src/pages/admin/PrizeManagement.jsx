import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Gift, Plus, Edit2, Trash2, CheckCircle2, XCircle, Percent, Package, Palette, ArrowUpDown, Sparkles, Upload } from 'lucide-react';

import product1Asset from '../../assets/prizes/product_1.png';
import product2Asset from '../../assets/prizes/product_2.png';
import product3Asset from '../../assets/prizes/product_3.png';
import product4Asset from '../../assets/prizes/product_4.png';
import product5Asset from '../../assets/prizes/product_5.png';
import product6Asset from '../../assets/prizes/product_6.png';
import product7Asset from '../../assets/prizes/product_7.png';
import product8Asset from '../../assets/prizes/product_8.png';

const fallbackProductMap = {
  1: product1Asset,
  2: product2Asset,
  3: product3Asset,
  4: product4Asset,
  5: product5Asset,
  6: product6Asset,
  7: product7Asset,
  8: product8Asset
};

const PrizeManagement = () => {
  const { t } = useLanguage();
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 10,
    stock_quantity: 100,
    display_order: 1,
    color_code: '#D4AF37',
    is_active: true,
    image_url: ''
  });

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/prizes');
      setPrizes(res.data.prizes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPrize(null);
    setFormData({
      name: '',
      description: '',
      weight: 10,
      stock_quantity: 100,
      display_order: prizes.length + 1,
      color_code: '#D4AF37',
      is_active: true,
      image_url: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPrize(p);
    setFormData({
      name: p.name,
      description: p.description || '',
      weight: p.weight,
      stock_quantity: p.stock_quantity,
      display_order: p.display_order,
      color_code: p.color_code || '#D4AF37',
      is_active: p.is_active === 1 || p.is_active === true,
      image_url: p.image_url || ''
    });
    setShowModal(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/png');
        setFormData((prev) => ({ ...prev, image_url: dataUrl }));
      };
      img.onerror = () => {
        alert('Failed to load image file.');
      };
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrize) {
        await api.put(`/admin/prizes/${editingPrize.id}`, formData);
      } else {
        await api.post('/admin/prizes', formData);
      }
      setShowModal(false);
      fetchPrizes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save prize.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prize?')) {
      try {
        await api.delete(`/admin/prizes/${id}`);
        fetchPrizes();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete prize.');
      }
    }
  };

  // Calculate Total Weight sum of active prizes for probability % breakdown
  const activePrizes = prizes.filter(p => p.is_active && p.stock_quantity > 0);
  const totalWeightSum = activePrizes.reduce((sum, p) => sum + Number(p.weight), 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-300/40 dark:border-gold-400/20">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {t('prizeTitle')} <Gift className="w-5 h-5 text-amber-600 dark:text-gold-400" />
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t('prizeSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to reset all spin prizes back to the default 8 luxury wheel template prizes?')) {
                try {
                  setLoading(true);
                  const res = await api.post('/admin/prizes/reset-defaults');
                  setPrizes(res.data.prizes);
                  alert('Spin wheel prizes successfully reset to the 8 template prizes!');
                } catch (err) {
                  alert(err.response?.data?.error || 'Failed to reset prizes.');
                } finally {
                  setLoading(false);
                }
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-gold-400 border border-amber-300 dark:border-gold-400/30 hover:bg-amber-200 transition-all flex items-center gap-1.5 shadow-xs"
            title="Reset prizes to the 8 default luxury wheel template prizes"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" /> Reset to 8 Template Prizes
          </button>

          <button
            onClick={handleOpenCreate}
            className="btn-gold px-4 py-2 rounded-xl text-xs font-bold shadow-gold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t('addPrizeBtn')}
          </button>
        </div>
      </div>

      {/* Normalized Weight Banner */}
      <div className="glass-panel bg-white/90 dark:bg-slate-900/60 border border-amber-300/60 dark:border-gold-400/30 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs text-amber-800 dark:text-gold-400 font-bold uppercase tracking-wider block">Weighted Random Selection Engine</span>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Total Active Weight Sum: <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{totalWeightSum}</span>. Weights are automatically normalized internally into percentage draw probabilities.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono">{activePrizes.length} Active Segment Prizes</span>
        </div>
      </div>

      {/* Prize Table */}
      <div className="glass-panel bg-white/90 dark:bg-slate-900/60 border border-amber-200/80 dark:border-gold-400/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-amber-50/80 dark:bg-slate-900/90 text-amber-900 dark:text-gold-400 uppercase font-bold text-[11px] border-b border-amber-200 dark:border-gold-400/20">
              <tr>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Color</th>
                <th className="p-3.5">Segment Image</th>
                <th className="p-3.5">Prize Name & Description</th>
                <th className="p-3.5">Weight</th>
                <th className="p-3.5">Probability %</th>
                <th className="p-3.5">Stock Qty</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500">Loading spin prizes...</td></tr>
              ) : prizes.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500 italic">No prizes configured.</td></tr>
              ) : (
                prizes.map((p) => {
                  const probPct = totalWeightSum > 0 && p.is_active && p.stock_quantity > 0
                    ? ((Number(p.weight) / totalWeightSum) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{p.display_order}</td>
                      <td className="p-3.5">
                        <div className="w-6 h-6 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: p.color_code || '#D4AF37' }} />
                      </td>
                      <td className="p-3.5">
                        {(() => {
                          const displayImg = p.image_url || fallbackProductMap[p.display_order || p.id] || fallbackProductMap[((p.id - 1) % 8) + 1];
                          return displayImg ? (
                            <img
                              src={displayImg}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-xl border border-amber-300 dark:border-gold-400/30 bg-white dark:bg-slate-950 p-1 shadow-xs"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-medium">No image</span>
                          );
                        })()}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{p.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{p.description || 'No description'}</p>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-800 dark:text-gold-400">{p.weight}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">{probPct}%</td>
                      <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{p.stock_quantity} units</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.is_active && p.stock_quantity > 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/40'
                        }`}>
                          {p.is_active && p.stock_quantity > 0 ? 'ACTIVE' : 'INACTIVE / NO STOCK'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded"
                          title="Edit Prize"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded"
                          title="Delete Prize"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingPrize ? 'Edit Prize Segment' : 'Add New Spin Prize'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Prize Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Oud EDP 100ml"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-amber-300/80 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-medium text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief prize description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-amber-300/80 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Weight (Probability)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-slate-50 border border-amber-300/80 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-mono text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-amber-300/80 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-mono text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Display Order (1..10)</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 bg-slate-50 border border-amber-300/80 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-mono text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Wheel Slice Color</label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="color"
                      value={formData.color_code}
                      onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                      className="w-10 h-8 p-0.5 bg-white border border-amber-300 rounded-lg cursor-pointer shadow-xs"
                    />
                    <span className="font-mono text-[11px] text-slate-800 font-bold uppercase">{formData.color_code}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      { hex: '#E2F1EB', label: 'Mint' },
                      { hex: '#FCE5E2', label: 'Coral' },
                      { hex: '#EAE6F8', label: 'Purple' },
                      { hex: '#FDF3D6', label: 'Yellow' },
                      { hex: '#DCECF6', label: 'Blue' },
                      { hex: '#FCE0DD', label: 'Red' },
                      { hex: '#E2F2EE', label: 'Teal' },
                      { hex: '#FDEBD9', label: 'Peach' },
                      { hex: '#E8EFFD', label: 'Pastel' },
                      { hex: '#F9F1E6', label: 'Cream' }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, color_code: c.hex })}
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs transition-transform hover:scale-125"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.label} (${c.hex})`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Prize Segment Image (Upload Pure File from Local Device)</label>
                
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex-1 cursor-pointer bg-amber-100/90 border border-amber-300 hover:bg-amber-200/90 p-2.5 rounded-xl text-amber-950 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs">
                    <Upload className="w-4 h-4 text-amber-800" />
                    <span>Upload Image File from Phone/PC</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-xl text-xs flex items-center gap-1 font-semibold"
                      title="Clear Uploaded Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>

                {/* Optional Manual URL Fallback */}
                <input
                  type="text"
                  placeholder="Or paste optional Image URL (Optional)"
                  value={formData.image_url.startsWith('data:') ? '[Pure Image Uploaded from Local Device]' : formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-amber-200 rounded-lg text-slate-600 text-[11px] font-mono"
                  readOnly={formData.image_url.startsWith('data:')}
                />

                {/* Image Specs & Fit Hint Box - Light Luxury Theme */}
                <div className="mt-2 p-3 bg-amber-50/90 border border-amber-300 rounded-xl text-[11px] text-slate-800 space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>💡 Recommended Image Specification (Image Hint):</span>
                  </div>
                  <p className="text-slate-700 leading-normal pl-5">
                    • <strong>Dimensions:</strong> <span className="text-emerald-800 font-mono font-bold">120 x 120 px</span> or <span className="text-emerald-800 font-mono font-bold">200 x 200 px</span> (Square ratio)<br />
                    • <strong>Format:</strong> Transparent PNG background (No crop, fits cleanly inside wheel slice edges)<br />
                    • <strong>Fit:</strong> Scaled proportionally inside segment boundary without edge clipping.
                  </p>
                  {formData.image_url && (
                    <div className="pt-2 flex items-center gap-2 pl-5">
                      <span className="text-slate-600 font-medium text-[10px]">Uploaded Preview:</span>
                      <img src={formData.image_url} alt="Prize Preview" className="w-10 h-10 object-contain rounded border border-amber-300 bg-white shadow-xs" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Status</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-900 font-semibold">
                    <input
                      type="radio"
                      checked={formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: true })}
                    /> Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-500">
                    <input
                      type="radio"
                      checked={!formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: false })}
                    /> Disabled
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 rounded-xl font-bold shadow-gold text-slate-950"
                >
                  Save Prize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PrizeManagement;
