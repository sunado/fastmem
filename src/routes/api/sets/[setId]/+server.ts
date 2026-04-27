import { json, type RequestHandler } from '@sveltejs/kit';
import {
	getSetById,
	updateSet,
	deleteSet,
	getCardCountForSet
} from '$lib/db/queries/sets';
import { createErrorResponse, createSuccessResponse } from '$lib/utils/errorHandler';
import type { FlashcardSet } from '$lib/db/schema';

interface SetResponse extends FlashcardSet {
	card_count: number;
}

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
 * PUT /api/sets/[setId] - Update set name/description
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

		const setId = parseInt(params.setId, 10);
		if (isNaN(setId)) {
			return json(
				createErrorResponse('Invalid set ID', 400),
				{ status: 400 }
			);
		}

		const body = await request.json().catch(() => ({}));
		const { name, description } = body as { name?: string; description?: string };

		// Validate that at least one field is provided
		if (!name && !description) {
			return json(
				createErrorResponse('Either name or description must be provided', 400),
				{ status: 400 }
			);
		}

		// Validate name if provided
		if (name !== undefined) {
			if (typeof name !== 'string' || name.trim().length === 0) {
				return json(
					createErrorResponse('Name must be a non-empty string', 400),
					{ status: 400 }
				);
			}
			if (name.trim().length < 1 || name.trim().length > 100) {
				return json(
					createErrorResponse('Name must be between 1 and 100 characters', 400),
					{ status: 400 }
				);
			}
		}

		// Validate description if provided
		if (description !== undefined) {
			if (typeof description !== 'string') {
				return json(
					createErrorResponse('Description must be a string', 400),
					{ status: 400 }
				);
			}
			if (description.length > 500) {
				return json(
					createErrorResponse('Description must not exceed 500 characters', 400),
					{ status: 400 }
				);
			}
		}

		// Get existing set to verify ownership
		const existing = await getSetById(setId, session.userId);
		if (!existing) {
			return json(
				createErrorResponse('Set not found or unauthorized', 403),
				{ status: 403 }
			);
		}

		// Update set
		const updatedSet = await updateSet(
			setId,
			session.userId,
			name?.trim() ?? existing.name,
			description?.trim() ?? existing.description ?? undefined
		);

		if (!updatedSet) {
			return json(
				createErrorResponse('Set not found or unauthorized', 403),
				{ status: 403 }
			);
		}

		const cardCount = await getCardCountForSet(setId);
		const response: SetResponse = {
			...updatedSet,
			card_count: cardCount
		};

		return json(
			createSuccessResponse({
				success: true,
				set: response
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating set:', error);
		return json(
			createErrorResponse('Failed to update set', 500),
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/sets/[setId] - Delete set and associated cards
 */
export const DELETE: RequestHandler = async ({ request, locals, params }) => {
	try {
		const session = getSessionFromRequest(request, locals);
		if (!session) {
			return json(
				createErrorResponse('Unauthorized', 401),
				{ status: 401 }
			);
		}

		const setId = parseInt(params.setId, 10);
		if (isNaN(setId)) {
			return json(
				createErrorResponse('Invalid set ID', 400),
				{ status: 400 }
			);
		}

		// Verify ownership
		const existing = await getSetById(setId, session.userId);
		if (!existing) {
			return json(
				createErrorResponse('Set not found or unauthorized', 403),
				{ status: 403 }
			);
		}

		// Delete set and associated cards (CASCADE)
		const deleted = await deleteSet(setId, session.userId);
		if (!deleted) {
			return json(
				createErrorResponse('Set not found or unauthorized', 403),
				{ status: 403 }
			);
		}

		return json(
			createSuccessResponse({
				success: true,
				message: 'Set deleted'
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting set:', error);
		return json(
			createErrorResponse('Failed to delete set', 500),
			{ status: 500 }
		);
	}
};
