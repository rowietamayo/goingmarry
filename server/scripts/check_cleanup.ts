import { db, initDb } from '../db';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800';

async function check() {
    await initDb();
    const products = await db.all('SELECT * FROM products WHERE imageUrl != ?', [DEFAULT_IMAGE]);
    if (products.length === 0) {
        console.log('Verification PASSED: All products have the default image.');
    } else {
        console.log(`Verification FAILED: ${products.length} products still have custom images.`);
        products.forEach((p: any) => console.log(`- ${p.imageUrl}`));
    }
}
check();
