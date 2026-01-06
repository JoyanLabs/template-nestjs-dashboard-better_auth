import {
	Controller,
	Delete,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import { RequireRole } from '@/shared/infrastructure/decorators/roles.decorator.js';
import { RolesGuard } from '@/shared/infrastructure/guards/roles.guard.js';

/**
 * Controlador de administración de usuarios.
 * Documentación de los endpoints de Better Auth Admin para Swagger/Scalar.
 * Los endpoints reales son manejados por Better Auth.
 */
@ApiTags('Administración de Usuarios')
@Controller('auth/admin')
@UseGuards(RolesGuard)
@RequireRole('admin') // Todos los endpoints requieren rol admin
export class UserController {
	@Post('create-user')
	@ApiOperation({
		summary: 'Crear usuario (Admin)',
		description:
			'Crea un nuevo usuario con rol específico. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email', 'password', 'name'],
			properties: {
				email: { type: 'string', format: 'email', example: 'user@example.com' },
				password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
				name: { type: 'string', example: 'John Doe' },
				role: {
					type: 'string',
					enum: ['user', 'admin'],
					default: 'user',
					example: 'user',
				},
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Usuario creado exitosamente' })
	@ApiResponse({
		status: 403,
		description: 'No autorizado - Requiere rol admin',
	})
	async createUser(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	@Post('ban-user')
	@ApiOperation({
		summary: 'Banear usuario (Admin)',
		description:
			'Banea un usuario del sistema. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['userId'],
			properties: {
				userId: { type: 'string', example: 'clx1234567890' },
				banReason: {
					type: 'string',
					example: 'Violación de términos de servicio',
				},
				banExpiresIn: {
					type: 'number',
					description: 'Duración del baneo en segundos',
					example: 86400,
				},
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Usuario baneado exitosamente' })
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async banUser(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	@Post('unban-user')
	@ApiOperation({
		summary: 'Desbanear usuario (Admin)',
		description:
			'Remueve el baneo de un usuario. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['userId'],
			properties: {
				userId: { type: 'string', example: 'clx1234567890' },
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Usuario desbaneado exitosamente' })
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async unbanUser(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	@Get('list-users')
	@ApiOperation({
		summary: 'Listar usuarios (Admin)',
		description:
			'Obtiene la lista de todos los usuarios del sistema. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiResponse({
		status: 200,
		description: 'Lista de usuarios obtenida exitosamente',
		schema: {
			type: 'object',
			properties: {
				users: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'string' },
							email: { type: 'string' },
							name: { type: 'string' },
							role: { type: 'string' },
							banned: { type: 'boolean' },
						},
					},
				},
			},
		},
	})
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async listUsers(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	@Delete('remove-user')
	@ApiOperation({
		summary: 'Eliminar usuario (Admin)',
		description:
			'Elimina permanentemente un usuario del sistema. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['userId'],
			properties: {
				userId: { type: 'string', example: 'clx1234567890' },
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async removeUser(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	/**
	 * Reenvía la petición al handler de Better Auth
	 */
	private async forwardToAuth(req: Request, res: Response) {
		const url = new URL(req.url, `${req.protocol}://${req.get('host')}`);

		const betterAuthRequest = new Request(url.toString(), {
			method: req.method,
			headers: req.headers as HeadersInit,
			body:
				req.method !== 'GET' && req.method !== 'HEAD'
					? JSON.stringify(req.body)
					: undefined,
		});

		const betterAuthResponse = await auth.handler(betterAuthRequest);

		res.status(betterAuthResponse.status);
		betterAuthResponse.headers.forEach((value, key) => {
			res.setHeader(key, value);
		});

		const responseBody = await betterAuthResponse.text();
		res.send(responseBody);
	}
}
