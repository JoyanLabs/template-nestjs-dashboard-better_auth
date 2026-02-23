/**
 * Query para obtener el usuario actual (de la sesión).
 *
 * Las Queries son objetos inmutables que representan la intención de
 * obtener información SIN modificar el estado del sistema.
 */
export class GetCurrentUserQuery {
	constructor(public readonly headers: Headers) {}
}
