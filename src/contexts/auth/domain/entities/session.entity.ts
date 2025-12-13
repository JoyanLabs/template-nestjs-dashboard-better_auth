import { BaseEntity } from '@/shared/domain/base.entity.js';

/**
 * Session Entity
 * Representa una sesión de usuario en el dominio
 * No tiene dependencias de Prisma ni de ningún framework externo
 */
export class SessionEntity extends BaseEntity {
	private readonly _token: string;
	private readonly _userId: string;
	private readonly _expiresAt: Date;
	private readonly _ipAddress: string | null;
	private readonly _userAgent: string | null;

	constructor(
		id: string,
		token: string,
		userId: string,
		expiresAt: Date,
		ipAddress: string | null,
		userAgent: string | null,
		createdAt: Date,
		updatedAt: Date,
	) {
		super(id, createdAt, updatedAt);
		this._token = token;
		this._userId = userId;
		this._expiresAt = expiresAt;
		this._ipAddress = ipAddress;
		this._userAgent = userAgent;
	}

	get token(): string {
		return this._token;
	}

	get userId(): string {
		return this._userId;
	}

	get expiresAt(): Date {
		return this._expiresAt;
	}

	get ipAddress(): string | null {
		return this._ipAddress;
	}

	get userAgent(): string | null {
		return this._userAgent;
	}

	/**
	 * Verifica si la sesión ha expirado
	 */
	public isExpired(): boolean {
		return this._expiresAt < new Date();
	}

	/**
	 * Verifica si la sesión es válida (no expirada)
	 */
	public isValid(): boolean {
		return !this.isExpired();
	}

	/**
	 * Obtiene el tiempo restante hasta la expiración en milisegundos
	 */
	public getTimeUntilExpiration(): number {
		return Math.max(0, this._expiresAt.getTime() - Date.now());
	}

	/**
	 * Verifica si la sesión expira pronto (en los próximos 5 minutos)
	 */
	public isExpiringSoon(): boolean {
		const fiveMinutes = 5 * 60 * 1000;
		return this.getTimeUntilExpiration() < fiveMinutes;
	}

	/**
	 * Crea una nueva instancia de SessionEntity
	 */
	public static create(params: {
		id: string;
		token: string;
		userId: string;
		expiresAt: Date;
		ipAddress?: string | null;
		userAgent?: string | null;
		createdAt?: Date;
		updatedAt?: Date;
	}): SessionEntity {
		return new SessionEntity(
			params.id,
			params.token,
			params.userId,
			params.expiresAt,
			params.ipAddress ?? null,
			params.userAgent ?? null,
			params.createdAt ?? new Date(),
			params.updatedAt ?? new Date(),
		);
	}
}
