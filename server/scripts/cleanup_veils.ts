
import { initDb } from '../db';

const cleanup = async () => {
  try {
    console.log('Initializing database connection...');
    const db = await initDb();

    console.log('Searching for "Lace Veil" products...');
    const products = await db.all('SELECT * FROM products WHERE name LIKE "%Lace Veil%" OR name LIKE "%lace veil%"');

    console.log(`Found ${products.length} products.`);
    products.forEach((p: any) => console.log(`- ${p.id}: ${p.name} (Seller: ${p.seller})`));

    if (products.length > 0) {
      console.log('Deleting...');
      await db.run('DELETE FROM products WHERE name LIKE "%Lace Veil%" OR name LIKE "%lace veil%"');
      console.log(`Successfully deleted ${products.length} products.`);
    } else {
        console.log('No products found to delete.');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

cleanup();
