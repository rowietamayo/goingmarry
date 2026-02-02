
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function createDatabase() {
    // Connect to default 'postgres' database to create new db
    const connectionString = process.env.DATABASE_URL?.replace('/goingmarry', '/postgres');

    const client = new Client({
        connectionString: connectionString
    });

    try {
        await client.connect();
        console.log('Connected to default postgres database.');

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'goingmarry'");
        if (res.rowCount === 0) {
            console.log('Database goingmarry does not exist. Creating...');
            await client.query('CREATE DATABASE goingmarry');
            console.log('Database goingmarry created.');
        } else {
            console.log('Database goingmarry already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
