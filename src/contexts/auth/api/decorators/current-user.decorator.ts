import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { UserEntity } from '@/contexts/auth/domain/entities/user.entity.js';

/**
 * Decorador para inyectar el usuario autenticado en los controladores
 * El usuario debe haber sido adjuntado al request por el BetterAuthGuard
 *
 * @example
 * ```typescript
 * @Get('me')
 * @UseGuards(BetterAuthGuard)
 * async getMe(@CurrentUser() user: UserEntity) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): UserEntity => {
		const request = ctx.switchToHttp().getRequest<FastifyRequest>();
		const user = (request as FastifyRequest & { user?: UserEntity }).user;

		if (!user) {
			throw new Error(
				'Usuario no encontrado en el request. ¿Olvidaste usar @UseGuards(BetterAuthGuard)?',
			);
		}

		return user;
	},
);

/**
 * Decorador para inyectar la sesión actual en los controladores
 * La sesión debe haber sido adjuntada al request por el BetterAuthGuard
 */
export const CurrentSession = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<FastifyRequest>();
		const session = (request as FastifyRequest & { session?: unknown }).session;

		if (!session) {
			throw new Error(
				'Sesión no encontrada en el request. ¿Olvidaste usar @UseGuards(BetterAuthGuard)?',
			);
		}

		return session;
	},
);
