/**
 * Interface base para Use Cases
 * Todos los use cases deben implementar un método execute
 */
export interface IUseCase<TInput, TOutput> {
	execute(input: TInput): Promise<TOutput>;
}
