const { allQuery } = require('../db');

const getCustomerHistory = async (req, res) => {
  try {
    const { search, branch_id } = req.query;

    let query = `
      SELECT
        c.id as customer_id,
        c.name as customer_name,
        c.email as google_email,
        c.google_id as google_account_id,
        b.name as branch_name,
        b.code as branch_code,
        i.invoice_number,
        sh.prize_name_snapshot as prize_won,
        sp.color_code as prize_color,
        sh.review_date,
        sh.spin_date,
        sh.qr_code_used,
        sh.ip_address
      FROM spin_history sh
      JOIN customers c ON sh.customer_id = c.id
      JOIN branches b ON sh.branch_id = b.id
      JOIN invoices i ON sh.invoice_id = i.id
      JOIN spin_prizes sp ON sh.prize_id = sp.id
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
