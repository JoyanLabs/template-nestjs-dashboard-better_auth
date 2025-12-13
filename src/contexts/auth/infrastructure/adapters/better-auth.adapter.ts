import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { SessionEntity } from '@/contexts/auth/domain/entities/session.entity.js';
import type { UserEntity } from '@/contexts/auth/domain/entities/user.entity.js';
import type { IAuthProvider } from '@/contexts/auth/domain/repositories/auth-provider.interface.js';
import { NotFoundException } from '@/shared/exceptions/not-found.exception.js';
import { ValidationException } from '@/shared/exceptions/validation.exception.js';
import type { PrismaService } from '@/shared/infrastructure/prisma/prisma.service.js';
import { SessionMapper } from '../persistence/mappers/session.mapper.js';
import { UserMapper } from '../persistence/mappers/user.mapper.js';

/**
 * Adaptador que encapsula Better Auth
 * Implementa la interfaz IAuthProvider del dominio
 * Convierte las respuestas de Better Auth a entidades del dominio
 */
@Injectable()
export class BetterAuthAdapter implements IAuthProvider {
	private readonly auth: ReturnType<typeof betterAuth>;

	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
	) {
		// Configurar Better Auth
		this.auth = betterAuth({
			database: prismaAdapter(this.prisma, {
				provider: 'postgresql',
			}),
			emailAndPassword: {
				enabled: true,
				minPasswordLength: 8,
				maxPasswordLength: 128,
			},
			secret: this.configService.get<string>(
				'BETTER_AUTH_SECRET',
				'default-secret-change-in-production',
			),
			baseURL: this.configService.get<string>(
				'BETTER_AUTH_URL',
				'http://localhost:3001/api/auth',
			),
			trustedOrigins: ['http://localhost:3000'],
			session: {
				expiresIn: 60 * 60 * 24 * 7, // 7 días
				updateAge: 60 * 60 * 24, // 1 día
			},
		});
	}

	/**
	 * Obtiene la instancia de Better Auth para usar en controladores
	 */
	getAuthInstance() {
		return this.auth;
	}

	/**
	 * Inicia sesión con email y contraseña
	 */
	async signIn(
		email: string,
		password: string,
		_ipAddress?: string,
		_userAgent?: string,
	): Promise<{
		user: UserEntity;
		session: SessionEntity;
	}> {
		try {
			// Llamar a Better Auth para autenticar
			const result = await this.auth.api.signInEmail({
				body: {
					email,
					password,
				},
			});

			if (!result || !result.user || !result.token) {
				throw new ValidationException('Credenciales inválidas', {
					auth: ['Email o contraseña incorrectos'],
				});
			}

			// Buscar los datos completos en la BD usando Prisma
			const user = await this.prisma.user.findUnique({
				where: { id: result.user.id },
			});

			const session = await this.prisma.session.findUnique({
				where: { token: result.token },
			});

			if (!user || !session) {
				throw new ValidationException(
					'Error al obtener datos de autenticación',
				);
			}

			return {
				user: UserMapper.toDomain(user),
				session: SessionMapper.toDomain(session),
			};
		} catch (error) {
			if (error instanceof ValidationException) {
				throw error;
			}
			throw new ValidationException('Error al iniciar sesión', {
				auth: ['Credenciales inválidas'],
			});
		}
	}

	/**
	 * Registra un nuevo usuario con email y contraseña
	 */
	async signUp(
		email: string,
		password: string,
		name: string,
	): Promise<{
		user: UserEntity;
		session: SessionEntity;
	}> {
		try {
			// Llamar a Better Auth para crear el usuario
			const result = await this.auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
				},
			});

			if (!result || !result.user || !result.token) {
				throw new ValidationException('Error al registrar usuario');
			}

			// Buscar los datos completos en la BD
			const user = await this.prisma.user.findUnique({
				where: { id: result.user.id },
			});

			const session = await this.prisma.session.findUnique({
				where: { token: result.token },
			});

			if (!user || !session) {
				throw new ValidationException('Error al obtener datos de registro');
			}

			return {
				user: UserMapper.toDomain(user),
				session: SessionMapper.toDomain(session),
			};
		} catch (error) {
			if (error instanceof ValidationException) {
				throw error;
			}
			throw new ValidationException('Error al registrar usuario', {
				auth: ['No se pudo crear el usuario'],
			});
		}
	}

	/**
	 * Valida una sesión por su token
	 */
	async validateSession(token: string): Promise<{
		user: UserEntity;
		session: SessionEntity;
	} | null> {
		try {
			// Buscar la sesión directamente en la BD
			const session = await this.prisma.session.findUnique({
				where: { token },
				include: { user: true },
			});

			if (!session) {
				return null;
			}

			// Verificar que la sesión no haya expirado
			const sessionEntity = SessionMapper.toDomain(session);
			if (sessionEntity.isExpired()) {
				return null;
			}

			return {
				user: UserMapper.toDomain(session.user),
				session: sessionEntity,
			};
		} catch {
			return null;
		}
	}

	/**
	 * Cierra sesión invalidando el token
	 */
	async signOut(sessionToken: string): Promise<void> {
		try {
			await this.auth.api.signOut({
				headers: {
					authorization: `Bearer ${sessionToken}`,
				},
			});
		} catch (error) {
			// Silenciar errores de signOut, la sesión podría ya estar invalidada
			console.warn('Error al cerrar sesión:', error);
		}
	}

	/**
	 * Refresca una sesión existente
	 */
	async refreshSession(sessionToken: string): Promise<SessionEntity> {
		const session = await this.prisma.session.findUnique({
			where: { token: sessionToken },
		});

		if (!session) {
			throw new NotFoundException('Session', sessionToken);
		}

		return SessionMapper.toDomain(session);
	}

	/**
	 * Obtiene un usuario por su ID
	 */
	async getUserById(userId: string): Promise<UserEntity | null> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		return user ? UserMapper.toDomain(user) : null;
	}
}
