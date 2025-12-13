import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * PrismaModule
 * Módulo global que proporciona acceso a PrismaService en toda la aplicación
 * Al ser @Global, no necesita ser importado en cada módulo que lo use
 */
@Global()
@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
