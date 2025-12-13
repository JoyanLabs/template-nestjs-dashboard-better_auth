import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para el caso de uso de Sign In
 * Define la estructura de los datos de entrada para iniciar sesión
 */
export class SignInDto {
	@IsEmail({}, { message: 'El email debe tener un formato válido' })
	@IsNotEmpty({ message: 'El email es requerido' })
	email: string;

	@IsString({ message: 'La contraseña debe ser un texto' })
	@IsNotEmpty({ message: 'La contraseña es requerida' })
	@MinLength(8, {
		message: 'La contraseña debe tener al menos 8 caracteres',
	})
	password: string;

	constructor(email: string, password: string) {
		this.email = email;
		this.password = password;
	}
}
