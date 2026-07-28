import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, CheckCircle2, Download, Printer, X } from 'lucide-react';

const WinModal = ({ isOpen, prize, ticket, onClose }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel bg-luxury-card border-gold-400/40 rounded-2xl p-6 md:p-8 text-center shadow-gold-lg overflow-hidden">
        
        {/* Decorative Gold Header Ribbon */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gold-400/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy & Badge */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 rounded-full flex items-center justify-center shadow-gold p-1 mb-4">
          <div className="w-full h-full bg-luxury-dark rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-gold-400 animate-bounce" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Congratulations Winner!
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">
          You Won!
        </h2>
        
        <p className="text-gold-400 font-medium text-lg mb-6">
          {prize.name}
        </p>

        {/* Claim Voucher Box */}
        <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-4 text-left mb-6 relative">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3 mb-3">
            <div>
              <span className="text-xs text-emerald-400 uppercase font-semibold">Store Branch</span>
              <p className="text-white font-medium text-sm">{ticket?.branch_name || 'Majlis Al Oud'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 uppercase font-semibold">Invoice Ref</span>
              <p className="text-white font-mono text-sm">{ticket?.invoice_number || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <p><span className="text-slate-400">Winner:</span> {ticket?.customer_name}</p>
            <p><span className="text-slate-400">Google Account:</span> {ticket?.customer_email}</p>
            <p><span className="text-slate-400">Reward Status:</span> <span className="text-emerald-400 font-semibold">VERIFIED & CLAIMED</span></p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Please show this verification screen or receipt to our branch store staff to collect your reward immediately.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/60 text-white font-medium text-sm transition-all"
          >
            <Printer className="w-4 h-4 text-slate-300" /> Print Receipt
          </button>

          <button
            onClick={onClose}
            className="flex-1 btn-gold py-2.5 rounded-lg text-sm font-bold shadow-gold"
          >
            Done & Return
          </button>
        </div>

      </div>
    </div>
  );
};

export default WinModal;
