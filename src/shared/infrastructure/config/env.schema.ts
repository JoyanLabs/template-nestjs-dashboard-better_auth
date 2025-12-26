import { z } from 'zod';

/**
 * Esquema de validación para las variables de entorno
 * Define todas las variables requeridas y sus formatos
 */
export const envSchema = z.object({
	// Configuración del Servidor
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	PORT: z.string().default('3001'),
	API_PREFIX: z.string().default('api'),

	// Base de Datos
	DATABASE_URL: z.string().url(),

	// Autenticación (Better Auth)
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.string().url(),
	JWT_SECRET: z.string().min(16).default('change-me-in-production-123456'),

	// CORS
	ALLOWED_ORIGINS: z
		.string()
		.default('http://localhost:3000,http://127.0.0.1:3000'),

	// Inngest (Próxima fase)
	INNGEST_EVENT_KEY: z.string().optional(),
	INNGEST_SIGNING_KEY: z.string().optional(),
});

/**
 * Tipo inferido del esquema
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Valida un objeto de configuración contra el esquema
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
	try {
		return envSchema.parse(config);
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			const missingVars = (error as z.ZodError).issues
				.map((issue: z.ZodIssue) => issue.path.join('.'))
				.join(', ');
			throw new Error(
				`❌ Error de validación de variables de entorno. Variables inválidas o faltantes: ${missingVars}`,
			);
		}
		throw error;
	}
}
