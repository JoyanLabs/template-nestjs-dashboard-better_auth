import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import { RequireRole } from '@/shared/infrastructure/decorators/roles.decorator.js';
import { RolesGuard } from '@/shared/infrastructure/guards/roles.guard.js';

/**
 * Controlador de gestión de roles.
 * Documentación de los endpoints de Better Auth Admin para Swagger/Scalar.
 * Los endpoints reales son manejados por Better Auth.
 */
@ApiTags('Gestión de Roles')
@Controller('auth/admin')
@UseGuards(RolesGuard)
@RequireRole('admin') // Todos los endpoints requieren rol admin
export class RoleController {
	@Post('set-role')
	@ApiOperation({
		summary: 'Asignar rol a usuario (Admin)',
		description:
			'Cambia el rol de un usuario existente. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['userId', 'role'],
			properties: {
				userId: {
					type: 'string',
					example: 'clx1234567890',
					description: 'ID del usuario',
				},
				role: {
					type: 'string',
					enum: ['user', 'admin'],
					example: 'admin',
					description: 'Nuevo rol para el usuario',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Rol asignado exitosamente',
		schema: {
			type: 'object',
			properties: {
				user: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						email: { type: 'string' },
						role: { type: 'string' },
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 403,
		description: 'No autorizado - Requiere rol admin',
	})
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	async setRole(@Req() req: Request, @Res() res: Response) {
		return this.forwardToAuth(req, res);
	}

	@Get('user-role')
	@ApiOperation({
		summary: 'Obtener rol de usuario (Admin)',
		description:
			'Obtiene el rol actual de un usuario. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiQuery({
		name: 'userId',
		type: 'string',
		required: true,
		example: 'clx1234567890',
		description: 'ID del usuario',
	})
	@ApiResponse({
		status: 200,
		description: 'Rol obtenido exitosamente',
		schema: {
			type: 'object',
			properties: {
				userId: { type: 'string' },
				role: { type: 'string', example: 'user' },
			},
		},
	})
	@ApiResponse({ status: 403, description: 'No autorizado' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	async getUserRole(@Req() req: Request, @Res() res: Response) {
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
