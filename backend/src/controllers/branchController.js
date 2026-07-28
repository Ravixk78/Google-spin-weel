const qrcode = require('qrcode');
const { getQuery, allQuery, runQuery } = require('../db');
const { logAudit } = require('../middleware/authMiddleware');

// Public: Get all active branches or single branch
const getBranches = async (req, res) => {
  try {
    const branches = await allQuery(`SELECT * FROM branches ORDER BY name ASC`);
    res.json({ branches });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branches.' });
  }
};

// Public: Detect branch from QR code or branch code (e.g. ?branch=kalba or ?qr=TOKEN)
const detectBranch = async (req, res) => {
  try {
    const { branch, qr } = req.query;

    if (!branch && !qr) {
      return res.status(400).json({ error: 'Branch code or QR token required.' });
    }

    let foundBranch = null;

    if (qr) {
      foundBranch = await getQuery(`SELECT * FROM branches WHERE qr_code_token = ? AND status = 'ACTIVE'`, [qr]);
    }

    if (!foundBranch && branch) {
      foundBranch = await getQuery(`SELECT * FROM branches WHERE LOWER(code) = ? AND status = 'ACTIVE'`, [branch.toLowerCase()]);
    }

    if (!foundBranch) {
      return res.status(404).json({ error: 'Branch not found or inactive.' });
    }

    return res.json({
      branch: {
        id: foundBranch.id,
        code: foundBranch.code,
        name: foundBranch.name,
        address: foundBranch.address,
        google_review_url: foundBranch.google_review_url,
        qr_code_token: foundBranch.qr_code_token
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error detecting branch.' });
  }
};

// Admin: Create new branch
const createBranch = async (req, res) => {
  try {
    const { name, code, address, google_review_url, status } = req.body;

    if (!name || !code || !google_review_url) {
      return res.status(400).json({ error: 'Branch name, code, and Google review URL are required.' });
    }

    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

    const existing = await getQuery(`SELECT * FROM branches WHERE code = ?`, [cleanCode]);
    if (existing) {
      return res.status(400).json({ error: 'Branch code already exists.' });
    }

    const qrToken = `QR-${cleanCode.toUpperCase()}-${Date.now()}`;

    const result = await runQuery(`
      INSERT INTO branches (code, name, address, google_review_url, qr_code_token, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [cleanCode, name, address || '', google_review_url, qrToken, status || 'ACTIVE']);

    await logAudit(req.admin.id, 'CREATE_BRANCH', 'BRANCH', result.id, { name, code: cleanCode }, req.ip);

    const newBranch = await getQuery(`SELECT * FROM branches WHERE id = ?`, [result.id]);
    return res.status(201).json({ message: 'Branch created successfully', branch: newBranch });
  } catch (err) {
    console.error('Create branch error:', err);
    res.status(500).json({ error: 'Failed to create branch.' });
  }
};

// Admin: Update branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, google_review_url, status } = req.body;

    const branch = await getQuery(`SELECT * FROM branches WHERE id = ?`, [id]);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found.' });
    }

    await runQuery(`
      UPDATE branches
      SET name = COALESCE(?, name),
          address = COALESCE(?, address),
          google_review_url = COALESCE(?, google_review_url),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, address, google_review_url, status, id]);

    await logAudit(req.admin.id, 'UPDATE_BRANCH', 'BRANCH', id, { name, status }, req.ip);

    const updated = await getQuery(`SELECT * FROM branches WHERE id = ?`, [id]);
    return res.json({ message: 'Branch updated successfully', branch: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update branch.' });
  }
};

// Admin: Regenerate QR Token
const regenerateQR = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await getQuery(`SELECT * FROM branches WHERE id = ?`, [id]);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found.' });
    }

    const newToken = `QR-${branch.code.toUpperCase()}-${Date.now()}`;
    await runQuery(`UPDATE branches SET qr_code_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newToken, id]);

    await logAudit(req.admin.id, 'REGENERATE_QR', 'BRANCH', id, { oldToken: branch.qr_code_token, newToken }, req.ip);

    return res.json({ message: 'QR Code regenerated successfully', qr_code_token: newToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to regenerate QR code.' });
  }
};

// Admin: Delete branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await getQuery(`SELECT * FROM branches WHERE id = ?`, [id]);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found.' });
    }

    // Check if invoices attached
    const invCount = await getQuery(`SELECT COUNT(*) as count FROM invoices WHERE branch_id = ?`, [id]);
    if (invCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete branch with existing invoices. Deactivate it instead.' });
    }

    await runQuery(`DELETE FROM branches WHERE id = ?`, [id]);
    await logAudit(req.admin.id, 'DELETE_BRANCH', 'BRANCH', id, { name: branch.name }, req.ip);

    return res.json({ message: 'Branch deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete branch.' });
  }
};

module.exports = {
  getBranches,
  detectBranch,
  createBranch,
  updateBranch,
  regenerateQR,
  deleteBranch
};
