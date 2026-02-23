import { Injectable } from '@nestjs/common';
import type { UserWithRole } from 'better-auth/plugins/admin';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import { handleBetterAuthError } from '@/shared/infrastructure/auth/better-auth.utils.js';
import type {
	BanUserParams,
	CreateUserParams,
	IAuthService,
	ListUsersParams,
	ListUsersResult,
	SessionData,
	UpdateUserParams,
	UserData,
} from '../../application/ports/auth-service.port.js';

/**
 * Tipo de roles válidos en el sistema.
 */
type ValidRole = 'user' | 'admin' | 'moderator';

/**
 * Adaptador que implementa IAuthService usando Better Auth.
 *
 * Este adaptador:
 * - Traduce las llamadas de la interfaz a llamadas de Better Auth
 * - Maneja los errores de Better Auth y los convierte a excepciones
 * - Usa UserWithRole directamente desde Better Auth (tipos alineados)
 */
@Injectable()
export class BetterAuthAdapter implements IAuthService {
	/**
	 * Mapea un usuario de Better Auth al tipo de dominio.
	 * Ahora usa UserWithRole directamente ya que nuestro UserData está alineado.
	 */
	private mapUser(user: UserWithRole): UserData {
		return {
			id: user.id,
			email: user.email,
			emailVerified: user.emailVerified,
			name: user.name,
			image: user.image,
			role: user.role,
			banned: user.banned,
			banReason: user.banReason,
			banExpires: user.banExpires,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}

	/**
	 * Valida y convierte el rol a un tipo válido.
	 */
	private toValidRole(role: string | undefined): ValidRole {
		if (role === 'admin' || role === 'moderator') {
			return role;
		}
		return 'user';
	}

	async getSession(headers: Headers): Promise<SessionData | null> {
		try {
			const result = await auth.api.getSession({ headers });
			if (!result?.user) {
				return null;
			}
			return {
				user: this.mapUser(result.user as UserWithRole),
				session: {
					id: result.session.id,
					expiresAt: new Date(result.session.expiresAt),
				},
			};
		} catch {
			return null;
		}
	}

	async createUser(
		params: CreateUserParams,
		headers: Headers,
	): Promise<UserData> {
		try {
			const result = await auth.api.createUser({
				headers,
				body: {
					email: params.email,
					password: params.password,
					name: params.name,
					role: this.toValidRole(params.role),
				},
			});
			return this.mapUser(result.user);
		} catch (error) {
			handleBetterAuthError(error);
			throw error;
		}
	}

	async updateUser(
		params: UpdateUserParams,
		headers: Headers,
	): Promise<UserData> {
		try {
			const result = await auth.api.adminUpdateUser({
				headers,
				body: {
					userId: params.userId,
					data: params.data,
				},
			});
			// adminUpdateUser devuelve el usuario directamente, no envuelto en { user }
			return this.mapUser(result as UserWithRole);
		} catch (error) {
			handleBetterAuthError(error);
			throw error;
		}
	}

	async deleteUser(userId: string, headers: Headers): Promise<void> {
		try {
			await auth.api.removeUser({
				headers,
				body: { userId },
			});
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	async setPassword(
		userId: string,
		newPassword: string,
		headers: Headers,
	): Promise<void> {
		try {
			await auth.api.setUserPassword({
				headers,
				body: { userId, newPassword },
			});
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	async banUser(params: BanUserParams, headers: Headers): Promise<UserData> {
		try {
			const result = await auth.api.banUser({
				headers,
				body: {
					userId: params.userId,
					banReason: params.banReason,
					banExpiresIn: params.banExpiresIn,
				},
			});
			return this.mapUser(result.user);
		} catch (error) {
			handleBetterAuthError(error);
			throw error;
		}
	}

	async unbanUser(userId: string, headers: Headers): Promise<UserData> {
		try {
			const result = await auth.api.unbanUser({
				headers,
				body: { userId },
			});
			return this.mapUser(result.user);
		} catch (error) {
			handleBetterAuthError(error);
			throw error;
		}
	}

	async listUsers(
		params: ListUsersParams,
		headers: Headers,
	): Promise<ListUsersResult> {
		try {
			const result = await auth.api.listUsers({
				headers,
				query: {
					limit: params.limit ?? 100,
					offset: params.offset ?? 0,
				},
			});
			return {
				users: result.users.map((u) => this.mapUser(u)),
				total: result.total,
			};
		} catch (error) {
			handleBetterAuthError(error);
			throw error;
		}
	}

	async signUp(params: CreateUserParams): Promise<UserData> {
		try {
			const result = await auth.api.signUpEmail({
				body: {
					email: params.email,
					password: params.password,
					name: params.name,
				},
			});
			// signUpEmail puede devolver role como null, convertimos a undefined
			const userWithRole = {
				...result.user,
				role: result.user.role ?? undefined,
			} as UserWithRole;
			return this.mapUser(userWithRole);
		} catch (error) {
			handleBetterAuthError(error);
			throw error;
		}
	}
}
