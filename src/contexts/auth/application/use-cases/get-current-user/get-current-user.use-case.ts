import { Inject, Injectable } from '@nestjs/common';
import type { UserEntity } from '@/contexts/auth/domain/entities/user.entity.js';
import type { IUserRepository } from '@/contexts/auth/domain/repositories/user.repository.interface.js';
import type { IUseCase } from '@/shared/application/use-case.interface.js';
import { NotFoundException } from '@/shared/exceptions/not-found.exception.js';

/**
 * Use Case para obtener el usuario actual
 * Busca un usuario por su ID
 */
@Injectable()
export class GetCurrentUserUseCase implements IUseCase<string, UserEntity> {
	constructor(
		@Inject('IUserRepository')
		private readonly userRepository: IUserRepository,
	) {}

	/**
	 * Ejecuta el caso de uso para obtener el usuario actual
	 */
	async execute(userId: string): Promise<UserEntity> {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new NotFoundException('User', userId);
		}

		return user;
	}
}
