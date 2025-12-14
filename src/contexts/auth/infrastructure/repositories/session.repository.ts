import { Injectable } from '@nestjs/common';
import type { SessionEntity } from '@/contexts/auth/domain/entities/session.entity.js';
import type { ISessionRepository } from '@/contexts/auth/domain/repositories/session.repository.interface.js';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service.js';
import {
	toDomain as sessionToDomain,
	toDomainArray as sessionToDomainArray,
	toPrismaCreate as sessionToPrismaCreate,
	toPrismaUpdate as sessionToPrismaUpdate,
} from '../persistence/mappers/session.mapper.js';

/**
 * Implementación del repositorio de sesiones usando Prisma
 * Implementa la interfaz ISessionRepository del dominio
 */
@Injectable()
export class SessionRepository implements ISessionRepository {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Busca una sesión por su ID
	 */
	async findById(id: string): Promise<SessionEntity | null> {
		const session = await this.prisma.session.findUnique({
			where: { id },
		});

		return session ? sessionToDomain(session) : null;
	}

	/**
	 * Busca una sesión por su token
	 */
	async findByToken(token: string): Promise<SessionEntity | null> {
		const session = await this.prisma.session.findUnique({
			where: { token },
		});

		return session ? sessionToDomain(session) : null;
	}

	/**
	 * Busca todas las sesiones de un usuario
	 */
	async findByUserId(userId: string): Promise<SessionEntity[]> {
		const sessions = await this.prisma.session.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		});

		return sessionToDomainArray(sessions);
	}

	/**
	 * Verifica si una sesión es válida por su token
	 */
	async isValidToken(token: string): Promise<boolean> {
		const session = await this.findByToken(token);

		if (!session) {
			return false;
		}

		return session.isValid();
	}

	/**
	 * Guarda una sesión (crear o actualizar)
	 */
	async save(session: SessionEntity): Promise<SessionEntity> {
		const existingSession = await this.prisma.session.findUnique({
			where: { id: session.id },
		});

		if (existingSession) {
			// Actualizar sesión existente
			const updated = await this.prisma.session.update({
				where: { id: session.id },
				data: sessionToPrismaUpdate(session),
			});
			return sessionToDomain(updated);
		}

		// Crear nueva sesión
		const created = await this.prisma.session.create({
			data: sessionToPrismaCreate(session),
		});

		return sessionToDomain(created);
	}

	/**
	 * Elimina una sesión por su ID
	 */
	async delete(id: string): Promise<void> {
		await this.prisma.session.delete({
			where: { id },
		});
	}

	/**
	 * Invalida (elimina) todas las sesiones de un usuario
	 */
	async deleteAllByUserId(userId: string): Promise<void> {
		await this.prisma.session.deleteMany({
			where: { userId },
		});
	}

	/**
	 * Elimina sesiones expiradas
	 * @returns Número de sesiones eliminadas
	 */
	async deleteExpiredSessions(): Promise<number> {
		const result = await this.prisma.session.deleteMany({
			where: {
				expiresAt: {
					lt: new Date(),
				},
			},
		});

		return result.count;
	}
}
