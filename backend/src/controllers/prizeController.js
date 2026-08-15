const { getQuery, allQuery, runQuery } = require('../db');
const { logAudit } = require('../middleware/authMiddleware');

// Get all spin prizes (admin & customer)
const getPrizes = async (req, res) => {
  try {
    const prizes = await allQuery(`SELECT * FROM spin_prizes ORDER BY display_order ASC, id ASC`);
    res.json({ prizes });
  } catch (err) {
    console.error('Fetch prizes error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch spin prizes.' });
  }
};

// Admin: Create new prize
const createPrize = async (req, res) => {
  try {
    const { name, description, weight, stock_quantity, display_order, color_code, is_active, image_url } = req.body;

    if (!name || weight === undefined) {
      return res.status(400).json({ error: 'Prize name and weight are required.' });
    }

    const weightVal = !isNaN(Number(weight)) ? Number(weight) : 1;
    const stockVal = !isNaN(Number(stock_quantity)) ? Number(stock_quantity) : 0;
    const orderVal = !isNaN(Number(display_order)) ? Number(display_order) : 1;
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;

    const result = await runQuery(`
      INSERT INTO spin_prizes (name, description, weight, stock_quantity, display_order, color_code, is_active, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      description || '',
      weightVal,
      stockVal,
      orderVal,
      color_code || '#D4AF37',
      activeVal,
      image_url || null
    ]);

    await logAudit(req.admin?.id || null, 'CREATE_PRIZE', 'PRIZE', result.id, { name, weight: weightVal, stock_quantity: stockVal }, req.ip);

    const created = await getQuery(`SELECT * FROM spin_prizes WHERE id = ?`, [result.id]);
    return res.status(201).json({ message: 'Prize created successfully', prize: created });
  } catch (err) {
    console.error('Create prize error:', err);
    res.status(500).json({ error: err.message || 'Failed to create prize.' });
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

    const nameVal = name !== undefined ? name : prize.name;
    const descVal = description !== undefined ? description : prize.description;
    const weightVal = (weight !== undefined && !isNaN(Number(weight))) ? Number(weight) : prize.weight;
    const stockVal = (stock_quantity !== undefined && !isNaN(Number(stock_quantity))) ? Number(stock_quantity) : prize.stock_quantity;
    const orderVal = (display_order !== undefined && !isNaN(Number(display_order))) ? Number(display_order) : prize.display_order;
    const colorVal = color_code !== undefined ? color_code : prize.color_code;
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : prize.is_active;
    const imageVal = image_url !== undefined ? image_url : prize.image_url;

    await runQuery(`
      UPDATE spin_prizes
      SET name = ?,
          description = ?,
          weight = ?,
          stock_quantity = ?,
          display_order = ?,
          color_code = ?,
          is_active = ?,
          image_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      nameVal,
      descVal,
      weightVal,
      stockVal,
      orderVal,
      colorVal,
      activeVal,
      imageVal,
      id
    ]);

    // Record stock change if stock updated
    if (stock_quantity !== undefined && !isNaN(Number(stock_quantity)) && Number(stock_quantity) !== Number(prize.stock_quantity)) {
      const diff = Number(stock_quantity) - Number(prize.stock_quantity);
      const adminEmail = req.admin?.email || 'admin@majlisaloud.ae';
      await runQuery(`
        INSERT INTO prize_inventory (prize_id, action, quantity, reason, created_by)
        VALUES (?, ?, ?, 'Admin Stock Adjustment', ?)
      `, [id, diff >= 0 ? 'RESTOCK' : 'DEDUCT', Math.abs(diff), adminEmail]);
    }

    await logAudit(req.admin?.id || null, 'UPDATE_PRIZE', 'PRIZE', id, { name: nameVal, weight: weightVal, stock_quantity: stockVal }, req.ip);

    const updated = await getQuery(`SELECT * FROM spin_prizes WHERE id = ?`, [id]);
    return res.json({ message: 'Prize updated successfully', prize: updated });
  } catch (err) {
    console.error('Update prize error:', err);
    res.status(500).json({ error: err.message || 'Failed to update prize.' });
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
    await logAudit(req.admin?.id || null, 'DELETE_PRIZE', 'PRIZE', id, { name: prize.name }, req.ip);

    return res.json({ message: 'Prize deleted successfully.' });
  } catch (err) {
    console.error('Delete prize error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete prize.' });
  }
};

module.exports = {
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize
};
