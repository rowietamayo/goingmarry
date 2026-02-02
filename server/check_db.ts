
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function check() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  const columns = await db.all('PRAGMA table_info(sellers)');
  console.log(JSON.stringify(columns, null, 2));
}

check();
