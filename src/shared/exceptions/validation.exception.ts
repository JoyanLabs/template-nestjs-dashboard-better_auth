import { DomainException } from './domain.exception.js';

/**
 * Validation Exception
 * Se lanza cuando falla la validación en el dominio
 */
export class ValidationException extends DomainException {
	constructor(
		message: string,
		public readonly errors?: Record<string, string[]>,
	) {
		super(message, 'VALIDATION_ERROR');
	}
}
