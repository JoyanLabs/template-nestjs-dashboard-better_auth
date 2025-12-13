import {
	type CanActivate,
	type ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { IAuthProvider } from '@/contexts/auth/domain/repositories/auth-provider.interface.js';

/**
 * Guard para validar sesiones de autenticación
 * Usa Better Auth a través del IAuthProvider para validar el token de sesión
 */
@Injectable()
export class BetterAuthGuard implements CanActivate {
	constructor(
		@Inject('IAuthProvider')
		private readonly authProvider: IAuthProvider,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<FastifyRequest>();

		// Extraer el token de las cookies o del header Authorization
		const token = this.extractToken(request);

		if (!token) {
			throw new UnauthorizedException('No se encontró token de autenticación');
		}

		// Validar la sesión usando Better Auth
		const result = await this.authProvider.validateSession(token);

		if (!result) {
			throw new UnauthorizedException('Sesión inválida o expirada');
		}

		// Adjuntar el usuario y la sesión al request
		(request as FastifyRequest & { user: unknown; session: unknown }).user =
			result.user;
		(request as FastifyRequest & { user: unknown; session: unknown }).session =
			result.session;

		return true;
	}

	/**
	 * Extrae el token de sesión de la petición
	 * Busca primero en las cookies, luego en el header Authorization
	 */
	private extractToken(request: FastifyRequest): string | null {
		// Buscar en cookies (nombre por defecto de Better Auth)
		const cookieToken =
			request.cookies?.['better-auth.session_token'] ||
			request.cookies?.session_token;

		if (cookieToken) {
			return cookieToken;
		}

		// Buscar en el header Authorization
		const authHeader = request.headers.authorization;
		if (authHeader?.startsWith('Bearer ')) {
			return authHeader.substring(7);
		}

		return null;
	}
}
