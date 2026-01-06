import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard.js';

/**
 * Decorador para requerir roles específicos en un endpoint.
 *
 * Debe usarse junto con RolesGuard.
 *
 * @param roles - Uno o más roles requeridos
 *
 * @example
 * // Requiere rol admin
 * @RequireRole('admin')
 *
 * @example
 * // Permite admin o moderator
 * @RequireRole('admin', 'moderator')
 */
export const RequireRole = (...roles: string[]) =>
	SetMetadata(ROLES_KEY, roles);
