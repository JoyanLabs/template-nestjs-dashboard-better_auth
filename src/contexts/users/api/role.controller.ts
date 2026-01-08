import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { auth } from '@/shared/infrastructure/auth/better-auth.config.js';
import {
	handleBetterAuthError,
	toWebHeaders,
} from '@/shared/infrastructure/auth/better-auth.utils.js';
import { RequireRole } from '@/shared/infrastructure/decorators/roles.decorator.js';
import { RolesGuard } from '@/shared/infrastructure/guards/roles.guard.js';
import { UpdateRoleDto } from './user.dto.js';

/**
 * Controlador de gestión de roles.
 * Implementa rutas RESTful semánticas para administración de roles de usuarios.
 * Usa auth.api.* para llamar a Better Auth programáticamente.
 * Todos los endpoints requieren rol de administrador.
 */
@ApiTags('Gestión de Roles')
@Controller('roles')
@UseGuards(RolesGuard)
@RequireRole('admin') // Todos los endpoints requieren rol admin
export class RoleController {
	/**
	 * Asigna un rol a un usuario
	 * Requiere rol de administrador
	 */
	@Put(':userId')
	@ApiOperation({
		summary: 'Asignar rol a usuario (Admin)',
		description:
			'Cambia el rol de un usuario existente. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID del usuario',
		example: 'clx1234567890',
	})
	@ApiBody({ type: UpdateRoleDto })
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
						role: { type: 'string', enum: ['user', 'admin'] },
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
	async setUserRole(
		@Param('userId') userId: string,
		@Req() req: Request,
		@Body() body: UpdateRoleDto,
	) {
		try {
			const result = await auth.api.setRole({
				headers: toWebHeaders(req.headers),
				body: {
					userId,
					role: body.role,
				},
			});

			// TODO: Aquí puedes agregar lógica de auditoría
			// await this.auditService.log('user.role.changed', { userId, newRole: body.role, changedBy: session.user.id });

			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	/**
	 * Obtiene el rol de un usuario
	 * Requiere rol de administrador
	 *
	 * Nota: Better Auth no tiene un endpoint específico para obtener el rol,
	 * así que obtenemos el usuario completo y extraemos el rol.
	 */
	@Get(':userId')
	@ApiOperation({
		summary: 'Obtener rol de usuario (Admin)',
		description:
			'Obtiene el rol actual de un usuario. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID del usuario',
		example: 'clx1234567890',
	})
	@ApiResponse({
		status: 200,
		description: 'Rol obtenido exitosamente',
		schema: {
			type: 'object',
			properties: {
				userId: { type: 'string' },
				role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
			},
		},
	})
	@ApiResponse({ status: 403, description: 'No autorizado' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	async getUserRole(@Param('userId') userId: string, @Req() req: Request) {
		try {
			// Better Auth no tiene un endpoint específico para obtener solo el rol
			// Obtenemos la lista de usuarios y filtramos
			const result = await auth.api.listUsers({
				headers: toWebHeaders(req.headers),
				query: {
					limit: 100,
					offset: 0,
				},
			});

			const user = result.users.find((u) => u.id === userId);

			if (!user) {
				throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
			}

			return {
				userId: user.id,
				role: user.role || 'user',
			};
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			handleBetterAuthError(error);
		}
	}
}
