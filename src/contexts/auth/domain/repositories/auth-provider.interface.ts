import type { SessionEntity } from '../entities/session.entity.js';
import type { UserEntity } from '../entities/user.entity.js';

/**
 * Interface del proveedor de autenticación
 * Define las operaciones de autenticación que debe proporcionar Better Auth
 * Debe ser implementado en la capa de infraestructura (BetterAuthAdapter)
 */
export interface IAuthProvider {
	/**
	 * Inicia sesión con email y contraseña
	 * @returns SessionEntity con el token y datos de sesión
	 */
	signIn(
		email: string,
		password: string,
		ipAddress?: string,
		userAgent?: string,
	): Promise<{
		user: UserEntity;
		session: SessionEntity;
	}>;

	/**
	 * Registra un nuevo usuario con email y contraseña
	 * @returns UserEntity del usuario creado
	 */
	signUp(
		email: string,
		password: string,
		name: string,
	): Promise<{
		user: UserEntity;
		session: SessionEntity;
	}>;

	/**
	 * Valida una sesión por su token
	 * @returns SessionEntity si es válida, null si no lo es
	 */
	validateSession(token: string): Promise<{
		user: UserEntity;
		session: SessionEntity;
	} | null>;

	/**
	 * Cierra sesión invalidando el token
	 */
	signOut(sessionToken: string): Promise<void>;

	/**
	 * Refresca una sesión existente
	 */
	refreshSession(sessionToken: string): Promise<SessionEntity>;

	/**
	 * Obtiene un usuario por su ID
	 */
	getUserById(userId: string): Promise<UserEntity | null>;
}
