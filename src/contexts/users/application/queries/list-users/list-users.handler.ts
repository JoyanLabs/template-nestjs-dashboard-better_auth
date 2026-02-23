import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
	AUTH_SERVICE,
	type IAuthService,
	type ListUsersResult,
} from '../../ports/auth-service.port.js';
import { ListUsersQuery } from './list-users.query.js';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler
	implements IQueryHandler<ListUsersQuery, ListUsersResult>
{
	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(query: ListUsersQuery): Promise<ListUsersResult> {
		return this.authService.listUsers(
			{
				limit: query.limit,
				offset: query.offset,
			},
			query.headers,
		);
	}
}
