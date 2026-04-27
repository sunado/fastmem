import { db } from './client';
import { users, flashcardSets, flashcards } from './schema';
import { createHash } from 'crypto';

/**
 * Hash a password using SHA256
 * Note: This is for demo purposes. In production, use bcrypt or Argon2.
 */
function hashPassword(password: string): string {
	return createHash('sha256').update(password).digest('hex');
}

/**
 * Initialize database tables and seed default data
 */
export async function initializeDatabase(): Promise<void> {
	try {
		// Create tables if they don't exist
		const schema = `
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
		`;

		// Execute schema creation
		const statements = schema.split(';').filter((s) => s.trim());
		for (const statement of statements) {
			if (statement.trim()) {
				db.run(statement);
			}
		}

		// Check if default user exists
		const existingUser = db
			.select()
			.from(users)
			.where(new Promise((resolve) => resolve(true)))
			.get();

		if (!existingUser) {
			// Seed default user
			const now = new Date();
			const passwordHash = hashPassword('user');

			db.insert(users).values({
				username: 'user',
				passwordHash,
				createdAt: now,
				updatedAt: now
			});

			console.log('✓ Database initialized with default user (username: "user", password: "user")');
		} else {
			console.log('✓ Database already initialized');
		}
	} catch (error) {
		console.error('Failed to initialize database:', error);
		throw error;
	}
}

export default initializeDatabase;
