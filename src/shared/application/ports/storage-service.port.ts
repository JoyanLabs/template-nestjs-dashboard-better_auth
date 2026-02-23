export interface PresignedUrlResponse {
	url: string;
	key: string;
	expiresIn: number; // segundos
}

export interface IStorageService {
	/**
	 * Genera una URL firmada para SUBIR un archivo (PUT)
	 * @param key Ruta del archivo (ej: "uploads/report.pdf")
	 * @param contentType Tipo MIME (ej: "application/pdf")
	 * @param expiresIn Tiempo de expiración en segundos (default: 3600)
	 */
	getPresignedPutUrl(
		key: string,
		contentType: string,
		expiresIn?: number,
	): Promise<PresignedUrlResponse>;

	/**
	 * Genera una URL firmada para LEER un archivo (GET)
	 * @param key Ruta del archivo
	 * @param expiresIn Tiempo de expiración en segundos (default: 3600)
	 */
	getPresignedGetUrl(key: string, expiresIn?: number): Promise<string>;

	/**
	 * Elimina un archivo del almacenamiento
	 * @param key Ruta del archivo
	 */
	deleteFile(key: string): Promise<void>;

	/**
	 * Verifica si un archivo existe y obtiene su metadata básica
	 * @param key Ruta del archivo
	 */
	headObject(
		key: string,
	): Promise<{ size: number; contentType: string } | null>;

	/**
	 * Sube un archivo directamente al almacenamiento (server-side)
	 * @param key Ruta del archivo
	 * @param body Contenido del archivo (Buffer)
	 * @param contentType Tipo MIME
	 */
	uploadFile(key: string, body: Buffer, contentType: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
