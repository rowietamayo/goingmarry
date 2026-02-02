
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

(async () => {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log('Migrating database: Adding isAdmin to sellers table...');

        try {
            await db.run('ALTER TABLE sellers ADD COLUMN isAdmin INTEGER DEFAULT 0');
            console.log('SUCCESS: isAdmin column added.');
        } catch (e: any) {
            if (e.message.includes('duplicate column name')) {
                console.log('INFO: isAdmin column already exists.');
            } else {
                throw e;
            }
        }

    } catch (error) {
        console.error('Error migrating DB:', error);
    }
})();
