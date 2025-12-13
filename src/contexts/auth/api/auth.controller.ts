import {
	All,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
	Req,
	Res,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user/get-current-user.use-case.js';
import type { SignInDto } from '../application/use-cases/sign-in/sign-in.dto.js';
import { SignInUseCase } from '../application/use-cases/sign-in/sign-in.use-case.js';
import type { SignUpDto } from '../application/use-cases/sign-up/sign-up.dto.js';
import { SignUpUseCase } from '../application/use-cases/sign-up/sign-up.use-case.js';
import type { UserEntity } from '../domain/entities/user.entity.js';
import { BetterAuthAdapter } from '../infrastructure/adapters/better-auth.adapter.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { BetterAuthGuard } from './guards/better-auth.guard.js';

/**
 * Controller de autenticación
 * Expone los endpoints HTTP y delega la lógica a los use cases
 */
@Controller('auth')
export class AuthController {
	constructor(
		private readonly signInUseCase: SignInUseCase,
		private readonly signUpUseCase: SignUpUseCase,
		private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
		@Inject('IAuthProvider')
		private readonly authAdapter: BetterAuthAdapter,
	) {}

	/**
	 * Endpoint para registrarse
	 * POST /api/auth/sign-up
	 */
	@Post('sign-up')
	@HttpCode(HttpStatus.CREATED)
	async signUp(
		@Body(new ValidationPipe({ transform: true })) dto: SignUpDto,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		const result = await this.signUpUseCase.execute(dto);

		// Establecer la cookie de sesión
		reply.setCookie('session_token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 días
		});

		return {
			success: true,
			user: {
				id: result.user.id,
				email: result.user.email,
				name: result.user.name,
				emailVerified: result.user.emailVerified,
				image: result.user.image,
			},
		};
	}

	/**
	 * Endpoint para iniciar sesión
	 * POST /api/auth/sign-in
	 */
	@Post('sign-in')
	@HttpCode(HttpStatus.OK)
	async signIn(
		@Body(new ValidationPipe({ transform: true })) dto: SignInDto,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		const result = await this.signInUseCase.execute(dto);

		// Establecer la cookie de sesión
		reply.setCookie('session_token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 días
		});

		return {
			success: true,
			user: {
				id: result.user.id,
				email: result.user.email,
				name: result.user.name,
				emailVerified: result.user.emailVerified,
				image: result.user.image,
			},
		};
	}

	/**
	 * Endpoint para obtener el usuario actual (protegido)
	 * GET /api/auth/me
	 */
	@Get('me')
	@UseGuards(BetterAuthGuard)
	async getMe(@CurrentUser() user: UserEntity) {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			emailVerified: user.emailVerified,
			image: user.image,
			createdAt: user.createdAt,
		};
	}

	/**
	 * Endpoint para cerrar sesión
	 * POST /api/auth/sign-out
	 */
	@Post('sign-out')
	@HttpCode(HttpStatus.OK)
	@UseGuards(BetterAuthGuard)
	async signOut(@Res({ passthrough: true }) reply: FastifyReply) {
		// Limpiar la cookie
		reply.clearCookie('session_token', {
			path: '/',
		});

		return {
			success: true,
			message: 'Sesión cerrada exitosamente',
		};
	}

	/**
	 * Ruta comodín para delegar peticiones internas a Better Auth
	 * ALL /api/auth/*
	 *
	 * Better Auth maneja sus propias rutas internas como:
	 * - /api/auth/session
	 * - /api/auth/csrf
	 * etc.
	 */
	@All('*')
	async handleBetterAuth(
		@Req() request: FastifyRequest,
		@Res() reply: FastifyReply,
	) {
		// Obtener la instancia de Better Auth del adaptador
		const auth = this.authAdapter.getAuthInstance();

		// Convertir FastifyRequest a Request estándar
		const webRequest = new Request(
			`${request.protocol}://${request.hostname}${request.url}`,
			{
				method: request.method,
				headers: request.headers as HeadersInit,
				body:
					request.method !== 'GET' && request.method !== 'HEAD'
						? JSON.stringify(request.body)
						: undefined,
			},
		);

		// Delegar la petición a Better Auth
		const response = await auth.handler(webRequest);

		// Configurar headers de la respuesta
		response.headers.forEach((value, key) => {
			reply.header(key, value);
		});

		// Establecer el status code
		reply.status(response.status);

		// Enviar el body
		const body = await response.text();
		reply.send(body);
	}
}
