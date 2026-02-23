/**
 * Command para actualizar un usuario.
 */
export class UpdateUserCommand {
	constructor(
		public readonly userId: string,
		public readonly data: {
			name?: string;
			email?: string;
			role?: string;
		},
		public readonly headers: Headers,
	) {}
}
