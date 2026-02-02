
import bcrypt from 'bcrypt';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const ADMIN_EMAIL = 'admin@goingmarry.com';
const ADMIN_PASSWORD = 'admin'; // Simple password for initial access
const ADMIN_NAME = 'Admin User';
const BOUTIQUE_NAME = 'System Admin';

(async () => {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log(`Setting up Admin account: ${ADMIN_EMAIL}...`);

        // Check if exists
        const existing = await db.get('SELECT * FROM sellers WHERE email = ?', [ADMIN_EMAIL]);

        if (existing) {
            console.log('Admin user exists. Updating permissions...');
            await db.run('UPDATE sellers SET isAdmin = 1 WHERE email = ?', [ADMIN_EMAIL]);
        } else {
            console.log('Creating new Admin user...');
            const id = 'admin_' + Math.random().toString(36).substr(2, 9);
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

            await db.run(
                'INSERT INTO sellers (id, name, email, boutiqueName, password, isAdmin) VALUES (?, ?, ?, ?, ?, 1)',
                [id, ADMIN_NAME, ADMIN_EMAIL, BOUTIQUE_NAME, hashedPassword]
            );
        }

        console.log('--- ADMIN ACCOUNT READY ---');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);

    } catch (error) {
        console.error('Error creating admin:', error);
    }
})();
