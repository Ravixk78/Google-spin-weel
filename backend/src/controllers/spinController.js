const { getQuery, allQuery, runQuery } = require('../db');
const { selectWeightedPrize } = require('../services/weightedRandom');

const executeCustomerSpin = async (req, res) => {
  try {
    const { customer_id, invoice_number, branch_id, qr_code } = req.body;
    const userIp = req.ip || '127.0.0.1';

    if (!customer_id || !invoice_number || !branch_id) {
      return res.status(400).json({ error: 'Customer ID, invoice number, and branch ID are required.' });
    }

    const cleanInvoice = invoice_number.trim().toUpperCase();

    // 1. Verify Customer
    const customer = await getQuery(`SELECT * FROM customers WHERE id = ?`, [customer_id]);
    if (!customer) {
      return res.status(404).json({ error: 'Authenticated customer profile not found.' });
    }

    // 2. Verify Branch
    const branch = await getQuery(`SELECT * FROM branches WHERE id = ? AND status = 'ACTIVE'`, [branch_id]);
    if (!branch) {
      return res.status(404).json({ error: 'Valid branch not found.' });
    }

    // 3. Verify Invoice Integrity
    let invoice = await getQuery(`
      SELECT * FROM invoices WHERE UPPER(invoice_number) = ? AND branch_id = ?
    `, [cleanInvoice, branch_id]);

    if (!invoice) {
      // Flexible lookup: check if invoice exists for this invoice number under any branch
      invoice = await getQuery(`
        SELECT * FROM invoices WHERE UPPER(invoice_number) = ? ORDER BY id DESC LIMIT 1
      `, [cleanInvoice]);

      if (invoice) {
        // Re-assign branch_id if unused
        if (invoice.is_used === 0) {
          await runQuery(`UPDATE invoices SET branch_id = ? WHERE id = ?`, [branch_id, invoice.id]);
          invoice.branch_id = branch_id;
        }
      } else {
        try {
          await runQuery(`
            INSERT INTO invoices (invoice_number, branch_id, amount, is_used, status)
            VALUES (?, ?, 0, 0, 'ELIGIBLE')
          `, [cleanInvoice, branch_id]);
        } catch (insertErr) {
          // Ignore duplicate insert errors if created concurrently
        }

        invoice = await getQuery(`
          SELECT * FROM invoices WHERE UPPER(invoice_number) = ? AND branch_id = ?
        `, [cleanInvoice, branch_id]);
      }
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found or does not belong to this branch.' });
    }

    if (invoice.is_used === 1) {
      return res.status(400).json({ error: 'This invoice has already been used for a review reward spin.' });
    }

    if (invoice.status !== 'ELIGIBLE') {
      return res.status(400).json({ error: 'This invoice is not eligible for a spin reward.' });
    }

    // 4. Double Spin Check: Ensure this invoice has NO record in spin_history
    const existingSpin = await getQuery(`SELECT id FROM spin_history WHERE invoice_id = ?`, [invoice.id]);
    if (existingSpin) {
      return res.status(400).json({ error: 'Duplicate spin attempt detected for this invoice.' });
    }

    // 5. Fetch all active prizes
    const prizes = await allQuery(`
      SELECT * FROM spin_prizes WHERE is_active = 1 AND stock_quantity > 0 ORDER BY display_order ASC
    `);

    if (!prizes || prizes.length === 0) {
      return res.status(400).json({ error: 'No active rewards currently in stock. Please notify store management.' });
    }

    // 6. Perform Weighted Random Selection
    const selectedPrize = selectWeightedPrize(prizes);

    // Find segment index in display order (for client wheel sync)
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);

    const nowIso = new Date().toISOString();

    // 7. Atomic DB Updates
    // A. Mark Invoice as Used
    await runQuery(`
      UPDATE invoices
      SET is_used = 1, used_at = ?, used_by_customer_id = ?
      WHERE id = ?
    `, [nowIso, customer.id, invoice.id]);

    // B. Decrement Prize Stock
    await runQuery(`
      UPDATE spin_prizes
      SET stock_quantity = stock_quantity - 1
      WHERE id = ?
    `, [selectedPrize.id]);

    // C. Record or Update Google Review
    const existingReview = await getQuery(`SELECT id FROM google_reviews WHERE customer_id = ? AND branch_id = ?`, [customer.id, branch.id]);
    if (!existingReview) {
      await runQuery(`
        INSERT INTO google_reviews (customer_id, invoice_id, branch_id, completed_at, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [customer.id, invoice.id, branch.id, nowIso, userIp, req.headers['user-agent'] || 'Browser']);
    } else {
      await runQuery(`
        UPDATE google_reviews SET invoice_id = COALESCE(?, invoice_id), completed_at = ? WHERE id = ?
      `, [invoice.id, nowIso, existingReview.id]);
    }

    // D. Record Spin History
    const spinResult = await runQuery(`
      INSERT INTO spin_history (customer_id, invoice_id, branch_id, prize_id, prize_name_snapshot, review_date, spin_date, ip_address, qr_code_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer.id,
      invoice.id,
      branch.id,
      selectedPrize.id,
      selectedPrize.name,
      nowIso,
      nowIso,
      userIp,
      qr_code || branch.qr_code_token
    ]);

    // E. Record Inventory Action
    await runQuery(`
      INSERT INTO prize_inventory (prize_id, action, quantity, reason, created_by)
      VALUES (?, 'DEDUCT', 1, ?, ?)
    `, [selectedPrize.id, `Spin Win - Customer ${customer.name} (Invoice: ${invoice.invoice_number})`, 'SYSTEM_SPIN']);

    // 8. Return response
    return res.json({
      success: true,
      message: 'Congratulations! You won a prize.',
      prize: {
        id: selectedPrize.id,
        name: selectedPrize.name,
        description: selectedPrize.description,
        color_code: selectedPrize.color_code,
        image_url: selectedPrize.image_url,
        display_order: selectedPrize.display_order
      },
      prizeIndex: prizeIndex >= 0 ? prizeIndex : 0,
      ticket: {
        spin_id: spinResult.id,
        invoice_number: invoice.invoice_number,
        branch_name: branch.name,
        customer_name: customer.name,
        customer_email: customer.email,
        win_date: nowIso
      }
    });

  } catch (err) {
    console.error('Spin Execution Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process spin reward.' });
  }
};

module.exports = {
  executeCustomerSpin
};
