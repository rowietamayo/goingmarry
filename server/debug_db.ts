
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

(async () => {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log('--- Users (Sellers) ---');
        const sellers = await db.all('SELECT id, name, email FROM sellers');
        console.table(sellers);

        console.log('\n--- Products ---');
        const products = await db.all('SELECT id, name, seller, sellerId FROM products');
        console.table(products);

    } catch (error) {
        console.error('Error debugging DB:', error);
    }
})();
