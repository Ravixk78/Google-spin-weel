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

// Admin: Reset to default 8 template prizes
const resetDefaultPrizes = async (req, res) => {
  try {
    const defaultPrizes = [
      {
        name: 'ST Oud Perfume',
        description: 'ST Royal luxury oud perfume set',
        weight: 12,
        stock_quantity: 50,
        display_order: 1,
        color_code: '#F5E5D3',
        image_url: '/assets/prizes/prize_1.png'
      },
      {
        name: 'Burmaluxe Oud',
        description: 'Burmaluxe royal agarwood fragrance',
        weight: 12,
        stock_quantity: 50,
        display_order: 2,
        color_code: '#2D1E18',
        image_url: '/assets/prizes/prize_2.png'
      },
      {
        name: 'Thara Beauty Cream',
        description: 'Thara luxury beauty cream jar',
        weight: 13,
        stock_quantity: 60,
        display_order: 3,
        color_code: '#FFD54F',
        image_url: '/assets/prizes/prize_3.png'
      },
      {
        name: 'Oud Powder',
        description: 'Oud body powder Majlis Al Oud',
        weight: 13,
        stock_quantity: 80,
        display_order: 4,
        color_code: '#FDD835',
        image_url: '/assets/prizes/prize_4.png'
      },
      {
        name: 'Fakhar Gold',
        description: 'Fakhar Gold Eau De Parfum',
        weight: 12,
        stock_quantity: 50,
        display_order: 5,
        color_code: '#FFF8E1',
        image_url: '/assets/prizes/prize_5.png'
      },
      {
        name: 'Pearl Beauty',
        description: 'Pearl Beauty luxury red fragrance',
        weight: 12,
        stock_quantity: 50,
        display_order: 6,
        color_code: '#E53935',
        image_url: '/assets/prizes/prize_6.png'
      },
      {
        name: 'Musk Lavender',
        description: 'Musk lavender perfume attar oil set',
        weight: 13,
        stock_quantity: 70,
        display_order: 7,
        color_code: '#9C27B0',
        image_url: '/assets/prizes/prize_7.png'
      },
      {
        name: 'Exclusive Oud Incense',
        description: 'Exclusive agarwood incense sticks pack',
        weight: 13,
        stock_quantity: 70,
        display_order: 8,
        color_code: '#4E342E',
        image_url: '/assets/prizes/prize_8.png'
      }
    ];

    await runQuery(`DELETE FROM spin_prizes`);

    for (const p of defaultPrizes) {
      await runQuery(`
        INSERT INTO spin_prizes (name, description, weight, stock_quantity, display_order, color_code, image_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [p.name, p.description, p.weight, p.stock_quantity, p.display_order, p.color_code, p.image_url]);
    }

    await logAudit(req.admin?.id || null, 'RESET_PRIZES', 'PRIZE', 'ALL', { count: 8 }, req.ip);

    const prizes = await allQuery(`SELECT * FROM spin_prizes ORDER BY display_order ASC, id ASC`);
    return res.json({ message: 'Successfully reset to the 8 template spin wheel prizes.', prizes });
  } catch (err) {
    console.error('Reset prizes error:', err);
    res.status(500).json({ error: err.message || 'Failed to reset default prizes.' });
  }
};

module.exports = {
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize,
  resetDefaultPrizes
};
