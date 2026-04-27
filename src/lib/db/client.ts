import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to database file
const dbPath = path.join(process.cwd(), 'data', 'fastmem.db');

// Create or open database
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Initialize Drizzle ORM
export const db = drizzle(sqlite);

export default db;
