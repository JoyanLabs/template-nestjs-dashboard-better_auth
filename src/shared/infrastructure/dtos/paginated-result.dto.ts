/**
 * DTO para resultados paginados
 * Estandariza la respuesta de endpoints que retornan listados con paginación
 */
export interface PaginatedResultDto<T> {
	/** Array de datos */
	data: T[];

	/** Metadata de paginación */
	meta: {
		/** Total de registros */
		total: number;

		/** Página actual */
		page: number;

		/** Registros por página */
		limit: number;

		/** Total de páginas */
		totalPages: number;
	};
}
