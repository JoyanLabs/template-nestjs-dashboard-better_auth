import '@fastify/cookie';
import '@fastify/cors';

declare module 'fastify' {
	interface FastifyInstance {
		// Métodos que @fastify/cookie agrega a FastifyInstance
		serializeCookie(cookie: import('@fastify/cookie').Cookie): string;
		parseCookie(cookieHeader: string): Record<string, string>;
		signCookie(value: string): string;
		unsignCookie(value: string): import('@fastify/cookie').UnsignResult | false;
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
