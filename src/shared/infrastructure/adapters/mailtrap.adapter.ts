import { Injectable } from '@nestjs/common';
import { MailtrapClient } from 'mailtrap';
import {
	Attachment,
	EmailResult,
	INotificationService,
	SendEmailParams,
} from '@/shared/application/ports/notification-service.port.js';

/**
 * Configuración para el adaptador Mailtrap
 */
interface MailtrapConfig {
	apiToken: string;
	senderEmail: string;
	senderName: string;
	sandbox?: boolean;
	inboxId?: number;
}

/**
 * Adaptador que implementa INotificationService usando Mailtrap.
 *
 * Este adaptador:
 * - Envía emails usando Mailtrap SDK
 * - Soporta modo Sandbox para desarrollo y producción
 * - Implementa el puerto INotificationService para desacoplamiento
 *
 * @example
 * // Configuración en módulo:
 * {
 *   provide: NOTIFICATION_SERVICE,
 *   useFactory: () => {
 *     return new MailtrapAdapter({
 *       apiToken: process.env.MAILTRAP_API_TOKEN!,
 *       senderEmail: 'hello@example.com',
 *       senderName: 'My App',
 *       sandbox: process.env.NODE_ENV !== 'production',
 *       inboxId: Number(process.env.MAILTRAP_INBOX_ID),
 *     });
 *   },
 * }
 */
@Injectable()
export class MailtrapAdapter implements INotificationService {
	private client: MailtrapClient;
	private readonly senderEmail: string;
	private readonly senderName: string;
	private readonly sandbox: boolean;

	constructor(config: MailtrapConfig) {
		this.sandbox = config.sandbox ?? true;

		this.client = new MailtrapClient({
			token: config.apiToken,
			sandbox: this.sandbox,
			testInboxId: this.sandbox ? config.inboxId : undefined,
		});

		this.senderEmail = config.senderEmail;
		this.senderName = config.senderName;
	}

	/**
	 * Envía un email usando Mailtrap
	 * En modo sandbox, el email se captura en el inbox de pruebas
	 */
	async sendEmail(params: SendEmailParams): Promise<EmailResult> {
		try {
			const sender = {
				email: this.senderEmail,
				name: this.senderName,
			};

			const recipients = [{ email: params.to }];

			const response = await this.client.send({
				from: sender,
				to: recipients,
				subject: params.subject,
				html: params.html,
				text: params.text || this.stripHtml(params.html),
				attachments: params.attachments?.map(this.mapAttachment),
			});

			const mode = this.sandbox ? '[Sandbox]' : '[Production]';
			console.log(`📧 ${mode} Email enviado a ${params.to}: ${params.subject}`);

			return {
				success: true,
				messageId: String(response.message_ids?.[0] || 'sent'),
				provider: 'mailtrap',
			};
		} catch (error) {
			console.error(`❌ Error enviando email a ${params.to}:`, error);
			throw error; // Re-throw para que Inngest pueda reintentar
		}
	}

	/**
	 * Mapea attachments del dominio al formato de Mailtrap
	 */
	private mapAttachment(att: Attachment): {
		filename: string;
		content: string;
		type?: string;
	} {
		return {
			filename: att.filename,
			content: Buffer.isBuffer(att.content)
				? att.content.toString('base64')
				: att.content,
			type: att.contentType,
		};
	}

	/**
	 * Extrae texto plano del HTML
	 */
	private stripHtml(html: string): string {
		return html
			.replace(/<style[^>]*>.*?<\/style>/gi, '')
			.replace(/<script[^>]*>.*?<\/script>/gi, '')
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}
}
