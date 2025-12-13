import { BaseEntity } from '@/shared/domain/base.entity.js';

/**
 * User Entity
 * Representa un usuario en el dominio
 * No tiene dependencias de Prisma ni de ningún framework externo
 */
export class UserEntity extends BaseEntity {
	private readonly _email: string;
	private readonly _name: string | null;
	private readonly _emailVerified: boolean;
	private readonly _image: string | null;

	constructor(
		id: string,
		email: string,
		name: string | null,
		emailVerified: boolean,
		image: string | null,
		createdAt: Date,
		updatedAt: Date,
	) {
		super(id, createdAt, updatedAt);
		this._email = email;
		this._name = name;
		this._emailVerified = emailVerified;
		this._image = image;
	}

	get email(): string {
		return this._email;
	}

	get name(): string | null {
		return this._name;
	}

	get emailVerified(): boolean {
		return this._emailVerified;
	}

	get image(): string | null {
		return this._image;
	}

	/**
	 * Verifica si el usuario ha verificado su email
	 */
	public isEmailVerified(): boolean {
		return this._emailVerified;
	}

	/**
	 * Obtiene el nombre para mostrar
	 * Si no tiene nombre, retorna el email
	 */
	public getDisplayName(): string {
		return this._name ?? this._email;
	}

	/**
	 * Crea una nueva instancia de UserEntity con datos actualizados
	 * Los Value Objects son inmutables, así que se crea una nueva instancia
	 */
	public static create(params: {
		id: string;
		email: string;
		name?: string | null;
		emailVerified?: boolean;
		image?: string | null;
		createdAt?: Date;
		updatedAt?: Date;
	}): UserEntity {
		return new UserEntity(
			params.id,
			params.email,
			params.name ?? null,
			params.emailVerified ?? false,
			params.image ?? null,
			params.createdAt ?? new Date(),
			params.updatedAt ?? new Date(),
		);
	}
}
