/**
 * Logging utility for the application
 * Logs auth events, CRUD operations, and errors with timestamps and severity levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	category: string;
	message: string;
	data?: Record<string, any>;
}

/**
 * Format timestamp in ISO format
 */
function getTimestamp(): string {
	return new Date().toISOString();
}

/**
 * Format log message with timestamp and level
 */
function formatLog(entry: LogEntry): string {
	const { timestamp, level, category, message, data } = entry;
	const dataStr = data ? ` ${JSON.stringify(data)}` : '';
	return `[${timestamp}] ${level.toUpperCase()} [${category}] ${message}${dataStr}`;
}

/**
 * Log a message
 */
function log(level: LogLevel, category: string, message: string, data?: Record<string, any>) {
	const entry: LogEntry = {
		timestamp: getTimestamp(),
		level,
		category,
		message,
		data
	};

	const formatted = formatLog(entry);

	if (typeof window !== 'undefined') {
		// Client-side logging
		switch (level) {
			case 'debug':
				console.debug(formatted);
				break;
			case 'info':
				console.info(formatted);
				break;
			case 'warn':
				console.warn(formatted);
				break;
			case 'error':
				console.error(formatted);
				break;
		}
	} else {
		// Server-side logging
		console.log(formatted);
	}
}

/**
 * Logger instance with category-specific methods
 */
class Logger {
	private category: string;

	constructor(category: string) {
		this.category = category;
	}

	debug(message: string, data?: Record<string, any>) {
		log('debug', this.category, message, data);
	}

	info(message: string, data?: Record<string, any>) {
		log('info', this.category, message, data);
	}

	warn(message: string, data?: Record<string, any>) {
		log('warn', this.category, message, data);
	}

	error(message: string, data?: Record<string, any>) {
		log('error', this.category, message, data);
	}
}

/**
 * Create a logger instance for a specific category
 */
export function createLogger(category: string): Logger {
	return new Logger(category);
}

/**
 * Pre-configured loggers for common categories
 */
export const loggers = {
	auth: new Logger('AUTH'),
	db: new Logger('DATABASE'),
	api: new Logger('API'),
	store: new Logger('STORE'),
	component: new Logger('COMPONENT'),
	error: new Logger('ERROR'),
	crud: new Logger('CRUD')
};

/**
 * Log authentication events
 */
export function logAuthEvent(event: 'login' | 'logout' | 'session_created' | 'session_expired', data?: Record<string, any>) {
	loggers.auth.info(`Auth event: ${event}`, data);
}

/**
 * Log CRUD operations
 */
export function logCrudOperation(
	operation: 'create' | 'read' | 'update' | 'delete',
	entity: string,
	data?: Record<string, any>
) {
	loggers.crud.info(`${operation.toUpperCase()} ${entity}`, data);
}

/**
 * Log errors with context
 */
export function logError(message: string, error: Error | unknown, context?: Record<string, any>) {
	const errorData = {
		...context,
		error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error)
	};
	loggers.error.error(message, errorData);
}
