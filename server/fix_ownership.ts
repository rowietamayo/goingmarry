
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

(async () => {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        // Target User: rowimaytamayo (xk17v1spf)
        const TARGET_USER_ID = 'xk17v1spf';
        const TARGET_USER_NAME = 'rowimaytamayo';

        console.log(`Assigning orphan products to ${TARGET_USER_NAME} (${TARGET_USER_ID})...`);

        const result = await db.run(
            'UPDATE products SET sellerId = ?, seller = ? WHERE sellerId IS NULL',
            [TARGET_USER_ID, TARGET_USER_NAME]
        );

        console.log(`Updated ${result.changes} products.`);

    } catch (error) {
        console.error('Error fixing DB:', error);
    }
})();
