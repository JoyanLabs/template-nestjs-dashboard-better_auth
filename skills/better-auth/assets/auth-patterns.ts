// =============================================================================
// NestJS Dashboard Template - Better Auth Patterns
// =============================================================================

import {
	Body,
	CanActivate,
	Controller,
	Delete,
	ExecutionContext,
	Get,
	HttpException,
	HttpStatus,
	Injectable,
	Param,
	Post,
	Req,
	Res,
	SetMetadata,
	UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

// =============================================================================
// UTILIDADES DE HEADERS
// =============================================================================

export function toWebHeaders(expressHeaders: Request['headers']): Headers {
	const headers = new Headers();
	for (const [key, value] of Object.entries(expressHeaders)) {
		if (value) {
			if (Array.isArray(value)) {
				value.forEach((v) => {
					headers.append(key, v);
				});
			} else {
				headers.set(key, value);
			}
		}
	}
	return headers;
}

export function copyResponseHeaders(
	betterAuthHeaders: Headers,
	res: Response,
): void {
	betterAuthHeaders.forEach((value, key) => {
		if (key.toLowerCase() === 'set-cookie') {
			const existing = res.getHeader('set-cookie');
			if (existing) {
				const cookies = Array.isArray(existing)
					? existing
					: [existing as string];
				res.setHeader('set-cookie', [...cookies, value]);
			} else {
				res.setHeader('set-cookie', value);
			}
		} else {
			res.setHeader(key, value);
		}
	});
}

export function handleBetterAuthError(error: unknown): never {
	if (error && typeof error === 'object' && 'status' in error) {
		const apiError = error as { status: number; body?: { message?: string } };
		throw new HttpException(
			apiError.body?.message || 'Authentication error',
			apiError.status,
		);
	}
	throw new HttpException(
		'Internal authentication error',
		HttpStatus.INTERNAL_SERVER_ERROR,
	);
}

// =============================================================================
// CONTROLADOR DE AUTENTICACIÓN
// =============================================================================

declare const auth: {
	api: {
		signInEmail(options: any): Promise<{ headers: Headers; body: any }>;
		signUpEmail(options: any): Promise<{ headers: Headers; body: any }>;
		signOut(options: any): Promise<{ headers: Headers; body: any }>;
		getSession(options: any): Promise<{ user: any; session: any } | null>;
		listUsers(options: any): Promise<{ users: any[] }>;
		createUser(options: any): Promise<{ user: any }>;
	};
};

class SignInDto {
	email!: string;
	password!: string;
}

class SignUpDto {
	email!: string;
	password!: string;
	name!: string;
}

@Controller('auth')
export class AuthController {
	@Post('sign-in')
	async signIn(
		@Req() req: Request,
		@Res() res: Response,
		@Body() dto: SignInDto,
	) {
		try {
			const result = await auth.api.signInEmail({
				headers: toWebHeaders(req.headers),
				body: { email: dto.email, password: dto.password },
				returnHeaders: true,
			});
			copyResponseHeaders(result.headers, res);
			return res.json(result.body);
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	@Post('sign-up')
	async signUp(
		@Req() req: Request,
		@Res() res: Response,
		@Body() dto: SignUpDto,
	) {
		try {
			const result = await auth.api.signUpEmail({
				headers: toWebHeaders(req.headers),
				body: { email: dto.email, password: dto.password, name: dto.name },
				returnHeaders: true,
			});
			copyResponseHeaders(result.headers, res);
			return res.json(result.body);
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	@Get('session')
	async getSession(@Req() req: Request) {
		try {
			const session = await auth.api.getSession({
				headers: toWebHeaders(req.headers),
			});
			if (!session) {
				throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
			}
			return session;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}
}

// =============================================================================
// GUARDS Y DECORADORES
// =============================================================================

export const ROLES_KEY = 'roles';
export const RequireRole = (...roles: string[]) =>
	SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = 'permissions';
export type PermissionRequirement = Record<string, string[]>;
export const RequirePermission = (permissions: PermissionRequirement) =>
	SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class RolesGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const session = await auth.api.getSession({
			headers: toWebHeaders(request.headers),
		});

		if (!session) {
			throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
		}

		(request as any).user = session.user;

		const requiredRoles = Reflect.getMetadata(ROLES_KEY, context.getHandler());
		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const userRole = (session.user as any).role || 'user';
		return requiredRoles.includes(userRole);
	}
}

@Injectable()
export class PermissionsGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const user = (request as any).user;

		if (!user) {
			throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
		}

		const requiredPermissions = Reflect.getMetadata(
			PERMISSIONS_KEY,
			context.getHandler(),
		) as PermissionRequirement | undefined;

		if (!requiredPermissions) {
			return true;
		}

		const userRole = user.role || 'user';
		return this.checkPermissions(userRole, requiredPermissions);
	}

	private checkPermissions(
		role: string,
		required: PermissionRequirement,
	): boolean {
		const rolePermissions: Record<string, Record<string, string[]>> = {
			admin: {
				user: ['list', 'create', 'update', 'delete', 'ban'],
				session: ['list', 'revoke'],
			},
			user: {
				session: [],
			},
		};

		const permissions = rolePermissions[role] || {};

		for (const [resource, actions] of Object.entries(required)) {
			const allowedActions = permissions[resource] || [];
			for (const action of actions) {
				if (!allowedActions.includes(action)) {
					return false;
				}
			}
		}

		return true;
	}
}

// =============================================================================
// EXPORTS
// =============================================================================
