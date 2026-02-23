import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
	AUTH_SERVICE,
	type IAuthService,
	type UserData,
} from '../../ports/auth-service.port.js';
import { UnbanUserCommand } from './unban-user.command.js';

export interface UnbanUserResult {
	user: UserData;
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserHandler
	implements ICommandHandler<UnbanUserCommand, UnbanUserResult>
{
	private readonly logger = new Logger(UnbanUserHandler.name);

	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(command: UnbanUserCommand): Promise<UnbanUserResult> {
		this.logger.log(`Unbanning user: ${command.userId}`);

		const user = await this.authService.unbanUser(
			command.userId,
			command.headers,
		);

		this.logger.log(`User unbanned: ${user.id}`);

		return { user };
	}
}
