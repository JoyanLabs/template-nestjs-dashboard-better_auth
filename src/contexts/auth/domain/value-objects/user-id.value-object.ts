import { ValueObject } from '@/shared/domain/value-object.base.js';
import { ValidationException } from '@/shared/exceptions/validation.exception.js';

interface UserIdProps {
	value: string;
}

/**
 * UserId Value Object
 * Encapsula la validación de un ID de usuario
 * Es inmutable y se valida en la construcción
 */
export class UserIdValueObject extends ValueObject<UserIdProps> {
	// Better Auth usa CUID por defecto, que tiene este formato
	private static readonly CUID_REGEX = /^c[a-z0-9]{24}$/;

	private constructor(props: UserIdProps) {
		super(props);
	}

	get value(): string {
		return this.props.value;
	}

	/**
	 * Crea un nuevo UserId Value Object validando el formato
	 */
	public static create(id: string): UserIdValueObject {
		if (!id || id.trim().length === 0) {
			throw new ValidationException('El ID de usuario es requerido', {
				userId: ['El ID de usuario no puede estar vacío'],
			});
		}

		const normalizedId = id.trim();

		// Validar formato CUID (usado por Better Auth)
		if (!UserIdValueObject.CUID_REGEX.test(normalizedId)) {
			throw new ValidationException(
				'El formato del ID de usuario es inválido',
				{
					userId: [
						'El ID de usuario debe tener el formato CUID (comienza con "c" seguido de 24 caracteres alfanuméricos)',
					],
				},
			);
		}

		return new UserIdValueObject({ value: normalizedId });
	}

	/**
	 * Convierte el ID a string
	 */
	public toString(): string {
		return this.props.value;
	}

	/**
	 * Verifica si el ID es válido sin lanzar excepción
	 */
	public static isValid(id: string): boolean {
		try {
			UserIdValueObject.create(id);
			return true;
		} catch {
			return false;
		}
	}
}
