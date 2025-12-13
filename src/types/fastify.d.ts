/// <reference types="@fastify/cookie" />
/// <reference types="@fastify/cors" />

import type { FastifyCookieOptions } from '@fastify/cookie';
import type { FastifyCorsOptions } from '@fastify/cors';
import type { FastifyPluginCallback } from 'fastify';

declare module 'fastify' {
	interface FastifyInstance {
		// Métodos agregados por @fastify/cookie
		serializeCookie(cookie: string): string;
		parseCookie(cookieHeader: string): Record<string, string>;
		signCookie(value: string): string;
		unsignCookie(value: string): {
			valid: boolean;
			renew: boolean;
			value: string | null;
		};
	}

	interface FastifyRequest {
		cookies: Record<string, string | undefined>;
	}

	interface FastifyReply {
		setCookie(
			name: string,
			value: string,
			options?: import('@fastify/cookie').CookieSerializeOptions,
		): this;
		clearCookie(
			name: string,
			options?: import('@fastify/cookie').CookieSerializeOptions,
		): this;
	}
}

declare module '@fastify/cookie' {
	const fastifyCookie: FastifyPluginCallback<FastifyCookieOptions>;
	export default fastifyCookie;
}

declare module '@fastify/cors' {
	const fastifyCors: FastifyPluginCallback<FastifyCorsOptions>;
	export default fastifyCors;
}
