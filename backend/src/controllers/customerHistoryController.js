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
        CASE
          WHEN sh.prize_name_snapshot IS NOT NULL AND sh.prize_name_snapshot != '' AND LOWER(sh.prize_name_snapshot) NOT LIKE 'prize %' THEN sh.prize_name_snapshot
          WHEN sp.name IS NOT NULL AND sp.name != '' AND LOWER(sp.name) NOT LIKE 'prize %' THEN sp.name
          WHEN sp.display_order = 1 THEN 'Lafirma Spray 300ml'
          WHEN sp.display_order = 2 THEN 'Special Oudh Masala Incense'
          WHEN sp.display_order = 3 THEN 'Misk al Wardi Attar 1/4'
          WHEN sp.display_order = 4 THEN 'Mukallath Khady Attar 1/4'
          WHEN sp.display_order = 5 THEN 'Khayan Attar 1/4'
          WHEN sp.display_order = 6 THEN 'Rose Fresh Hair Mist 30ml'
          WHEN sp.display_order = 7 THEN 'Rashat Musk EDP Perfume'
          WHEN sp.display_order = 8 THEN 'Vaseline Powder Cream'
          WHEN sh.prize_name_snapshot = 'Prize 1' OR sh.prize_name_snapshot = 'prize 1' THEN 'Lafirma Spray 300ml'
          WHEN sh.prize_name_snapshot = 'Prize 2' OR sh.prize_name_snapshot = 'prize 2' THEN 'Special Oudh Masala Incense'
          WHEN sh.prize_name_snapshot = 'Prize 3' OR sh.prize_name_snapshot = 'prize 3' THEN 'Misk al Wardi Attar 1/4'
          WHEN sh.prize_name_snapshot = 'Prize 4' OR sh.prize_name_snapshot = 'prize 4' THEN 'Mukallath Khady Attar 1/4'
          WHEN sh.prize_name_snapshot = 'Prize 5' OR sh.prize_name_snapshot = 'prize 5' THEN 'Khayan Attar 1/4'
          WHEN sh.prize_name_snapshot = 'Prize 6' OR sh.prize_name_snapshot = 'prize 6' THEN 'Rose Fresh Hair Mist 30ml'
          WHEN sh.prize_name_snapshot = 'Prize 7' OR sh.prize_name_snapshot = 'prize 7' THEN 'Rashat Musk EDP Perfume'
          WHEN sh.prize_name_snapshot = 'Prize 8' OR sh.prize_name_snapshot = 'prize 8' THEN 'Vaseline Powder Cream'
          ELSE COALESCE(sh.prize_name_snapshot, 'Reward Prize')
        END as prize_won,
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
