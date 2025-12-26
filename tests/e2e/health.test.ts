import type { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as nock from 'nock';
import request from 'supertest';
import { HealthController } from '@/app/health/api/health.controller.js';
import { createMock } from '@/tests/utils/mock.js';

describe('Health', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const mockLogger = createMock<Logger>();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
			providers: [
				{
					provide: Logger,
					useValue: mockLogger,
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
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
