import type { Prisma, session as PrismaSession } from '@prisma/client';
import { SessionEntity } from '@/contexts/auth/domain/entities/session.entity.js';

/**
 * Funciones para convertir entre Prisma Session y SessionEntity del dominio
 * Mantiene la separación entre la capa de infraestructura y el dominio
 */

/**
 * Convierte un modelo de Prisma Session a una entidad del dominio SessionEntity
 */
export function toDomain(prismaSession: PrismaSession): SessionEntity {
	return SessionEntity.create({
		id: prismaSession.id,
		token: prismaSession.token,
		userId: prismaSession.userId,
		expiresAt: prismaSession.expiresAt,
		ipAddress: prismaSession.ipAddress,
		userAgent: prismaSession.userAgent,
		createdAt: prismaSession.createdAt,
		updatedAt: prismaSession.updatedAt,
	});
}

/**
 * Convierte una entidad del dominio SessionEntity a un objeto de creación de Prisma
 */
export function toPrismaCreate(
	sessionEntity: SessionEntity,
): Prisma.sessionCreateInput {
	return {
		id: sessionEntity.id,
		token: sessionEntity.token,
		expiresAt: sessionEntity.expiresAt,
		ipAddress: sessionEntity.ipAddress,
		userAgent: sessionEntity.userAgent,
		user: {
			connect: {
				id: sessionEntity.userId,
			},
		},
	};
}

/**
 * Convierte una entidad del dominio SessionEntity a un objeto de actualización de Prisma
 */
export function toPrismaUpdate(
	sessionEntity: Partial<SessionEntity>,
): Prisma.sessionUpdateInput {
	const updateData: Prisma.sessionUpdateInput = {};

	if (sessionEntity.token !== undefined) {
		updateData.token = sessionEntity.token;
	}
	if (sessionEntity.expiresAt !== undefined) {
		updateData.expiresAt = sessionEntity.expiresAt;
	}
	if (sessionEntity.ipAddress !== undefined) {
		updateData.ipAddress = sessionEntity.ipAddress;
	}
	if (sessionEntity.userAgent !== undefined) {
		updateData.userAgent = sessionEntity.userAgent;
	}

	return updateData;
}

/**
 * Convierte un array de Prisma Sessions a un array de SessionEntities
 */
export function toDomainArray(
	prismaSessions: PrismaSession[],
): SessionEntity[] {
	return prismaSessions.map((session) => toDomain(session));
}
