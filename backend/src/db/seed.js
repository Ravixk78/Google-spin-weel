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

    // 3. Seed 10 Spin Prizes matching the exact design image with exact pastel color hex codes
    const defaultPrizes = [
      {
        name: 'Luxury Travel Set',
        description: 'Luxury travel perfume fragrance set',
        weight: 10,
        stock_quantity: 50,
        display_order: 1,
        color_code: '#FAD0C4'
      },
      {
        name: 'Special Edition Kit',
        description: 'Special edition exclusive fragrance box set',
        weight: 10,
        stock_quantity: 50,
        display_order: 2,
        color_code: '#FBE7C6'
      },
      {
        name: 'Majlis Al Oud Branch',
        description: 'Voucher valid at any Majlis Al Oud branch',
        weight: 15,
        stock_quantity: 100,
        display_order: 3,
        color_code: '#B5EAD7'
      },
      {
        name: 'Luxury Royal Oud Oil',
        description: 'Pure 100% aged royal oud oil attar',
        weight: 5,
        stock_quantity: 30,
        display_order: 4,
        color_code: '#E2F0CB'
      },
      {
        name: 'Majlis Signature Set',
        description: 'Signature luxury oud perfume set',
        weight: 10,
        stock_quantity: 50,
        display_order: 5,
        color_code: '#C7CEEA'
      },
      {
        name: 'Amber & Oud Bukhoor',
        description: 'Premium amber and natural oud incense bakhoor',
        weight: 15,
        stock_quantity: 100,
        display_order: 6,
        color_code: '#FFDAC1'
      },
      {
        name: 'Majlis Al Oud Perfume',
        description: 'Iconic Majlis Al Oud spray perfume',
        weight: 10,
        stock_quantity: 80,
        display_order: 7,
        color_code: '#E8DFF5'
      },
      {
        name: 'Dehn El Oud Car Oil',
        description: 'Luxury car fragrance oil diffuser',
        weight: 20,
        stock_quantity: 150,
        display_order: 8,
        color_code: '#FCE1E4'
      },
      {
        name: 'Exclusive Oud Incense',
        description: 'Exclusive agarwood incense sticks pack',
        weight: 20,
        stock_quantity: 150,
        display_order: 9,
        color_code: '#FCF6BD'
      },
      {
        name: 'Majlis Gift Card',
        description: 'Store gift shopping card voucher',
        weight: 25,
        stock_quantity: 200,
        display_order: 10,
        color_code: '#D0F4DE'
      }
    ];

    // Sync / Upsert 10 Spin Prizes with exact design names and pastel colors
    for (const p of defaultPrizes) {
      const existing = await getQuery(`SELECT id FROM spin_prizes WHERE display_order = ?`, [p.display_order]);
      if (existing) {
        await runQuery(`
          UPDATE spin_prizes
          SET name = ?, description = ?, weight = ?, stock_quantity = ?, color_code = ?, is_active = 1
          WHERE id = ?
        `, [p.name, p.description, p.weight, p.stock_quantity, p.color_code, existing.id]);
      } else {
        await runQuery(`
          INSERT INTO spin_prizes (name, description, weight, stock_quantity, display_order, color_code, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [p.name, p.description, p.weight, p.stock_quantity, p.display_order, p.color_code]);
      }
    }

    // Deactivate any extra legacy prizes beyond 10
    await runQuery(`UPDATE spin_prizes SET is_active = 0 WHERE display_order > 10`);

    console.log('✔ Successfully synced 10 Spin Prizes with weighted probabilities and pastel colors.');

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
