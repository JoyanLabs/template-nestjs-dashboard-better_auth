/**
 * Command para crear un usuario.
 *
 * Los Commands son objetos inmutables que representan la intención de
 * realizar una operación que modifica el estado del sistema.
 *
 * Convención de nombres:
 * - Command: {Verbo}{Sustantivo}Command (CreateUserCommand)
 * - Handler: {Verbo}{Sustantivo}Handler (CreateUserHandler)
 */
export class CreateUserCommand {
	constructor(
		public readonly email: string,
		public readonly password: string,
		public readonly name: string,
		public readonly role: string | undefined,
		public readonly createdByUserId: string | undefined,
		public readonly headers: Headers,
	) {}
}
