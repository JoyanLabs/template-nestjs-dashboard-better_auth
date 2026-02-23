import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
	AUTH_SERVICE,
	type IAuthService,
	type UserData,
} from '../../ports/auth-service.port.js';
import { BanUserCommand } from './ban-user.command.js';

export interface BanUserResult {
	user: UserData;
}

@CommandHandler(BanUserCommand)
export class BanUserHandler
	implements ICommandHandler<BanUserCommand, BanUserResult>
{
	private readonly logger = new Logger(BanUserHandler.name);

	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(command: BanUserCommand): Promise<BanUserResult> {
		this.logger.log(`Banning user: ${command.userId}`);

		const user = await this.authService.banUser(
			{
				userId: command.userId,
				banReason: command.banReason,
				banExpiresIn: command.banExpiresIn,
			},
			command.headers,
		);

		this.logger.log(
			`User banned: ${user.id}, reason: ${command.banReason || 'No reason provided'}`,
		);

		// TODO: Disparar evento de auditoría
		// await this.eventBus.publish(new UserBannedEvent(user.id, command.bannedByUserId));

		return { user };
	}
}
