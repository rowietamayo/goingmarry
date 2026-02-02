import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Type parsers to ensure BigInts (like timestamps) are returned as numbers
import { types } from 'pg';
types.setTypeParser(20, (val) => parseInt(val, 10));

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),

    // Wrapper for SQLite 'get' (returns single row)
    get: async (text: string, params?: any[]) => {
        const res = await pool.query(text, params);
        return res.rows[0];
    },

    // Wrapper for SQLite 'all' (returns all rows)
    all: async (text: string, params?: any[]) => {
        const res = await pool.query(text, params);
        return res.rows;
    },

    // Wrapper for SQLite 'run' (executes and returns lastID/changes)
    run: async (text: string, params?: any[]) => {
        const res = await pool.query(text, params);
        return {
            lastID: null, // PG doesn't return lastID this way usually, requires RETURNING id
            changes: res.rowCount
        };
    },

    exec: async (text: string) => {
        return await pool.query(text);
    }
};

export const initDb = async () => {
    try {
        await pool.query('SELECT NOW()'); // Test connection
        console.log('Connected to PostgreSQL database');
        return db;
    } catch (error) {
        console.error('Failed to connect to database', error);
        throw error;
    }
};
