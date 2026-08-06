import React, { useState, useEffect } from 'react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import SpinWheelCanvas from '../../components/SpinWheelCanvas';
import WinModal from '../../components/WinModal';
import { MapPin, ShieldCheck, CheckCircle2, Star, ArrowRight, RefreshCw, AlertCircle, Sparkles, Receipt, Lock, Trophy } from 'lucide-react';

const CustomerFlow = () => {
  const { detectedBranch, loadingBranch, branchError } = useBranch();
  const { customerUser, loginCustomerGoogle, logoutCustomer } = useAuth();
  const { lang, t } = useLanguage();

  // Wizard Step State: 1 (Branch/Google Auth) -> 2 (Invoice Verification) -> 3 (Google Review) -> 4 (Spin Wheel)
  const [currentStep, setCurrentStep] = useState(1);

  // Form & Workflow States
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [validatedInvoice, setValidatedInvoice] = useState(null);
  const [validating, setValidating] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);

  // Review step state
  const [reviewOpened, setReviewOpened] = useState(false);

  // Spin Wheel States
  const [prizes, setPrizes] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState(null);
  const [wonPrize, setWonPrize] = useState(null);
  const [claimTicket, setClaimTicket] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [spinError, setSpinError] = useState(null);

  // Fetch Prizes on Mount
  useEffect(() => {
    fetchPrizes();
  }, []);

  // Ensure active persistent customer session on load per device
  useEffect(() => {
    if (!customerUser && detectedBranch) {
      try {
        let deviceId = localStorage.getItem('deviceGoogleId');
        if (!deviceId) {
          deviceId = `google-user-device-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
          localStorage.setItem('deviceGoogleId', deviceId);
        }

        loginCustomerGoogle({
          google_id: deviceId,
          email: `${deviceId.toLowerCase()}@gmail.com`,
          name: `Google Customer`,
          branch_id: detectedBranch?.id || 1,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        }).catch(err => {
          console.warn('Auto-login notice:', err);
        });
      } catch (e) {
        console.warn('Storage notice:', e);
      }
    }
  }, [detectedBranch, customerUser]);

  const fetchPrizes = async () => {
    try {
      const res = await api.get('/prizes');
      // Filter active prizes sorted by display order
      const activePrizes = res.data.prizes.filter(p => p.is_active);
      setPrizes(activePrizes);
    } catch (err) {
      console.error('Error loading spin prizes:', err);
    }
  };

  // Step 1: Validate Invoice Number (Strict 4-digit rule)
  const handleValidateInvoice = async (e) => {
    e.preventDefault();
    const cleanNum = invoiceNumber.trim();
    if (!cleanNum) return;

    // Strict 4-digit enforcement
    if (cleanNum.length !== 4 || !/^\d{4}$/.test(cleanNum)) {
      setInvoiceError(t('invoiceFormatError'));
      return;
    }

    setValidating(true);
    setInvoiceError(null);

    let activeCustomer = customerUser;
    if (!activeCustomer) {
      let deviceId = localStorage.getItem('deviceGoogleId');
      if (!deviceId) {
        deviceId = `google-user-device-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem('deviceGoogleId', deviceId);
      }

      activeCustomer = await loginCustomerGoogle({
        google_id: deviceId,
        email: `${deviceId.toLowerCase()}@gmail.com`,
        name: `Google Customer`,
        branch_id: detectedBranch?.id || 1,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
    }

    try {
      const res = await api.post('/customer/invoice/validate', {
        invoice_number: cleanNum,
        branch_id: detectedBranch?.id || 1,
        customer_id: activeCustomer?.id
      });

      if (res.data?.valid) {
        setValidatedInvoice(res.data.invoice);
        
        // If customer has already submitted a review for THIS SPECIFIC BRANCH, skip straight to Spin Wheel (Step 3)
        if (res.data?.has_submitted_review) {
          setCurrentStep(3);
        } else {
          setCurrentStep(2); // Proceed to Google Review step for this branch
        }
      } else {
        setInvoiceError(res.data?.error || 'Invoice validation failed.');
      }
    } catch (err) {
      console.error('Invoice Validation Error:', err);
      setInvoiceError(err.response?.data?.error || err.message || 'Failed to validate invoice.');
    } finally {
      setValidating(false);
    }
  };

  // Step 2: Open Google Business Review Page & INSTANTLY load Spin Wheel page
  const handleOpenGoogleReview = (e) => {
    if (e) e.preventDefault();

    // 1. Immediately switch our website to Step 3 (Spin Wheel page)
    setCurrentStep(3);
    setReviewOpened(true);

    // 2. Open Google Review URL in new tab/window
    if (detectedBranch?.google_review_url) {
      const url = detectedBranch.google_review_url.trim();
      setTimeout(() => {
        const newWin = window.open(url, '_blank');
        if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
          window.location.href = url;
        }
      }, 50);
    }
  };

  const handleCompleteReviewAndProceed = () => {
    setCurrentStep(3); // Proceed to Spin Wheel!
  };

  // Reset flow after win modal is closed to allow next 4-digit invoice entry
  const resetFlowForNextSpin = () => {
    setShowWinModal(false);
    setInvoiceNumber('');
    setValidatedInvoice(null);
    setWinningIndex(null);
    setWonPrize(null);
    setClaimTicket(null);
    setSpinError(null);
    setReviewOpened(false);

    setCurrentStep(1); // Go back to Step 1 (Invoice Input) for next spin
  };

  // Step 3: Trigger Server-side Weighted Spin
  const handleExecuteSpin = async () => {
    if (spinning || !validatedInvoice || !detectedBranch) return;

    let activeUser = customerUser;
    if (!activeUser) {
      const randId = Math.floor(1000 + Math.random() * 9000);
      activeUser = await loginCustomerGoogle({
        google_id: `google-user-${Date.now()}-${randId}`,
        email: `customer.${Date.now()}.${randId}@gmail.com`,
        name: `Google User ${randId}`,
        branch_id: detectedBranch?.id || 1,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
    }

    setSpinning(true);
    setSpinError(null);

    try {
      const res = await api.post('/customer/spin', {
        customer_id: activeUser.id,
        invoice_number: validatedInvoice.invoice_number,
        branch_id: validatedInvoice.branch_id || detectedBranch.id,
        qr_code: detectedBranch.qr_code_token
      });

      if (res.data.success) {
        setWinningIndex(res.data.prizeIndex);
        setWonPrize(res.data.prize);
        setClaimTicket(res.data.ticket);

        if (customerUser) {
          customerUser.has_submitted_review = true;
          try {
            localStorage.setItem('customerUser', JSON.stringify({ ...customerUser, has_submitted_review: true }));
          } catch (e) {}
        }
      }
    } catch (err) {
      setSpinning(false);
      setSpinError(err.response?.data?.error || 'Spin failed. Invoice might have already been used.');
    }
  };

  const handleSpinAnimationFinished = () => {
    setSpinning(false);
    setShowWinModal(true);
  };

  if (loadingBranch) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-amber-800 font-medium animate-pulse">{lang === 'ar' ? 'جاري التعرف على فرع المحل...' : 'Detecting physical store branch from QR code...'}</p>
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-rose-300 rounded-2xl text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">{t('qrErrorTitle')}</h3>
        <p className="text-xs text-slate-600 mb-6">{branchError}</p>
        <button
          onClick={() => window.location.href = '/?branch=kalba'}
          className="bg-gradient-to-r from-[#F9E498] via-[#E6C687] to-[#C5A059] text-slate-950 px-6 py-2.5 rounded-full text-xs font-bold shadow-md"
        >
          {t('tryAgainBtn')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Branch Header Banner */}
      <div className="glass-panel border-gold-400/30 rounded-2xl p-6 mb-8 text-center relative overflow-hidden shadow-gold">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {t('scannedBranch')} {detectedBranch?.name}
        </div>

        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2 uppercase tracking-wide">
          {t('title')}
        </h1>

        <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
          {t('subtitle')}
        </p>

        {/* Progress Stepper */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mt-6 pt-4 border-t border-gold-400/20">
          {[
            { step: 1, label: t('step1Label') },
            { step: 2, label: t('step2Label') },
            { step: 3, label: t('step3Label') }
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === item.step
                  ? 'bg-gold-gradient text-black shadow-gold scale-110'
                  : currentStep > item.step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {currentStep > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${currentStep === item.step ? 'text-gold-400' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: INVOICE VERIFICATION */}
      {currentStep === 1 && (
        <div className="glass-panel bg-white/90 dark:bg-slate-900/80 border-amber-300/60 dark:border-gold-400/20 rounded-2xl p-6 md:p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-600">
            <Receipt className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('step1Title')}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            {t('step1Desc')} <span className="text-amber-700 dark:text-gold-400 font-bold">{detectedBranch?.name}</span>.
          </p>

          <form onSubmit={handleValidateInvoice} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={4}
                placeholder={t('invoicePlaceholder')}
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest font-mono text-2xl py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-amber-300 dark:border-gold-400/40 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold placeholder-slate-400"
                required
              />
            </div>

            {invoiceError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-600/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{invoiceError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={validating || !invoiceNumber.trim()}
              className="w-full btn-gold py-3 rounded-xl font-bold text-sm shadow-gold flex items-center justify-center gap-2"
            >
              {validating ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('validateBtn')}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: GOOGLE REVIEW REDIRECT */}
      {currentStep === 2 && (
        <div className="glass-panel bg-white/90 dark:bg-slate-900/80 border-amber-300/60 dark:border-gold-400/20 rounded-2xl p-6 md:p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="w-14 h-14 bg-amber-100 dark:bg-gold-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-300 dark:border-gold-400/40">
            <Star className="w-7 h-7 text-amber-600 dark:text-gold-400 fill-amber-500 dark:fill-gold-400" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('step2Title')}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            {t('step2Desc', { branch: detectedBranch?.name })}
          </p>

          <div className="space-y-4">
            <button
              onClick={handleOpenGoogleReview}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
            >
              <Star className="w-4 h-4 fill-white" /> {t('openReviewBtn', { branch: detectedBranch?.name })}
            </button>

            {reviewOpened && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 text-left flex items-start gap-2 animate-fadeIn font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('reviewOpenedMsg')}</span>
              </div>
            )}

            <button
              onClick={handleCompleteReviewAndProceed}
              disabled={!reviewOpened}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                reviewOpened ? 'btn-gold shadow-gold' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              {t('proceedToSpinBtn')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LUXURY ANIMATED SPIN WHEEL */}
      {currentStep === 3 && (
        <div className="rounded-3xl p-6 md:p-8 text-center shadow-xl max-w-2xl mx-auto bg-gradient-to-b from-[#FAF8F5] via-[#FFFDF9] to-[#F5F0E6] border border-amber-200/60 relative overflow-hidden">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-amber-300/80 text-slate-800 text-xs md:text-sm font-semibold shadow-sm mb-4">
            {t('spinReadyBadge')}
          </div>

          {/* Main Heading */}
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-1 tracking-tight">
            {t('spinTitle')}
          </h2>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-slate-500 mb-6">
            {t('spinSubtitle', { invoice: validatedInvoice?.invoice_number || '4444' })}
          </p>

          {spinError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-6 max-w-md mx-auto">
              {spinError}
            </div>
          )}

          {/* Canvas Wheel Component */}
          <SpinWheelCanvas
            prizes={prizes}
            winningIndex={winningIndex}
            isSpinning={spinning}
            onSpinComplete={handleSpinAnimationFinished}
          />

          {/* Spin Action Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleExecuteSpin}
              disabled={spinning || winningIndex !== null}
              className={`w-full max-w-md py-4 px-8 rounded-full font-bold text-base md:text-lg shadow-lg transition-all transform ${
                spinning || winningIndex !== null
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                  : 'bg-gradient-to-r from-[#F9E498] via-[#E6C687] to-[#C5A059] hover:from-[#FFF0B8] hover:to-[#B38728] text-slate-950 hover:scale-[1.02] active:scale-95 shadow-amber-500/20 border border-amber-200'
              }`}
            >
              {spinning ? t('spinningMsg') : winningIndex !== null ? '✓' : t('spinActionBtn')}
            </button>
          </div>

          {/* Bottom Trophy Rewards Card */}
          <div className="mt-8 p-4 md:p-5 rounded-2xl bg-white/90 border border-amber-200/60 shadow-sm flex items-center justify-between gap-4 text-left rtl:text-right max-w-lg mx-auto">
            <div className="flex-1">
              <h4 className="text-xs md:text-sm font-bold text-slate-800 mb-0.5">
                {t('bottomCardTitle')}
              </h4>
              <p className="text-[11px] md:text-xs text-slate-500">
                {t('bottomCardSub')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
          </div>

        </div>
      )}

      {/* Victory Modal Popup */}
      <WinModal
        isOpen={showWinModal}
        prize={wonPrize}
        ticket={claimTicket}
        onClose={resetFlowForNextSpin}
      />

    </div>
  );
};

export default CustomerFlow;
