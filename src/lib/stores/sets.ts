import { writable } from 'svelte/store';
import { apiGet, apiPost, apiPut, apiDelete } from '$lib/utils/api';
import type { FlashcardSet } from '$lib/db/schema';

interface SetWithCount extends FlashcardSet {
	card_count: number;
}

interface SetsStoreState {
	sets: SetWithCount[];
	loading: boolean;
	error: string | null;
}

/**
 * Create sets store for managing flashcard sets
 */
function createSetsStore() {
	const initialState: SetsStoreState = {
		sets: [],
		loading: false,
		error: null
	};

	const { subscribe, set, update } = writable<SetsStoreState>(initialState);

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
		 * Fetch all sets for the current user
		 */
		async fetchSets(): Promise<void> {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const response = await apiGet<{ success: boolean; sets: SetWithCount[] }>(
					'/api/sets',
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					const sets = response.data.sets || [];
					update((state) => ({
						...state,
						sets,
						loading: false,
						error: null
					}));
				} else {
					update((state) => ({
						...state,
						loading: false,
						error: response.error || 'Failed to fetch sets'
					}));
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to fetch sets';
				update((state) => ({
					...state,
					loading: false,
					error: message
				}));
			}
		},

		/**
		 * Create a new set
		 */
		async createSet(name: string, description?: string): Promise<SetWithCount | null> {
			update((state) => ({ ...state, error: null }));

			try {
				const response = await apiPost<{ success: boolean; set: SetWithCount }>(
					'/api/sets',
					{ name, description },
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					const newSet = response.data.set;
					update((state) => ({
						...state,
						sets: [...state.sets, newSet]
					}));
					return newSet;
				} else {
					update((state) => ({
						...state,
						error: response.error || 'Failed to create set'
					}));
					return null;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to create set';
				update((state) => ({
					...state,
					error: message
				}));
				return null;
			}
		},

		/**
		 * Update a set
		 */
		async updateSet(
			setId: number,
			name?: string,
			description?: string
		): Promise<SetWithCount | null> {
			update((state) => ({ ...state, error: null }));

			try {
				const response = await apiPut<{ success: boolean; set: SetWithCount }>(
					`/api/sets/${setId}`,
					{ name, description },
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					const updatedSet = response.data.set;
					update((state) => ({
						...state,
						sets: state.sets.map((s) => (s.id === setId ? updatedSet : s))
					}));
					return updatedSet;
				} else {
					update((state) => ({
						...state,
						error: response.error || 'Failed to update set'
					}));
					return null;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to update set';
				update((state) => ({
					...state,
					error: message
				}));
				return null;
			}
		},

		/**
		 * Delete a set
		 */
		async deleteSet(setId: number): Promise<boolean> {
			update((state) => ({ ...state, error: null }));

			try {
				const response = await apiDelete<{ success: boolean; message: string }>(
					`/api/sets/${setId}`,
					{ headers: getAuthHeader() }
				);

				if (response.success) {
					update((state) => ({
						...state,
						sets: state.sets.filter((s) => s.id !== setId)
					}));
					return true;
				} else {
					update((state) => ({
						...state,
						error: response.error || 'Failed to delete set'
					}));
					return false;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to delete set';
				update((state) => ({
					...state,
					error: message
				}));
				return false;
			}
		}
	};
}

export const sets = createSetsStore();
