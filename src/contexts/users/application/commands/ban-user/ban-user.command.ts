/**
 * Command para banear un usuario.
 */
export class BanUserCommand {
	constructor(
		public readonly userId: string,
		public readonly banReason: string | undefined,
		public readonly banExpiresIn: number | undefined,
		public readonly bannedByUserId: string | undefined,
		public readonly headers: Headers,
	) {}
}
