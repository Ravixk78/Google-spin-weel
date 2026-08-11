import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, CheckCircle2, Download, Printer, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import product1Asset from '../assets/prizes/product_1.png';
import product2Asset from '../assets/prizes/product_2.png';
import product3Asset from '../assets/prizes/product_3.png';
import product4Asset from '../assets/prizes/product_4.png';
import product5Asset from '../assets/prizes/product_5.png';
import product6Asset from '../assets/prizes/product_6.png';
import product7Asset from '../assets/prizes/product_7.png';
import product8Asset from '../assets/prizes/product_8.png';

const productAssetMap = {
  1: product1Asset,
  2: product2Asset,
  3: product3Asset,
  4: product4Asset,
  5: product5Asset,
  6: product6Asset,
  7: product7Asset,
  8: product8Asset,
};

const prizeTranslations = {
  'Exclusive Oud Perfume 50ml': 'عطر عود فاخر 50مل',
  'Luxury Oud Wood Chip 25g': 'رقائق عود فاخر 25غ',
  'Royal Bakhoor Incense Box': 'صندوق بخور ملكي',
  '15% Store Discount Voucher': 'قسيمة خصم 15%',
  'Majlis Fragrance Sample Set': 'مجموعة عينات عطور',
  'Golden Oud Oil Concentrated': 'دهن عود ذهبي مركز',
  'Better Luck Next Time': 'حظاً أوفر المرة القادمة',
  'Free Oud Incense': 'بخور عود مجاني'
};

const WinModal = ({ isOpen, prize, ticket, onClose }) => {
  const { lang, t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      // Trigger Confetti Cannon
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#1E4D45', '#FFFFFF']
      });
    }
  }, [isOpen]);

  if (!isOpen || !prize) return null;

  const prizeDisplayName = lang === 'ar' && prizeTranslations[prize.name] ? prizeTranslations[prize.name] : prize.name;

  const order = prize.display_order || prize.id || 1;
  const productCardPhoto = productAssetMap[order] || product1Asset;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel bg-white dark:bg-luxury-card border-amber-300/60 dark:border-gold-400/40 rounded-2xl p-6 md:p-8 text-center shadow-2xl overflow-hidden">
        
        {/* Decorative Gold Header Ribbon */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gold-400/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy & Badge */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 rounded-full flex items-center justify-center shadow-gold p-1 mb-4">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-gold-400 animate-bounce" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-gold-400/10 border border-amber-300 dark:border-gold-400/30 text-amber-800 dark:text-gold-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> {t('congratsTitle')}
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white mb-1">
          {t('prizeWonMsg')}
        </h2>
        
        <p className="text-amber-700 dark:text-gold-400 font-bold text-xl mb-4">
          {prizeDisplayName}
        </p>

        {/* Premium Square Product Card Photo */}
        <div className="flex justify-center mb-5">
          <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-600 shadow-xl">
            <img
              src={productCardPhoto}
              alt={prizeDisplayName}
              className="w-36 h-36 object-cover rounded-xl shadow-inner border border-white/60"
            />
          </div>
        </div>

        {/* Balanced Luxury Ticket Box */}
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 md:p-5 text-left mb-6 relative shadow-sm divide-y divide-amber-200/80 space-y-2.5">
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">{t('branchLabel')}</span>
            <span className="text-xs md:text-sm font-bold text-slate-900 text-right">{ticket?.branch_name || 'Majlis Al Oud'}</span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">{t('invoiceLabel')}</span>
            <span className="text-xs md:text-sm font-mono font-bold text-slate-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300">{ticket?.invoice_number || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('customerLabel')}</span>
            <span className="text-xs md:text-sm font-bold text-slate-900">{ticket?.customer_name}</span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('ticketLabel')}</span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">{ticket?.ticket_code || 'VERIFIED'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
          {t('modalInstructions')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:border-slate-500 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-white font-semibold text-sm transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500 dark:text-slate-300" /> {lang === 'ar' ? 'طباعة التذكرة' : 'Print Receipt'}
          </button>

          <button
            onClick={onClose}
            className="flex-1 btn-gold py-2.5 rounded-lg text-sm font-bold shadow-gold"
          >
            {t('spinAgainBtn')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default WinModal;
