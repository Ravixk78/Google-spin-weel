const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper promise wrapper for sqlite queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const initDB = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Admins
        await runQuery(`
          CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'SUPER_ADMIN',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Branches
        await runQuery(`
          CREATE TABLE IF NOT EXISTS branches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            google_review_url TEXT NOT NULL,
            qr_code_token TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'ACTIVE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Customers
        await runQuery(`
          CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            last_ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Invoices
        await runQuery(`
          CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_number TEXT UNIQUE NOT NULL,
            branch_id INTEGER NOT NULL,
            amount REAL DEFAULT 0,
            is_used INTEGER DEFAULT 0,
            used_at DATETIME,
            used_by_customer_id INTEGER,
            expiry_date DATE,
            status TEXT DEFAULT 'ELIGIBLE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (branch_id) REFERENCES branches(id),
            FOREIGN KEY (used_by_customer_id) REFERENCES customers(id)
          )
        `);

        // GoogleReviews
        await runQuery(`
          CREATE TABLE IF NOT EXISTS google_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            invoice_id INTEGER NOT NULL,
            branch_id INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (invoice_id) REFERENCES invoices(id),
            FOREIGN KEY (branch_id) REFERENCES branches(id)
          )
        `);

        // SpinPrizes
        await runQuery(`
          CREATE TABLE IF NOT EXISTS spin_prizes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            weight REAL NOT NULL DEFAULT 10,
            stock_quantity INTEGER NOT NULL DEFAULT 100,
            is_active INTEGER DEFAULT 1,
            display_order INTEGER DEFAULT 1,
            color_code TEXT DEFAULT '#D4AF37',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // SpinHistory
        await runQuery(`
          CREATE TABLE IF NOT EXISTS spin_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            invoice_id INTEGER NOT NULL,
            branch_id INTEGER NOT NULL,
            prize_id INTEGER NOT NULL,
            prize_name_snapshot TEXT NOT NULL,
            review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            spin_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            qr_code_used TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (invoice_id) REFERENCES invoices(id),
            FOREIGN KEY (branch_id) REFERENCES branches(id),
            FOREIGN KEY (prize_id) REFERENCES spin_prizes(id)
          )
        `);

        // PrizeInventory
        await runQuery(`
          CREATE TABLE IF NOT EXISTS prize_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prize_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            reason TEXT,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prize_id) REFERENCES spin_prizes(id)
          )
        `);

        // AuditLogs
        await runQuery(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // SystemSettings
        await runQuery(`
          CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_name TEXT UNIQUE NOT NULL,
            value_json TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

module.exports = {
  db,
  initDB,
  runQuery,
  getQuery,
  allQuery
};
