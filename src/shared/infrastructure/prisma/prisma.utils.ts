/**
 * Utilidades para interactuar con Prisma de forma más limpia
 */

/**
 * Elimina las propiedades con valor 'undefined' de un objeto.
 * Útil para preparar objetos de actualización (UpdateInput) en Prisma
 * sin tener que hacer 'if (val !== undefined)' campo por campo.
 */
export function cleanPrismaData<T extends Record<string, unknown>>(data: T): T {
	const cleanData = { ...data };

	for (const key in cleanData) {
		if (cleanData[key] === undefined) {
			delete cleanData[key];
		}
	}

	return cleanData;
}

/**
 * Mapea propiedades de un objeto a otro basándose en un mapa de claves,
 * filtrando los valores undefined.
 */
export function mapAndClean<
	T extends Record<string, unknown>,
	U extends Record<string, unknown>,
>(source: T, mapping: Partial<Record<keyof T, keyof U>>): Partial<U> {
	const result: Partial<U> = {};

	for (const [sourceKey, targetKey] of Object.entries(mapping)) {
		const value = source[sourceKey as keyof T];
		if (value !== undefined) {
			// Usamos unknown como puente para evitar 'any' y satisfacer al linter
			result[targetKey as keyof U] = value as unknown as U[keyof U];
		}
	}

	return result;
}
