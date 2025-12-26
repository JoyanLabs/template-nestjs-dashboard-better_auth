import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';

/**
 * Documentación de los endpoints de Better Auth para Swagger/Scalar.
 * Los endpoints reales son manejados por BetterAuthMiddleware.
 */
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
	@Post('sign-up/email')
	@ApiOperation({
		summary: 'Registrar usuario con email',
		description: 'Crea una nueva cuenta de usuario usando email y contraseña',
	})
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email', 'password', 'name'],
			properties: {
				email: { type: 'string', format: 'email', example: 'user@example.com' },
				password: {
					type: 'string',
					minLength: 8,
					example: 'SecurePassword123!',
				},
				name: { type: 'string', example: 'John Doe' },
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Usuario registrado exitosamente' })
	@ApiResponse({ status: 400, description: 'Datos inválidos' })
	@ApiResponse({ status: 409, description: 'El email ya está registrado' })
	async signUp(@Req() req: Request, @Res() res: Response) {
		// Manejado por BetterAuthMiddleware
		return this.forwardToAuth(req, res);
	}

	@Post('sign-in/email')
	@ApiOperation({
		summary: 'Iniciar sesión con email',
		description: 'Autentica un usuario usando email y contraseña',
	})
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email', 'password'],
			properties: {
				email: { type: 'string', format: 'email', example: 'user@example.com' },
				password: { type: 'string', example: 'SecurePassword123!' },
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente' })
	@ApiResponse({ status: 401, description: 'Credenciales inválidas' })
	async signIn(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	@Get('get-session')
	@ApiOperation({
		summary: 'Obtener sesión actual',
		description: 'Retorna la información de la sesión del usuario autenticado',
	})
	@ApiCookieAuth('session_token')
	@ApiResponse({
		status: 200,
		description: 'Sesión del usuario',
		schema: {
			type: 'object',
			properties: {
				session: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						userId: { type: 'string' },
						expiresAt: { type: 'string', format: 'date-time' },
					},
				},
				user: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						email: { type: 'string' },
						name: { type: 'string' },
					},
				},
			},
		},
	})
	@ApiResponse({ status: 401, description: 'No autenticado' })
	async getSession(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	@Post('sign-out')
	@ApiOperation({
		summary: 'Cerrar sesión',
		description: 'Cierra la sesión actual del usuario',
	})
	@ApiCookieAuth('session_token')
	@ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
	async signOut(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	/**
	 * Reenvía la petición al handler de Better Auth
	 */
	private async forwardToAuth(req: Request, res: Response) {
		const url = new URL(req.url, `${req.protocol}://${req.get('host')}`);

		const betterAuthRequest = new Request(url.toString(), {
			method: req.method,
			headers: req.headers as HeadersInit,
			body:
				req.method !== 'GET' && req.method !== 'HEAD'
					? JSON.stringify(req.body)
					: undefined,
		});

		const betterAuthResponse = await auth.handler(betterAuthRequest);

		res.status(betterAuthResponse.status);
		betterAuthResponse.headers.forEach((value, key) => {
			res.setHeader(key, value);
		});

		const responseBody = await betterAuthResponse.text();
		res.send(responseBody);
	}
}
