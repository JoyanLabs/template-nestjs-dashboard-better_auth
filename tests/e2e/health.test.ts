import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import * as nock from 'nock';
import request from 'supertest';

import { AppModule } from '@/app/app.module.js';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service.js';
import { createMock } from '@/tests/utils/mock.js';

describe('Health', () => {
	let app: NestFastifyApplication;

	beforeAll(async () => {
		const mockPrismaService = createMock<PrismaService>();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(PrismaService)
			.useValue(mockPrismaService)
			.compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(
			new FastifyAdapter(),
		);
		await app.init();
		await app.getHttpAdapter().getInstance().ready();
		nock.disableNetConnect();
		nock.enableNetConnect('127.0.0.1');
	});

	afterEach(() => {
		nock.cleanAll();
	});

	afterAll(async () => {
		await app.close();
		nock.enableNetConnect();
	});

	it('/GET health', async () => {
		const response = await request(app.getHttpServer()).get('/health');
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ status: 'ok' });
	});
});
