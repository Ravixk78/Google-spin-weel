import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  ar: {
    // Header & Navigation
    brandName: "مجلس العود",
    brandSubtitle: "جوائز تقييم جوجل",
    languageBtn: "English 🇬🇧",

    // Banner & Stepper
    scannedBranch: "الفرع المحدد:",
    title: "قيم عطور مجلس العود واكسب جوائز فاخرة",
    subtitle: "شكراً لتسوقك في عطور مجلس العود. اتبع الخطوات البسيطة أدناه لتدوير عجلة الجوائز الفاخرة!",
    step1Label: "تسجيل الدخول",
    step2Label: "الفاتورة",
    step3Label: "التقييم",
    step4Label: "عجلة الفوز",

    // Step 1: Google Login
    step1Title: "الخطوة 1: تسجيل الدخول عبر حساب جوجل",
    step1Desc: "سجّل الدخول باستخدام حساب جوجل للبدء في تدوير عجلة الجوائز مع حفظ تجربتك.",
    googleLoginBtn: "المتابعة باستخدام حساب جوجل",

    // Step 2: Invoice Validation
    step2Title: "الخطوة 2: أدخل رقم الفاتورة المكون من 4 أرقام",
    step2Desc: "أدخل رقم الفاتورة المطبوع على إيصال الشراء المكون من 4 أرقام من فرع",
    invoicePlaceholder: "مثال: 5879",
    invoiceFormatError: "يجب أن يتكون رقم الفاتورة من 4 أرقام فقط (مثال: 5879).",
    validateBtn: "التحقق من الفاتورة والمتابعة",
    validating: "جاري التحقق...",

    // Step 3: Google Review
    step3Title: "الخطوة 3: أضف تقييمك على جوجل",
    step3Desc: "شارك تجربتك وملاحظاتك حول فرع {branch} على خرائط جوجل لتفعيل عجلة الجوائز.",
    openReviewBtn: "فتح صفحة تقييم فرع {branch} على جوجل",
    reviewOpenedMsg: "تم فتح رابط التقييم! بعد نشر تقييمك، اضغط أدناه لتدوير العجلة.",
    proceedToSpinBtn: "لقد أضفت التقييم، ادر العجلة الآن!",

    // Step 4: Spin Wheel
    spinReadyBadge: "جاهز لتدوير العجلة",
    spinTitle: "ادر عجلة مجلس العود الفاخرة",
    spinSubtitle: "تم التحقق من الفاتورة رقم {invoice} للعميل {name}.",
    spinActionBtn: "🎯 ادر العجلة الآن للفوز!",
    spinningMsg: "جاري تدوير العجلة بكل تشويق...",

    // Win Modal
    congratsTitle: "🎉 ألف مبروك للفائز!",
    prizeWonMsg: "لقد فزت بـ",
    ticketLabel: "رقم تذكرة الجائزة:",
    branchLabel: "الفرع المعتمد:",
    customerLabel: "اسم الفائز:",
    invoiceLabel: "رقم الفاتورة:",
    modalInstructions: "التقط صورة لشاشة هاتفك الآن أو احفظ التذكرة لإبرازها لموظف المحل واستلام جائزتك الفاخرة!",
    spinAgainBtn: "إدخال فاتورة جديدة لتدوير العجلة",

    // Admin Dashboard KPI & Headings
    dashTitle: "لوحة التحليلات التنفيذية",
    dashSubtitle: "نظرة عامة تشغيلية مباشرة لفروع عطور مجلس العود بالإمارات",
    refreshMetricsBtn: "تحديث البيانات المباشرة",
    todaysReviews: "تقييمات اليوم",
    todaysSpins: "تدويرات اليوم",
    todaysWinners: "فائزو اليوم",
    todayInvoices: "فواتير اليوم",
    filteredReviews: "التقييمات المحددة",
    filteredSpins: "التدويرات المحددة",
    filteredWinners: "الفائزون المحددون",
    filteredInvoices: "الفواتير المحددة",
    activeBranchesCount: "فروع المتاجر النشطة",
    rewardStock: "إجمالي مخزون الجوائز",
    branchSpinDist: "توزيع التدويرات حسب الفروع",
    recentWinnersFeed: "أحدث الفائزين بالجوائز",
    noSpinsToday: "لم يتم تسجيل أي تدويرات حتى الآن اليوم.",
    fromLabel: "من:",
    toLabel: "إلى:",
    todayBtn: "اليوم",
    yesterdayBtn: "الأمس",
    last7DaysBtn: "7 أيام",
    resetBtn: "إعادة ضبط",
    liveStatusToday: "مؤشرات تشغيلية مباشرة لليوم",
    liveStatusRange: "الفترة المحددة: {start} إلى {end}",

    // Admin Sidebar & Portal Header
    adminDashboard: "لوحة التحكم الرئيسية",
    branchManagement: "إدارة الفروع",
    invoiceManagement: "إدارة الفواتير",
    prizeManagement: "إدارة الجوائز والنسب",
    reports: "التقارير والإحصائيات",
    customerHistory: "سجل العملاء والجوائز",
    superAdminPortal: "بوابة الإدارة العليا",
    logout: "تسجيل الخروج",

    // Footer
    footerText: "عطور مجلس العود الإمارات العربية المتحدة © 2026. جميع الحقوق محفوظة. نظام جوائز تقييم جوجل."
  },
  en: {
    // Header & Navigation
    brandName: "MAJLIS AL OUD",
    brandSubtitle: "Google Review Rewards",
    languageBtn: "العربية 🇦🇪",

    // Banner & Stepper
    scannedBranch: "Scanned Branch:",
    title: "Review & Win Exclusive Oud Rewards",
    subtitle: "Thank you for shopping at Majlis Al Oud. Follow the simple steps below to spin our luxury reward wheel!",
    step1Label: "Google Auth",
    step2Label: "Invoice Check",
    step3Label: "Google Review",
    step4Label: "Spin & Win",

    // Step 1: Google Login
    step1Title: "Step 1: Google Account Verification",
    step1Desc: "Sign in with your Google account to start your review reward session and securely claim your gift.",
    googleLoginBtn: "Continue with Google Account",

    // Step 2: Invoice Validation
    step2Title: "Step 2: Enter 4-Digit Invoice Number",
    step2Desc: "Enter the 4-digit invoice number printed on your receipt from",
    invoicePlaceholder: "e.g. 5879",
    invoiceFormatError: "Invoice number must be exactly 4 digits (e.g. 5879).",
    validateBtn: "Validate Invoice & Continue",
    validating: "Validating...",

    // Step 3: Google Review
    step3Title: "Step 3: Submit Google Review",
    step3Desc: "Share your store experience on Google Business Profile for {branch} to unlock your reward spin.",
    openReviewBtn: "Open {branch} Google Review Page",
    reviewOpenedMsg: "Google Business Review link opened! Once posted, click below to spin the wheel.",
    proceedToSpinBtn: "I Have Submitted My Review & Spin Now!",

    // Step 4: Spin Wheel
    spinReadyBadge: "Ready to Spin",
    spinTitle: "Spin the Luxury Oud Wheel",
    spinSubtitle: "Invoice {invoice} verified for {name}.",
    spinActionBtn: "🎯 SPIN THE WHEEL NOW!",
    spinningMsg: "Spinning the luxury wheel...",

    // Win Modal
    congratsTitle: "🎉 Congratulations Winner!",
    prizeWonMsg: "You have won a",
    ticketLabel: "Claim Ticket Number:",
    branchLabel: "Redemption Store Branch:",
    customerLabel: "Winner Customer Name:",
    invoiceLabel: "Verified Invoice Number:",
    modalInstructions: "Screenshot this claim ticket now and present it at the counter to redeem your luxury reward!",
    spinAgainBtn: "Enter Next Invoice to Spin Again",

    // Admin Dashboard KPI & Headings
    dashTitle: "Executive Analytics Dashboard",
    dashSubtitle: "Live operational overview for Majlis Al Oud UAE branches",
    refreshMetricsBtn: "Refresh Live Metrics",
    todaysReviews: "Today's Reviews",
    todaysSpins: "Today's Spins",
    todaysWinners: "Today Winners",
    todayInvoices: "Today Invoices",
    filteredReviews: "Filtered Reviews",
    filteredSpins: "Filtered Spins",
    filteredWinners: "Filtered Winners",
    filteredInvoices: "Filtered Invoices",
    activeBranchesCount: "Active Store Branches",
    rewardStock: "Total Reward Stock",
    branchSpinDist: "Branch Spin Distribution",
    recentWinnersFeed: "Recent Winners",
    noSpinsToday: "No spins recorded yet today.",
    fromLabel: "From:",
    toLabel: "To:",
    todayBtn: "Today",
    yesterdayBtn: "Yesterday",
    last7DaysBtn: "7 Days",
    resetBtn: "Reset",
    liveStatusToday: "Real-time Live Today's Operational Metrics",
    liveStatusRange: "Filtered Range: {start} to {end}",

    // Admin Sidebar & Portal Header
    adminDashboard: "Executive Dashboard",
    branchManagement: "Branch Management",
    invoiceManagement: "Invoice Management",
    prizeManagement: "Spin Prize Management",
    reports: "Reports & Analytics",
    customerHistory: "Customer History",
    superAdminPortal: "Super Admin Portal",
    logout: "Logout",

    // Footer
    footerText: "Majlis Al Oud Perfumes UAE © 2026. All Rights Reserved. Google Review Reward System."
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('appLanguage');
    return saved || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLangState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations['en']?.[key] || key;
    Object.keys(params).forEach(pKey => {
      text = text.replace(new RegExp(`{${pKey}}`, 'g'), params[pKey]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
