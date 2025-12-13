import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

/**
 * PrismaService
 * Servicio global que gestiona la conexión con la base de datos
 * En Prisma 7.x se requiere un adapter explícito
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
	private prisma: PrismaClient;
	private pool: pg.Pool;

	constructor(private configService: ConfigService) {
		// Obtener la URL de la base de datos
		const databaseUrl = this.configService.get<string>(
			'DATABASE_URL',
			'postgresql://postgres:postgres@localhost:5432/spp_db',
		);

		// Crear pool de conexiones de PostgreSQL
		this.pool = new pg.Pool({
			connectionString: databaseUrl,
		});

		// Crear adapter de Prisma para PostgreSQL
		const adapter = new PrismaPg(this.pool);

		// Inicializar Prisma Client con el adapter
		this.prisma = new PrismaClient({
			adapter,
			log: ['error', 'warn'],
		});
	}

	// Exponer el cliente de Prisma con getters para todos los modelos
	get user() {
		return this.prisma.user;
	}

	get session() {
		return this.prisma.session;
	}

	get account() {
		return this.prisma.account;
	}

	get verification() {
		return this.prisma.verification;
	}

	// Métodos de utilidad
	get $connect() {
		return this.prisma.$connect.bind(this.prisma);
	}

	get $disconnect() {
		return this.prisma.$disconnect.bind(this.prisma);
	}

	get $transaction() {
		return this.prisma.$transaction.bind(this.prisma);
	}

	/**
	 * Conecta con la base de datos al inicializar el módulo
	 */
	async onModuleInit() {
		await this.prisma.$connect();
	}

	/**
	 * Desconecta de la base de datos al destruir el módulo
	 */
	async onModuleDestroy() {
		await this.prisma.$disconnect();
		await this.pool.end();
	}

	/**
	 * Limpia la base de datos (útil para tests)
	 */
	async cleanDatabase() {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('No se puede limpiar la base de datos en producción');
		}

		const models = ['user', 'session', 'account', 'verification'];

		return Promise.all(
			models.map(async (modelName) => {
				const model = this[modelName as keyof PrismaService];
				if (model && typeof model === 'object' && 'deleteMany' in model) {
					return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
				}
				return Promise.resolve();
			}),
		);
	}
}
