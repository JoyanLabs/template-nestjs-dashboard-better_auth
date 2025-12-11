import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '@/app/app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

	const configService = app.get(ConfigService);
	const logger = app.get(Logger);

	// Configuración de variables de entorno
	const port = configService.get<string>('PORT', '3000');
	const nodeEnv = configService.get<string>('NODE_ENV', 'development');
	const apiPrefix = configService.get<string>('API_PREFIX', 'api');

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
}

bootstrap().catch(handleError);

function handleError(error: unknown) {
	console.error(error);
	process.exit(1);
}

process.on('uncaughtException', handleError);
