import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { toNodeHandler } from 'better-auth/node';
import cookieParser from 'cookie-parser';

import { AppModule } from '@/app/app.module.js';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import {
	type EnvConfig,
	validateEnv,
} from '@/shared/infrastructure/config/env.schema.js';

async function bootstrap() {
	// NestJS usa Express body parser por defecto
	// Better Auth handler montado directamente en Express maneja su propio body
	const app = await NestFactory.create(AppModule);

	const logger = new Logger('Bootstrap');

	// Validación de variables de entorno al arranque
	let env: EnvConfig;
	try {
		env = validateEnv(process.env);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		logger.error(message);
		process.exit(1);
	}

	const port = env.PORT;
	const nodeEnv = env.NODE_ENV;
	const apiPrefix = env.API_PREFIX;

	// Fix para Express 5: Usar regex en lugar de wildcard
	// Esto evita el bug de Express 5 con /*path
	// Ver: https://github.com/better-auth/better-auth/issues/6636
	const express = app.getHttpAdapter().getInstance();
	const authHandler = toNodeHandler(auth);
	express.all(/^\/api\/auth\/.*$/, authHandler);
	logger.log('✅ Better Auth handler mounted with Express 5 regex fix');

	// Configurar cookie parser
	app.use(cookieParser(env.JWT_SECRET));

	// Configurar CORS dinámico usando NestJS built-in
	const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o: string) =>
		o.trim(),
	);
	app.enableCors({
		origin: (
			origin: string | undefined,
			callback: (err: Error | null, allow?: boolean) => void,
		) => {
			// En desarrollo, permitir peticiones sin origen (como Postman) o de la lista permitida
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
				return;
			}

			// Si falla, imprimimos cuál es el origen que está intentando entrar
			console.warn(
				`⚠️ CORS bloqueado para el origen: ${origin}. Asegúrate de que esté en ALLOWED_ORIGINS.`,
			);
			callback(new Error('Not allowed by CORS'), false);
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'Cookie',
			'x-better-auth-agent',
			'x-csrf-token',
		],
		exposedHeaders: ['Set-Cookie'],
	});

	// Establecer prefijo global de la API ANTES de configurar Swagger
	app.setGlobalPrefix(apiPrefix);

	// Global Exception Filter for Domain
	const { DomainExceptionFilter } = await import(
		'./shared/infrastructure/filters/domain-exception.filter.js'
	);
	app.useGlobalFilters(new DomainExceptionFilter());

	// Configuración de Swagger/OpenAPI (después del prefijo global para incluir /api en las rutas)
	const config = new DocumentBuilder()
		.setTitle('SPP Backend API')
		.setDescription('Documentación de la API del sistema SPP')
		.setVersion('1.0')
		.addServer(`http://localhost:${port}`)
		.addBearerAuth()
		.addCookieAuth('session_token')
		.addTag('Autenticación')
		.addTag('api')
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// Servir el documento OpenAPI en /api-docs (estándar de NestJS)
	SwaggerModule.setup('api-docs', app, document, {
		jsonDocumentUrl: 'api-json',
	});

	// Configuración de Scalar para una documentación interactiva mejorada
	app.use(
		'/reference',
		apiReference({
			spec: {
				content: document,
			},
		} as Parameters<typeof apiReference>[0]),
	);

	// Iniciar servidor
	await app.listen(port, '0.0.0.0');

	// Logs informativos
	logger.log(
		`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
	);
	logger.log(`📊 Environment: ${nodeEnv}`);
	logger.log(`🔧 API Prefix: /${apiPrefix}`);
	logger.log(`🔐 Authentication: Better Auth enabled`);
	logger.log(`🍪 Cookies: Enabled`);
	logger.log(`🌐 CORS: Enabled for ${allowedOrigins.join(', ')}`);
	logger.log(`📚 API Documentation: http://localhost:${port}/reference`);
}

bootstrap().catch(handleError);

function handleError(error: unknown) {
	console.error(error);
	process.exit(1);
}

process.on('uncaughtException', handleError);
