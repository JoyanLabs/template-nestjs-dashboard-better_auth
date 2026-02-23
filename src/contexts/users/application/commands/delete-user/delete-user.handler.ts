import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
	AUTH_SERVICE,
	type IAuthService,
} from '../../ports/auth-service.port.js';
import { DeleteUserCommand } from './delete-user.command.js';

export interface DeleteUserResult {
	success: boolean;
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler
	implements ICommandHandler<DeleteUserCommand, DeleteUserResult>
{
	private readonly logger = new Logger(DeleteUserHandler.name);

	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(command: DeleteUserCommand): Promise<DeleteUserResult> {
		this.logger.log(`Deleting user: ${command.userId}`);

		await this.authService.deleteUser(command.userId, command.headers);

		this.logger.log(`User deleted: ${command.userId}`);

		// TODO: Disparar evento de auditoría
		// await this.eventBus.publish(new UserDeletedEvent(command.userId, command.deletedByUserId));

		return { success: true };
	}
}
