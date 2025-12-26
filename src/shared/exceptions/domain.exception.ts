/**
 * Base Domain Exception
 * Excepción base para todas las excepciones del dominio
 */
export class DomainException extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly errors?: Record<string, string[]>,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}
