import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller.js';

@Module({
	controllers: [AuthController],
})
export class AuthModule {}
