/**
 * Validation utilities for forms and inputs
 */

/**
 * Validate username format
 * Requirements: 3-20 alphanumeric characters, underscores allowed
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
	if (!username || username.length < 3) {
		return { valid: false, error: 'Username must be at least 3 characters' };
	}

	if (username.length > 20) {
		return { valid: false, error: 'Username must be at most 20 characters' };
	}

	if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
	}

	return { valid: true };
}

/**
 * Validate password format
 * Requirements: Minimum 4 characters (MVP, can be stricter in production)
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
	if (!password || password.length < 4) {
		return { valid: false, error: 'Password must be at least 4 characters' };
	}

	return { valid: true };
}

/**
 * Validate set name
 * Requirements: 1-100 characters, non-empty
 */
export function validateSetName(name: string): { valid: boolean; error?: string } {
	if (!name || name.trim().length === 0) {
		return { valid: false, error: 'Set name is required' };
	}

	if (name.length > 100) {
		return { valid: false, error: 'Set name must be at most 100 characters' };
	}

	return { valid: true };
}

/**
 * Validate card question
 * Requirements: Non-empty, at least 1 character
 */
export function validateCardQuestion(question: string): { valid: boolean; error?: string } {
	if (!question || question.trim().length === 0) {
		return { valid: false, error: 'Question is required' };
	}

	return { valid: true };
}

/**
 * Validate card answer
 * Requirements: Non-empty, at least 1 character
 */
export function validateCardAnswer(answer: string): { valid: boolean; error?: string } {
	if (!answer || answer.trim().length === 0) {
		return { valid: false, error: 'Answer is required' };
	}

	return { valid: true };
}

/**
 * Validate set description (optional)
 * Requirements: At most 500 characters
 */
export function validateSetDescription(description?: string): { valid: boolean; error?: string } {
	if (!description) {
		return { valid: true };
	}

	if (description.length > 500) {
		return { valid: false, error: 'Description must be at most 500 characters' };
	}

	return { valid: true };
}

/**
 * Validate email format (for future use)
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!email || !emailRegex.test(email)) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	return { valid: true };
}
