
import { db, initDb } from '../db';

async function syncBoutiqueNames() {
    console.log('Syncing product seller labels with boutique names in Postgres...');
    await initDb();

    // Update products.seller with sellers.boutiqueName where they match on sellerId
    // Postgres allows UPDATE with FROM (join)
    const result = await db.query(`
        UPDATE products
        SET seller = sellers.boutiqueName
        FROM sellers
        WHERE products.sellerId = sellers.id
        AND products.seller != sellers.boutiqueName;
    `);

    console.log(`Synced products. Updated ${result.rowCount} rows.`);
    process.exit(0);
}

syncBoutiqueNames();
