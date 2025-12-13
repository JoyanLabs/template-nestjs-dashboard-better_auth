import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module.js';

// Controllers (API Layer)
import { AuthController } from './api/auth.controller.js';

// Guards
import { BetterAuthGuard } from './api/guards/better-auth.guard.js';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user/get-current-user.use-case.js';
// Use Cases (Application Layer)
import { SignInUseCase } from './application/use-cases/sign-in/sign-in.use-case.js';
import { SignUpUseCase } from './application/use-cases/sign-up/sign-up.use-case.js';
// Adapters (Infrastructure Layer)
import { BetterAuthAdapter } from './infrastructure/adapters/better-auth.adapter.js';
import { SessionRepository } from './infrastructure/repositories/session.repository.js';
// Repositories (Infrastructure Layer)
import { UserRepository } from './infrastructure/repositories/user.repository.js';

/**
 * AuthModule
 * Módulo que orquesta todas las capas del contexto de autenticación
 * Implementa inyección de dependencias por tokens siguiendo Clean Architecture
 */
@Module({
	imports: [
		ConfigModule, // Para leer variables de entorno
		PrismaModule, // Para acceso a la base de datos
	],
	controllers: [AuthController],
	providers: [
		// ========================================
		// Use Cases (Application Layer)
		// ========================================
		SignInUseCase,
		SignUpUseCase,
		GetCurrentUserUseCase,

		// ========================================
		// Repositories (Infrastructure Layer)
		// Inyección por tokens para cumplir con inversión de dependencias
		// ========================================
		{
			provide: 'IUserRepository',
			useClass: UserRepository,
		},
		{
			provide: 'ISessionRepository',
			useClass: SessionRepository,
		},

		// ========================================
		// Auth Provider (Infrastructure Layer)
		// Adaptador de Better Auth
		// ========================================
		{
			provide: 'IAuthProvider',
			useClass: BetterAuthAdapter,
		},

		// ========================================
		// Guards (API Layer)
		// ========================================
		BetterAuthGuard,
	],
	exports: [
		// Exportar el guard para usarlo en otros módulos
		BetterAuthGuard,
		// Exportar los use cases si otros módulos los necesitan
		SignInUseCase,
		SignUpUseCase,
		GetCurrentUserUseCase,
		// Exportar tokens de repositorios si otros módulos los necesitan
		'IUserRepository',
		'ISessionRepository',
		'IAuthProvider',
	],
})
export class AuthModule {}
