// =============================================================================
// NestJS Dashboard Template - NestJS + CQRS Patterns
// =============================================================================

import {
	Body,
	Controller,
	Get,
	Inject,
	Injectable,
	Module,
	Post,
	Req,
} from '@nestjs/common';
import {
	CommandBus,
	CommandHandler,
	CqrsModule,
	ICommandHandler,
	IQueryHandler,
	QueryBus,
	QueryHandler,
} from '@nestjs/cqrs';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// =============================================================================
// PATRÓN 1: COMMAND
// =============================================================================

class CreateUserCommand {
	constructor(
		public readonly email: string,
		public readonly name: string,
		public readonly password: string,
		public readonly headers: Headers,
	) {}
}

// =============================================================================
// PATRÓN 2: COMMAND HANDLER
// =============================================================================

interface IAuthService {
	createUser(
		params: { email: string; name: string; password: string },
		headers: Headers,
	): Promise<UserData>;
}

interface UserData {
	id: string;
	email: string;
	name: string | null;
}

const AUTH_SERVICE = Symbol('AUTH_SERVICE');

@CommandHandler(CreateUserCommand)
class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(command: CreateUserCommand): Promise<{ user: UserData }> {
		const user = await this.authService.createUser(
			{
				email: command.email,
				name: command.name,
				password: command.password,
			},
			command.headers,
		);
		return { user };
	}
}

// =============================================================================
// PATRÓN 3: QUERY
// =============================================================================

class GetCurrentUserQuery {
	constructor(public readonly headers: Headers) {}
}

// =============================================================================
// PATRÓN 4: QUERY HANDLER
// =============================================================================

@QueryHandler(GetCurrentUserQuery)
class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
	constructor(
		@Inject(AUTH_SERVICE)
		private readonly authService: IAuthService,
	) {}

	async execute(query: GetCurrentUserQuery): Promise<{ user: UserData }> {
		const session = await (this.authService as any).getSession(query.headers);
		if (!session?.user) {
			throw new Error('Not authenticated');
		}
		return { user: session.user };
	}
}

// =============================================================================
// PATRÓN 5: PUERTO
// =============================================================================

interface IAuthServiceComplete {
	getSession(headers: Headers): Promise<SessionData | null>;
	createUser(params: CreateUserParams, headers: Headers): Promise<UserData>;
}

interface SessionData {
	user: UserData;
	session: { id: string; expiresAt: Date };
}

interface CreateUserParams {
	email: string;
	name: string;
	password: string;
}

// =============================================================================
// PATRÓN 6: ADAPTER
// =============================================================================

declare const auth: {
	api: {
		getSession(opts: any): Promise<any>;
		createUser(opts: any): Promise<any>;
	};
};

@Injectable()
class BetterAuthAdapter implements IAuthServiceComplete {
	async getSession(headers: Headers): Promise<SessionData | null> {
		try {
			const result = await auth.api.getSession({ headers });
			if (!result?.user) return null;
			return {
				user: this.mapUser(result.user),
				session: {
					id: result.session.id,
					expiresAt: new Date(result.session.expiresAt),
				},
			};
		} catch {
			return null;
		}
	}

	async createUser(
		params: CreateUserParams,
		headers: Headers,
	): Promise<UserData> {
		const result = await auth.api.createUser({
			headers,
			body: params,
		});
		return this.mapUser(result.user);
	}

	private mapUser(user: any): UserData {
		return {
			id: user.id,
			email: user.email,
			name: user.name ?? null,
		};
	}
}

// =============================================================================
// PATRÓN 7: CONTROLLER CON CQRS
// =============================================================================

class CreateUserDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email!: string;

	@ApiProperty({ example: 'John Doe' })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ example: 'securePassword123' })
	@IsString()
	@IsNotEmpty()
	password!: string;
}

function toWebHeaders(headers: any): Headers {
	return new Headers(headers);
}

@ApiTags('Users')
@Controller('users')
class UsersController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@Post()
	@ApiOperation({ summary: 'Crear usuario' })
	async create(@Body() dto: CreateUserDto, @Req() req: any) {
		const command = new CreateUserCommand(
			dto.email,
			dto.name,
			dto.password,
			toWebHeaders(req.headers),
		);
		return this.commandBus.execute(command);
	}

	@Get('me')
	@ApiOperation({ summary: 'Obtener perfil actual' })
	async getProfile(@Req() req: any) {
		const query = new GetCurrentUserQuery(toWebHeaders(req.headers));
		return this.queryBus.execute(query);
	}
}

// =============================================================================
// PATRÓN 8: MÓDULO CON CQRS
// =============================================================================

const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetCurrentUserHandler];

@Module({
	imports: [CqrsModule],
	controllers: [UsersController],
	providers: [
		...CommandHandlers,
		...QueryHandlers,
		{
			provide: AUTH_SERVICE,
			useClass: BetterAuthAdapter,
		},
	],
	exports: [AUTH_SERVICE],
})
class UsersModule {}

// =============================================================================
// PATRÓN 9: ENTIDAD DE DOMINIO
// =============================================================================

abstract class BaseEntity {
	constructor(
		public readonly id: string,
		public readonly createdAt?: Date,
		public readonly updatedAt?: Date,
	) {}
}

class UserEntity extends BaseEntity {
	constructor(
		id: string,
		public email: string,
		public name: string,
		createdAt?: Date,
		updatedAt?: Date,
	) {
		super(id, createdAt, updatedAt);
	}

	static create(props: { email: string; name: string }): UserEntity {
		return new UserEntity(crypto.randomUUID(), props.email, props.name);
	}
}

// =============================================================================
// PATRÓN 10: EXCEPCIONES DE DOMINIO
// =============================================================================

class DomainException extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = 'DomainException';
	}
}

class NotFoundException extends DomainException {
	constructor(entity: string, id: string) {
		super(`${entity} with id ${id} not found`, 'NOT_FOUND');
	}
}

// =============================================================================
// EXPORTS
// =============================================================================
export {
	CreateUserCommand,
	CreateUserHandler,
	GetCurrentUserQuery,
	GetCurrentUserHandler,
	type IAuthServiceComplete as IAuthService,
	AUTH_SERVICE,
	BetterAuthAdapter,
	UsersController,
	UsersModule,
	BaseEntity,
	UserEntity,
	DomainException,
	NotFoundException,
	CommandHandlers,
	QueryHandlers,
};
