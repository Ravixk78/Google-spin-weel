const { allQuery, getQuery } = require('../db');

const getReports = async (req, res) => {
  try {
    const { invoice_number, startDate, endDate, branch_id, prize_id, is_today_only = 'true' } = req.query;

    let query = `
      SELECT
        sh.id as spin_id,
        i.invoice_number,
        b.name as branch_name,
        b.code as branch_code,
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
        c.name as customer_name,
        c.email as customer_email,
        sh.ip_address,
        sh.qr_code_used
      FROM spin_history sh
      JOIN invoices i ON sh.invoice_id = i.id
      JOIN branches b ON sh.branch_id = b.id
      LEFT JOIN spin_prizes sp ON sh.prize_id = sp.id
      JOIN customers c ON sh.customer_id = c.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by invoice number
    if (invoice_number) {
      query += ` AND UPPER(i.invoice_number) LIKE ?`;
      params.push(`%${invoice_number.trim().toUpperCase()}%`);
    }

    // Filter by branch
    if (branch_id) {
      query += ` AND sh.branch_id = ?`;
      params.push(branch_id);
    }

    // Filter by prize
    if (prize_id) {
      query += ` AND sh.prize_id = ?`;
      params.push(prize_id);
    }

    // Date Range vs Default Today
    if (startDate || endDate) {
      if (startDate) {
        query += ` AND DATE(sh.spin_date) >= DATE(?)`;
        params.push(startDate);
      }
      if (endDate) {
        query += ` AND DATE(sh.spin_date) <= DATE(?)`;
        params.push(endDate);
      }
    } else if (is_today_only === 'true') {
      // Default: SHOW ONLY TODAY'S RECORDS
      const todayStr = new Date().toISOString().split('T')[0];
      query += ` AND DATE(sh.spin_date) = DATE(?)`;
      params.push(todayStr);
    }

    query += ` ORDER BY sh.spin_date DESC`;

    const records = await allQuery(query, params);

    // Calculate Summary Section (Prize Distribution counts for the filtered dataset)
    const prizeSummaryMap = {};
    records.forEach(r => {
      const prizeName = r.prize_won || 'Unknown Prize';
      prizeSummaryMap[prizeName] = (prizeSummaryMap[prizeName] || 0) + 1;
    });

    const prizeDistribution = Object.keys(prizeSummaryMap).map(prizeName => ({
      prize_name: prizeName,
      count: prizeSummaryMap[prizeName]
    })).sort((a, b) => b.count - a.count);

    return res.json({
      records,
      totalCount: records.length,
      prizeDistribution,
      appliedFilters: {
        invoice_number: invoice_number || null,
        startDate: startDate || null,
        endDate: endDate || null,
        branch_id: branch_id || null,
        prize_id: prize_id || null,
        is_today_only: !startDate && !endDate && is_today_only === 'true'
      }
    });

  } catch (err) {
    console.error('Report Error:', err);
    res.status(500).json({ error: 'Failed to generate report data.' });
  }
};

module.exports = {
  getReports
};
