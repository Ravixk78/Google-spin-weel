const { getQuery, allQuery } = require('../db');

const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const todayStr = new Date().toISOString().split('T')[0];

    const start = startDate ? startDate.trim() : todayStr;
    const end = endDate ? endDate.trim() : start;

    const params = [start, end];

    // Reviews in Range
    const todaysReviews = await getQuery(`
      SELECT COUNT(*) as count FROM google_reviews WHERE DATE(completed_at) BETWEEN DATE(?) AND DATE(?)
    `, params);

    // Spins in Range
    const todaysSpins = await getQuery(`
      SELECT COUNT(*) as count FROM spin_history WHERE DATE(spin_date) BETWEEN DATE(?) AND DATE(?)
    `, params);

    // Winners in Range
    const todaysWinners = await getQuery(`
      SELECT COUNT(DISTINCT customer_id) as count FROM spin_history WHERE DATE(spin_date) BETWEEN DATE(?) AND DATE(?)
    `, params);

    // Invoices in Range
    const rangeInvoices = await getQuery(`
      SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    `, params);

    // Active Branches
    const activeBranches = await getQuery(`SELECT COUNT(*) as count FROM branches WHERE status = 'ACTIVE'`);

    // Total Remaining Reward Stock
    const prizeStock = await getQuery(`SELECT SUM(stock_quantity) as total FROM spin_prizes WHERE is_active = 1`);

    // Branch Performance Breakdown in Range
    const branchStats = await allQuery(`
      SELECT b.name as branch_name, b.code as branch_code, COUNT(sh.id) as spin_count
      FROM branches b
      LEFT JOIN spin_history sh ON b.id = sh.branch_id AND DATE(sh.spin_date) BETWEEN DATE(?) AND DATE(?)
      GROUP BY b.id
      ORDER BY spin_count DESC
    `, params);

    // Recent Winners in Range
    const recentWinners = await allQuery(`
      SELECT
        sh.id,
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
        END as prize,
        sh.spin_date,
        b.name as branch_name,
        c.name as customer_name,
        c.email as customer_email,
        i.invoice_number
      FROM spin_history sh
      JOIN branches b ON sh.branch_id = b.id
      JOIN customers c ON sh.customer_id = c.id
      JOIN invoices i ON sh.invoice_id = i.id
      LEFT JOIN spin_prizes sp ON sh.prize_id = sp.id
      WHERE DATE(sh.spin_date) BETWEEN DATE(?) AND DATE(?)
      ORDER BY sh.spin_date DESC
      LIMIT 10
    `, params);

    return res.json({
      filter: {
        startDate: start,
        endDate: end,
        isToday: (start === todayStr && end === todayStr)
      },
      stats: {
        todaysReviews: todaysReviews.count || 0,
        todaysSpins: todaysSpins.count || 0,
        todaysWinners: todaysWinners.count || 0,
        rangeInvoices: rangeInvoices.count || 0,
        activeBranches: activeBranches.count || 0,
        prizeStock: prizeStock.total || 0
      },
      branchStats,
      recentWinners
    });

  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
};

module.exports = {
  getDashboardStats
};
