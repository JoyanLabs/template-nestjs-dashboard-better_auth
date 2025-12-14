/// <reference path="./types/fastify.d.ts" />
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '@/app/app.module.js';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

	const configService = app.get(ConfigService);
	const logger = app.get(Logger);

	// Configuración de variables de entorno
	const port = configService.get<string>('PORT', '3001');
	const nodeEnv = configService.get<string>('NODE_ENV', 'development');
	const apiPrefix = configService.get<string>('API_PREFIX', 'api');

	// Registrar plugin de cookies
	await app.register(fastifyCookie, {
		secret: configService.get<string>('JWT_SECRET', 'my-secret'),
	});

	// Configurar CORS
	await app.register(fastifyCors, {
		origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
		exposedHeaders: ['Set-Cookie'],
	});

	// Establecer prefijo global de la API
	app.setGlobalPrefix(apiPrefix);

	// Iniciar servidor
	await app.listen(port, '0.0.0.0');

	// Logs informativos
	logger.log(
		`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
	);
	logger.log(`📊 Environment: ${nodeEnv}`);
	logger.log(`🔧 API Prefix: /${apiPrefix}`);
	logger.log(`🔐 Authentication: Better Auth configured`);
	logger.log(`🍪 Cookies: Enabled`);
	logger.log(`🌐 CORS: Enabled for http://localhost:3000`);
}

bootstrap().catch(handleError);

function handleError(error: unknown) {
	console.error(error);
	process.exit(1);
}

process.on('uncaughtException', handleError);
