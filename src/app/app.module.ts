import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@/app/auth/auth.module.js';
import { HealthModule } from '@/app/health/health.module.js';
import { LoggerModule } from '@/contexts/shared/logger/logger.module.js';
import { UserModule } from '@/contexts/users/user.module.js';
import { BetterAuthMiddleware } from '@/shared/infrastructure/auth/better-auth.middleware.js';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, cache: true }),
		PrismaModule,
		LoggerModule,
		AuthModule,
		HealthModule,
		UserModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// Aplicar el middleware de Better Auth a todas las rutas
		// Usando named parameter syntax para Express 5.x (path-to-regexp v8)
		consumer.apply(BetterAuthMiddleware).forRoutes('{*path}');
	}
}
