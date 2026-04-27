import type { ErrorResponse, SuccessResponse } from './errorHandler';
import { createErrorResponse, createSuccessResponse } from './errorHandler';

/**
 * Unified API response type
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Fetch wrapper with standardized error handling
 */
export async function apiFetch<T = unknown>(
	url: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		});

		const data = await response.json();

		if (!response.ok) {
			return (
				data ||
				createErrorResponse(
					`HTTP ${response.status}: ${response.statusText}`,
					response.status
				)
			);
		}

		return createSuccessResponse(data, response.status);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch';
		return createErrorResponse(message, 500);
	}
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(
	url: string,
	body: unknown,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, {
		...options,
		method: 'POST',
		body: JSON.stringify(body)
	});
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(
	url: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, {
		...options,
		method: 'GET'
	});
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(
	url: string,
	body: unknown,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, {
		...options,
		method: 'PUT',
		body: JSON.stringify(body)
	});
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(
	url: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, {
		...options,
		method: 'DELETE'
	});
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = unknown>(
	url: string,
	body: unknown,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	return apiFetch<T>(url, {
		...options,
		method: 'PATCH',
		body: JSON.stringify(body)
	});
}

export default {
	apiFetch,
	apiPost,
	apiGet,
	apiPut,
	apiDelete,
	apiPatch
};
