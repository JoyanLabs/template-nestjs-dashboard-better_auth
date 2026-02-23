/**
 * Query para listar usuarios.
 */
export class ListUsersQuery {
	constructor(
		public readonly limit: number | undefined,
		public readonly offset: number | undefined,
		public readonly headers: Headers,
	) {}
}
