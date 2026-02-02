
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function migrate() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Migrating database...');

  try {
    await db.exec(`ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 1;`);
    console.log('Added quantity column.');
  } catch (e: any) {
    console.log(`quantity column error (may exist): ${e.message}`);
  }

  try {
    await db.exec(`ALTER TABLE products ADD COLUMN notes TEXT;`);
    console.log('Added notes column.');
  } catch (e: any) {
     console.log(`notes column error (may exist): ${e.message}`);
  }

  console.log('Migration complete.');
}

migrate();
