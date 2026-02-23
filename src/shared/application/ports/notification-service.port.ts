/**
 * Puerto (interfaz) para el servicio de notificaciones.
 * Define el contrato que debe cumplir cualquier implementación de envío de mensajes.
 *
 * La capa de aplicación depende de esta interfaz, NO de proveedores específicos.
 * Esto permite:
 * - Testear los handlers con mocks (no enviar emails reales en tests)
 * - Cambiar de proveedor de email/SMS/push sin tocar la lógica de negocio
 * - Agregar múltiples canales (email + SMS + push) con la misma interfaz
 *
 * @example
 * // En un handler:
 * @Inject(NOTIFICATION_SERVICE)
 * private readonly notificationService: INotificationService,
 *
 * await this.notificationService.sendEmail({
 *   to: user.email,
 *   subject: 'Bienvenido',
 *   html: welcomeTemplate(user),
 * });
 */

// =============================================================================
// TIPOS DE DOMINIO
// =============================================================================

/**
 * Parámetros para enviar un email
 */
export interface SendEmailParams {
	to: string;
	subject: string;
	html: string;
	text?: string;
	attachments?: Attachment[];
}

/**
 * Archivo adjunto para emails
 */
export interface Attachment {
	filename: string;
	content: Buffer | string;
	contentType?: string;
}

/**
 * Resultado del envío de email
 */
export interface EmailResult {
	success: boolean;
	messageId?: string;
	provider: string; // 'mailtrap' | 'ses' | 'sendgrid' | etc
}

/**
 * Parámetros para enviar SMS (futuro)
 */
export interface SendSMSParams {
	to: string;
	message: string;
}

/**
 * Resultado del envío de SMS (futuro)
 */
export interface SMSResult {
	success: boolean;
	messageId?: string;
	provider: string;
}

// =============================================================================
// INTERFAZ DEL PUERTO
// =============================================================================

export interface INotificationService {
	/**
	 * Envía un email
	 * @param params Parámetros del email (destinatario, asunto, contenido)
	 * @returns Resultado del envío con ID del mensaje si fue exitoso
	 */
	sendEmail(params: SendEmailParams): Promise<EmailResult>;

	/**
	 * Envía un SMS (opcional - para implementaciones futuras)
	 * @param params Parámetros del SMS
	 * @returns Resultado del envío
	 */
	sendSMS?(params: SendSMSParams): Promise<SMSResult>;
}

// Token para inyección de dependencias con NestJS
export const NOTIFICATION_SERVICE = Symbol('NOTIFICATION_SERVICE');
