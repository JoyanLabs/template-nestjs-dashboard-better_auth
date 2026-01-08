import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import { toWebHeaders } from '@/shared/infrastructure/auth/better-auth.utils.js';
import { PERMISSIONS_KEY } from '@/shared/infrastructure/decorators/permission.decorator.js';

/**
 * Guard para verificar permisos granulares usando Better Auth Access Control.
 *
 * A diferencia de RolesGuard que verifica rol string, este guard verifica
 * si el usuario tiene permisos específicos sobre recursos.
 *
 * @example
 * // En el controlador
 * @UseGuards(PermissionsGuard)
 * @RequirePermission({ user: ['ban'] })
 * async banUser() { ... }
 *
 * // Un moderator con permiso user:ban puede ejecutar esto
 * // Un user sin ese permiso recibe 403 Forbidden
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.get<Record<string, string[]>>(
			PERMISSIONS_KEY,
			context.getHandler(),
		);

		// Si no hay permisos requeridos, permitir acceso
		if (!requiredPermissions) {
			return true;
		}

		const request = context.switchToHttp().getRequest();

		// Obtener sesión de Better Auth
		const session = await auth.api.getSession({
			headers: toWebHeaders(request.headers),
		});

		if (!session?.user) {
			throw new ForbiddenException('No autenticado');
		}

		// Verificar permisos usando Better Auth
		const hasPermission = await auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: requiredPermissions,
			},
		});

		if (!hasPermission) {
			throw new ForbiddenException(
				`Permisos insuficientes. Se requiere: ${JSON.stringify(requiredPermissions)}`,
			);
		}

		// Agregar sesión al request para uso posterior
		request.session = session;

		return true;
	}
}
