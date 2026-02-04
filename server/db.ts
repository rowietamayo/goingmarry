import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000, // 10s timeout
    ssl: {
        rejectUnauthorized: false // Required for Neon/Postgres unless CA certs are configured
    }
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
            lastID: null,
            changes: res.rowCount
        };
    },

    exec: async (text: string) => {
        return await pool.query(text);
    }
};

export const initDb = async () => {
    try {
        const start = Date.now();
        // Test the connection with a simple query
        await pool.query('SELECT NOW()');
        console.log(`PostgreSQL database connected successfully in ${Date.now() - start}ms`);
        return db;
    } catch (error: any) {
        console.error('CRITICAL: Failed to initialize database');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        if (error.detail) console.error('Detail:', error.detail);
        throw error;
    }
};
