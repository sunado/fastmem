/**
 * Standard error response structure
 */
export interface ErrorResponse {
	success: false;
	error: string;
	statusCode: number;
	details?: Record<string, unknown>;
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> {
	success: true;
	data: T;
	statusCode?: number;
}

/**
 * Error codes and their corresponding HTTP status codes
 */
export const ERROR_CODES = {
	UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
	FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
	NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
	BAD_REQUEST: { code: 'BAD_REQUEST', status: 400 },
	CONFLICT: { code: 'CONFLICT', status: 409 },
	INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', status: 500 },
	VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 422 }
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
	message: string,
	statusCode: number = 500,
	details?: Record<string, unknown>
): ErrorResponse {
	return {
		success: false,
		error: message,
		statusCode,
		...(details && { details })
	};
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, statusCode: number = 200): SuccessResponse<T> {
	return {
		success: true,
		data,
		statusCode
	};
}

/**
 * Handle and log errors with proper status codes
 */
export function handleError(error: unknown): ErrorResponse {
	console.error('Error:', error);

	if (error instanceof Error) {
		return createErrorResponse(error.message, 500);
	}

	if (typeof error === 'string') {
		return createErrorResponse(error, 500);
	}

	return createErrorResponse('An unexpected error occurred', 500);
}

/**
 * Validate required fields in request data
 */
export function validateRequired(
	data: Record<string, unknown>,
	requiredFields: string[]
): { valid: boolean; error?: ErrorResponse } {
	const missing = requiredFields.filter((field) => !data[field]);

	if (missing.length > 0) {
		return {
			valid: false,
			error: createErrorResponse('Missing required fields', 400, {
				missing
			})
		};
	}

	return { valid: true };
}

/**
 * Assert authentication - throw error if not authenticated
 */
export function assertAuthenticated(userId: number | null): asserts userId is number {
	if (!userId || userId <= 0) {
		throw createErrorResponse('Unauthorized', 401);
	}
}

export default {
	createErrorResponse,
	createSuccessResponse,
	handleError,
	validateRequired,
	assertAuthenticated,
	ERROR_CODES
};
