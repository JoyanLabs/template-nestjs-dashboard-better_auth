import { Inject, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
	AUTH_SERVICE,
	type IAuthService,
	type UserData,
} from '../../ports/auth-service.port.js';
import { GetCurrentUserQuery } from './get-current-user.query.js';

export interface GetCurrentUserResult {
	user: UserData;
}

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler
	implements IQueryHandler<GetCurrentUserQuery, GetCurrentUserResult>
{
	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(query: GetCurrentUserQuery): Promise<GetCurrentUserResult> {
		const session = await this.authService.getSession(query.headers);

		if (!session?.user) {
			throw new UnauthorizedException('No autenticado');
		}

		return { user: session.user };
	}
}
