/**
 * Generic Repository Interface
 * Define contratos base para operaciones de repositorio
 */
export interface IRepository<T> {
	/**
	 * Busca una entidad por su ID
	 */
	findById(id: string): Promise<T | null>;

	/**
	 * Guarda una entidad (crear o actualizar)
	 */
	save(entity: T): Promise<T>;

	/**
	 * Elimina una entidad por su ID
	 */
	delete(id: string): Promise<void>;
}
