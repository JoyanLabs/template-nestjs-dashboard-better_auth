/**
 * Base Entity class for all domain entities
 * Provides common properties and behavior for entities
 */
export abstract class BaseEntity {
	protected readonly _id: string;
	protected readonly _createdAt: Date;
	protected readonly _updatedAt: Date;

	constructor(id: string, createdAt: Date, updatedAt: Date) {
		this._id = id;
		this._createdAt = createdAt;
		this._updatedAt = updatedAt;
	}

	get id(): string {
		return this._id;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	/**
	 * Compara dos entidades por su ID
	 * Dos entidades son iguales si tienen el mismo ID
	 */
	public equals(entity: BaseEntity): boolean {
		if (!entity) {
			return false;
		}

		if (this === entity) {
			return true;
		}

		return this._id === entity._id;
	}

	/**
	 * Verifica si esta entidad es la misma instancia que otra
	 */
	public isSameInstance(entity: BaseEntity): boolean {
		return this === entity;
	}
}
