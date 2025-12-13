import { Inject, Injectable } from '@nestjs/common';
import type { SessionEntity } from '@/contexts/auth/domain/entities/session.entity.js';
import type { UserEntity } from '@/contexts/auth/domain/entities/user.entity.js';
import type { IAuthProvider } from '@/contexts/auth/domain/repositories/auth-provider.interface.js';
import type { IUserRepository } from '@/contexts/auth/domain/repositories/user.repository.interface.js';
import type { IUseCase } from '@/shared/application/use-case.interface.js';
import { ValidationException } from '@/shared/exceptions/validation.exception.js';
import type { SignUpDto } from './sign-up.dto.js';

/**
 * Use Case para Sign Up
 * Maneja la lógica de negocio para registrarse
 */
@Injectable()
export class SignUpUseCase
	implements
		IUseCase<
			SignUpDto,
			{ user: UserEntity; session: SessionEntity; token: string }
		>
{
	constructor(
		@Inject('IAuthProvider')
		private readonly authProvider: IAuthProvider,
		@Inject('IUserRepository')
		private readonly userRepository: IUserRepository,
	) {}

	/**
	 * Ejecuta el caso de uso de Sign Up
	 *
	 * TODO: Emitir UserCreatedEvent para Inngest cuando se implemente
	 */
	async execute(
		dto: SignUpDto,
	): Promise<{ user: UserEntity; session: SessionEntity; token: string }> {
		// Validar que el email no esté en uso
		const existingUser = await this.userRepository.findByEmail(dto.email);
		if (existingUser) {
			throw new ValidationException('El email ya está en uso', {
				email: ['Este email ya está registrado'],
			});
		}

		// Crear el usuario usando el proveedor de autenticación
		const result = await this.authProvider.signUp(
			dto.email,
			dto.password,
			dto.name,
		);

		// TODO: Emitir evento UserCreatedEvent
		// await this.eventBus.emit(new UserCreatedEvent(result.user.id, result.user.email));

		return {
			user: result.user,
			session: result.session,
			token: result.session.token,
		};
	}
}
