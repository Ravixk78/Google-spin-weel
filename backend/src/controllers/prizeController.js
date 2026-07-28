const { getQuery, allQuery, runQuery } = require('../db');
const { logAudit } = require('../middleware/authMiddleware');

// Get all spin prizes (admin & customer)
const getPrizes = async (req, res) => {
  try {
    const prizes = await allQuery(`SELECT * FROM spin_prizes ORDER BY display_order ASC, id ASC`);
    res.json({ prizes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch spin prizes.' });
  }
};

// Admin: Create new prize
const createPrize = async (req, res) => {
  try {
    const { name, description, weight, stock_quantity, display_order, color_code, is_active, image_url } = req.body;

    if (!name || weight === undefined) {
      return res.status(400).json({ error: 'Prize name and weight are required.' });
    }

    const result = await runQuery(`
      INSERT INTO spin_prizes (name, description, weight, stock_quantity, display_order, color_code, is_active, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      description || '',
      Number(weight) || 1,
      Number(stock_quantity) || 0,
      Number(display_order) || 1,
      color_code || '#D4AF37',
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      image_url || null
    ]);

    await logAudit(req.admin.id, 'CREATE_PRIZE', 'PRIZE', result.id, { name, weight, stock_quantity }, req.ip);

    const created = await getQuery(`SELECT * FROM spin_prizes WHERE id = ?`, [result.id]);
    return res.status(201).json({ message: 'Prize created successfully', prize: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create prize.' });
  }
};

// Admin: Update Prize
const updatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, weight, stock_quantity, display_order, color_code, is_active, image_url } = req.body;

    const prize = await getQuery(`SELECT * FROM spin_prizes WHERE id = ?`, [id]);
    if (!prize) {
      return res.status(404).json({ error: 'Prize not found.' });
    }

    await runQuery(`
      UPDATE spin_prizes
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          weight = COALESCE(?, weight),
          stock_quantity = COALESCE(?, stock_quantity),
          display_order = COALESCE(?, display_order),
          color_code = COALESCE(?, color_code),
          is_active = COALESCE(?, is_active),
          image_url = COALESCE(?, image_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, weight, stock_quantity, display_order, color_code, is_active, image_url, id]);

    // Record stock change if stock updated
    if (stock_quantity !== undefined && Number(stock_quantity) !== Number(prize.stock_quantity)) {
      const diff = Number(stock_quantity) - Number(prize.stock_quantity);
      await runQuery(`
        INSERT INTO prize_inventory (prize_id, action, quantity, reason, created_by)
        VALUES (?, ?, ?, 'Admin Stock Adjustment', ?)
      `, [id, diff >= 0 ? 'RESTOCK' : 'DEDUCT', Math.abs(diff), req.admin.email]);
    }

    await logAudit(req.admin.id, 'UPDATE_PRIZE', 'PRIZE', id, { name, weight, stock_quantity }, req.ip);

    const updated = await getQuery(`SELECT * FROM spin_prizes WHERE id = ?`, [id]);
    return res.json({ message: 'Prize updated successfully', prize: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update prize.' });
  }
};

// Admin: Delete Prize
const deletePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const prize = await getQuery(`SELECT * FROM spin_prizes WHERE id = ?`, [id]);
    if (!prize) {
      return res.status(404).json({ error: 'Prize not found.' });
    }

    await runQuery(`DELETE FROM spin_prizes WHERE id = ?`, [id]);
    await logAudit(req.admin.id, 'DELETE_PRIZE', 'PRIZE', id, { name: prize.name }, req.ip);

    return res.json({ message: 'Prize deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete prize.' });
  }
};

module.exports = {
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize
};
