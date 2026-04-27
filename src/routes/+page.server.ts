import { redirect, fail } from '@sveltejs/kit';
import { apiPost } from '$lib/utils/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to dashboard
	if (locals.session?.isAuthenticated) {
		throw redirect(302, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		if (request.method !== 'POST') {
			return fail(405, { error: 'Method not allowed' });
		}

		try {
			const formData = await request.formData();
			const username = formData.get('username');
			const password = formData.get('password');

			// Validate input
			if (!username || !password) {
				return fail(400, { error: 'Username and password are required' });
			}

			// Call login API
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					password
				})
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				return fail(response.status || 401, {
					error: data.error || 'Login failed'
				});
			}

			// Success - session will be set via client-side store
			// Redirect happens on client side
			return {
				success: true,
				user: data.data.user,
				session: data.data.session
			};
		} catch (error) {
			console.error('Login server action error:', error);
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
