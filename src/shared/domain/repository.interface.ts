import type { Prisma, PrismaClient } from '@prisma/client';

/**
 * Tipo para el cliente de Prisma que puede ser el cliente normal o uno transaccional
 */
export type PrismaClientOrTransaction = PrismaClient | Prisma.TransactionClient;

/**
 * Generic Repository Interface
 * Define contratos base para operaciones de repositorio
 */
export interface IRepository<T> {
	/**
	 * Busca una entidad por su ID
	 */
	findById(id: string, tx?: PrismaClientOrTransaction): Promise<T | null>;

	/**
	 * Guarda una entidad (crear o actualizar)
	 */
	save(entity: T, tx?: PrismaClientOrTransaction): Promise<T>;

	/**
	 * Elimina una entidad por su ID
	 */
	delete(id: string, tx?: PrismaClientOrTransaction): Promise<void>;
}
