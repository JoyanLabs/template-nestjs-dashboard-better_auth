// Archivo de declaración global (ambient) para extender Fastify
// NO usar import/export aquí para mantenerlo como script global

declare module 'fastify' {
	import type {
		Cookie,
		CookieSerializeOptions,
		UnsignResult,
	} from '@fastify/cookie';
	import type { IncomingHttpHeaders } from 'node:http';

	interface FastifyInstance {
		// Métodos que @fastify/cookie agrega a FastifyInstance
		serializeCookie(cookie: Cookie): string;
		parseCookie(cookieHeader: string): Record<string, string>;
		signCookie(value: string): string;
		unsignCookie(value: string): UnsignResult | false;
	}

	interface FastifyRequest {
		// Del core de Fastify
		body: unknown;
		headers: IncomingHttpHeaders;
		method: string;
		url: string;
		protocol: string;
		hostname: string;
		// De @fastify/cookie
		cookies: Record<string, string | undefined>;
	}

	interface FastifyReply {
		// Del core de Fastify
		status(code: number): this;
		header(key: string, value: string | string[]): this;
		send(payload?: unknown): this;
		// De @fastify/cookie
		setCookie(
			name: string,
			value: string,
			options?: CookieSerializeOptions,
		): this;
		clearCookie(name: string, options?: CookieSerializeOptions): this;
	}
}
