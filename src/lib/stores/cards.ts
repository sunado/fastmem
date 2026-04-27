import { writable } from 'svelte/store';
import { apiGet, apiPost, apiPut, apiDelete } from '$lib/utils/api';
import type { Flashcard } from '$lib/db/schema';

interface CardsStoreState {
	cards: Flashcard[];
	currentSetId: number | null;
	loading: boolean;
	error: string | null;
}

/**
 * Create cards store for managing flashcards in a study session
 */
function createCardsStore() {
	const initialState: CardsStoreState = {
		cards: [],
		currentSetId: null,
		loading: false,
		error: null
	};

	const { subscribe, set, update } = writable<CardsStoreState>(initialState);

	/**
	 * Get session from localStorage
	 */
	function getSession() {
		if (typeof window === 'undefined') return null;
		const stored = localStorage.getItem('fastmem_session');
		if (!stored) return null;
		try {
			return JSON.parse(stored);
		} catch {
			return null;
		}
	}

	/**
	 * Create Authorization header from session
	 */
	function getAuthHeader() {
		const session = getSession();
		if (!session) return {};
		try {
			const sessionStr = JSON.stringify(session);
			const encoded = Buffer.from(sessionStr).toString('base64');
			return { Authorization: `Bearer ${encoded}` };
		} catch {
			return {};
		}
	}

	return {
		subscribe,

		/**
		 * Fetch cards for a specific set
		 */
		async fetchCards(setId: number): Promise<void> {
			update((state) => ({ ...state, loading: true, error: null, currentSetId: setId }));

			try {
				const response = await apiGet<{ success: boolean; setId: number; cards: Flashcard[] }>(
					`/api/cards?setId=${setId}`,
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					const cards = response.data.cards || [];
					update((state) => ({
						...state,
						cards,
						currentSetId: setId,
						loading: false,
						error: null
					}));
				} else {
					update((state) => ({
						...state,
						loading: false,
						error: response.error || 'Failed to fetch cards'
					}));
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to fetch cards';
				update((state) => ({
					...state,
					loading: false,
					error: message
				}));
			}
		},

		/**
		 * Create a new card in a set
		 */
		async createCard(setId: number, question: string, answer: string): Promise<Flashcard | null> {
			update((state) => ({ ...state, error: null }));

			try {
				const response = await apiPost<{ success: boolean; card: Flashcard }>(
					'/api/cards',
					{ setId, question, answer },
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					const newCard = response.data.card;
					update((state) => ({
						...state,
						cards: [...state.cards, newCard]
					}));
					return newCard;
				} else {
					update((state) => ({
						...state,
						error: response.error || 'Failed to create card'
					}));
					return null;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to create card';
				update((state) => ({
					...state,
					error: message
				}));
				return null;
			}
		},

		/**
		 * Update a card
		 */
		async updateCard(
			cardId: number,
			setId: number,
			question: string,
			answer: string
		): Promise<Flashcard | null> {
			update((state) => ({ ...state, error: null }));

			try {
				const response = await apiPut<{ success: boolean; card: Flashcard }>(
					`/api/cards/${cardId}`,
					{ setId, question, answer },
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					const updatedCard = response.data.card;
					update((state) => ({
						...state,
						cards: state.cards.map((c) => (c.id === cardId ? updatedCard : c))
					}));
					return updatedCard;
				} else {
					update((state) => ({
						...state,
						error: response.error || 'Failed to update card'
					}));
					return null;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to update card';
				update((state) => ({
					...state,
					error: message
				}));
				return null;
			}
		},

		/**
		 * Delete a card from a set
		 */
		async deleteCard(cardId: number, setId: number): Promise<boolean> {
			update((state) => ({ ...state, error: null }));

			try {
				const response = await apiDelete<{ success: boolean; cards: Flashcard[] }>(
					`/api/cards/${cardId}?setId=${setId}`,
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					// Update cards list to the returned list (already reordered on server)
					const cards = response.data.cards || [];
					update((state) => ({
						...state,
						cards
					}));
					return true;
				} else {
					update((state) => ({
						...state,
						error: response.error || 'Failed to delete card'
					}));
					return false;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to delete card';
				update((state) => ({
					...state,
					error: message
				}));
				return false;
			}
		},

		/**
		 * Update review status (remembered) for a card
		 */
		async updateReviewStatus(cardId: number, setId: number, remembered: boolean): Promise<Flashcard | null> {
			update((state) => ({ ...state, error: null }));

			try {
				const response = await apiPut<{ success: boolean; card: Flashcard }>(
					`/api/cards/${cardId}`,
					{ setId, remembered },
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					const updatedCard = response.data.card;
					update((state) => ({
						...state,
						cards: state.cards.map((c) => (c.id === cardId ? updatedCard : c))
					}));
					return updatedCard;
				} else {
					return null;
				}
			} catch (error) {
				return null;
			}
		},

		/**
		 * Clear the cards store (e.g., when leaving study view)
		 */
		clearCards(): void {
			set({
				cards: [],
				currentSetId: null,
				loading: false,
				error: null
			});
		}
	};
}

export const cardsStore = createCardsStore();
