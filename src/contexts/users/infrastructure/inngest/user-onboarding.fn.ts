import { inngest } from '@/shared/infrastructure/inngest-client/client.js';

/**
 * Función Inngest: User Onboarding
 *
 * Se ejecuta cuando un admin crea un nuevo usuario.
 * Para el template, esta es una versión base que puede ser extendida
 * con las siguientes funcionalidades:
 * 1. Registrar la acción en el audit log
 * 2. Enviar email de "Configura tu cuenta"
 *
 * Para habilitar completamente, necesitas:
 * - Implementar IAuditLogRepository
 * - Implementar INotificationService
 * - Crear email templates
 */
export const createUserOnboardingFn = (deps: {
	logger: {
		log: (message: string) => void;
	};
}) =>
	inngest.createFunction(
		{
			id: 'user-onboarding',
			retries: 3,
		},
		{ event: 'user/created' },
		async ({ event, step }) => {
			const { userId, email, name, createdBy } = event.data as {
				userId: string;
				email: string;
				name: string;
				createdBy?: string;
			};

			deps.logger.log(`🚀 Starting onboarding for user: ${email}`);

			// Step 1: Audit Log (placeholder - requires IAuditLogRepository)
			await step.run('audit-log', async () => {
				// TODO: Implementar con IAuditLogRepository
				// await auditLogRepository.create({
				// 	action: 'USER_CREATED',
				// 	entityType: 'user',
				// 	entityId: userId,
				// 	performedBy: createdBy,
				// 	metadata: { email, name, createdAt: new Date().toISOString() },
				// });

				deps.logger.log(`📝 Audit log: USER_CREATED for ${email}`);
				return { logged: true };
			});

			// Step 2: Send setup email (placeholder - requires INotificationService)
			const emailResult = await step.run('send-setup-email', async () => {
				// TODO: Implementar con INotificationService
				// const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
				// const resetUrl = `${frontendUrl}/auth/setup-password?email=${encodeURIComponent(email)}`;
				// const html = setupAccountTemplate({ name: name || email, resetUrl, appName: 'App' });
				// const result = await notificationService.sendEmail({ to: email, subject: '...', html });

				deps.logger.log(`📧 Setup email would be sent to ${email}`);
				return { success: true, messageId: null };
			});

			// Step 3: Audit email sent (placeholder)
			await step.run('audit-email-sent', async () => {
				// TODO: Implementar con IAuditLogRepository
				return { logged: true };
			});

			deps.logger.log(`✅ Onboarding completed for ${email}`);

			return {
				success: true,
				userId,
				email,
				steps: {
					auditLog: true,
					emailSent: emailResult.success,
				},
			};
		},
	);
