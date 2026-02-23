import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { inngest } from '@/shared/infrastructure/inngest-client/client.js';
import {
	AUTH_SERVICE,
	type IAuthService,
	type UserData,
} from '../../ports/auth-service.port.js';
import { CreateUserCommand } from './create-user.command.js';

/**
 * Resultado del comando CreateUser.
 */
export interface CreateUserResult {
	user: UserData;
}

/**
 * Handler para el comando CreateUser.
 *
 * Responsabilidades:
 * 1. Crear el usuario via IAuthService (abstracción de Better Auth)
 * 2. Disparar evento de Inngest para onboarding (audit + email)
 *
 * El handler NO conoce Better Auth directamente, solo la interfaz IAuthService.
 */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler
	implements ICommandHandler<CreateUserCommand, CreateUserResult>
{
	private readonly logger = new Logger(CreateUserHandler.name);

	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(command: CreateUserCommand): Promise<CreateUserResult> {
		this.logger.log(`Creating user: ${command.email}`);

		// 1. Crear usuario via el puerto de autenticación
		const user = await this.authService.createUser(
			{
				email: command.email,
				password: command.password,
				name: command.name,
				role: command.role,
			},
			command.headers,
		);

		this.logger.log(`User created: ${user.id}`);

		// 2. Disparar evento de Inngest para onboarding
		// TODO: En el futuro, esto podría ser un evento de dominio
		// manejado por un EventHandler separado
		await inngest.send({
			name: 'user/created',
			data: {
				userId: user.id,
				email: user.email,
				name: user.name || command.name,
				createdBy: command.createdByUserId || 'system',
			},
		});

		this.logger.log(`Onboarding event dispatched for: ${user.email}`);

		return { user };
	}
}
