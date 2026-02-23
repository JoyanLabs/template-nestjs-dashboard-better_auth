import type { Logger } from '@nestjs/common';
import { createHelloWorldFn } from './hello-world.fn.js';

/**
 * Dependencias compartidas para todas las funciones de Inngest
 * Sigue el patrón de inyección de dependencias de la arquitectura
 */
export interface InngestFunctionsDeps {
	logger: Logger;
}

/**
 * Factory que crea y retorna todas las funciones de Inngest
 * con sus dependencias inyectadas
 */
export const getInngestFunctions = (deps: InngestFunctionsDeps) => [
	// Función de ejemplo (hello world)
	createHelloWorldFn(deps),

	// Agrega más funciones aquí según las necesites
	// createUserOnboardingFn(deps),
	// createFileProcessingFn(deps),
];
