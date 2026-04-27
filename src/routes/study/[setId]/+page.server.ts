import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const setId = params.setId;

	// Return the setId to the page component
	// Session validation happens via Authorization headers in API calls from the client
	// The client will verify ownership when fetching cards for this set

	return {
		setId,
		setName: 'Flashcard Set' // Will be updated by client-side store
	};
};
