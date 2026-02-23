// =============================================================================
// NestJS Dashboard Template - Prisma Patterns
// =============================================================================

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

// =============================================================================
// PRISMA SERVICE
// =============================================================================

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}

// =============================================================================
// CLEAN PRISMA DATA UTILITY
// =============================================================================

export function cleanPrismaData<T extends Record<string, unknown>>(data: T): T {
	return Object.fromEntries(
		Object.entries(data).filter(([_, value]) => value !== undefined),
	) as T;
}

// =============================================================================
// MAPPER COMPLETO
// =============================================================================

interface UserEntity {
	id: string;
	email: string;
	name: string;
	createdAt?: Date;
	updatedAt?: Date;
}

interface PrismaUser {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export function userToDomain(raw: PrismaUser): UserEntity {
	return {
		id: raw.id,
		email: raw.email,
		name: raw.name,
		createdAt: raw.createdAt,
		updatedAt: raw.updatedAt,
	};
}

export function userToPrismaCreate(entity: UserEntity): Prisma.UserCreateInput {
	return {
		id: entity.id,
		email: entity.email,
		name: entity.name,
	};
}

export function userToPrismaUpdate(
	entity: Partial<UserEntity>,
): Prisma.UserUpdateInput {
	return cleanPrismaData({
		email: entity.email,
		name: entity.name,
	});
}

// =============================================================================
// EJEMPLOS DE TRANSACCIONES
// =============================================================================

async function transactionBatchExample(prisma: PrismaClient) {
	const userId = 'user-123';

	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: { name: 'Nuevo Nombre' },
		}),
		prisma.auditLog.create({
			data: {
				action: 'USER_UPDATED',
				entityId: userId,
				entityType: 'user',
			},
		}),
	]);
}

async function transactionInteractiveExample(
	prisma: PrismaClient,
	userId: string,
	amount: number,
) {
	await prisma.$transaction(async (tx) => {
		const user = await tx.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error('User not found');
		}

		const currentBalance = (user as any).balance || 0;
		if (currentBalance < amount) {
			throw new Error('Insufficient balance');
		}

		await tx.user.update({
			where: { id: userId },
			data: { balance: currentBalance - amount } as any,
		});
	});
}

// =============================================================================
// EXPORTS
// =============================================================================
export {
	PrismaService,
	cleanPrismaData,
	userToDomain,
	userToPrismaCreate,
	userToPrismaUpdate,
	transactionBatchExample,
	transactionInteractiveExample,
};
