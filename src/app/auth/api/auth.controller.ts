import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Req,
	Res,
} from '@nestjs/common';
import {
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
import { validateEnv } from '@/shared/infrastructure/config/env.schema.js';
import {
	AuthResponseDto,
	ForgetPasswordDto,
	ResetPasswordDto,
	SignInDto,
	SignUpDto,
} from './auth.dto.js';

const env = validateEnv(process.env);

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
	@ApiResponse({
		status: 200,
		description: 'Usuario registrado exitosamente',
		type: AuthResponseDto,
	})
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
	@ApiResponse({
		status: 200,
		description: 'Sesión iniciada exitosamente',
		type: AuthResponseDto,
	})
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
		type: AuthResponseDto,
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
			// Manejar caso donde la sesión ya fue eliminada (doble logout, race condition)
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				error.code === 'P2025'
			) {
				// Sesión no encontrada - igual consideramos el logout exitoso
				// Limpiar la cookie del cliente de todos modos
				res.clearCookie('session_token', {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
				});
				return res
					.status(200)
					.json({ success: true, message: 'Sesión ya cerrada' });
			}
			handleBetterAuthError(error);
		}
	}

	@Post('request-password-reset')
	@ApiOperation({
		summary: 'Solicitar recuperación de contraseña',
		description: 'Envía un correo con el token para resetear la contraseña',
	})
	@ApiResponse({ status: 200, description: 'Correo enviado exitosamente' })
	async forgetPassword(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: ForgetPasswordDto,
	) {
		try {
			const result = await auth.api.requestPasswordReset({
				headers: toWebHeaders(req.headers),
				body: {
					email: body.email,
					redirectTo: body.redirectTo,
				},
			});

			return res.status(200).json(result);
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	@Get('reset-password/:token')
	@ApiOperation({
		summary: 'Callback de reset password',
		description:
			'Valida el token del email y redirige al frontend con el token',
	})
	@ApiResponse({ status: 302, description: 'Redirige al frontend' })
	async resetPasswordCallback(
		@Req() _req: Request,
		@Res() res: Response,
		@Param('token') token: string,
		@Query('callbackURL') callbackURL: string,
	) {
		try {
			// Redirigir al frontend con el token como query param
			const redirectUrl = `${env.FRONTEND_URL}${callbackURL}?token=${token}`;
			return res.redirect(redirectUrl);
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	@Post('reset-password')
	@ApiOperation({
		summary: 'Resetear contraseña',
		description: 'Cambia la contraseña del usuario usando un token válido',
	})
	@ApiResponse({
		status: 200,
		description: 'Contraseña actualizada exitosamente',
	})
	async resetPassword(
		@Req() req: Request,
		@Res() res: Response,
		@Body() body: ResetPasswordDto,
	) {
		try {
			const result = await auth.api.resetPassword({
				headers: toWebHeaders(req.headers),
				body: {
					token: body.token,
					newPassword: body.newPassword,
				},
			});

			return res.status(200).json(result);
		} catch (error) {
			handleBetterAuthError(error);
		}
	}
}
