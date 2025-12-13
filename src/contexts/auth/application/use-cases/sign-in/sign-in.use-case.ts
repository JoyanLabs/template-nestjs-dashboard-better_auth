import { Inject, Injectable } from '@nestjs/common';
import type { SessionEntity } from '@/contexts/auth/domain/entities/session.entity.js';
import type { UserEntity } from '@/contexts/auth/domain/entities/user.entity.js';
import type { IAuthProvider } from '@/contexts/auth/domain/repositories/auth-provider.interface.js';
import type { IUseCase } from '@/shared/application/use-case.interface.js';
import type { SignInDto } from './sign-in.dto.js';

/**
 * Use Case para Sign In
 * Maneja la lógica de negocio para iniciar sesión
 */
@Injectable()
export class SignInUseCase
	implements
		IUseCase<
			SignInDto,
			{ user: UserEntity; session: SessionEntity; token: string }
		>
{
	constructor(
		@Inject('IAuthProvider')
		private readonly authProvider: IAuthProvider,
	) {}

	/**
	 * Ejecuta el caso de uso de Sign In
	 *
	 * TODO: Emitir UserLoggedInEvent para Inngest cuando se implemente
	 */
	async execute(
		dto: SignInDto,
	): Promise<{ user: UserEntity; session: SessionEntity; token: string }> {
		// Delegar la autenticación al proveedor (Better Auth)
		const result = await this.authProvider.signIn(dto.email, dto.password);

		// TODO: Emitir evento UserLoggedInEvent
		// await this.eventBus.emit(new UserLoggedInEvent(result.user.id, result.session.id));

		return {
			user: result.user,
			session: result.session,
			token: result.session.token,
		};
	}
}
