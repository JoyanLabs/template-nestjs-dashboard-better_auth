import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from '@/app/health/health.module.js';
import { AuthModule } from '@/contexts/auth/auth.module.js';
import { LoggerModule } from '@/contexts/shared/logger/logger.module.js';
import { UserModule } from '@/contexts/users/user.module.js';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, cache: true }),
		PrismaModule,
		LoggerModule,
		HealthModule,
		AuthModule,
		UserModule,
	],
})
export class AppModule {}
