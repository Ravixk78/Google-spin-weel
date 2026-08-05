const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getQuery, runQuery } = require('../db');
const { JWT_SECRET, logAudit } = require('../middleware/authMiddleware');

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await getQuery(`SELECT * FROM admins WHERE email = ?`, [email.toLowerCase().trim()]);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAudit(admin.id, 'ADMIN_LOGIN', 'ADMIN', admin.id, { email: admin.email }, req.ip);

    return res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await getQuery(`SELECT id, name, email, role, created_at FROM admins WHERE id = ?`, [req.admin.id]);
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }
    return res.json({ admin });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin profile.' });
  }
};

// Customer Google Auth Callback & Dev Simulator
const customerGoogleAuth = async (req, res) => {
  try {
    const { google_id, email, name, avatar_url, branch_id } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) ? name.trim() : cleanEmail.split('@')[0];
    const gId = google_id || `google-user-${cleanEmail.replace(/[^a-z0-9]/gi, '')}`;
    const userIp = req.ip || '127.0.0.1';

    let customer = await getQuery(`SELECT * FROM customers WHERE email = ? OR google_id = ?`, [cleanEmail, gId]);

    if (!customer) {
      const result = await runQuery(`
        INSERT INTO customers (google_id, email, name, avatar_url, last_ip_address)
        VALUES (?, ?, ?, ?, ?)
      `, [gId, cleanEmail, cleanName, avatar_url || null, userIp]);
      customer = await getQuery(`SELECT * FROM customers WHERE id = ?`, [result.id]);
    } else {
      await runQuery(`
        UPDATE customers 
        SET email = ?, name = COALESCE(?, name), last_ip_address = ?, avatar_url = COALESCE(?, avatar_url), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [cleanEmail, cleanName, userIp, avatar_url, customer.id]);
      customer = await getQuery(`SELECT * FROM customers WHERE id = ?`, [customer.id]);
    }

    const customerToken = jwt.sign(
      { id: customer.id, google_id: customer.google_id, email: customer.email, name: customer.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    let hasSubmittedReview = false;
    if (branch_id) {
      const reviewRecord = await getQuery(`SELECT COUNT(*) as cnt FROM google_reviews WHERE customer_id = ? AND branch_id = ?`, [customer.id, branch_id]);
      const spinRecord = await getQuery(`SELECT COUNT(*) as cnt FROM spin_history WHERE customer_id = ? AND branch_id = ?`, [customer.id, branch_id]);
      hasSubmittedReview = (reviewRecord?.cnt || 0) > 0 || (spinRecord?.cnt || 0) > 0;
    }

    return res.json({
      message: 'Google authentication successful',
      token: customerToken,
      customer: {
        id: customer.id,
        google_id: customer.google_id,
        email: customer.email,
        name: customer.name,
        avatar_url: customer.avatar_url,
        has_submitted_review: hasSubmittedReview
      }
    });
  } catch (err) {
    console.error('Customer Google Auth Error:', err);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  customerGoogleAuth
};
