import type { IRepository } from '@/shared/domain/repository.interface.js';
import type { SessionEntity } from '../entities/session.entity.js';

/**
 * Interface del repositorio de sesiones
 * Define las operaciones de persistencia para la entidad Session
 * Debe ser implementado en la capa de infraestructura
 */
export interface ISessionRepository extends IRepository<SessionEntity> {
	/**
	 * Busca una sesión por su token
	 */
	findByToken(token: string): Promise<SessionEntity | null>;

	/**
	 * Busca todas las sesiones de un usuario
	 */
	findByUserId(userId: string): Promise<SessionEntity[]>;

	/**
	 * Invalida (elimina) todas las sesiones de un usuario
	 */
	deleteAllByUserId(userId: string): Promise<void>;

	/**
	 * Elimina sesiones expiradas
	 */
	deleteExpiredSessions(): Promise<number>;

	/**
	 * Verifica si una sesión es válida por su token
	 */
	isValidToken(token: string): Promise<boolean>;
}
