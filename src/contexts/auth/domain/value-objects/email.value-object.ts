import { ValueObject } from '@/shared/domain/value-object.base.js';
import { ValidationException } from '@/shared/exceptions/validation.exception.js';

interface EmailProps {
	value: string;
}

/**
 * Email Value Object
 * Encapsula la validación y el comportamiento de un email
 * Es inmutable y se valida en la construcción
 */
export class EmailValueObject extends ValueObject<EmailProps> {
	private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	private constructor(props: EmailProps) {
		super(props);
	}

	get value(): string {
		return this.props.value;
	}

	/**
	 * Crea un nuevo Email Value Object validando el formato
	 */
	public static create(email: string): EmailValueObject {
		if (!email || email.trim().length === 0) {
			throw new ValidationException('El email es requerido', {
				email: ['El email no puede estar vacío'],
			});
		}

		const normalizedEmail = email.trim().toLowerCase();

		if (!EmailValueObject.EMAIL_REGEX.test(normalizedEmail)) {
			throw new ValidationException('El formato del email es inválido', {
				email: ['El email debe tener un formato válido (ejemplo@dominio.com)'],
			});
		}

		if (normalizedEmail.length > 255) {
			throw new ValidationException('El email es demasiado largo', {
				email: ['El email no puede tener más de 255 caracteres'],
			});
		}

		return new EmailValueObject({ value: normalizedEmail });
	}

	/**
	 * Obtiene el dominio del email
	 */
	public getDomain(): string {
		return this.props.value.split('@')[1];
	}

	/**
	 * Obtiene la parte local del email (antes del @)
	 */
	public getLocalPart(): string {
		return this.props.value.split('@')[0];
	}

	/**
	 * Convierte el email a string
	 */
	public toString(): string {
		return this.props.value;
	}
}
