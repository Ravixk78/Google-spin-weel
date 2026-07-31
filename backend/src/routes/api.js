const express = require('express');
const router = express.Router();

const { verifyAdminToken } = require('../middleware/authMiddleware');
const { adminLogin, getAdminProfile, customerGoogleAuth } = require('../controllers/authController');
const { getBranches, detectBranch, createBranch, updateBranch, regenerateQR, deleteBranch } = require('../controllers/branchController');
const { validateInvoiceForCustomer, listInvoices, createInvoice, updateInvoice, toggleInvoiceStatus, deleteInvoice, clearAllInvoices, importInvoicesCSV } = require('../controllers/invoiceController');
const { executeCustomerSpin: spinAction } = require('../controllers/spinController');
const { getPrizes, createPrize, updatePrize, deletePrize } = require('../controllers/prizeController');
const { getReports } = require('../controllers/reportController');
const { getDashboardStats } = require('../controllers/dashboardController');
const { getCustomerHistory } = require('../controllers/customerHistoryController');

// ----------------------------------------------------
// PUBLIC & CUSTOMER ENDPOINTS
// ----------------------------------------------------
router.get('/branches', getBranches);
router.get('/branches/detect', detectBranch);
router.get('/prizes', getPrizes);
router.post('/customer/auth/google', customerGoogleAuth);
router.post('/customer/invoice/validate', validateInvoiceForCustomer);
router.post('/customer/spin', spinAction);

// ----------------------------------------------------
// ADMIN AUTH ENDPOINTS
// ----------------------------------------------------
router.post('/admin/login', adminLogin);
router.get('/admin/me', verifyAdminToken, getAdminProfile);

// ----------------------------------------------------
// SUPER ADMIN PROTECTED ENDPOINTS
// ----------------------------------------------------

// Dashboard
router.get('/admin/dashboard', verifyAdminToken, getDashboardStats);

// Branch Management
router.post('/admin/branches', verifyAdminToken, createBranch);
router.put('/admin/branches/:id', verifyAdminToken, updateBranch);
router.post('/admin/branches/:id/regenerate-qr', verifyAdminToken, regenerateQR);
router.delete('/admin/branches/:id', verifyAdminToken, deleteBranch);

// Invoice Management
router.get('/admin/invoices', verifyAdminToken, listInvoices);
router.post('/admin/invoices', verifyAdminToken, createInvoice);
router.put('/admin/invoices/:id', verifyAdminToken, updateInvoice);
router.patch('/admin/invoices/:id/toggle-status', verifyAdminToken, toggleInvoiceStatus);
router.delete('/admin/invoices/clear-all', verifyAdminToken, clearAllInvoices);
router.delete('/admin/invoices/:id', verifyAdminToken, deleteInvoice);
router.post('/admin/invoices/import-csv', verifyAdminToken, importInvoicesCSV);

// Prize Management
router.get('/admin/prizes', verifyAdminToken, getPrizes);
router.post('/admin/prizes', verifyAdminToken, createPrize);
router.put('/admin/prizes/:id', verifyAdminToken, updatePrize);
router.delete('/admin/prizes/:id', verifyAdminToken, deletePrize);

// Reports & Customer History
router.get('/admin/reports', verifyAdminToken, getReports);
router.get('/admin/customer-history', verifyAdminToken, getCustomerHistory);

module.exports = router;
