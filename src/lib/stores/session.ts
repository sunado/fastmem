import { writable } from 'svelte/store';

export interface Session {
	userId: number;
	username: string;
	isAuthenticated: boolean;
	created_at?: string;
	current_set_id?: number | null;
	current_card_index?: number;
	reviewed_count?: number;
}

/**
 * Session store - manages user session state
 * Persists to localStorage as 'fastmem_session'
 */
function createSessionStore() {
	const initialSession: Session = {
		userId: 0,
		username: '',
		isAuthenticated: false,
		created_at: undefined,
		current_set_id: null,
		current_card_index: 0,
		reviewed_count: 0
	};

	const { subscribe, set, update } = writable<Session>(initialSession);

	// Load session from localStorage if available
	function hydrate(): void {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('fastmem_session');
			if (stored) {
				try {
					const session = JSON.parse(stored);
					set(session);
				} catch (error) {
					console.error('Failed to hydrate session:', error);
				}
			}
		}
	}

	function login(userId: number, username: string, sessionData?: Partial<Session>): void {
		const session: Session = {
			userId,
			username,
			isAuthenticated: true,
			created_at: sessionData?.created_at ?? new Date().toISOString(),
			current_set_id: sessionData?.current_set_id ?? null,
			current_card_index: sessionData?.current_card_index ?? 0,
			reviewed_count: sessionData?.reviewed_count ?? 0
		};
		set(session);

		if (typeof window !== 'undefined') {
			localStorage.setItem('fastmem_session', JSON.stringify(session));
		}
	}

	function setSession(sessionData: Session): void {
		set(sessionData);

		if (typeof window !== 'undefined') {
			localStorage.setItem('fastmem_session', JSON.stringify(sessionData));
		}
	}

	function logout(): void {
		set(initialSession);

		if (typeof window !== 'undefined') {
			localStorage.removeItem('fastmem_session');
		}
	}

	return {
		subscribe,
		login,
		logout,
		hydrate,
		setSession
	};
}

export const session = createSessionStore();
