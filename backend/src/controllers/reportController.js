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
        sh.prize_name_snapshot as prize_won,
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
      JOIN spin_prizes sp ON sh.prize_id = sp.id
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
