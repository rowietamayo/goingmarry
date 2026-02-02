
import 'dotenv/config';
import { Pool } from 'pg';

// Configuration
const LOCAL_DB_URL = 'postgres://postgres:091617@localhost:5432/goingmarry';
const RENDER_DB_URL = process.argv[2] || process.env.RENDER_EXTERNAL_URL;

if (!RENDER_DB_URL) {
    console.error('❌ Error: Render External Database URL is missing.');
    console.log('\nPlease run the command like this:');
    console.log('npx ts-node scripts/sync_pg_to_render.ts "PASTE_YOUR_EXTERNAL_URL_HERE"');
    process.exit(1);
}

async function migrate() {
    console.log('🚀 Starting Local -> Render Migration...');

    const localPool = new Pool({ connectionString: LOCAL_DB_URL });
    const renderPool = new Pool({
        connectionString: RENDER_DB_URL,
        ssl: {
            rejectUnauthorized: false // Required for Render's self-signed certificates in some environments
        }
    });

    try {
        // 1. Test connections
        await localPool.query('SELECT 1');
        console.log('✅ Connected to Local Postgres');
        await renderPool.query('SELECT 1');
        console.log('✅ Connected to Render Postgres');

        // 2. Setup Tables
        console.log('🏗️ Setting up tables on Render...');
        await renderPool.query(`
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
                price INTEGER,
                category TEXT,
                condition TEXT,
                imageUrl TEXT,
                seller TEXT,
                sellerId TEXT,
                createdAt BIGINT,
                isSold INTEGER DEFAULT 0,
                quantity INTEGER DEFAULT 1,
                notes TEXT
            );
        `);

        // 3. Clear Render tables (Optional, but ensures fresh sync)
        console.log('🧹 Cleaning Render tables...');
        await renderPool.query('DELETE FROM products');
        await renderPool.query('DELETE FROM sellers');

        // 3. Migrate Sellers
        console.log('👥 Migrating Sellers...');
        const sellersResult = await localPool.query('SELECT * FROM sellers');
        for (const seller of sellersResult.rows) {
            await renderPool.query(
                `INSERT INTO sellers (id, name, email, boutiqueName, password, isAdmin)
                 VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
                [seller.id, seller.name, seller.email, seller.boutiquename, seller.password, seller.isadmin]
            );
        }
        console.log(`✅ ${sellersResult.rows.length} sellers migrated.`);

        // 4. Migrate Products
        console.log('👗 Migrating Products...');
        const productsResult = await localPool.query('SELECT * FROM products');
        for (const product of productsResult.rows) {
            await renderPool.query(
                `INSERT INTO products (id, name, description, price, category, condition, imageUrl, seller, sellerId, createdAt, isSold, quantity, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING`,
                [
                    product.id,
                    product.name,
                    product.description,
                    product.price,
                    product.category,
                    product.condition,
                    product.imageurl,
                    product.seller,
                    product.sellerid,
                    product.createdat,
                    product.issold,
                    product.quantity,
                    product.notes
                ]
            );
        }
        console.log(`✅ ${productsResult.rows.length} products migrated.`);

        console.log('\n✨ Migration Complete! Your Render database is now up to date.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await localPool.end();
        await renderPool.end();
    }
}

migrate();
