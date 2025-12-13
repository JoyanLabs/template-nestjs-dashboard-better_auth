import type { Prisma, user as PrismaUser } from '@prisma/client';
import { UserEntity } from '@/contexts/auth/domain/entities/user.entity.js';

/**
 * Mapper para convertir entre Prisma User y UserEntity del dominio
 * Mantiene la separación entre la capa de infraestructura y el dominio
 */
export class UserMapper {
	/**
	 * Convierte un modelo de Prisma User a una entidad del dominio UserEntity
	 */
	static toDomain(prismaUser: PrismaUser): UserEntity {
		return UserEntity.create({
			id: prismaUser.id,
			email: prismaUser.email,
			name: prismaUser.name,
			emailVerified: prismaUser.emailVerified,
			image: prismaUser.image,
			createdAt: prismaUser.createdAt,
			updatedAt: prismaUser.updatedAt,
		});
	}

	/**
	 * Convierte una entidad del dominio UserEntity a un objeto de creación de Prisma
	 */
	static toPrismaCreate(userEntity: UserEntity): Prisma.userCreateInput {
		return {
			id: userEntity.id,
			email: userEntity.email,
			name: userEntity.name,
			emailVerified: userEntity.emailVerified,
			image: userEntity.image,
		};
	}

	/**
	 * Convierte una entidad del dominio UserEntity a un objeto de actualización de Prisma
	 */
	static toPrismaUpdate(
		userEntity: Partial<UserEntity>,
	): Prisma.userUpdateInput {
		const updateData: Prisma.userUpdateInput = {};

		if (userEntity.email !== undefined) {
			updateData.email = userEntity.email;
		}
		if (userEntity.name !== undefined) {
			updateData.name = userEntity.name;
		}
		if (userEntity.emailVerified !== undefined) {
			updateData.emailVerified = userEntity.emailVerified;
		}
		if (userEntity.image !== undefined) {
			updateData.image = userEntity.image;
		}

		return updateData;
	}

	/**
	 * Convierte un array de Prisma Users a un array de UserEntities
	 */
	static toDomainArray(prismaUsers: PrismaUser[]): UserEntity[] {
		return prismaUsers.map((user) => UserMapper.toDomain(user));
	}
}
