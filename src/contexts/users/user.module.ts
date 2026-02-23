import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { RoleController } from './api/role.controller.js';
import { UserController } from './api/user.controller.js';

// Command Handlers - importados directamente para evitar problemas ESM con barrel files
import { BanUserHandler } from './application/commands/ban-user/ban-user.handler.js';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler.js';
import { DeleteUserHandler } from './application/commands/delete-user/delete-user.handler.js';
import { SetPasswordHandler } from './application/commands/set-password/set-password.handler.js';
import { UnbanUserHandler } from './application/commands/unban-user/unban-user.handler.js';
import { UpdateUserHandler } from './application/commands/update-user/update-user.handler.js';

// Ports (interfaces)
import { AUTH_SERVICE } from './application/ports/auth-service.port.js';

// Query Handlers
import { GetCurrentUserHandler } from './application/queries/get-current-user/get-current-user.handler.js';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler.js';

// Adapters (implementaciones)
import { BetterAuthAdapter } from './infrastructure/adapters/better-auth.adapter.js';

/**
 * Array de todos los handlers de comandos.
 * Se definen aquí directamente para evitar problemas con imports de barrel files en ESM.
 */
const CommandHandlers = [
	CreateUserHandler,
	BanUserHandler,
	UnbanUserHandler,
	UpdateUserHandler,
	DeleteUserHandler,
	SetPasswordHandler,
];

/**
 * Array de todos los handlers de queries.
 */
const QueryHandlers = [GetCurrentUserHandler, ListUsersHandler];

@Module({
	imports: [CqrsModule],
	controllers: [UserController, RoleController],
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
export class UserModule {}
