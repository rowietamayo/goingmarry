import { db, initDb } from './db';

async function setup() {
  try {
    await initDb();

    // PostgreSQL schema
    await db.query(`
      CREATE TABLE IF NOT EXISTS sellers (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        boutiqueName TEXT,
        password TEXT,
        isAdmin BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        price INTEGER, -- Storing in cents or whole units? Assuming compatible with SQLite INTEGER
        category TEXT,
        condition TEXT,
        imageUrl TEXT,
        seller TEXT,
        sellerId TEXT,
        createdAt BIGINT, -- Important for Date.now()
        isSold INTEGER DEFAULT 0,
        quantity INTEGER DEFAULT 1,
        notes TEXT
      );
    `);

    // Add isAdmin column to sellers if it doesn't exist (migration for existing)
    // In PG, easiest way is try/catch or check information_schema, but for now IF NOT EXISTS handles table creation.
    // If table exists but missing column (unlikely for fresh PG), we might need ALTER.
    // Let's assume fresh PG db for now or handle ALTERs if needed.
    // Actually, "migrate_admin.ts" handled adding isAdmin in SQLite.
    // Let's add it consistently.

    // Check if isAdmin exists in sellers
    try {
        await db.query('ALTER TABLE sellers ADD COLUMN isAdmin BOOLEAN DEFAULT FALSE');
    } catch (e: any) {
        // Ignore if column already exists
        if (e.code !== '42701') { // 42701 is duplicate_column
           // console.log('Column isAdmin likely already exists or other error:', e.message);
        }
    }

    console.log('Database setup complete');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();
