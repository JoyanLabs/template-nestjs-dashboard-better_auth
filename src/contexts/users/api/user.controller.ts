import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('users')
export class UserController {
	@Get()
	@ApiOperation({
		summary: 'Obtener lista de usuarios',
		description: 'Retorna la lista de todos los usuarios del sistema',
	})
	@ApiResponse({
		status: 200,
		description: 'Lista de usuarios obtenida exitosamente',
		schema: {
			example: {
				users: 'ok',
			},
		},
	})
	run() {
		return { users: 'ok' };
	}
}
