import { json, type RequestHandler } from '@sveltejs/kit';
import {
	getCardById,
	updateCard,
	deleteCard,
	getCardsBySet
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
 * PUT /api/cards/[cardId] - Update card question/answer, verify user ownership
 */
export const PUT: RequestHandler = async ({ request, locals, params }) => {
	try {
		const session = getSessionFromRequest(request, locals);
		if (!session) {
			return json(
				createErrorResponse('Unauthorized', 401),
				{ status: 401 }
			);
		}

		const cardIdParam = params.cardId;
		if (!cardIdParam) {
			return json(
				createErrorResponse('cardId parameter is required', 400),
				{ status: 400 }
			);
		}

		const cardId = parseInt(cardIdParam, 10);
		if (isNaN(cardId)) {
			return json(
				createErrorResponse('cardId must be a valid integer', 400),
				{ status: 400 }
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

		// Update the card
		const updatedCard = await updateCard(cardId, setId, question.trim(), answer.trim());

		if (!updatedCard) {
			return json(
				createErrorResponse('Card not found or you do not have permission', 404),
				{ status: 404 }
			);
		}

		return json(
			createSuccessResponse({
				success: true,
				card: updatedCard
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating card:', error);
		return json(
			createErrorResponse('Failed to update card', 500),
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/cards/[cardId] - Delete card from set, verify user ownership
 */
export const DELETE: RequestHandler = async ({ request, locals, params, url }) => {
	try {
		const session = getSessionFromRequest(request, locals);
		if (!session) {
			return json(
				createErrorResponse('Unauthorized', 401),
				{ status: 401 }
			);
		}

		const cardIdParam = params.cardId;
		if (!cardIdParam) {
			return json(
				createErrorResponse('cardId parameter is required', 400),
				{ status: 400 }
			);
		}

		const cardId = parseInt(cardIdParam, 10);
		if (isNaN(cardId)) {
			return json(
				createErrorResponse('cardId must be a valid integer', 400),
				{ status: 400 }
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

		// Delete the card
		const deleted = await deleteCard(cardId, setId);

		if (!deleted) {
			return json(
				createErrorResponse('Card not found or you do not have permission', 404),
				{ status: 404 }
			);
		}

		// Get updated card list
		const cards = await getCardsBySet(setId);

		return json(
			createSuccessResponse({
				success: true,
				message: 'Card deleted successfully',
				cards
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting card:', error);
		return json(
			createErrorResponse('Failed to delete card', 500),
			{ status: 500 }
		);
	}
};
