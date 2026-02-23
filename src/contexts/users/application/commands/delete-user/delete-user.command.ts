/**
 * Command para eliminar un usuario.
 */
export class DeleteUserCommand {
	constructor(
		public readonly userId: string,
		public readonly deletedByUserId: string | undefined,
		public readonly headers: Headers,
	) {}
}
