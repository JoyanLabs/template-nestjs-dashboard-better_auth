import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface HttpErrorResponse {
	message?: string;
	error?: string;
}

interface PrismaError {
	code: string;
	message: string;
	meta?: { target?: string };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger('ExceptionsHandler');

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';
		let code = 'INTERNAL_ERROR';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const responseBody = exception.getResponse();
			message =
				typeof responseBody === 'object' && 'message' in responseBody
					? ((responseBody as HttpErrorResponse).message ?? exception.message)
					: exception.message;
			code =
				typeof responseBody === 'object' && 'error' in responseBody
					? ((responseBody as HttpErrorResponse).error ?? 'HTTP_ERROR')
					: 'HTTP_ERROR';
		} else if (this.isPrismaError(exception)) {
			// Manejo básico de errores de Prisma para que no exploten
			status = HttpStatus.BAD_REQUEST;
			const prismaError = exception as PrismaError;
			code = prismaError.code;

			// Mensajes amigables para errores comunes de Prisma
			switch (code) {
				case 'P2002':
					message = `Unique constraint failed on the fields: ${prismaError.meta?.target}`;
					status = HttpStatus.CONFLICT;
					break;
				case 'P2025':
					message =
						'An operation failed because it depends on one or more records that were required but not found.';
					status = HttpStatus.NOT_FOUND;
					break;
				default:
					message = `Database error: ${prismaError.message.split('\n').pop()}`; // Última línea del error suele ser la más clara
			}
		} else if (exception instanceof Error) {
			message = exception.message;
		}

		// Ignorar logs de error para favicon.ico
		if (request.url.includes('favicon.ico')) {
			response.status(HttpStatus.NOT_FOUND).send();
			return;
		}

		// Log del error con formato NestJS
		this.logger.error(
			`[${code}] ${message}`,
			exception instanceof Error ? exception.stack : undefined,
			`${request.method} ${request.url}`,
		);

		response.status(status).json({
			statusCode: status,
			message,
			code,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}

	private isPrismaError(exception: unknown): boolean {
		return (
			typeof exception === 'object' &&
			exception !== null &&
			'code' in exception &&
			'clientVersion' in exception
		);
	}
}
