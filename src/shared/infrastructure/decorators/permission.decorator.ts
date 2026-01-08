import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'required_permissions';

/**
 * Decorator para requerir permisos específicos en un endpoint.
 *
 * Usar junto con PermissionsGuard para verificar que el usuario
 * tenga los permisos necesarios antes de ejecutar el handler.
 *
 * @param permissions - Objeto de permisos requeridos { recurso: [acciones] }
 *
 * @example
 * // Requiere permiso para banear usuarios
 * @UseGuards(PermissionsGuard)
 * @RequirePermission({ user: ['ban'] })
 * async banUser() { ... }
 *
 * @example
 * // Requiere múltiples permisos
 * @UseGuards(PermissionsGuard)
 * @RequirePermission({ user: ['list', 'ban'], session: ['list'] })
 * async moderatorDashboard() { ... }
 */
export const RequirePermission = (permissions: Record<string, string[]>) =>
	SetMetadata(PERMISSIONS_KEY, permissions);
