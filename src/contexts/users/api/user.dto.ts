import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUserDto {
	@ApiProperty({
		description: 'Email del usuario',
		example: 'user@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		description: 'Contraseña del usuario',
		example: 'SecurePass123!',
		minLength: 8,
	})
	@IsString()
	@MinLength(8)
	@IsNotEmpty()
	password!: string;

	@ApiProperty({
		description: 'Nombre del usuario',
		example: 'John Doe',
	})
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiPropertyOptional({
		description: 'Rol del usuario',
		enum: ['user', 'admin', 'moderator'],
		default: 'user',
		example: 'user',
	})
	@IsOptional()
	@IsEnum(['user', 'admin', 'moderator'])
	role?: 'user' | 'admin' | 'moderator';
}

/**
 * DTO para banear un usuario
 */
export class BanUserDto {
	@ApiPropertyOptional({
		description: 'Razón del baneo',
		example: 'Violación de términos de servicio',
	})
	@IsOptional()
	@IsString()
	banReason?: string;

	@ApiPropertyOptional({
		description: 'Duración del baneo en segundos',
		example: 86400,
	})
	@IsOptional()
	@IsNumber()
	banExpiresIn?: number;
}

/**
 * DTO para actualizar el rol de un usuario
 */
export class UpdateRoleDto {
	@ApiProperty({
		description: 'Nuevo rol para el usuario',
		enum: ['user', 'admin', 'moderator'],
		example: 'admin',
	})
	@IsEnum(['user', 'admin', 'moderator'])
	@IsNotEmpty()
	role!: 'user' | 'admin' | 'moderator';
}

/**
 * DTO para actualizar la contraseña de un usuario por un administrador
 */
export class SetPasswordDto {
	@ApiProperty({
		description: 'Nueva contraseña para el usuario',
		example: 'NewSecurePass123!',
		minLength: 8,
	})
	@IsString()
	@MinLength(8)
	@IsNotEmpty()
	password!: string;
}

/**
 * DTO para actualizar la información básica de un usuario
 */
export class UpdateUserDto {
	@ApiPropertyOptional({
		description: 'Nuevo nombre del usuario',
		example: 'Jane Doe',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description: 'Nuevo email del usuario',
		example: 'jane@example.com',
	})
	@IsOptional()
	@IsEmail()
	email?: string;
}
