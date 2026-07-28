const { getQuery, allQuery } = require('../db');

const getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Today's Reviews
    const todaysReviews = await getQuery(`
      SELECT COUNT(*) as count FROM google_reviews WHERE DATE(completed_at) = DATE(?)
    `, [todayStr]);

    // Today's Spins
    const todaysSpins = await getQuery(`
      SELECT COUNT(*) as count FROM spin_history WHERE DATE(spin_date) = DATE(?)
    `, [todayStr]);

    // Today's Winners
    const todaysWinners = await getQuery(`
      SELECT COUNT(DISTINCT customer_id) as count FROM spin_history WHERE DATE(spin_date) = DATE(?)
    `, [todayStr]);

    // Total Reviews
    const totalReviews = await getQuery(`SELECT COUNT(*) as count FROM google_reviews`);

    // Total Winners
    const totalWinners = await getQuery(`SELECT COUNT(DISTINCT customer_id) as count FROM spin_history`);

    // Total Invoices
    const totalInvoices = await getQuery(`SELECT COUNT(*) as count FROM invoices`);

    // Total Branches
    const totalBranches = await getQuery(`SELECT COUNT(*) as count FROM branches WHERE status = 'ACTIVE'`);

    // Branch Performance Breakdown
    const branchStats = await allQuery(`
      SELECT b.name as branch_name, b.code as branch_code, COUNT(sh.id) as spin_count
      FROM branches b
      LEFT JOIN spin_history sh ON b.id = sh.branch_id
      GROUP BY b.id
      ORDER BY spin_count DESC
    `);

    // Recent 5 Winners
    const recentWinners = await allQuery(`
      SELECT
        sh.id,
        sh.prize_name_snapshot as prize,
        sh.spin_date,
        b.name as branch_name,
        c.name as customer_name,
        c.email as customer_email,
        i.invoice_number
      FROM spin_history sh
      JOIN branches b ON sh.branch_id = b.id
      JOIN customers c ON sh.customer_id = c.id
      JOIN invoices i ON sh.invoice_id = i.id
      ORDER BY sh.spin_date DESC
      LIMIT 5
    `);

    return res.json({
      stats: {
        todaysReviews: todaysReviews.count || 0,
        todaysSpins: todaysSpins.count || 0,
        todaysWinners: todaysWinners.count || 0,
        totalReviews: totalReviews.count || 0,
        totalWinners: totalWinners.count || 0,
        totalInvoices: totalInvoices.count || 0,
        totalBranches: totalBranches.count || 0
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
