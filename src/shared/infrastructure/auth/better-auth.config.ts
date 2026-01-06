import process from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import pg from 'pg';
import { validateEnv } from '@/shared/infrastructure/config/env.schema.js';

// Cargar variables de entorno antes de validar (necesario para ESM top-level imports)
try {
	process.loadEnvFile();
} catch {
	// Ignorar si el archivo .env no existe
}

// Validar variables de entorno al cargar el módulo
const env = validateEnv(process.env);

/**
 * Pool de conexiones para Better Auth.
 * Se usa una instancia separada para no interferir con el ciclo de vida de NestJS.
 */
const databaseUrl = env.DATABASE_URL;

const pool = new pg.Pool({
	connectionString: databaseUrl,
});

const pgAdapter = new PrismaPg(pool);

/**
 * Instancia de PrismaClient para Better Auth.
 * Prisma 7.x requiere un adapter explícito.
 */
const prisma = new PrismaClient({
	adapter: pgAdapter,
});

/**
 * Configuración central de Better Auth.
 * Exportar como 'auth' es requerido por la librería.
 */

const trustedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

const isProduction = env.NODE_ENV === 'production';

// Secret for signing cookies
const authSecret = env.BETTER_AUTH_SECRET;

console.log('🔐 Better Auth trustedOrigins:', trustedOrigins);
console.log('🔐 Better Auth isProduction:', isProduction);
console.log(
	'🔐 Better Auth secret configured:',
	authSecret.length >= 32 ? 'Yes (valid length)' : 'No (too short)',
);

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	secret: authSecret,
	baseURL: env.BETTER_AUTH_URL,
	basePath: '/api/auth', // Path where auth routes are mounted
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins,
	// Configuración de sesión - Sin Cookie Cache (más confiable para desarrollo)
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 días
		updateAge: 60 * 60 * 24, // Actualizar cada día
		// Cookie Cache DESHABILITADO - Causa problemas con cross-domain cookies
		// Usaremos sessions basadas en base de datos que son más confiables
		// cookieCache: {
		// 	enabled: true,
		// 	maxAge: 60 * 5, // 5 minutos
		// },
	},
	// Configuración avanzada para cookies
	advanced: {
		// En desarrollo (HTTP), no usar Secure. En producción (HTTPS), sí.
		useSecureCookies: isProduction,
		// Configuración de cookies para desarrollo - permitir cross-origin con localhost
		defaultCookieAttributes: {
			sameSite: isProduction ? 'none' : 'lax',
			secure: isProduction,
			httpOnly: true,
			path: '/',
		},
		// IMPORTANTE: Para desarrollo con localhost y múltiples puertos
		crossSubDomainCookies: {
			enabled: !isProduction, // Solo en desarrollo
			domain: !isProduction ? 'localhost' : undefined, // Permitir cookies en localhost
		},
	},
	// Plugin de Admin para gestión de roles
	plugins: [
		admin({
			defaultRole: 'user',
			adminRoles: ['admin'],
		}),
	],
});

export type Session = typeof auth.$Infer.Session;
