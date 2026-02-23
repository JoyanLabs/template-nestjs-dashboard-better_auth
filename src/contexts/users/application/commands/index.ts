// Commands

export { BanUserCommand } from './ban-user/ban-user.command.js';
export { BanUserHandler } from './ban-user/ban-user.handler.js';
export { CreateUserCommand } from './create-user/create-user.command.js';
// Handlers
export { CreateUserHandler } from './create-user/create-user.handler.js';
export { DeleteUserCommand } from './delete-user/delete-user.command.js';
export { DeleteUserHandler } from './delete-user/delete-user.handler.js';
export { SetPasswordCommand } from './set-password/set-password.command.js';
export { SetPasswordHandler } from './set-password/set-password.handler.js';
export { UnbanUserCommand } from './unban-user/unban-user.command.js';
export { UnbanUserHandler } from './unban-user/unban-user.handler.js';
export { UpdateUserCommand } from './update-user/update-user.command.js';
export { UpdateUserHandler } from './update-user/update-user.handler.js';

import { BanUserHandler } from './ban-user/ban-user.handler.js';
// Array de todos los handlers para registrar en el módulo
import { CreateUserHandler } from './create-user/create-user.handler.js';
import { DeleteUserHandler } from './delete-user/delete-user.handler.js';
import { SetPasswordHandler } from './set-password/set-password.handler.js';
import { UnbanUserHandler } from './unban-user/unban-user.handler.js';
import { UpdateUserHandler } from './update-user/update-user.handler.js';

export const CommandHandlers = [
	CreateUserHandler,
	BanUserHandler,
	UnbanUserHandler,
	UpdateUserHandler,
	DeleteUserHandler,
	SetPasswordHandler,
];
