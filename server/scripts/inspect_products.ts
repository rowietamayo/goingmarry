
import { db, initDb } from '../db';

async function inspectProducts() {
    await initDb();
    const products = await db.all('SELECT id, name, seller, imageUrl FROM products LIMIT 2');
    console.log(products);
    process.exit(0);
}

inspectProducts();
