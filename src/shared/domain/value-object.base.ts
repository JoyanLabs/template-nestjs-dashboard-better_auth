/**
 * Base class for all Value Objects
 * Value Objects are immutable and compared by value rather than identity
 */
export abstract class ValueObject<T> {
	protected readonly props: T;

	constructor(props: T) {
		this.props = Object.freeze(props);
	}

	/**
	 * Compara dos Value Objects por su valor
	 * Dos Value Objects son iguales si todos sus valores son iguales
	 */
	public equals(vo?: ValueObject<T>): boolean {
		if (vo === null || vo === undefined) {
			return false;
		}

		if (vo.props === undefined) {
			return false;
		}

		return JSON.stringify(this.props) === JSON.stringify(vo.props);
	}
}
