/**
 * Sistema de Access Control para Better Auth
 *
 * Define los recursos, acciones y roles disponibles en el sistema.
 * Este archivo es parte de la capa de infraestructura compartida.
 *
 * @see https://www.better-auth.com/docs/plugins/admin#access-control
 */

import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

export const statement = defaultStatements;

/**
 * Access Control instance usando los statements por defecto
 */
export const ac = createAccessControl(statement);

/**
 * Definición de roles con sus permisos
 */

/**
 * Admin: Control total sobre todos los recursos
 * Hereda todos los permisos del admin por defecto de Better Auth
 */
export const admin = ac.newRole({
	...adminAc.statements,
});

/**
 * Moderator: Rol de ejemplo para demostrar custom roles
 * Puede:
 * - Listar usuarios (user:list)
 * - Banear/Desbanear usuarios (user:ban)
 * - Listar sesiones (session:list)
 * NO puede:
 * - Crear usuarios
 * - Eliminar usuarios
 * - Cambiar roles
 */
export const moderator = ac.newRole({
	user: ['list', 'ban'],
	session: ['list'],
});

/**
 * User: Usuario regular sin permisos administrativos
 * Tiene un permiso mínimo para evitar el problema de tipo 'never'
 * El permiso 'get' sobre session es inofensivo (cada usuario puede ver sus propias sesiones)
 */
export const user = ac.newRole({
	session: [],
});

/**
 * Objeto de roles para pasar al plugin admin
 * IMPORTANTE: Incluir todos los roles que se puedan asignar vía setRole
 */
export const roles = {
	admin,
	moderator,
	user,
};

/**
 * Tipo para los nombres de roles disponibles
 */
export type RoleName = keyof typeof roles;
