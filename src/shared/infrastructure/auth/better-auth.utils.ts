/**
 * Utilidades para integración con Better Auth API
 *
 * Estas funciones son parte de la capa de infraestructura compartida
 * y proveen helpers para la comunicación entre NestJS y Better Auth.
 *
 * @module shared/infrastructure/auth
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { APIError } from 'better-auth/api';
import type { Request, Response } from 'express';

/**
 * Convierte headers de Express (IncomingHttpHeaders) a formato Web Headers.
 *
 * Better Auth espera headers en formato Web API (Headers object),
 * pero Express usa su propio formato (IncomingHttpHeaders).
 *
 * @param headers - Headers de Express request
 * @returns Headers en formato Web API
 *
 * @example
 * ```typescript
 * const webHeaders = toWebHeaders(req.headers);
 * await auth.api.getSession({ headers: webHeaders });
 * ```
 */
export function toWebHeaders(headers: Request['headers']): Headers {
	const webHeaders = new Headers();
	for (const [key, value] of Object.entries(headers)) {
		if (value !== undefined) {
			if (Array.isArray(value)) {
				// Headers como 'set-cookie' pueden tener múltiples valores
				value.forEach((v) => {
					webHeaders.append(key, v);
				});
			} else {
				webHeaders.set(key, value);
			}
		}
	}
	return webHeaders;
}

/**
 * Copia los headers de respuesta de Better Auth a la respuesta de Express/NestJS.
 *
 * Especialmente importante para Set-Cookie headers que contienen tokens de sesión.
 * Maneja correctamente múltiples valores de Set-Cookie usando res.append().
 *
 * @param betterAuthHeaders - Headers de respuesta de Better Auth
 * @param res - Response object de Express/NestJS
 *
 * @example
 * ```typescript
 * const { headers, response } = await auth.api.signInEmail({
 *   returnHeaders: true,
 *   body: { email, password }
 * });
 * if (headers) copyResponseHeaders(headers, res);
 * ```
 */
export function copyResponseHeaders(
	betterAuthHeaders: Headers,
	res: Response,
): void {
	betterAuthHeaders.forEach((value, key) => {
		// Para Set-Cookie, puede haber múltiples valores
		// Usar append() en lugar de setHeader() para no sobrescribir
		if (key.toLowerCase() === 'set-cookie') {
			res.append(key, value);
		} else {
			res.setHeader(key, value);
		}
	});
}

/**
 * Maneja errores de Better Auth API y los convierte a excepciones HTTP de NestJS.
 *
 * Better Auth lanza APIError para errores de autenticación/autorización.
 * Esta función los convierte a HttpException de NestJS para que el
 * framework los maneje correctamente.
 *
 * @param error - Error capturado (puede ser APIError u otro)
 * @throws HttpException siempre (función never returns)
 *
 * @example
 * ```typescript
 * try {
 *   await auth.api.signInEmail({ body });
 * } catch (error) {
 *   handleBetterAuthError(error);
 * }
 * ```
 */
export function handleBetterAuthError(error: unknown): never {
	if (error instanceof APIError) {
		// Mapear status codes de string a número si es necesario
		const statusMap: Record<string, number> = {
			UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
			FORBIDDEN: HttpStatus.FORBIDDEN,
			BAD_REQUEST: HttpStatus.BAD_REQUEST,
			NOT_FOUND: HttpStatus.NOT_FOUND,
			INTERNAL_SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
		};

		let statusCode: number;
		if (typeof error.status === 'number') {
			statusCode = error.status;
		} else {
			statusCode = statusMap[error.status as string] || HttpStatus.BAD_REQUEST;
		}

		throw new HttpException(
			{
				statusCode,
				message: error.message,
				error: error.body,
				code: typeof error.status === 'string' ? error.status : undefined,
			},
			statusCode,
		);
	}

	// Error inesperado - log y throw genérico
	console.error('Unexpected Better Auth error:', error);
	throw new HttpException(
		'Error interno del servidor',
		HttpStatus.INTERNAL_SERVER_ERROR,
	);
}
