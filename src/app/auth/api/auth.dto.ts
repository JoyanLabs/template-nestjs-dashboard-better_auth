import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
	@ApiProperty({
		example: 'user@example.com',
		description: 'Correo electrónico del usuario',
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		example: 'SecurePassword123!',
		description: 'Contraseña segura (mínimo 8 caracteres)',
		minLength: 8,
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	password!: string;

	@ApiProperty({
		example: 'John Doe',
		description: 'Nombre completo del usuario',
	})
	@IsString()
	@IsNotEmpty()
	name!: string;
}

export class SignInDto {
	@ApiProperty({
		example: 'user@example.com',
		description: 'Correo electrónico registrado',
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({ example: 'SecurePassword123!', description: 'Contraseña' })
	@IsString()
	@IsNotEmpty()
	password!: string;
}

export class ForgetPasswordDto {
	@ApiProperty({
		example: 'user@example.com',
		description: 'Correo electrónico para enviar el link de recuperación',
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		example: '/auth/reset-password',
		description: 'URL del frontend para redireccionar con el token',
	})
	@IsString()
	@IsNotEmpty()
	redirectTo!: string;
}

export class ResetPasswordDto {
	@ApiProperty({
		example: 'token-seguro-123',
		description: 'Token recibido por correo',
	})
	@IsString()
	@IsNotEmpty()
	token!: string;

	@ApiProperty({
		example: 'NewSecurePassword123!',
		description: 'Nueva contraseña',
		minLength: 8,
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	newPassword!: string;
}

export class AuthResponseDto {
	@ApiProperty({ description: 'Usuario autenticado' })
	user!: {
		id: string;
		email: string;
		emailVerified: boolean;
		name: string;
		createdAt: Date;
		updatedAt: Date;
	};

	@ApiProperty({ description: 'Sesión activa' })
	session!: {
		id: string;
		userId: string;
		expiresAt: Date;
		ipAddress?: string;
		userAgent?: string;
	};
}
