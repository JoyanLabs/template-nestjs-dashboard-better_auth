import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

/**
 * DTO para el caso de uso de Sign Up
 * Define la estructura de los datos de entrada para registrarse
 */
export class SignUpDto {
	@IsEmail({}, { message: 'El email debe tener un formato válido' })
	@IsNotEmpty({ message: 'El email es requerido' })
	@MaxLength(255, { message: 'El email no puede tener más de 255 caracteres' })
	email: string;

	@IsString({ message: 'La contraseña debe ser un texto' })
	@IsNotEmpty({ message: 'La contraseña es requerida' })
	@MinLength(8, {
		message: 'La contraseña debe tener al menos 8 caracteres',
	})
	@MaxLength(128, {
		message: 'La contraseña no puede tener más de 128 caracteres',
	})
	password: string;

	@IsString({ message: 'El nombre debe ser un texto' })
	@IsNotEmpty({ message: 'El nombre es requerido' })
	@MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
	@MaxLength(100, {
		message: 'El nombre no puede tener más de 100 caracteres',
	})
	name: string;

	@IsOptional()
	@IsString({ message: 'La imagen debe ser una URL' })
	image?: string;

	constructor(email: string, password: string, name: string, image?: string) {
		this.email = email;
		this.password = password;
		this.name = name;
		this.image = image;
	}
}
