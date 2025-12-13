import type { Logger } from '@nestjs/common';

import { HealthController } from '@/app/health/api/health.controller.js';
import { createMock, type Mock } from '@/tests/utils/mock.js';

describe('HealthController', () => {
	let healthController: HealthController;
	let logger: Mock<Logger>;

	beforeEach(() => {
		logger = createMock<Logger>();
		healthController = new HealthController(logger);
	});

	describe('run', () => {
		it('should return is healthy', () => {
			expect(healthController.run()).toEqual({ status: 'ok' });
			expect(logger.log).toHaveBeenCalledTimes(1);
		});
	});
});
