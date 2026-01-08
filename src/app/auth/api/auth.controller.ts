import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import {
	copyResponseHeaders,
	handleBetterAuthError,
	toWebHeaders,
} from '@/shared/infrastructure/auth/better-auth.utils.js';

// DTOs para validación y documentación
class SignUpDto {
	email!: string;
	password!: string;
	name!: string;
}

class SignInDto {
	email!: string;
	password!: string;
}

/**
 * Controlador de autenticación.
 * Usa auth.api.* para llamar a Better Auth programáticamente.
 * Maneja cookies de sesión correctamente.
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
	async signUp(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: SignUpDto,
	) {
		try {
			const { headers, response } = await auth.api.signUpEmail({
				returnHeaders: true,
				headers: toWebHeaders(req.headers),
				body: {
					email: body.email,
					password: body.password,
					name: body.name,
				},
			});

			// Copiar headers de respuesta (incluye Set-Cookie)
			if (headers) {
				copyResponseHeaders(headers, res);
			}

			return res.status(200).json(response);
		} catch (error) {
			handleBetterAuthError(error);
		}
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
	async signIn(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: SignInDto,
	) {
		try {
			const { headers, response } = await auth.api.signInEmail({
				returnHeaders: true,
				headers: toWebHeaders(req.headers),
				body: {
					email: body.email,
					password: body.password,
				},
			});

			// Copiar headers de respuesta (incluye Set-Cookie con token de sesión)
			if (headers) {
				copyResponseHeaders(headers, res);
			}

			return res.status(200).json(response);
		} catch (error) {
			handleBetterAuthError(error);
		}
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
						role: { type: 'string', enum: ['user', 'admin'] },
					},
				},
			},
		},
	})
	@ApiResponse({ status: 401, description: 'No autenticado' })
	async getSession(@Req() req: Request, @Res() res: Response) {
		try {
			const session = await auth.api.getSession({
				headers: toWebHeaders(req.headers),
			});

			if (!session) {
				return res.status(401).json({ message: 'No autenticado' });
			}

			return res.status(200).json(session);
		} catch {
			// getSession no debería lanzar errores normalmente,
			// pero manejamos por si acaso
			return res.status(401).json({ message: 'No autenticado' });
		}
	}

	@Post('sign-out')
	@ApiOperation({
		summary: 'Cerrar sesión',
		description: 'Cierra la sesión actual del usuario',
	})
	@ApiCookieAuth('session_token')
	@ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
	async signOut(@Req() req: Request, @Res() res: Response) {
		try {
			const { headers } = await auth.api.signOut({
				returnHeaders: true,
				headers: toWebHeaders(req.headers),
			});

			// Copiar headers de respuesta (incluye Set-Cookie para limpiar la cookie)
			if (headers) {
				copyResponseHeaders(headers, res);
			}

			return res.status(200).json({ success: true });
		} catch (error) {
			handleBetterAuthError(error);
		}
	}
}
