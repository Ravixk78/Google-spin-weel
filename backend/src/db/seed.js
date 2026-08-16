const bcrypt = require('bcryptjs');
const { initDB, runQuery, getQuery, allQuery } = require('./index');

const seedDatabase = async () => {
  try {
    console.log('Initializing database schema...');
    await initDB();

    // 1. Seed Super Admin
    const existingAdmin = await getQuery(`SELECT * FROM admins WHERE email = ?`, ['admin@majlisaloud.ae']);
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin@123456', 10);
      await runQuery(`
        INSERT INTO admins (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, ['Majlis Super Admin', 'admin@majlisaloud.ae', passwordHash, 'SUPER_ADMIN']);
      console.log('✔ Super Admin created: admin@majlisaloud.ae / Admin@123456');
    }

    // 2. Seed Branches (Kalba, RAK, Sharjah)
    const branches = [
      {
        code: 'kalba',
        name: 'Kalba Branch',
        address: 'Al Corniche Road, Kalba, Sharjah, UAE',
        google_review_url: 'https://www.google.com/search?q=Majlis+al+oud+perfumes+Kalba#lrd=0x3ef4fba036b45999:0x7d6143ac6320b799,3,',
        qr_code_token: 'QR-KALBA-2026-TOKEN982'
      },
      {
        code: 'rak',
        name: 'Ras Al Khaimah (RAK) Branch',
        address: 'Al Manama - Ras Al Khaimah Rd, RAK, UAE',
        google_review_url: 'https://www.google.com/search?q=Majlis+al+oud+perfumes+RAK#lrd=0x3ef6713486344a03:0x25fcef74095f2e18,3,',
        qr_code_token: 'QR-RAK-2026-TOKEN541'
      },
      {
        code: 'sharjah',
        name: 'Halwan Sharjah Branch',
        address: 'Halwan Sub-District, Wasit Street, Sharjah, UAE',
        google_review_url: 'https://www.google.com/search?q=Majlis+al+oud+Perfumes+halwan#lrd=0x3e5f598cfc8be895:0x3c1745876fc25a92,3,',
        qr_code_token: 'QR-SHARJAH-2026-TOKEN773'
      }
    ];

    for (const b of branches) {
      const exists = await getQuery(`SELECT * FROM branches WHERE code = ?`, [b.code]);
      if (!exists) {
        await runQuery(`
          INSERT INTO branches (code, name, address, google_review_url, qr_code_token, status)
          VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        `, [b.code, b.name, b.address, b.google_review_url, b.qr_code_token]);
        console.log(`✔ Branch seeded: ${b.name}`);
      }
    }

    // Get branch IDs
    const kalbaBranch = await getQuery(`SELECT id FROM branches WHERE code = 'kalba'`);
    const rakBranch = await getQuery(`SELECT id FROM branches WHERE code = 'rak'`);
    const sharjahBranch = await getQuery(`SELECT id FROM branches WHERE code = 'sharjah'`);

    // Clean up old legacy test prizes if present in DB
    await runQuery(`DELETE FROM spin_prizes WHERE name IN (
      'Majlis Signature Eau De Parfum 100ml',
      'Amber & Rose Bakhoor Burner Set',
      'AED 100 VIP Shopping Voucher',
      'Dehn El Oud Car Diffuser',
      'Exclusive Oud Incense Sticks Pack',
      'AED 50 Gift Card',
      'Luxury Travel Atomizer Spray',
      'Special Edition Fragrance Sample Vial',
      'Luxury Royal Oud Oil 3ml',
      'Majlis Al Oud Branded Coffee Set'
    )`);

    // 3. Seed 8 Spin Prizes matching the exact 8 custom wedge design graphics
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

    // If prizes table is empty or only legacy items were deleted, seed defaults
    const currentCount = await getQuery(`SELECT COUNT(*) as count FROM spin_prizes`);
    if (!currentCount || currentCount.count === 0) {
      for (const p of defaultPrizes) {
        await runQuery(`
          INSERT INTO spin_prizes (name, description, weight, stock_quantity, display_order, color_code, image_url, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [p.name, p.description, p.weight, p.stock_quantity, p.display_order, p.color_code, p.image_url]);
      }
    } else {
      // Sync defaults by display_order 1..8 if existing
      for (const p of defaultPrizes) {
        const existing = await getQuery(`SELECT id FROM spin_prizes WHERE display_order = ?`, [p.display_order]);
        if (existing) {
          await runQuery(`
            UPDATE spin_prizes
            SET name = ?, description = ?, weight = ?, stock_quantity = ?, color_code = ?, image_url = ?, is_active = 1
            WHERE id = ?
          `, [p.name, p.description, p.weight, p.stock_quantity, p.color_code, p.image_url, existing.id]);
        } else {
          await runQuery(`
            INSERT INTO spin_prizes (name, description, weight, stock_quantity, display_order, color_code, image_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
          `, [p.name, p.description, p.weight, p.stock_quantity, p.display_order, p.color_code, p.image_url]);
        }
      }
    }

    console.log('✔ Successfully synced 8 Spin Prizes with weighted probabilities and custom prize assets.');

    // 4. Seed Test 4-digit Invoices if needed
    console.log('🎉 Database seeding complete!');
    return true;
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDatabase };
