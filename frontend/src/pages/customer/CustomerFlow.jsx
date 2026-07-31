import React, { useState, useEffect } from 'react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SpinWheelCanvas from '../../components/SpinWheelCanvas';
import WinModal from '../../components/WinModal';
import { MapPin, ShieldCheck, CheckCircle2, Star, ArrowRight, RefreshCw, AlertCircle, Sparkles, Receipt, Lock } from 'lucide-react';

const CustomerFlow = () => {
  const { detectedBranch, loadingBranch, branchError } = useBranch();
  const { customerUser, loginCustomerGoogle, logoutCustomer } = useAuth();

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

  // Update Step depending on Auth & Branch
  useEffect(() => {
    if (customerUser && detectedBranch) {
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [customerUser, detectedBranch]);

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

  // Step 5: Google Login Simulator / Callback Handler
  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
      // Consistent Google Customer Account for persistent testing & user flow
      const googleAccount = {
        google_id: 'g-account-google-verified-customer',
        email: 'google.customer@majlisaloud.ae',
        name: 'Verified Google Customer',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };
      const loggedInCustomer = await loginCustomerGoogle(googleAccount);
      
      // If customer has already submitted a review previously, start at Step 2 (Invoice entry)
      setCurrentStep(2);
    } catch (err) {
      alert('Google Auth failed. Please try again.');
    }
  };

  // Step 6: Validate Invoice Number (Strict 4-digit rule)
  const handleValidateInvoice = async (e) => {
    e.preventDefault();
    const cleanNum = invoiceNumber.trim();
    if (!cleanNum) return;

    // Strict 4-digit enforcement
    if (cleanNum.length !== 4 || !/^\d{4}$/.test(cleanNum)) {
      setInvoiceError('Invoice number must be exactly 4 digits (e.g. 5879).');
      return;
    }

    setValidating(true);
    setInvoiceError(null);

    try {
      const res = await api.post('/customer/invoice/validate', {
        invoice_number: cleanNum,
        branch_id: detectedBranch?.id || 1,
        customer_id: customerUser?.id
      });

      if (res.data?.valid) {
        setValidatedInvoice(res.data.invoice);
        
        // If customer has already submitted a review previously, skip straight to Spin Wheel (Step 4)
        if (customerUser?.has_submitted_review || res.data?.has_submitted_review) {
          setCurrentStep(4);
        } else {
          setCurrentStep(3); // Proceed to Google Review step
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

  // Step 7: Open Google Business Review Page & Auto Proceed to Spin Wheel
  const handleOpenGoogleReview = () => {
    if (detectedBranch?.google_review_url) {
      let url = detectedBranch.google_review_url.trim();

      // Ensure lrd is present in query parameters as well as hash fragment for Mobile Google Search
      const lrdMatch = url.match(/#lrd=([^&#]+)/) || url.match(/[?&]lrd=([^&#]+)/);
      if (lrdMatch && lrdMatch[1]) {
        let lrdVal = lrdMatch[1];
        if (!lrdVal.endsWith(',1') && !lrdVal.endsWith(',3,1')) {
          lrdVal = lrdVal.replace(/,3,$/, ',3,1').replace(/,3,,,,$/, ',3,1');
        }
        
        if (!url.includes('?lrd=') && !url.includes('&lrd=')) {
          const parts = url.split('#');
          const sep = parts[0].includes('?') ? '&' : '?';
          parts[0] = `${parts[0]}${sep}lrd=${lrdVal}`;
          parts[1] = `lrd=${lrdVal}`;
          url = parts.join('#');
        }
      }

      const newWin = window.open(url, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        window.location.href = url;
      }
    }
    setReviewOpened(true);
    
    // Auto-advance to Spin Wheel step immediately
    setTimeout(() => {
      setCurrentStep(4);
    }, 500);
  };

  const handleCompleteReviewAndProceed = () => {
    setCurrentStep(4); // Proceed to Spin Wheel!
  };

  // Reset flow after win modal is closed to allow next 4-digit invoice entry without full page reload
  const resetFlowForNextSpin = () => {
    setShowWinModal(false);
    setInvoiceNumber('');
    setValidatedInvoice(null);
    setWinningIndex(null);
    setWonPrize(null);
    setClaimTicket(null);
    setSpinError(null);
    setReviewOpened(false);

    // Persist has_submitted_review: true on customerUser in local storage
    if (customerUser) {
      const updated = { ...customerUser, has_submitted_review: true };
      localStorage.setItem('customerUser', JSON.stringify(updated));
    }

    setCurrentStep(2); // Go directly to Step 2 (Invoice Input) for next spin
  };

  // Step 8: Trigger Server-side Weighted Spin
  const handleExecuteSpin = async () => {
    if (spinning || !validatedInvoice || !customerUser || !detectedBranch) return;

    setSpinning(true);
    setSpinError(null);

    try {
      const res = await api.post('/customer/spin', {
        customer_id: customerUser.id,
        invoice_number: validatedInvoice.invoice_number,
        branch_id: detectedBranch.id,
        qr_code: detectedBranch.qr_code_token
      });

      if (res.data.success) {
        setWinningIndex(res.data.prizeIndex);
        setWonPrize(res.data.prize);
        setClaimTicket(res.data.ticket);

        // Update local customer user state to remember review has been submitted
        if (customerUser) {
          customerUser.has_submitted_review = true;
          localStorage.setItem('customerUser', JSON.stringify({ ...customerUser, has_submitted_review: true }));
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gold-300 font-medium animate-pulse">Detecting physical store branch from QR code...</p>
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 glass-panel border-rose-500/40 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">QR Code Error</h3>
        <p className="text-xs text-slate-300 mb-6">{branchError}</p>
        <button
          onClick={() => window.location.href = '/?branch=kalba'}
          className="btn-gold px-4 py-2 rounded-lg text-xs font-bold"
        >
          Try Kalba Branch Demo
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
          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Scanned Branch: {detectedBranch?.name}
        </div>

        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
          Review & Win Exclusive Oud Rewards
        </h1>

        <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
          Thank you for shopping at <span className="text-gold-400 font-medium">Majlis Al Oud</span> ({detectedBranch?.name}). Follow the simple steps below to spin our luxury reward wheel!
        </p>

        {/* Progress Stepper */}
        <div className="grid grid-cols-4 gap-2 max-w-xl mx-auto mt-6 pt-4 border-t border-gold-400/20">
          {[
            { step: 1, label: 'Google Auth' },
            { step: 2, label: 'Invoice Check' },
            { step: 3, label: 'Google Review' },
            { step: 4, label: 'Spin & Win' }
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

      {/* STEP 5: GOOGLE OAUTH LOGIN */}
      {currentStep === 1 && (
        <div className="glass-panel border-gold-400/20 rounded-2xl p-6 md:p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-400/40">
            <Lock className="w-7 h-7 text-gold-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Step 1: Authenticate with Google</h2>
          <p className="text-xs text-slate-300 mb-6">
            Only verified Google users are eligible to submit reviews and claim luxury rewards.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-all shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google OAuth
          </button>
        </div>
      )}

      {/* STEP 6: INVOICE VERIFICATION */}
      {currentStep === 2 && (
        <div className="glass-panel border-gold-400/20 rounded-2xl p-6 md:p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="w-14 h-14 bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-600">
            <Receipt className="w-7 h-7 text-emerald-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Step 2: Enter 4-Digit Invoice Number</h2>
          <p className="text-xs text-slate-300 mb-6">
            Enter the 4-digit invoice number printed on your receipt from <span className="text-gold-400 font-semibold">{detectedBranch?.name}</span>.
          </p>

          <form onSubmit={handleValidateInvoice} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. 5879"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest font-mono text-2xl py-3 px-4 rounded-xl bg-slate-900/90 border border-gold-400/40 text-white focus:outline-none focus:border-gold-400 placeholder-slate-600"
                required
              />
            </div>

            {invoiceError && (
              <div className="p-3 bg-rose-950/80 border border-rose-600/50 rounded-xl text-xs text-rose-300 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{invoiceError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={validating || !invoiceNumber.trim()}
              className="w-full btn-gold py-3 rounded-xl font-bold text-sm shadow-gold flex items-center justify-center gap-2"
            >
              {validating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Validate Invoice & Continue'}
            </button>
          </form>


        </div>
      )}

      {/* STEP 7: GOOGLE REVIEW REDIRECT */}
      {currentStep === 3 && (
        <div className="glass-panel border-gold-400/20 rounded-2xl p-6 md:p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="w-14 h-14 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-400/40">
            <Star className="w-7 h-7 text-gold-400 fill-gold-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Step 3: Submit Google Review</h2>
          <p className="text-xs text-slate-300 mb-6">
            Share your store experience on Google Business Profile for <span className="text-gold-400 font-semibold">{detectedBranch?.name}</span> to unlock your reward spin.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleOpenGoogleReview}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <Star className="w-4 h-4 fill-white" /> Open {detectedBranch?.name} Google Review Page
            </button>

            <div className="p-3 bg-slate-900/90 border border-gold-400/20 rounded-xl text-left text-[11px] text-slate-300 space-y-1">
              <span className="font-semibold text-gold-400 block">💡 Mobile Device Tip:</span>
              <p>On mobile phones, tap the <span className="text-amber-400 font-bold">"Write a review"</span> button or <span className="text-amber-400 font-bold">⭐⭐⭐⭐⭐ Stars</span> on the Google business listing to leave your review.</p>
            </div>

            {reviewOpened && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 text-left flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Google Business Review link opened! Once posted, click below to spin the wheel.</span>
              </div>
            )}

            <button
              onClick={handleCompleteReviewAndProceed}
              disabled={!reviewOpened}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                reviewOpened ? 'btn-gold shadow-gold' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              I Have Submitted My Review & Spin Now!
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: LUXURY ANIMATED SPIN WHEEL */}
      {currentStep === 4 && (
        <div className="glass-panel border-gold-400/30 rounded-2xl p-6 md:p-8 text-center shadow-gold-lg max-w-2xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs font-semibold uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Ready to Spin
          </div>

          <h2 className="text-2xl font-serif font-bold text-white mb-1">
            Spin the Luxury Oud Wheel
          </h2>
          <p className="text-xs text-slate-300 mb-6">
            Invoice <span className="font-mono text-gold-400">{validatedInvoice?.invoice_number}</span> verified for <span className="text-emerald-400">{customerUser?.name}</span>.
          </p>

          {spinError && (
            <div className="p-3 bg-rose-950/80 border border-rose-600/50 rounded-xl text-xs text-rose-300 mb-6 max-w-md mx-auto">
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

          <div className="mt-6">
            <button
              onClick={handleExecuteSpin}
              disabled={spinning || winningIndex !== null}
              className={`px-8 py-3.5 rounded-full font-serif font-bold text-base shadow-gold transition-all transform ${
                spinning || winningIndex !== null
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'btn-gold hover:scale-105 active:scale-95'
              }`}
            >
              {spinning ? 'SPINNING THE WHEEL...' : winningIndex !== null ? 'WINNER CLAIMED' : 'SPIN THE WHEEL NOW!'}
            </button>
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
