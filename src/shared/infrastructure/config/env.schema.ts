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

	// Inngest
	INNGEST_EVENT_KEY: z.string().optional(),
	INNGEST_SIGNING_KEY: z.string().optional(),
	INNGEST_DEV: z.string().optional().default('1'),
	INNGEST_BASE_URL: z.string().url().optional(),

	// Mailtrap (Email service)
	MAILTRAP_API_TOKEN: z.string().optional(),
	MAILTRAP_SENDER_EMAIL: z.string().email().optional(),
	MAILTRAP_SENDER_NAME: z.string().optional(),
	MAILTRAP_SANDBOX: z.string().optional(),
	MAILTRAP_INBOX_ID: z.string().optional(),

	// Cloudflare R2 (Storage) - Opcionales para desarrollo
	R2_ACCOUNT_ID: z.string().optional(),
	R2_ACCESS_KEY_ID: z.string().optional(),
	R2_SECRET_ACCESS_KEY: z.string().optional(),
	R2_BUCKET_NAME: z.string().optional(),
	R2_PUBLIC_URL: z.string().url().optional(),

	// Frontend URL (para redirects)
	FRONTEND_URL: z.string().url().default('http://localhost:3000'),
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
