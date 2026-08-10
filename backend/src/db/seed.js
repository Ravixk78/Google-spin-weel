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

    // 3. Seed 8 Spin Prizes matching the exact design image with exact pastel color hex codes and prize images
    const defaultPrizes = [
      {
        name: 'Romantic Perfume',
        description: 'Romantic luxury spray perfume',
        weight: 12,
        stock_quantity: 50,
        display_order: 1,
        color_code: '#FCE1E4',
        image_url: '/assets/prizes/prize_1.png'
      },
      {
        name: 'مخلط بركة',
        description: 'Makhalat Barakah luxury jar',
        weight: 12,
        stock_quantity: 50,
        display_order: 2,
        color_code: '#FEF08A',
        image_url: '/assets/prizes/prize_2.png'
      },
      {
        name: 'Oud Powder',
        description: 'Oud body powder Majlis Al Oud',
        weight: 13,
        stock_quantity: 60,
        display_order: 3,
        color_code: '#BAE6FD',
        image_url: '/assets/prizes/prize_3.png'
      },
      {
        name: 'Exclusive Oud Incense',
        description: 'Exclusive agarwood incense pack',
        weight: 13,
        stock_quantity: 80,
        display_order: 4,
        color_code: '#FECDD3',
        image_url: '/assets/prizes/prize_4.png'
      },
      {
        name: 'Musk Lavender',
        description: 'Musk lavender perfume attar oil',
        weight: 12,
        stock_quantity: 50,
        display_order: 5,
        color_code: '#A7F3D0',
        image_url: '/assets/prizes/prize_5.png'
      },
      {
        name: 'Pearl Ajmal',
        description: 'Pearl Ajmal luxury fragrance',
        weight: 12,
        stock_quantity: 50,
        display_order: 6,
        color_code: '#C6F6D5',
        image_url: '/assets/prizes/prize_6.png'
      },
      {
        name: 'Musk Al Gharam',
        description: 'Musk Al Gharam perfume spray',
        weight: 13,
        stock_quantity: 70,
        display_order: 7,
        color_code: '#E0F2FE',
        image_url: '/assets/prizes/prize_7.png'
      },
      {
        name: 'Kalemat Oud',
        description: 'Kalemat royal oud fragrance',
        weight: 13,
        stock_quantity: 70,
        display_order: 8,
        color_code: '#E8DFF5',
        image_url: '/assets/prizes/prize_8.png'
      }
    ];

    // Sync / Upsert 8 Spin Prizes with exact design names and pastel colors
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

    // Deactivate any extra legacy prizes beyond 8
    await runQuery(`UPDATE spin_prizes SET is_active = 0 WHERE display_order > 8`);

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
