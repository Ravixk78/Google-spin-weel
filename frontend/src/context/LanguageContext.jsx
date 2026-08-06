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
    title: "جوائز مجلس العود الفاخرة",
    subtitle: "شكراً لتسوقك في عطور مجلس العود. أدخل رقم الفاتورة لتدوير عجلة الجوائز الفاخرة!",
    step1Label: "الفاتورة",
    step2Label: "التقييم",
    step3Label: "عجلة الفوز",

    // Step 1: Invoice Validation
    qrErrorTitle: "خطأ في التعرف على رمز QR",
    tryAgainBtn: "إعادة المحاولة",
    step1Title: "الخطوة 1: أدخل رقم الفاتورة المكون من 4 أرقام",
    step1Desc: "أدخل رقم الفاتورة المطبوع على إيصال الشراء المكون من 4 أرقام من فرع",
    invoicePlaceholder: "مثال: 5879",
    invoiceFormatError: "يجب أن يتكون رقم الفاتورة من 4 أرقام فقط (مثال: 5879).",
    validateBtn: "التحقق من الفاتورة والمتابعة",
    validating: "جاري التحقق...",

    // Step 2: Google Review
    step2Title: "الخطوة 2: أضف تقييمك على جوجل",
    step2Desc: "شارك تجربتك وملاحظاتك حول فرع {branch} على خرائط جوجل لتفعيل عجلة الجوائز.",
    openReviewBtn: "فتح صفحة تقييم فرع {branch} على جوجل",
    reviewOpenedMsg: "تم فتح رابط التقييم! جارٍ توجيهك إلى عجلة الجوائز تلقائياً...",
    proceedToSpinBtn: "الانتقال إلى عجلة الجوائز",

    // Step 3: Spin Wheel
    spinReadyBadge: "جاهز لتدوير العجلة؟ ✨",
    spinTitle: "إدر عجلة مجلس العود الفاخرة",
    spinSubtitle: "تم التحقق من الفاتورة رقم {invoice}.",
    spinActionBtn: "ادِر العجلة الآن للفوز! 🎯",
    spinningMsg: "جاري تدوير العجلة بكل تشويق...",
    bottomCardTitle: "جوائز مميزة بانتظارك من مجلس العود الفاخر.",
    bottomCardSub: "كل تجربة فريدة، وكل فوز أقرب إليك!",

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

    // Customer History Audit Log Page
    customerHistoryTitle: "سجل تدقيق العملاء والجوائز",
    customerHistorySubtitle: "سجل تدقيق كامل لحسابات جوجل للعملاء ورموز QR والجوائز الممنوحة",
    searchPlaceholder: "البحث عن اسم العميل، البريد، معرّف جوجل، أو رقم الفاتورة...",
    searchBtn: "بحث",
    allBranches: "جميع الفروع",
    thCustomerName: "اسم العميل",
    thGoogleEmail: "بريد جوجل",
    thGoogleId: "معرّف حساب جوجل",
    thBranch: "الفرع",
    thInvoiceRef: "رقم الفاتورة",
    thPrizeWon: "الجائزة المكسوبة",
    thReviewDate: "تاريخ التقييم",
    thSpinDate: "تاريخ التدوير",
    thQrCode: "رمز QR المستخدم",
    thIpAddress: "عنوان IP",
    loadingAuditLogs: "جاري تحميل سجلات التدقيق...",
    noCustomerHistory: "لم يتم العثور على سجلات عملاء.",

    // Branch Management Page
    branchTitle: "إدارة فروع المتاجر",
    branchSubtitle: "إدارة فروع المتاجر وروابط تقييم جوجل ورموز QR",
    addBranchBtn: "إضافة فرع جديد",
    qrPdfBtn: "رمز QR والملف",
    branchActive: "نشط",

    // Invoice Management Page
    invoiceTitle: "إدارة الفواتير والإيصالات",
    invoiceSubtitle: "إدارة والتحقق من أرقام الفواتير المكونة من 4 أرقام",
    addInvoiceBtn: "إضافة فاتورة واحدة",
    bulkUploadBtn: "رفع ملف CSV",
    thStatus: "الحالة",
    statusUnused: "غير مستخدمة / متاحة",
    statusUsed: "مستخدمة ومطالب بها",

    // Prize Management Page
    prizeTitle: "إدارة الجوائز ونسب الفوز",
    prizeSubtitle: "إدارة جوائز العجلة والكميات ونسب الاحتمالات",
    addPrizeBtn: "إضافة جائزة جديدة",
    thPrizeName: "اسم الجائزة",
    thStockQty: "كمية المخزون",
    thProbability: "نسبة الاحتمال",

    // Reports Page
    reportsTitle: "التقارير والتحليلات الشاملة",
    reportsSubtitle: "تصدير تقارير الأداء والتحليلات التشغيلية",
    exportPdf: "تصدير تقرير PDF",
    exportExcel: "تصدير ملف Excel",

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
    title: "WIN EXCLUSIVE OUD REWARDS",
    subtitle: "Thank you for shopping at Majlis Al Oud. Enter your invoice number to spin our luxury reward wheel!",
    step1Label: "Invoice Check",
    step2Label: "Google Review",
    step3Label: "Spin & Win",

    // Step 1: Invoice Validation
    qrErrorTitle: "Branch Detection Error",
    tryAgainBtn: "Try Again",
    step1Title: "Step 1: Enter 4-Digit Invoice Number",
    step1Desc: "Enter the 4-digit invoice number printed on your receipt from",
    invoicePlaceholder: "e.g. 5879",
    invoiceFormatError: "Invoice number must be exactly 4 digits (e.g. 5879).",
    validateBtn: "Validate Invoice & Continue",
    validating: "Validating...",

    // Step 2: Google Review
    step2Title: "Step 2: Submit Google Review",
    step2Desc: "Share your store experience on Google Business Profile for {branch} to unlock your reward spin.",
    openReviewBtn: "Open {branch} Google Review Page",
    reviewOpenedMsg: "Google Business Review link opened! Redirecting to spin wheel...",
    proceedToSpinBtn: "Proceed to Spin Wheel",

    // Step 3: Spin Wheel
    spinReadyBadge: "Ready to spin the wheel? ✨",
    spinTitle: "Spin the Luxury Majlis Al Oud Wheel",
    spinSubtitle: "Invoice #{invoice} verified.",
    spinActionBtn: "SPIN THE WHEEL NOW TO WIN! 🎯",
    spinningMsg: "Spinning the luxury wheel...",
    bottomCardTitle: "Special rewards await you from luxury Majlis Al Oud.",
    bottomCardSub: "Every experience is unique, and every win is closer to you!",

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

    // Customer History Audit Log Page
    customerHistoryTitle: "Customer History Audit Log",
    customerHistorySubtitle: "Complete historical audit trail of customer Google accounts, scanned QR codes, and prize allocations",
    searchPlaceholder: "Search customer name, email, Google ID, or invoice number...",
    searchBtn: "Search",
    allBranches: "All Branches",
    thCustomerName: "Customer Name",
    thGoogleEmail: "Google Email",
    thGoogleId: "Google Account ID",
    thBranch: "Branch",
    thInvoiceRef: "Invoice Ref",
    thPrizeWon: "Prize Won",
    thReviewDate: "Review Date",
    thSpinDate: "Spin Date",
    thQrCode: "QR Code Used",
    thIpAddress: "IP Address",
    loadingAuditLogs: "Loading customer audit logs...",
    noCustomerHistory: "No customer history records found.",

    // Branch Management Page
    branchTitle: "Branch Management",
    branchSubtitle: "Manage store branches, Google Business Review links, and QR Code Standees",
    addBranchBtn: "Add New Branch",
    qrPdfBtn: "QR Code & PDF",
    branchActive: "ACTIVE",

    // Invoice Management Page
    invoiceTitle: "Invoice Management",
    invoiceSubtitle: "Manage and audit 4-digit branch invoice numbers",
    addInvoiceBtn: "Add Single Invoice",
    bulkUploadBtn: "Upload CSV / Bulk",
    thStatus: "Status",
    statusUnused: "Unused / Available",
    statusUsed: "Used & Claimed",

    // Prize Management Page
    prizeTitle: "Spin Prize Management",
    prizeSubtitle: "Manage wheel prizes, quantities, and winning probability odds",
    addPrizeBtn: "Add New Prize",
    thPrizeName: "Prize Name",
    thStockQty: "Stock Qty",
    thProbability: "Probability Odds",

    // Reports Page
    reportsTitle: "Analytics & Reports",
    reportsSubtitle: "Export performance reports and operational analytics",
    exportPdf: "Export PDF Report",
    exportExcel: "Export Excel / CSV",

    // Footer
    footerText: "Majlis Al Oud Perfumes UAE © 2026. All Rights Reserved. Google Review Reward System."
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('appLanguage');
      return saved || 'ar';
    } catch (e) {
      return 'ar';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('appLanguage', lang);
    } catch (e) {}
    try {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch (e) {}
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
