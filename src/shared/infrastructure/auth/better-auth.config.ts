import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import pg from 'pg';

/**
 * Pool de conexiones para Better Auth.
 * Se usa una instancia separada para no interferir con el ciclo de vida de NestJS.
 */
const databaseUrl =
	process.env.DATABASE_URL ||
	'postgresql://postgres:postgres@localhost:5432/spp_db';

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

// Default trusted origins for development
// In production, these should come from ALLOWED_ORIGINS env var
const defaultOrigins = [
	'http://localhost:3000',
	'http://localhost:3001',
	'http://localhost:4000',
	'http://127.0.0.1:3000',
	'http://127.0.0.1:4000',
];

const trustedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
	: defaultOrigins;

const isProduction = process.env.NODE_ENV === 'production';

// Secret for signing cookies - defaults if not in env
const authSecret =
	process.env.BETTER_AUTH_SECRET || 'development-secret-min-32-chars-long!';

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
	baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
	basePath: '/api/auth', // Path where auth routes are mounted
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins,
	// Configuración de sesión - DESHABILITANDO cookieCache temporalmente para probar
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 días
		updateAge: 60 * 60 * 24, // Actualizar cada día
		// cookieCache DESHABILITADO para pruebas - puede interferir con session_token
		// cookieCache: {
		// 	enabled: true,
		// 	maxAge: 60 * 5, // 5 minutos
		// },
	},
	// Configuración avanzada para cookies
	advanced: {
		// En desarrollo (HTTP), no usar Secure. En producción (HTTPS), sí.
		useSecureCookies: isProduction,
		// Configuración de cookies para desarrollo
		defaultCookieAttributes: {
			sameSite: isProduction ? 'none' : 'lax',
			secure: isProduction,
			httpOnly: true,
			path: '/',
		},
	},
});

export type Session = typeof auth.$Infer.Session;
