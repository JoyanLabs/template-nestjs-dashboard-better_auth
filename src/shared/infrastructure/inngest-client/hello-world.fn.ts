import type { Logger } from '@nestjs/common';
import { inngest } from './client.js';

interface HelloWorldDeps {
	logger: Logger;
}

export const createHelloWorldFn = ({ logger }: HelloWorldDeps) =>
	inngest.createFunction(
		{ id: 'hello-world' },
		{ event: 'app/hello.world' },
		async ({ event, step }) => {
			// Step 1: Log del mensaje
			const result = await step.run('log-message', async () => {
				logger.log(`📨 Inngest recibió: ${event.data.message}`);
				return { received: event.data.message };
			});

			// Step 2: Simular procesamiento
			await step.sleep('wait-a-bit', '1s');

			// Step 3: Respuesta final
			await step.run('complete', async () => {
				logger.log(`✅ Procesamiento completado para: ${result.received}`);
			});

			return { success: true, message: result.received };
		},
	);
