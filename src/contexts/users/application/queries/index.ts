// Queries

// Handlers
export { GetCurrentUserHandler } from './get-current-user/get-current-user.handler.js';
export { GetCurrentUserQuery } from './get-current-user/get-current-user.query.js';
export { ListUsersHandler } from './list-users/list-users.handler.js';
export { ListUsersQuery } from './list-users/list-users.query.js';

// Array de todos los handlers para registrar en el módulo
import { GetCurrentUserHandler } from './get-current-user/get-current-user.handler.js';
import { ListUsersHandler } from './list-users/list-users.handler.js';

export const QueryHandlers = [GetCurrentUserHandler, ListUsersHandler];
