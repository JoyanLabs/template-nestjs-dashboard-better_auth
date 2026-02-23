/**
 * Puerto (interfaz) para el servicio de autenticación.
 * Define el contrato que debe cumplir cualquier implementación de auth.
 *
 * La capa de aplicación depende de esta interfaz, NO de Better Auth directamente.
 * Esto permite:
 * - Testear los handlers con mocks
 * - Cambiar de proveedor de auth sin tocar la lógica de negocio
 */

// =============================================================================
// TIPOS DE DOMINIO
// =============================================================================

/**
 * Representación de un usuario en el dominio.
 * Alineado con UserWithRole de Better Auth para compatibilidad directa.
 */
export interface UserData {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null;
	role?: string;
	banned: boolean | null;
	banReason?: string | null;
	banExpires?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface SessionData {
	user: UserData;
	session: {
		id: string;
		expiresAt: Date;
	};
}

export interface CreateUserParams {
	email: string;
	password: string;
	name: string;
	role?: string;
}

export interface UpdateUserParams {
	userId: string;
	data: {
		name?: string;
		email?: string;
		role?: string;
	};
}

export interface BanUserParams {
	userId: string;
	banReason?: string;
	banExpiresIn?: number; // segundos
}

export interface ListUsersParams {
	limit?: number;
	offset?: number;
}

export interface ListUsersResult {
	users: UserData[];
	total?: number;
}

// =============================================================================
// INTERFAZ DEL PUERTO
// =============================================================================

export interface IAuthService {
	// Sesión
	getSession(headers: Headers): Promise<SessionData | null>;

	// Operaciones de usuario (Commands)
	createUser(params: CreateUserParams, headers: Headers): Promise<UserData>;
	updateUser(params: UpdateUserParams, headers: Headers): Promise<UserData>;
	deleteUser(userId: string, headers: Headers): Promise<void>;
	setPassword(
		userId: string,
		newPassword: string,
		headers: Headers,
	): Promise<void>;
	banUser(params: BanUserParams, headers: Headers): Promise<UserData>;
	unbanUser(userId: string, headers: Headers): Promise<UserData>;

	// Consultas (Queries)
	listUsers(
		params: ListUsersParams,
		headers: Headers,
	): Promise<ListUsersResult>;

	/**
	 * Registra un nuevo usuario sin requerir autenticación.
	 * Usado para el registro público o inicialización del sistema.
	 */
	signUp(params: CreateUserParams): Promise<UserData>;
}

// Token para inyección de dependencias
export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
