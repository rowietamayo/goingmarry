
import { db, initDb } from '../db';

async function checkBoutiqueNames() {
    await initDb();

    // Get products and join with sellers to compare stored 'seller' name vs actual 'boutiqueName'
    const query = `
        SELECT
            p.id as product_id,
            p.name as product_name,
            p.seller as product_seller_label,
            s.name as seller_personal_name,
            s.boutiqueName as seller_boutique_name
        FROM products p
        JOIN sellers s ON p.sellerId = s.id
        LIMIT 10;
    `;

    const results = await db.all(query);
    console.table(results);
    process.exit(0);
}

checkBoutiqueNames();
