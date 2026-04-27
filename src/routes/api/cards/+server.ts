import { json, type RequestHandler } from '@sveltejs/kit';
import {
	getCardsBySet,
	createCard
} from '$lib/db/queries/cards';
import { getSetById } from '$lib/db/queries/sets';
import { createErrorResponse, createSuccessResponse } from '$lib/utils/errorHandler';

/**
 * Extract session from request locals or headers
 */
function getSessionFromRequest(request: Request, locals: App.Locals): { userId: number } | null {
	// Check if session is in locals (populated by hooks.server.ts)
	if (locals.session?.userId) {
		return { userId: locals.session.userId };
	}

	// Fallback: check for Authorization header with session data
	const authHeader = request.headers.get('Authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		try {
			const sessionStr = Buffer.from(authHeader.slice(7), 'base64').toString();
			const session = JSON.parse(sessionStr);
			if (session.userId) {
				return { userId: session.userId };
			}
		} catch (error) {
			// Invalid session format, continue
		}
	}

	return null;
}

/**
 * GET /api/cards?setId=[id] - Get cards for a set, ordered by position, verify user owns set
 */
export const GET: RequestHandler = async ({ request, locals, url }) => {
	try {
		const session = getSessionFromRequest(request, locals);
		if (!session) {
			return json(
				createErrorResponse('Unauthorized', 401),
				{ status: 401 }
			);
		}

		const setIdParam = url.searchParams.get('setId');
		if (!setIdParam) {
			return json(
				createErrorResponse('setId query parameter is required', 400),
				{ status: 400 }
			);
		}

		const setId = parseInt(setIdParam, 10);
		if (isNaN(setId)) {
			return json(
				createErrorResponse('setId must be a valid integer', 400),
				{ status: 400 }
			);
		}

		// Verify user owns the set
		const set = await getSetById(setId, session.userId);
		if (!set) {
			return json(
				createErrorResponse('Set not found or you do not have permission', 404),
				{ status: 404 }
			);
		}

		// Get cards for the set
		const cards = await getCardsBySet(setId);

		return json(
			createSuccessResponse({
				success: true,
				setId,
				cards
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching cards:', error);
		return json(
			createErrorResponse('Failed to fetch cards', 500),
			{ status: 500 }
		);
	}
};

/**
 * POST /api/cards - Create new card in a set
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const session = getSessionFromRequest(request, locals);
		if (!session) {
			return json(
				createErrorResponse('Unauthorized', 401),
				{ status: 401 }
			);
		}

		const body = await request.json().catch(() => ({}));
		const { setId, question, answer } = body as { setId?: number; question?: string; answer?: string };

		// Validate inputs
		if (!setId || typeof setId !== 'number') {
			return json(
				createErrorResponse('setId is required and must be a number', 400),
				{ status: 400 }
			);
		}

		if (!question || typeof question !== 'string' || question.trim().length === 0) {
			return json(
				createErrorResponse('Question is required and must be a non-empty string', 400),
				{ status: 400 }
			);
		}

		if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
			return json(
				createErrorResponse('Answer is required and must be a non-empty string', 400),
				{ status: 400 }
			);
		}

		// Verify user owns the set
		const set = await getSetById(setId, session.userId);
		if (!set) {
			return json(
				createErrorResponse('Set not found or you do not have permission', 404),
				{ status: 404 }
			);
		}

		// Create the card
		const card = await createCard(setId, question.trim(), answer.trim());

		return json(
			createSuccessResponse({
				success: true,
				card
			}),
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating card:', error);
		return json(
			createErrorResponse('Failed to create card', 500),
			{ status: 500 }
		);
	}
};
