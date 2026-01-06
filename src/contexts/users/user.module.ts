import { Module } from '@nestjs/common';

import { RoleController } from './api/role.controller.js';
import { UserController } from './api/user.controller.js';

@Module({
	controllers: [UserController, RoleController],
})
export class UserModule {}
