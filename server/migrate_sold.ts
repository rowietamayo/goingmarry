import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function migrate() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Adding isSold column to products table...');

  try {
    await db.exec(`
      ALTER TABLE products ADD COLUMN isSold INTEGER DEFAULT 0;
    `);
    console.log('Migration complete!');
  } catch (error: any) {
    if (error.message.includes('duplicate column name')) {
      console.log('Column already exists, skipping migration.');
    } else {
      throw error;
    }
  }
}

migrate();
