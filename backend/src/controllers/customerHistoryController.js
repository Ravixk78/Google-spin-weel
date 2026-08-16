const { allQuery } = require('../db');

const getCustomerHistory = async (req, res) => {
  try {
    const { search, branch_id, start_date, end_date } = req.query;

    let query = `
      SELECT
        sh.id as spin_id,
        COALESCE(c.name, 'Google Customer') as customer_name,
        COALESCE(c.email, 'N/A') as google_email,
        COALESCE(c.google_id, 'N/A') as google_account_id,
        COALESCE(b.name, 'Main Branch') as branch_name,
        COALESCE(b.code, 'main') as branch_code,
        i.invoice_number,
        sh.prize_name_snapshot as prize_won,
        sp.color_code as prize_color,
        sh.review_date,
        sh.spin_date,
        sh.qr_code_used,
        sh.ip_address
      FROM spin_history sh
      LEFT JOIN customers c ON sh.customer_id = c.id
      LEFT JOIN branches b ON sh.branch_id = b.id
      LEFT JOIN invoices i ON sh.invoice_id = i.id
      LEFT JOIN spin_prizes sp ON sh.prize_id = sp.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (c.name LIKE ? OR c.email LIKE ? OR i.invoice_number LIKE ? OR c.google_id LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (branch_id) {
      query += ` AND sh.branch_id = ?`;
      params.push(branch_id);
    }

    if (start_date) {
      query += ` AND DATE(sh.spin_date) >= DATE(?)`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND DATE(sh.spin_date) <= DATE(?)`;
      params.push(end_date);
    }

    query += ` ORDER BY sh.spin_date DESC`;

    const history = await allQuery(query, params);

    return res.json({
      history,
      totalCount: history.length
    });
  } catch (err) {
    console.error('Customer History Error:', err);
    res.status(500).json({ error: 'Failed to fetch customer history.' });
  }
};

module.exports = {
  getCustomerHistory
};
