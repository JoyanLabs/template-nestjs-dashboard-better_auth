import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';

export const ROLES_KEY = 'roles';

/**
 * Guard personalizado para verificar roles de usuario.
 *
 * Verifica que el usuario autenticado tenga uno de los roles requeridos
 * para acceder al endpoint.
 *
 * @example
 * @UseGuards(RolesGuard)
 * @RequireRole('admin')
 * async adminEndpoint() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredRoles || requiredRoles.length === 0) {
			return true; // No hay roles requeridos
		}

		const request = context.switchToHttp().getRequest();

		// Obtener sesión de Better Auth
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			throw new ForbiddenException('No autenticado');
		}

		const userRole = session.user.role || 'user';

		if (!requiredRoles.includes(userRole)) {
			throw new ForbiddenException(
				`Requiere uno de los roles: ${requiredRoles.join(', ')}`,
			);
		}

		// Agregar sesión al request para uso posterior
		request.session = session;

		return true;
	}
}
