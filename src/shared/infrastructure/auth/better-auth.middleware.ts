import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import { auth } from './better-auth.config.js';

/**
 * Middleware que intercepta las rutas de Better Auth y las procesa usando toNodeHandler.
 * Basado en la documentación oficial de Better Auth para Express.
 *
 * @see https://www.better-auth.com/docs/integrations/express
 */
@Injectable()
export class BetterAuthMiddleware implements NestMiddleware {
	private readonly logger = new Logger(BetterAuthMiddleware.name);
	private readonly handler = toNodeHandler(auth);

	async use(req: Request, res: Response, next: NextFunction) {
		// Solo procesar rutas que empiecen con /api/auth
		if (!req.path.startsWith('/api/auth')) {
			return next();
		}

		this.logger.debug(`Processing auth request: ${req.method} ${req.path}`);

		try {
			// Usar toNodeHandler que maneja correctamente el body
			await this.handler(req, res);
		} catch (error) {
			this.logger.error('Better Auth middleware error:', error);
			if (!res.headersSent) {
				res.status(500).json({ error: 'Internal server error' });
			}
		}
	}
}
