import { json, type RequestHandler } from '@sveltejs/kit';
import {
	getSetsByUser,
	getSetById,
	createSet,
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
	// Format: Authorization: Bearer <base64-encoded-session-json>
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
 * Enrich sets with card count
 */
async function enrichWithCardCounts(sets: FlashcardSet[]): Promise<SetResponse[]> {
	const enriched: SetResponse[] = [];
	for (const set of sets) {
		const count = await getCardCountForSet(set.id);
		enriched.push({
			...set,
			card_count: count
		});
	}
	return enriched;
}

/**
 * GET /api/sets - Get all sets for authenticated user with card counts
 */
export const GET: RequestHandler = async ({ request, locals }) => {
	try {
		const session = getSessionFromRequest(request, locals);
		if (!session) {
			return json(
				createErrorResponse('Unauthorized', 401),
				{ status: 401 }
			);
		}

		const sets = await getSetsByUser(session.userId);
		const enrichedSets = await enrichWithCardCounts(sets);

		return json(
			createSuccessResponse({
				success: true,
				sets: enrichedSets
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching sets:', error);
		return json(
			createErrorResponse('Failed to fetch sets', 500),
			{ status: 500 }
		);
	}
};

/**
 * POST /api/sets - Create new set
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

		// Validate input
		const { name, description } = body as { name?: string; description?: string };

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return json(
				createErrorResponse('Name is required and must be a non-empty string', 400),
				{ status: 400 }
			);
		}

		if (name.trim().length < 1 || name.trim().length > 100) {
			return json(
				createErrorResponse('Name must be between 1 and 100 characters', 400),
				{ status: 400 }
			);
		}

		if (description && typeof description !== 'string') {
			return json(
				createErrorResponse('Description must be a string', 400),
				{ status: 400 }
			);
		}

		if (description && description.length > 500) {
			return json(
				createErrorResponse('Description must not exceed 500 characters', 400),
				{ status: 400 }
			);
		}

		const set = await createSet(session.userId, name.trim(), description?.trim());
		const enriched = await enrichWithCardCounts([set]);

		return json(
			createSuccessResponse({
				success: true,
				set: enriched[0]
			}),
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating set:', error);
		return json(
			createErrorResponse('Failed to create set', 500),
			{ status: 500 }
		);
	}
};
