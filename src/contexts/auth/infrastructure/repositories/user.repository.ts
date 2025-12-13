import { Injectable } from '@nestjs/common';
import type { UserEntity } from '@/contexts/auth/domain/entities/user.entity.js';
import type { IUserRepository } from '@/contexts/auth/domain/repositories/user.repository.interface.js';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service.js';
import { UserMapper } from '../persistence/mappers/user.mapper.js';

/**
 * Implementación del repositorio de usuarios usando Prisma
 * Implementa la interfaz IUserRepository del dominio
 */
@Injectable()
export class UserRepository implements IUserRepository {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Busca un usuario por su ID
	 */
	async findById(id: string): Promise<UserEntity | null> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		return user ? UserMapper.toDomain(user) : null;
	}

	/**
	 * Busca un usuario por su email
	 */
	async findByEmail(email: string): Promise<UserEntity | null> {
		const user = await this.prisma.user.findUnique({
			where: { email: email.toLowerCase() },
		});

		return user ? UserMapper.toDomain(user) : null;
	}

	/**
	 * Verifica si existe un usuario con el email dado
	 */
	async existsByEmail(email: string): Promise<boolean> {
		const count = await this.prisma.user.count({
			where: { email: email.toLowerCase() },
		});

		return count > 0;
	}

	/**
	 * Guarda un usuario (crear o actualizar)
	 */
	async save(user: UserEntity): Promise<UserEntity> {
		const existingUser = await this.prisma.user.findUnique({
			where: { id: user.id },
		});

		if (existingUser) {
			// Actualizar usuario existente
			const updated = await this.prisma.user.update({
				where: { id: user.id },
				data: UserMapper.toPrismaUpdate(user),
			});
			return UserMapper.toDomain(updated);
		}

		// Crear nuevo usuario
		const created = await this.prisma.user.create({
			data: UserMapper.toPrismaCreate(user),
		});

		return UserMapper.toDomain(created);
	}

	/**
	 * Actualiza un usuario existente
	 */
	async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
		const updated = await this.prisma.user.update({
			where: { id },
			data: UserMapper.toPrismaUpdate(user),
		});

		return UserMapper.toDomain(updated);
	}

	/**
	 * Elimina un usuario por su ID
	 */
	async delete(id: string): Promise<void> {
		await this.prisma.user.delete({
			where: { id },
		});
	}
}
