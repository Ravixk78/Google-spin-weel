const { getQuery, allQuery, runQuery } = require('../db');
const { logAudit } = require('../middleware/authMiddleware');

// Customer: Validate Invoice for scanned branch
const validateInvoiceForCustomer = async (req, res) => {
  try {
    const { invoice_number, branch_id, customer_id, google_id } = req.body;

    if (!invoice_number || !invoice_number.trim()) {
      return res.status(400).json({ error: 'Invoice number is required.' });
    }

    const cleanInvoice = invoice_number.trim();

    // Enforce 4-digit requirement
    if (!/^\d{4}$/.test(cleanInvoice)) {
      return res.status(400).json({ error: 'Invoice number must be exactly 4 digits (e.g. 5879).' });
    }

    // Fetch branch info or fallback to first active branch
    let branch = null;
    if (branch_id) {
      branch = await getQuery(`SELECT * FROM branches WHERE id = ?`, [branch_id]);
    }
    if (!branch) {
      branch = await getQuery(`SELECT * FROM branches WHERE status = 'ACTIVE' LIMIT 1`);
    }
    if (!branch) {
      branch = { id: 1, name: 'Kalba Branch', code: 'kalba' };
    }

    const activeBranchId = branch.id;

    // 1. Check if invoice exists in DB for THIS branch
    let invoice = await getQuery(`
      SELECT i.*, b.name as branch_name, b.code as branch_code
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      WHERE UPPER(i.invoice_number) = ? AND i.branch_id = ?
    `, [cleanInvoice, activeBranchId]);

    // 2. Check if invoice has already been used in spin_history for THIS branch
    const alreadySpun = await getQuery(`
      SELECT id FROM spin_history 
      WHERE branch_id = ? AND invoice_id IN (SELECT id FROM invoices WHERE UPPER(invoice_number) = ? AND branch_id = ?)
    `, [activeBranchId, cleanInvoice, activeBranchId]);

    if (alreadySpun || (invoice && invoice.is_used === 1)) {
      return res.status(400).json({
        valid: false,
        error: `Invoice #${cleanInvoice} has already been used for a spin at ${branch.name}.`
      });
    }

    // 3. If invoice not pre-uploaded, auto-create it on-the-fly for THIS branch
    if (!invoice) {
      try {
        await runQuery(`
          INSERT INTO invoices (invoice_number, branch_id, amount, is_used, status)
          VALUES (?, ?, 0, 0, 'ELIGIBLE')
        `, [cleanInvoice, activeBranchId]);
      } catch (insertErr) {
        // If unique constraint or duplicate insert occurs concurrently
      }

      invoice = await getQuery(`
        SELECT i.*, b.name as branch_name, b.code as branch_code
        FROM invoices i
        JOIN branches b ON i.branch_id = b.id
        WHERE UPPER(i.invoice_number) = ? AND i.branch_id = ?
      `, [cleanInvoice, activeBranchId]);
    }

    if (!invoice) {
      invoice = {
        id: Date.now(),
        invoice_number: cleanInvoice,
        branch_id: branch.id,
        branch_name: branch.name,
        amount: 0
      };
    }

    // Check if customer profile has previously submitted a Google Review or spun before for THIS SPECIFIC BRANCH
    let hasSubmittedReview = false;

    let targetCustId = customer_id;
    if (!targetCustId && google_id) {
      const gIdClean = String(google_id).trim();
      const cust = await getQuery(`SELECT id FROM customers WHERE google_id = ? OR email = ?`, [gIdClean, `${gIdClean.toLowerCase()}@gmail.com`]);
      if (cust) targetCustId = cust.id;
    }

    if (activeBranchId && targetCustId) {
      const revCheck = await getQuery(`SELECT COUNT(*) as cnt FROM google_reviews WHERE customer_id = ? AND branch_id = ?`, [targetCustId, activeBranchId]);
      const spinCheck = await getQuery(`SELECT COUNT(*) as cnt FROM spin_history WHERE customer_id = ? AND branch_id = ?`, [targetCustId, activeBranchId]);
      const revCnt = revCheck?.cnt || 0;
      const spinCnt = spinCheck?.cnt || 0;

      hasSubmittedReview = (revCnt > 0 || spinCnt > 0);
    }

    return res.json({
      valid: true,
      message: 'Invoice validated successfully.',
      has_submitted_review: hasSubmittedReview,
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        branch_id: invoice.branch_id,
        branch_name: invoice.branch_name || branch.name,
        amount: invoice.amount || 0
      }
    });
  } catch (err) {
    console.error('Invoice validation error:', err);
    res.status(500).json({ error: err.message || 'Failed to validate invoice.' });
  }
};

