/**
 * Command para desbanear un usuario.
 */
export class UnbanUserCommand {
	constructor(
		public readonly userId: string,
		public readonly unbannedByUserId: string | undefined,
		public readonly headers: Headers,
	) {}
}
