import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from '@/app/health/health.module';
import { UserModule } from '@/contexts/users/user.module';
import { LoggerModule } from '@/shared/logger/logger.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, cache: true }),
		LoggerModule,
		HealthModule,
		UserModule,
	],
})
export class AppModule {}
