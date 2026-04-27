import { db } from '../client';
import { flashcardSets, flashcards } from '../schema';
import { eq, and } from 'drizzle-orm';
import type { FlashcardSet, NewFlashcardSet } from '../schema';

/**
 * Get all sets for a user
 */
export async function getSetsByUser(userId: number): Promise<FlashcardSet[]> {
	try {
		const results = await db
			.select()
			.from(flashcardSets)
			.where(eq(flashcardSets.userId, userId));
		return results;
	} catch (error) {
		console.error('Error fetching sets by user:', error);
		throw error;
	}
}

/**
 * Get a specific set by ID with user ownership verification
 */
export async function getSetById(setId: number, userId: number): Promise<FlashcardSet | undefined> {
	try {
		const results = await db
			.select()
			.from(flashcardSets)
			.where(and(eq(flashcardSets.id, setId), eq(flashcardSets.userId, userId)));
		return results[0];
	} catch (error) {
		console.error('Error fetching set by ID:', error);
		throw error;
	}
}

/**
 * Create a new set
 */
export async function createSet(
	userId: number,
	name: string,
	description?: string
): Promise<FlashcardSet> {
	try {
		const result = await db
			.insert(flashcardSets)
			.values({
				userId,
				name,
				description: description || null
			})
			.returning();
		return result[0];
	} catch (error) {
		console.error('Error creating set:', error);
		throw error;
	}
}

/**
 * Update a set with user ownership verification
 */
export async function updateSet(
	setId: number,
	userId: number,
	name: string,
	description?: string
): Promise<FlashcardSet | undefined> {
	try {
		// Verify ownership first
		const existing = await getSetById(setId, userId);
		if (!existing) {
			return undefined;
		}

		const result = await db
			.update(flashcardSets)
			.set({
				name,
				description: description ?? existing.description
			})
			.where(and(eq(flashcardSets.id, setId), eq(flashcardSets.userId, userId)))
			.returning();
		return result[0];
	} catch (error) {
		console.error('Error updating set:', error);
		throw error;
	}
}

/**
 * Delete a set and its associated cards (CASCADE delete handled by schema)
 */
export async function deleteSet(setId: number, userId: number): Promise<boolean> {
	try {
		// Verify ownership first
		const existing = await getSetById(setId, userId);
		if (!existing) {
			return false;
		}

		// Delete will cascade to flashcards due to schema definition
		const result = await db
			.delete(flashcardSets)
			.where(and(eq(flashcardSets.id, setId), eq(flashcardSets.userId, userId)));
		return true;
	} catch (error) {
		console.error('Error deleting set:', error);
		throw error;
	}
}

/**
 * Get card count for a set
 */
export async function getCardCountForSet(setId: number): Promise<number> {
	try {
		const result = await db
			.select({ count: flashcards.id })
			.from(flashcards)
			.where(eq(flashcards.setId, setId));
		return result.length;
	} catch (error) {
		console.error('Error fetching card count:', error);
		throw error;
	}
}
