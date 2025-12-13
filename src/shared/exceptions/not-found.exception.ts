import { DomainException } from './domain.exception.js';

/**
 * Not Found Exception
 * Se lanza cuando una entidad no se encuentra en el repositorio
 */
export class NotFoundException extends DomainException {
	constructor(entityName: string, id: string) {
		super(`${entityName} con ID ${id} no encontrado`, 'NOT_FOUND');
	}
}
