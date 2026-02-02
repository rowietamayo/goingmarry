
import { db, initDb } from '../db';

async function checkImages() {
    await initDb();
    const products = await db.all('SELECT id, name, imageUrl FROM products LIMIT 5');
    console.log(products);
    process.exit(0);
}

checkImages();
