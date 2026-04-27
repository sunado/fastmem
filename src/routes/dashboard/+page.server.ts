import type { PageServerLoad } from './$types';
import type { FlashcardSet } from '$lib/db/schema';

interface SetWithCount extends FlashcardSet {
	card_count: number;
}

export const load: PageServerLoad = async ({ locals }) => {
	// Note: In a typical setup, we'd validate session here from cookies/locals
	// However, since this MVP uses localStorage for session management,
	// the server doesn't have direct access to the session.
	// Instead, the client-side store will handle authentication and data fetching.
	// The session validation happens via Authorization headers in API calls.

	return {
		sets: [] as SetWithCount[],
		user: null
	};
};
