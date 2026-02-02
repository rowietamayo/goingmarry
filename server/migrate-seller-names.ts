/**
 * One-time migration script to sync all existing products with current boutique names
 * This updates the 'seller' field in products to match the current 'boutiqueName' from sellers table
 */

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function migrateProductSellerNames() {
    console.log('Starting migration: Syncing product seller names with boutique names...\n');

    try {
        // Open database connection
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        // Get all sellers
        const sellers = await db.all('SELECT id, boutiqueName FROM sellers');
        console.log(`Found ${sellers.length} sellers to process\n`);

        let totalUpdated = 0;

        // Update products for each seller
        for (const seller of sellers) {
            const result = await db.run(
                'UPDATE products SET seller = ? WHERE sellerId = ?',
                [seller.boutiqueName, seller.id]
            );

            if (result.changes && result.changes > 0) {
                console.log(`✓ Updated ${result.changes} product(s) for seller: ${seller.boutiqueName}`);
                totalUpdated += result.changes;
            }
        }

        console.log(`\n✅ Migration complete! Updated ${totalUpdated} total products.`);

        await db.close();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
migrateProductSellerNames();
