import type { IRepository } from '@/shared/domain/repository.interface.js';
import type { UserEntity } from '../entities/user.entity.js';

/**
 * Interface del repositorio de usuarios
 * Define las operaciones de persistencia para la entidad User
 * Debe ser implementado en la capa de infraestructura
 */
export interface IUserRepository extends IRepository<UserEntity> {
	/**
	 * Busca un usuario por su email
	 */
	findByEmail(email: string): Promise<UserEntity | null>;

	/**
	 * Verifica si existe un usuario con el email dado
	 */
	existsByEmail(email: string): Promise<boolean>;

	/**
	 * Actualiza un usuario existente
	 */
	update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
}
