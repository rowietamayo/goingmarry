import { db, initDb } from '../db';

async function addIndexes() {
  try {
    console.log('Connecting to database...');
    await initDb();

    console.log('Adding indexes...');

    // Index for sorting products by creation date
    await db.query('CREATE INDEX IF NOT EXISTS idx_products_createdat ON products (createdAt DESC)');
    console.log('✓ Created idx_products_createdat');

    // Index for filtering products by seller
    await db.query('CREATE INDEX IF NOT EXISTS idx_products_sellerid ON products (sellerId)');
    console.log('✓ Created idx_products_sellerid');

    // Index for duplicate checks and searching by name
    await db.query('CREATE INDEX IF NOT EXISTS idx_products_name ON products (name)');
    console.log('✓ Created idx_products_name');

    // Index for seller identity
    await db.query('CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers (email)');
    console.log('✓ Created idx_sellers_email');

    console.log('Database optimization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Optimization failed:', err);
    process.exit(1);
  }
}

addIndexes();
