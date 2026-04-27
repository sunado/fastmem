import { db } from '../client';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import type { User, NewUser } from '../schema';

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
	try {
		const result = await db.select().from(users).where(eq(users.username, username));
		return result[0];
	} catch (error) {
		console.error('Error fetching user by username:', error);
		throw error;
	}
}

/**
 * Create a new user
 */
export async function createUser(
	username: string,
	passwordHash: string
): Promise<User> {
	try {
		const result = await db.insert(users).values({
			username,
			passwordHash
		}).returning();
		return result[0];
	} catch (error) {
		console.error('Error creating user:', error);
		throw error;
	}
}

/**
 * Verify password for a user (MVP implementation)
 * For MVP: simple string comparison (password === 'user' for username 'user')
 */
export async function verifyPassword(username: string, password: string): Promise<boolean> {
	try {
		const user = await getUserByUsername(username);
		if (!user) {
			return false;
		}

		// MVP implementation: simple comparison
		// In production, this would use proper password hashing (bcrypt, argon2, etc.)
		return password === user.passwordHash;
	} catch (error) {
		console.error('Error verifying password:', error);
		return false;
	}
}
