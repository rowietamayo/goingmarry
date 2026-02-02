
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { db, initDb } from '../db';

async function migrate() {
    console.log('Starting migration...');

    // 1. Connect to SQLite
    const sqliteDb = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });
    console.log('Connected to SQLite source.');

    // 2. Connect to Postgres
    await initDb();
    console.log('Connected to Postgres destination.');

    // 3. Migrate Sellers
    const sellers = await sqliteDb.all('SELECT * FROM sellers');
    console.log(`Migrating ${sellers.length} sellers...`);

    for (const seller of sellers) {
        // SQLite uses 0/1 for booleans often, but we check if isAdmin exists
        const isAdminVal = seller.isAdmin ? true : false;

        // Check if exists (idempotency)
        const exists = await db.get('SELECT id FROM sellers WHERE id = $1', [seller.id]);
        if (!exists) {
            await db.query(
                `INSERT INTO sellers (id, name, email, boutiqueName, password, isAdmin)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [seller.id, seller.name, seller.email, seller.boutiqueName, seller.password, isAdminVal]
            );
        }
    }
    console.log('Sellers migrated.');

    // 4. Migrate Products
    const products = await sqliteDb.all('SELECT * FROM products');
    console.log(`Migrating ${products.length} products...`);

    for (const product of products) {
        const exists = await db.get('SELECT id FROM products WHERE id = $1', [product.id]);
        if (!exists) {
            await db.query(
                `INSERT INTO products (id, name, description, price, category, condition, imageUrl, seller, sellerId, createdAt, isSold, quantity, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    product.id,
                    product.name,
                    product.description,
                    product.price,
                    product.category,
                    product.condition,
                    product.imageUrl,
                    product.seller,
                    product.sellerId,
                    BigInt(product.createdAt), // Ensure BigInt
                    product.isSold,
                    product.quantity || 1,
                    product.notes
                ]
            );
        }
    }
    console.log('Products migrated.');

    console.log('Migration complete!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
