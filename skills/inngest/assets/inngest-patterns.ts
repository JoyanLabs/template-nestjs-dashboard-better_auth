// =============================================================================
// NestJS Dashboard Template - Inngest Patterns
// =============================================================================

// =============================================================================
// TIPOS DE EVENTOS
// =============================================================================

export type Events = {
	'app/hello.world': {
		data: { message: string };
	};
	'user/created': {
		data: {
			userId: string;
			email: string;
			name: string;
		};
	};
	'user/welcome.email': {
		data: {
			userId: string;
			email: string;
			name: string;
		};
	};
};

// =============================================================================
// FACTORY PATTERN PARA FUNCIONES
// =============================================================================

interface NotificationService {
	sendEmail(params: {
		to: string;
		subject: string;
		html: string;
	}): Promise<{ success: boolean; messageId: string }>;
}

interface UserOnboardingDeps {
	logger: Console;
	notificationService: NotificationService;
}

// Placeholder para inngest
declare const inngest: {
	createFunction<T>(
		config: { id: string; retries?: number },
		trigger: { event: string },
		handler: (ctx: {
			event: { data: T };
			step: {
				run: <R>(name: string, fn: () => Promise<R>) => Promise<R>;
				sleep: (name: string, duration: string) => Promise<void>;
				waitForEvent: <E>(name: string, opts: any) => Promise<E | null>;
			};
		}) => Promise<any>,
	): any;
	send: (event: { name: string; data: any }) => Promise<void>;
};

export const createUserOnboardingFn = ({
	logger,
	notificationService,
}: UserOnboardingDeps) =>
	inngest.createFunction(
		{ id: 'user-onboarding', retries: 3 },
		{ event: 'user/created' },
		async ({ event, step }) => {
			const { userId, email, name } = event.data;

			// Step 1: Send welcome email
			const emailResult = await step.run('send-welcome-email', async () => {
				const result = await notificationService.sendEmail({
					to: email,
					subject: 'Welcome!',
					html: `<h1>Welcome ${name}!</h1>`,
				});
				logger.log(`Email enviado a ${email}`);
				return result;
			});

			return { success: true, userId, emailSent: emailResult.success };
		},
	);

// =============================================================================
// EJEMPLO DE FUNCTIONS FACTORY
// =============================================================================

interface InngestFunctionsDeps {
	logger: Console;
	notificationService: NotificationService;
}

export const getInngestFunctions = (deps: InngestFunctionsDeps) => [
	createUserOnboardingFn(deps),
];

// =============================================================================
// ENVIAR EVENTOS
// =============================================================================

async function sendEventExample() {
	await inngest.send({
		name: 'user/created',
		data: {
			userId: 'user-123',
			email: 'user@example.com',
			name: 'John Doe',
		},
	});
}

// =============================================================================
// STEP PATTERNS
// =============================================================================

async function stepPatternsExample(step: {
	run: <R>(name: string, fn: () => Promise<R>) => Promise<R>;
	sleep: (name: string, duration: string) => Promise<void>;
	waitForEvent: <E>(name: string, opts: any) => Promise<E | null>;
}) {
	// step.run: Operación atómica
	const result = await step.run('process-data', async () => {
		return { processed: true };
	});

	// step.sleep: Esperar tiempo
	await step.sleep('wait-delay', '1h');

	// step.waitForEvent: Esperar otro evento
	const event = await step.waitForEvent('wait-for-completion', {
		event: 'task/completed',
		timeout: '24h',
	});
}

// =============================================================================
// EXPORTS
// =============================================================================
export {
	createUserOnboardingFn,
	getInngestFunctions,
	sendEventExample,
	stepPatternsExample,
};
export type { Events, UserOnboardingDeps, InngestFunctionsDeps };
