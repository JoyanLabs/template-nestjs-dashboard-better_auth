import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import cookieParser from 'cookie-parser';
import { serve } from 'inngest/express';

import { AppModule } from '@/app/app.module.js';
import {
	type EnvConfig,
	validateEnv,
} from '@/shared/infrastructure/config/env.schema.js';
import { inngest } from '@/shared/infrastructure/inngest-client/client.js';
import { getInngestFunctions } from '@/shared/infrastructure/inngest-client/functions-factory.js';

async function bootstrap() {
	// NestJS usa Express body parser por defecto
	// Better Auth handler montado directamente en Express maneja su propio body
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bodyParser: true,
	});

	// Configurar body parser para Inngest (payloads grandes)
	app.useBodyParser('json', { limit: '10mb' });

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

	// NOTA: Las rutas de autenticación (/api/auth/*) son manejadas por
	// AuthController usando auth.api.* programáticamente.
	// Ya no usamos el handler de Express para evitar duplicación de rutas.

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

	// Global Exception Filter for Domain and Unhandled Errors
	const { DomainExceptionFilter } = await import(
		'./shared/infrastructure/filters/domain-exception.filter.js'
	);
	const { GlobalExceptionFilter } = await import(
		'./shared/infrastructure/filters/global-exception.filter.js'
	);

	// El orden importa: NestJS procesa filtros globales en orden de registro.
	// Pero la especificidad de @Catch() tiene precedencia lógica.
	// Registramos ambos para asegurar cobertura total.
	app.useGlobalFilters(
		new GlobalExceptionFilter(),
		new DomainExceptionFilter(),
	);

	// Configuración global de validación (class-validator)
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true, // Transforma el payload al tipo del DTO
			whitelist: true, // Elimina propiedades no decoradas en el DTO
			forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
		}),
	);

	// ============================================
	// Inngest Configuration
	// ============================================
	// Configuración básica de Inngest - las dependencias se inyectan en el factory
	const inngestFunctions = getInngestFunctions({
		logger: new Logger('Inngest'),
	});

	app.use(
		'/api/inngest',
		serve({
			client: inngest,
			functions: inngestFunctions,
		}),
	);

	logger.log(`🔄 Inngest: ${inngestFunctions.length} function(s) registered`);
	logger.log(`📡 Inngest endpoint: http://localhost:${port}/api/inngest`);

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
