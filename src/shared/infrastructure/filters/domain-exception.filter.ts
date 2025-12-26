import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthException } from '@/shared/exceptions/auth.exception.js';
import { DomainException } from '@/shared/exceptions/domain.exception.js';
import { NotFoundException } from '@/shared/exceptions/not-found.exception.js';
import { ValidationException } from '@/shared/exceptions/validation.exception.js';

/**
 * Filtro global para manejar excepciones de dominio y convertirlas a respuestas HTTP.
 * Centraliza el mapeo de errores de negocio a códigos de estado HTTP de NestJS/Express.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(DomainExceptionFilter.name);

	catch(exception: DomainException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status = this.mapDomainErrorToStatus(exception);
		const body = this.createResponseBody(exception, status);

		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(
				`[${exception.code}] ${exception.message}`,
				exception.stack,
			);
		}

		response.status(status).json(body);
	}

	private mapDomainErrorToStatus(exception: DomainException): HttpStatus {
		if (exception instanceof AuthException) {
			switch (exception.code) {
				case 'INVALID_CREDENTIALS':
				case 'USER_NOT_FOUND':
					return HttpStatus.UNAUTHORIZED;
				case 'EMAIL_ALREADY_EXISTS':
					return HttpStatus.CONFLICT;
				case 'ACCOUNT_DISABLED':
				case 'SESSION_EXPIRED':
					return HttpStatus.FORBIDDEN;
				default:
					return HttpStatus.INTERNAL_SERVER_ERROR;
			}
		}

		if (exception instanceof NotFoundException) {
			return HttpStatus.NOT_FOUND;
		}

		if (exception instanceof ValidationException) {
			return HttpStatus.BAD_REQUEST;
		}

		return HttpStatus.INTERNAL_SERVER_ERROR;
	}

	private createResponseBody(exception: DomainException, status: HttpStatus) {
		return {
			statusCode: status,
			message: exception.message,
			code: exception.code || 'UNKNOWN_ERROR',
			errors: exception.errors || undefined,
			timestamp: new Date().toISOString(),
		};
	}
}
