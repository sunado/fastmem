import { db } from '../client';
import { flashcards } from '../schema';
import { eq, and } from 'drizzle-orm';
import type { Flashcard, NewFlashcard } from '../schema';

/**
 * Get all cards for a set, ordered by position
 */
export async function getCardsBySet(setId: number): Promise<Flashcard[]> {
	try {
		const results = await db
			.select()
			.from(flashcards)
			.where(eq(flashcards.setId, setId))
			.orderBy(flashcards.position);
		return results;
	} catch (error) {
		console.error('Error fetching cards by set:', error);
		throw error;
	}
}

/**
 * Get a specific card by ID with set ownership verification
 */
export async function getCardById(cardId: number, setId: number): Promise<Flashcard | undefined> {
	try {
		const results = await db
			.select()
			.from(flashcards)
			.where(and(eq(flashcards.id, cardId), eq(flashcards.setId, setId)));
		return results[0];
	} catch (error) {
		console.error('Error fetching card by ID:', error);
		throw error;
	}
}

/**
 * Create a new card in a set with auto-assigned position
 */
export async function createCard(
	setId: number,
	question: string,
	answer: string
): Promise<Flashcard> {
	try {
		// Get the next position
		const maxPositionResult = await db
			.select({ maxPos: flashcards.position })
			.from(flashcards)
			.where(eq(flashcards.setId, setId));
		
		const nextPosition = maxPositionResult.length > 0 
			? Math.max(...maxPositionResult.map(r => r.maxPos || 0)) + 1 
			: 0;

		const result = await db
			.insert(flashcards)
			.values({
				setId,
				question,
				answer,
				position: nextPosition,
				remembered: false
			})
			.returning();
		return result[0];
	} catch (error) {
		console.error('Error creating card:', error);
		throw error;
	}
}

/**
 * Update a card with set ownership verification
 */
export async function updateCard(
	cardId: number,
	setId: number,
	question: string,
	answer: string
): Promise<Flashcard | undefined> {
	try {
		// Verify card exists in this set
		const existing = await getCardById(cardId, setId);
		if (!existing) {
			return undefined;
		}

		const result = await db
			.update(flashcards)
			.set({
				question,
				answer
			})
			.where(and(eq(flashcards.id, cardId), eq(flashcards.setId, setId)))
			.returning();
		return result[0];
	} catch (error) {
		console.error('Error updating card:', error);
		throw error;
	}
}

/**
 * Delete a card from a set and reorder remaining cards
 */
export async function deleteCard(cardId: number, setId: number): Promise<boolean> {
	try {
		// Verify card exists in this set
		const existing = await getCardById(cardId, setId);
		if (!existing) {
			return false;
		}

		const position = existing.position;

		// Delete the card
		await db
			.delete(flashcards)
			.where(and(eq(flashcards.id, cardId), eq(flashcards.setId, setId)));

		// Reorder cards after the deleted position
		const cardsToReorder = await db
			.select()
			.from(flashcards)
			.where(and(eq(flashcards.setId, setId)))
			.orderBy(flashcards.position);

		// Update positions to be sequential
		for (let i = 0; i < cardsToReorder.length; i++) {
			if (cardsToReorder[i].position !== i) {
				await db
					.update(flashcards)
					.set({ position: i })
					.where(eq(flashcards.id, cardsToReorder[i].id));
			}
		}

		return true;
	} catch (error) {
		console.error('Error deleting card:', error);
		throw error;
	}
}

/**
 * Update review status (remembered) for a card
 */
export async function updateReviewStatus(
	cardId: number,
	setId: number,
	remembered: boolean
): Promise<Flashcard | undefined> {
	try {
		// Verify card exists in this set
		const existing = await getCardById(cardId, setId);
		if (!existing) {
			return undefined;
		}

		const result = await db
			.update(flashcards)
			.set({ remembered })
			.where(and(eq(flashcards.id, cardId), eq(flashcards.setId, setId)))
			.returning();
		return result[0];
	} catch (error) {
		console.error('Error updating review status:', error);
		throw error;
	}
}
