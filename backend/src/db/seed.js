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
        google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJmVm0lqD79D4RbLcgY6xDYX0',
        qr_code_token: 'QR-KALBA-2026-TOKEN982'
      },
      {
        code: 'rak',
        name: 'Ras Al Khaimah (RAK) Branch',
        address: 'Al Manama - Ras Al Khaimah Rd, RAK, UAE',
        google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJA0p0hnRx9j4RGy5fCXTv_CE',
        qr_code_token: 'QR-RAK-2026-TOKEN541'
      },
      {
        code: 'sharjah',
        name: 'Halwan Sharjah Branch',
        address: 'Halwan Sub-District, Wasit Street, Sharjah, UAE',
        google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJleir_MxZXz4RkmrCb4dFFzw',
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

    // 3. Seed 10 Spin Prizes with exact required weights (2, 5, 8, 15, 20, 25, 30, 30, 50, 50)
    const defaultPrizes = [
      {
        name: 'Luxury Royal Oud Oil 3ml',
        description: 'Pure 100% aged Cambodian Royal Oud Attar',
        weight: 2,
        stock_quantity: 15,
        display_order: 1,
        color_code: '#D4AF37'
      },
      {
        name: 'Majlis Signature Eau De Parfum 100ml',
        description: 'Our iconic unisex oud EDP luxury bottle',
        weight: 5,
        stock_quantity: 30,
        display_order: 2,
        color_code: '#1E4D45'
      },
      {
        name: 'Amber & Rose Bakhoor Burner Set',
        description: 'Handcrafted incense burner set with premium incense',
        weight: 8,
        stock_quantity: 50,
        display_order: 3,
        color_code: '#AA7C11'
      },
      {
        name: 'AED 100 VIP Shopping Voucher',
        description: 'Voucher valid on any purchase above AED 300',
        weight: 15,
        stock_quantity: 100,
        display_order: 4,
        color_code: '#2D6A5F'
      },
      {
        name: 'Dehn El Oud Car Diffuser',
        description: 'Premium car fragrance clip with royal oud oil refill',
        weight: 20,
        stock_quantity: 150,
        display_order: 5,
        color_code: '#996515'
      },
      {
        name: 'Exclusive Oud Incense Sticks Pack',
        description: '20 luxury scented agarwood incense sticks',
        weight: 25,
        stock_quantity: 200,
        display_order: 6,
        color_code: '#3D8A7C'
      },
      {
        name: 'AED 50 Gift Card',
        description: 'Instant discount voucher for any store branch',
        weight: 30,
        stock_quantity: 250,
        display_order: 7,
        color_code: '#C5A059'
      },
      {
        name: 'Luxury Travel Atomizer Spray',
        description: 'Refillable metallic gold pocket scent atomizer',
        weight: 30,
        stock_quantity: 300,
        display_order: 8,
        color_code: '#123530'
      },
      {
        name: 'Special Edition Fragrance Sample Vial',
        description: '5ml mini spray sample of our newest oud collection',
        weight: 50,
        stock_quantity: 500,
        display_order: 9,
        color_code: '#8E640B'
      },
      {
        name: 'Majlis Al Oud Branded Coffee Set',
        description: 'Collector Arabic coffee cup and scented coaster set',
        weight: 50,
        stock_quantity: 500,
        display_order: 10,
        color_code: '#232830'
      }
    ];

    const prizeCount = await getQuery(`SELECT COUNT(*) as count FROM spin_prizes`);
    if (prizeCount.count === 0) {
      for (const p of defaultPrizes) {
        await runQuery(`
          INSERT INTO spin_prizes (name, description, weight, stock_quantity, display_order, color_code, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [p.name, p.description, p.weight, p.stock_quantity, p.display_order, p.color_code]);
      }
      console.log('✔ Seeded 10 Spin Prizes with weighted probabilities.');
    }

    // 4. Seed Test 4-digit Invoices if needed
    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
