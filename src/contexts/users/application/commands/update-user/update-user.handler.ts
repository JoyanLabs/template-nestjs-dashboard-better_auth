import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
	AUTH_SERVICE,
	type IAuthService,
	type UserData,
} from '../../ports/auth-service.port.js';
import { UpdateUserCommand } from './update-user.command.js';

export interface UpdateUserResult {
	user: UserData;
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler
	implements ICommandHandler<UpdateUserCommand, UpdateUserResult>
{
	private readonly logger = new Logger(UpdateUserHandler.name);

	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
		this.logger.log(`Updating user: ${command.userId}`);

		const user = await this.authService.updateUser(
			{
				userId: command.userId,
				data: command.data,
			},
			command.headers,
		);

		this.logger.log(`User updated: ${user.id}`);

		return { user };
	}
}
