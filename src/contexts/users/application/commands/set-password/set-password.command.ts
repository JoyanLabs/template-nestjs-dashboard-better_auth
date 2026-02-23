/**
 * Command para cambiar la contraseña de un usuario (por admin).
 */
export class SetPasswordCommand {
	constructor(
		public readonly userId: string,
		public readonly newPassword: string,
		public readonly headers: Headers,
	) {}
}
