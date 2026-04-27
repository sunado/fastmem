import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserByUsername, verifyPassword } from '$lib/db/queries/users';
import { createErrorResponse, createSuccessResponse, validateRequired } from '$lib/utils/errorHandler';

interface LoginRequest {
	username: string;
	password: string;
}

interface LoginResponse {
	success: boolean;
	user?: {
		id: number;
		username: string;
	};
	session?: {
		userId: number;
		username: string;
		isAuthenticated: boolean;
		created_at: string;
		current_set_id: null;
		current_card_index: number;
		reviewed_count: number;
	};
	error?: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse request body
		const body = await request.json().catch(() => ({}));

		// Validate required fields
		const validation = validateRequired(body, ['username', 'password']);
		if (!validation.valid) {
			return json(validation.error, { status: 400 });
		}

		const { username, password } = body as LoginRequest;

		// Validate input is non-empty
		if (typeof username !== 'string' || username.trim() === '') {
			return json(
				createErrorResponse('Username must be a non-empty string', 400),
				{ status: 400 }
			);
		}

		if (typeof password !== 'string' || password.trim() === '') {
			return json(
				createErrorResponse('Password must be a non-empty string', 400),
				{ status: 400 }
			);
		}

		// Get user by username
		const user = await getUserByUsername(username.trim());
		if (!user) {
			return json(
				createErrorResponse('Invalid username or password', 401),
				{ status: 401 }
			);
		}

		// Verify password
		const isPasswordValid = await verifyPassword(username.trim(), password);
		if (!isPasswordValid) {
			return json(
				createErrorResponse('Invalid username or password', 401),
				{ status: 401 }
			);
		}

		// Create session
		const session = {
			userId: user.id,
			username: user.username,
			isAuthenticated: true,
			created_at: new Date().toISOString(),
			current_set_id: null,
			current_card_index: 0,
			reviewed_count: 0
		};

		const response: LoginResponse = {
			success: true,
			user: {
				id: user.id,
				username: user.username
			},
			session
		};

		return json(createSuccessResponse(response), { status: 200 });
	} catch (error) {
		console.error('Login error:', error);
		return json(
			createErrorResponse('Internal server error', 500),
			{ status: 500 }
		);
	}
};
