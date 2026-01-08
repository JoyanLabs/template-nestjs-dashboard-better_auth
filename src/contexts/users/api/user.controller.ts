import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UnauthorizedException,
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
import { RequirePermission } from '@/shared/infrastructure/decorators/permission.decorator.js';
import { RequireRole } from '@/shared/infrastructure/decorators/roles.decorator.js';
import { PermissionsGuard } from '@/shared/infrastructure/guards/permissions.guard.js';
import { RolesGuard } from '@/shared/infrastructure/guards/roles.guard.js';
import {
	BanUserDto,
	CreateUserDto,
	SetPasswordDto,
	UpdateUserDto,
} from './user.dto.js';

/**
 * Controlador de gestión de usuarios.
 * Implementa rutas RESTful semánticas para administración de usuarios.
 * Usa auth.api.* para llamar a Better Auth programáticamente.
 */
@ApiTags('Gestión de Usuarios')
@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
	/**
	 * Obtiene el perfil del usuario actual
	 * Endpoint público (solo requiere autenticación)
	 */
	@Get('me')
	@ApiOperation({
		summary: 'Obtener perfil del usuario actual',
		description:
			'Retorna la información del usuario autenticado. No requiere rol específico.',
	})
	@ApiCookieAuth('session_token')
	@ApiResponse({
		status: 200,
		description: 'Perfil obtenido exitosamente',
		schema: {
			type: 'object',
			properties: {
				user: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						email: { type: 'string' },
						name: { type: 'string' },
						role: { type: 'string', enum: ['user', 'admin'] },
						banned: { type: 'boolean' },
						createdAt: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	})
	@ApiResponse({ status: 401, description: 'No autenticado' })
	async getMyProfile(@Req() req: Request) {
		const session = await auth.api.getSession({
			headers: toWebHeaders(req.headers),
		});

		if (!session?.user) {
			throw new UnauthorizedException('No autenticado');
		}

		return { user: session.user };
	}

	/**
	 * Crea un nuevo usuario
	 * Requiere rol de administrador
	 */
	@Post()
	@RequireRole('admin')
	@ApiOperation({
		summary: 'Crear usuario (Admin)',
		description:
			'Crea un nuevo usuario con rol específico. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
	@ApiResponse({
		status: 403,
		description: 'No autorizado - Requiere rol admin',
	})
	async createUser(@Req() req: Request, @Body() body: CreateUserDto) {
		try {
			const result = await auth.api.createUser({
				headers: toWebHeaders(req.headers),
				body: {
					email: body.email,
					password: body.password,
					name: body.name,
					role: body.role || 'user',
				},
			});

			// TODO: Aquí puedes agregar lógica de auditoría
			// await this.auditService.log('user.created', { userId: result.user.id, createdBy: session.user.id });

			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	/**
	 * Lista todos los usuarios del sistema
	 * Requiere permiso user:list (admin, moderator)
	 */
	@Get()
	@UseGuards(PermissionsGuard)
	@RequirePermission({ user: ['list'] })
	@ApiOperation({
		summary: 'Listar todos los usuarios',
		description:
			'Obtiene la lista completa de usuarios del sistema. Requiere permiso user:list.',
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
							role: { type: 'string', enum: ['user', 'admin'] },
							banned: { type: 'boolean' },
							createdAt: { type: 'string', format: 'date-time' },
						},
					},
				},
				total: { type: 'number' },
				limit: { type: 'number' },
				offset: { type: 'number' },
			},
		},
	})
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async listAllUsers(@Req() req: Request) {
		try {
			const result = await auth.api.listUsers({
				headers: toWebHeaders(req.headers),
				query: {
					limit: 100,
					offset: 0,
				},
			});

			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	/**
	 * Banea un usuario
	 * Requiere permiso user:ban (admin, moderator)
	 */
	@Post(':userId/ban')
	@UseGuards(PermissionsGuard)
	@RequirePermission({ user: ['ban'] })
	@ApiOperation({
		summary: 'Banear usuario',
		description: 'Banea un usuario del sistema. Requiere permiso user:ban.',
	})
	@ApiCookieAuth('session_token')
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID del usuario a banear',
		example: 'clx1234567890',
	})
	@ApiBody({ type: BanUserDto, required: false })
	@ApiResponse({ status: 200, description: 'Usuario baneado exitosamente' })
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async banUser(
		@Param('userId') userId: string,
		@Req() req: Request,
		@Body() body?: BanUserDto,
	) {
		try {
			const result = await auth.api.banUser({
				headers: toWebHeaders(req.headers),
				body: {
					userId,
					banReason: body?.banReason,
					banExpiresIn: body?.banExpiresIn,
				},
			});

			// TODO: Aquí puedes agregar lógica de auditoría
			// await this.auditService.log('user.banned', { userId, bannedBy: session.user.id, reason: body?.banReason });

			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	/**
	 * Desbanea un usuario
	 * Requiere permiso user:ban (admin, moderator)
	 */
	@Delete(':userId/ban')
	@UseGuards(PermissionsGuard)
	@RequirePermission({ user: ['ban'] })
	@ApiOperation({
		summary: 'Desbanear usuario',
		description: 'Remueve el baneo de un usuario. Requiere permiso user:ban.',
	})
	@ApiCookieAuth('session_token')
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID del usuario a desbanear',
		example: 'clx1234567890',
	})
	@ApiResponse({ status: 200, description: 'Usuario desbaneado exitosamente' })
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async unbanUser(@Param('userId') userId: string, @Req() req: Request) {
		try {
			const result = await auth.api.unbanUser({
				headers: toWebHeaders(req.headers),
				body: {
					userId,
				},
			});

			// TODO: Aquí puedes agregar lógica de auditoría
			// await this.auditService.log('user.unbanned', { userId, unbannedBy: session.user.id });

			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	/**
	 * Actualiza la información básica de un usuario
	 * Requiere rol de administrador
	 */
	@Patch(':userId')
	@RequireRole('admin')
	@ApiOperation({
		summary: 'Actualizar información del usuario (Admin)',
		description:
			'Actualiza el nombre o email de un usuario. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID del usuario a actualizar',
	})
	@ApiBody({ type: UpdateUserDto })
	@ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async updateUser(
		@Param('userId') userId: string,
		@Req() req: Request,
		@Body() body: UpdateUserDto,
	) {
		try {
			const result = await auth.api.adminUpdateUser({
				headers: toWebHeaders(req.headers),
				body: {
					userId,
					data: {
						...body,
					},
				},
			});
			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	/**
	 * Actualiza la contraseña de un usuario (Admin)
	 * Requiere rol de administrador
	 */
	@Post(':userId/password')
	@RequireRole('admin')
	@ApiOperation({
		summary: 'Cambiar contraseña de usuario (Admin)',
		description:
			'Establece una nueva contraseña para el usuario especificado. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID del usuario',
	})
	@ApiBody({ type: SetPasswordDto })
	@ApiResponse({
		status: 200,
		description: 'Contraseña actualizada exitosamente',
	})
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async setPassword(
		@Param('userId') userId: string,
		@Req() req: Request,
		@Body() body: SetPasswordDto,
	) {
		try {
			const result = await auth.api.setUserPassword({
				headers: toWebHeaders(req.headers),
				body: {
					userId,
					newPassword: body.password,
				},
			});
			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}

	/**
	 * Elimina un usuario permanentemente
	 * Requiere rol de administrador
	 */
	@Delete(':userId')
	@RequireRole('admin')
	@ApiOperation({
		summary: 'Eliminar usuario (Admin)',
		description:
			'Elimina permanentemente un usuario del sistema. Requiere permisos de administrador.',
	})
	@ApiCookieAuth('session_token')
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID del usuario a eliminar',
		example: 'clx1234567890',
	})
	@ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
	@ApiResponse({ status: 403, description: 'No autorizado' })
	async removeUser(@Param('userId') userId: string, @Req() req: Request) {
		try {
			const result = await auth.api.removeUser({
				headers: toWebHeaders(req.headers),
				body: {
					userId,
				},
			});

			// TODO: Aquí puedes agregar lógica de auditoría
			// await this.auditService.log('user.removed', { userId, removedBy: session.user.id });

			return result;
		} catch (error) {
			handleBetterAuthError(error);
		}
	}
}
