import { Module } from '@nestjs/common';

import { UserController } from './api/user.controller.js';

@Module({
	controllers: [UserController],
})
export class UserModule {}
