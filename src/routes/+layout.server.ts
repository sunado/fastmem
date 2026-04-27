import { redirect } from '@sveltejs/kit';
import { validateSessionFromStorage } from '$lib/utils/sessionUtils';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ route, cookies }) => {
	// Get session from cookies or request headers
	// Note: For client-side localStorage, we rely on client hydration
	// The session store will load from localStorage on the client

	// Check if this is a protected route (anything other than login pages)
	const isProtectedRoute = !route.id?.match(/^\/(login|auth|api)/);

	// If it's a protected route and we're on the server,
	// we can't fully validate since localStorage is client-only
	// The client will handle the redirect if session is invalid
	// For server-side protection, check for cookies if implemented

	return {
		sessionData: null // Will be populated by client-side session store
	};
};
