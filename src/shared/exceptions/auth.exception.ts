import { DomainException } from './domain.exception.js';

/**
 * Authentication Exception
 * Se lanza cuando falla la autenticación en el dominio.
 * No hereda de NestJS para mantener el dominio puro.
 */
export class AuthException extends DomainException {
	constructor(
		message: string,
		public readonly code:
			| 'INVALID_CREDENTIALS'
			| 'USER_NOT_FOUND'
			| 'EMAIL_ALREADY_EXISTS'
			| 'ACCOUNT_DISABLED'
			| 'SESSION_EXPIRED'
			| 'UNKNOWN_ERROR',
		public readonly errors?: Record<string, string[]>,
	) {
		super(message, code);
	}
}
