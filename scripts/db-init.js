#!/usr/bin/env node

/**
 * Database Initialization Script
 * Initializes SQLite database and seeds default data
 */

import sqlite3 from 'sqlite3';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'fastmem.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new sqlite3.Database(dbPath);

// Hash password (for demo purposes)
function hashPassword(password) {
	return createHash('sha256').update(password).digest('hex');
}

try {
	// Create tables
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS flashcard_sets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS flashcards (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			set_id INTEGER NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
			question TEXT NOT NULL,
			answer TEXT NOT NULL,
			position INTEGER NOT NULL DEFAULT 0,
			remembered INTEGER NOT NULL DEFAULT 0,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_id ON flashcard_sets(user_id);
		CREATE INDEX IF NOT EXISTS idx_flashcards_set_id ON flashcards(set_id);
	`);

	// Check if default user exists
	const userCount = db
		.prepare('SELECT COUNT(*) as count FROM users')
		.get();

	if (userCount.count === 0) {
		// Insert default user
		const now = Date.now();
		const passwordHash = hashPassword('user');

		db.prepare(`
			INSERT INTO users (username, password_hash, created_at, updated_at)
			VALUES (?, ?, ?, ?)
		`).run('user', passwordHash, now, now);

		console.log('✓ Database initialized at:', dbPath);
		console.log('✓ Default user created:');
		console.log('  Username: user');
		console.log('  Password: user');
	} else {
		console.log('✓ Database already initialized at:', dbPath);
		const userCount = db
			.prepare('SELECT COUNT(*) as count FROM users')
			.get();
		console.log('  Users:', userCount.count);
	}

	// Show table info
	const setCount = db
		.prepare('SELECT COUNT(*) as count FROM flashcard_sets')
		.get();
	const cardCount = db
		.prepare('SELECT COUNT(*) as count FROM flashcards')
		.get();

	console.log('  Sets:', setCount.count);
	console.log('  Cards:', cardCount.count);

	db.close();
	process.exit(0);
} catch (error) {
	console.error('✗ Database initialization failed:');
	console.error(error.message);
	db.close();
	process.exit(1);
}