// Admin: List Invoices with search, date filters, and status filters
const listInvoices = async (req, res) => {
  try {
    const { branch_id, is_used, status, search, start_date, end_date, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT i.*, b.name as branch_name, b.code as branch_code, c.email as used_by_email, c.name as used_by_name
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      LEFT JOIN customers c ON i.used_by_customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += ` AND i.branch_id = ?`;
      params.push(branch_id);
    }

    if (is_used !== undefined && is_used !== '') {
      query += ` AND i.is_used = ?`;
      params.push(is_used);
    }

    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (i.invoice_number LIKE ? OR c.name LIKE ? OR c.email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (start_date && end_date) {
      query += ` AND ((DATE(i.created_at) >= DATE(?) AND DATE(i.created_at) <= DATE(?)) OR (i.used_at IS NOT NULL AND DATE(i.used_at) >= DATE(?) AND DATE(i.used_at) <= DATE(?)))`;
      params.push(start_date, end_date, start_date, end_date);
    } else if (start_date) {
      query += ` AND (DATE(i.created_at) >= DATE(?) OR (i.used_at IS NOT NULL AND DATE(i.used_at) >= DATE(?)))`;
      params.push(start_date, start_date);
    } else if (end_date) {
      query += ` AND (DATE(i.created_at) <= DATE(?) OR (i.used_at IS NOT NULL AND DATE(i.used_at) <= DATE(?)))`;
      params.push(end_date, end_date);
    }

    query += ` ORDER BY i.id DESC`;

    const invoices = await allQuery(query, params);
    res.json({ invoices, total: invoices.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
};

// Admin: Create Single Invoice
const createInvoice = async (req, res) => {
  try {
    const { invoice_number, branch_id, amount, expiry_date } = req.body;

    if (!invoice_number || !branch_id) {
      return res.status(400).json({ error: 'Invoice number and branch ID are required.' });
    }

    const cleanNum = String(invoice_number).trim();

    if (!/^\d{4}$/.test(cleanNum)) {
      return res.status(400).json({ error: 'Invoice number must be exactly 4 digits (e.g. 5879).' });
    }

    const existing = await getQuery(`SELECT * FROM invoices WHERE UPPER(invoice_number) = ? AND branch_id = ?`, [cleanNum, branch_id]);
    if (existing) {
      return res.status(400).json({ error: 'Invoice number already exists for this branch.' });
    }

    const result = await runQuery(`
      INSERT INTO invoices (invoice_number, branch_id, amount, expiry_date, is_used, status)
      VALUES (?, ?, ?, ?, 0, 'ELIGIBLE')
    `, [cleanNum, branch_id, amount || 0, expiry_date || null]);

    await logAudit(req.admin.id, 'CREATE_INVOICE', 'INVOICE', result.id, { invoice_number: cleanNum, branch_id }, req.ip);

    const created = await getQuery(`SELECT * FROM invoices WHERE id = ?`, [result.id]);
    return res.status(201).json({ message: 'Invoice created successfully', invoice: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invoice.' });
  }
};

// Admin: Edit Invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id, amount, expiry_date, status, is_used } = req.body;

    const inv = await getQuery(`SELECT * FROM invoices WHERE id = ?`, [id]);
    if (!inv) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    await runQuery(`
      UPDATE invoices
      SET branch_id = COALESCE(?, branch_id),
          amount = COALESCE(?, amount),
          expiry_date = COALESCE(?, expiry_date),
          status = COALESCE(?, status),
          is_used = COALESCE(?, is_used)
      WHERE id = ?
    `, [branch_id, amount, expiry_date, status, is_used, id]);

    await logAudit(req.admin.id, 'UPDATE_INVOICE', 'INVOICE', id, { invoice_number: inv.invoice_number }, req.ip);

    const updated = await getQuery(`SELECT * FROM invoices WHERE id = ?`, [id]);
    return res.json({ message: 'Invoice updated successfully', invoice: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice.' });
  }
};

// Admin: Toggle Mark Used / Unused
const toggleInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_used } = req.body;

    const inv = await getQuery(`SELECT * FROM invoices WHERE id = ?`, [id]);
    if (!inv) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const usedVal = is_used ? 1 : 0;
    const usedAt = usedVal === 1 ? new Date().toISOString() : null;

    await runQuery(`
      UPDATE invoices
      SET is_used = ?, used_at = ?
      WHERE id = ?
    `, [usedVal, usedAt, id]);

    await logAudit(req.admin.id, usedVal === 1 ? 'MARK_INVOICE_USED' : 'MARK_INVOICE_UNUSED', 'INVOICE', id, { invoice_number: inv.invoice_number }, req.ip);

    return res.json({ message: `Invoice marked as ${usedVal === 1 ? 'Used' : 'Unused'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice status.' });
  }
};

// Admin: Delete Invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const inv = await getQuery(`SELECT * FROM invoices WHERE id = ?`, [id]);
    if (!inv) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    if (inv.is_used === 1) {
      return res.status(400).json({ error: 'Cannot delete an invoice that has already been used for a spin.' });
    }

    await runQuery(`DELETE FROM invoices WHERE id = ?`, [id]);
    await logAudit(req.admin.id, 'DELETE_INVOICE', 'INVOICE', id, { invoice_number: inv.invoice_number }, req.ip);

    return res.json({ message: 'Invoice deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete invoice.' });
  }
};

// Admin: Clear All Invoices
const clearAllInvoices = async (req, res) => {
  try {
    await runQuery(`DELETE FROM invoices`);
    await logAudit(req.admin.id, 'CLEAR_ALL_INVOICES', 'INVOICE', null, {}, req.ip);
    return res.json({ message: 'All invoices cleared successfully.' });
  } catch (err) {
    console.error('Clear invoices error:', err);
    res.status(500).json({ error: 'Failed to clear invoices.' });
  }
};

// Admin: Bulk CSV Import
const importInvoicesCSV = async (req, res) => {
  try {
    const { invoices } = req.body; // Array of { invoice_number, branch_id, amount, expiry_date }

    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(400).json({ error: 'No invoice data provided.' });
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of invoices) {
      if (!item.invoice_number || !item.branch_id) {
        skippedCount++;
        continue;
      }

      const cleanNum = String(item.invoice_number).trim();

      if (!/^\d{4}$/.test(cleanNum)) {
        skippedCount++;
        continue;
      }

      const existing = await getQuery(`SELECT id FROM invoices WHERE UPPER(invoice_number) = ? AND branch_id = ?`, [cleanNum, item.branch_id]);

      if (existing) {
        skippedCount++;
        continue;
      }

      await runQuery(`
        INSERT INTO invoices (invoice_number, branch_id, amount, expiry_date, is_used, status)
        VALUES (?, ?, ?, ?, 0, 'ELIGIBLE')
      `, [cleanNum, item.branch_id, item.amount || 0, item.expiry_date || null]);

      createdCount++;
    }

    await logAudit(req.admin.id, 'BULK_IMPORT_INVOICES', 'INVOICE', null, { createdCount, skippedCount }, req.ip);

    return res.json({
      message: `Bulk import finished: ${createdCount} created, ${skippedCount} skipped/duplicates.`,
      createdCount,
      skippedCount
    });
  } catch (err) {
    console.error('CSV import error:', err);
    res.status(500).json({ error: 'Failed to process CSV import.' });
  }
};

// Customer: Log Google Review action immediately
const logCustomerReview = async (req, res) => {
  try {
    const { branch_id, customer_id, google_id, invoice_id } = req.body;
    const userIp = req.ip || '127.0.0.1';

    let targetCustId = customer_id;
    if (!targetCustId && google_id) {
      const gIdClean = String(google_id).trim();
      const cust = await getQuery(`SELECT id FROM customers WHERE google_id = ? OR email = ?`, [gIdClean, `${gIdClean.toLowerCase()}@gmail.com`]);
      if (cust) targetCustId = cust.id;
    }

    if (!targetCustId) {
      return res.status(400).json({ error: 'Customer identifier is required.' });
    }

    const activeBranchId = branch_id || 1;
    const nowIso = new Date().toISOString();

    const existing = await getQuery(`SELECT id FROM google_reviews WHERE customer_id = ? AND branch_id = ?`, [targetCustId, activeBranchId]);
    if (!existing) {
      await runQuery(`
        INSERT INTO google_reviews (customer_id, invoice_id, branch_id, completed_at, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [targetCustId, invoice_id || 0, activeBranchId, nowIso, userIp, req.headers['user-agent'] || 'Browser']);
    }

    return res.json({ success: true, message: 'Google review logged successfully.' });
  } catch (err) {
    console.error('Review logging error:', err);
    res.status(500).json({ error: 'Failed to log review.' });
  }
};

module.exports = {
  validateInvoiceForCustomer,
  logCustomerReview,
  listInvoices,
  createInvoice,
  updateInvoice,
  toggleInvoiceStatus,
  deleteInvoice,
  clearAllInvoices,
  importInvoicesCSV
};
