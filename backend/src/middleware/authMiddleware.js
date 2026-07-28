const jwt = require('jsonwebtoken');
const { runQuery } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'majlis_al_oud_super_secret_jwt_key_2026';

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};

const logAudit = async (adminId, action, entityType, entityId, details, ipAddress) => {
  try {
    await runQuery(`
      INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      adminId || null,
      action,
      entityType,
      entityId ? String(entityId) : null,
      typeof details === 'object' ? JSON.stringify(details) : details,
      ipAddress || '127.0.0.1'
    ]);
  } catch (err) {
    console.error('Audit log insertion failed:', err);
  }
};

module.exports = {
  JWT_SECRET,
  verifyAdminToken,
  logAudit
};
