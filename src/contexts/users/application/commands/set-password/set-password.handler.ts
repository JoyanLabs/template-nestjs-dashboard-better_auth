import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
	AUTH_SERVICE,
	type IAuthService,
} from '../../ports/auth-service.port.js';
import { SetPasswordCommand } from './set-password.command.js';

export interface SetPasswordResult {
	success: boolean;
}

@CommandHandler(SetPasswordCommand)
export class SetPasswordHandler
	implements ICommandHandler<SetPasswordCommand, SetPasswordResult>
{
	private readonly logger = new Logger(SetPasswordHandler.name);

	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(command: SetPasswordCommand): Promise<SetPasswordResult> {
		this.logger.log(`Setting password for user: ${command.userId}`);

		await this.authService.setPassword(
			command.userId,
			command.newPassword,
			command.headers,
		);

		this.logger.log(`Password set for user: ${command.userId}`);

		return { success: true };
	}
}
