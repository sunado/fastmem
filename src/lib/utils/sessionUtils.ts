import type { Session } from '../stores/session';

/**
 * Validate session from localStorage
 * Returns session data if valid, null otherwise
 */
export function validateSessionFromStorage(): Session | null {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const stored = localStorage.getItem('fastmem_session');
		if (!stored) {
			return null;
		}

		const session = JSON.parse(stored) as Session;

		// Validate session structure
		if (
			typeof session.userId === 'number' &&
			typeof session.username === 'string' &&
			typeof session.isAuthenticated === 'boolean' &&
			session.isAuthenticated === true &&
			session.userId > 0 &&
			session.username.length > 0
		) {
			return session;
		}

		return null;
	} catch (error) {
		console.error('Session validation error:', error);
		return null;
	}
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	const session = validateSessionFromStorage();
	return session !== null && session.isAuthenticated;
}

/**
 * Get current user ID from session
 */
export function getCurrentUserId(): number | null {
	const session = validateSessionFromStorage();
	return session?.userId ?? null;
}

/**
 * Get current username from session
 */
export function getCurrentUsername(): string | null {
	const session = validateSessionFromStorage();
	return session?.username ?? null;
}

/**
 * Clear session from storage
 */
export function clearSessionStorage(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('fastmem_session');
	}
}

/**
 * Clear session and optionally redirect
 * Clears both localStorage and session store
 */
export function clearSession(redirect = false): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('fastmem_session');
		
		if (redirect) {
			window.location.href = '/';
		}
	}
}
