import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	IStorageService,
	PresignedUrlResponse,
} from '../../application/ports/storage-service.port.js';
import { EnvConfig } from '../config/env.schema.js';

@Injectable()
export class CloudflareR2Adapter implements IStorageService {
	private readonly client: S3Client;
	private readonly bucketName: string;
	private readonly logger = new Logger(CloudflareR2Adapter.name);
	private readonly publicUrl?: string;

	constructor(private readonly configService: ConfigService<EnvConfig, true>) {
		const accountId = this.configService.get('R2_ACCOUNT_ID');
		const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID');
		const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY');

		this.bucketName = this.configService.get('R2_BUCKET_NAME');
		this.publicUrl = this.configService.get('R2_PUBLIC_URL');

		this.client = new S3Client({
			region: 'auto',
			endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		});
	}

	async getPresignedPutUrl(
		key: string,
		contentType: string,
		expiresIn = 3600,
	): Promise<PresignedUrlResponse> {
		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: key,
			ContentType: contentType,
		});

		try {
			const url = await getSignedUrl(this.client, command, { expiresIn });
			return { url, key, expiresIn };
		} catch (error) {
			this.logger.error(`Error generating PUT presigned URL for ${key}`, error);
			throw error;
		}
	}

	async getPresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
		// Si tenemos una URL pública configurada (Domain Access en R2), la usamos
		// Nota: Esto asume que el bucket es público o tiene reglas adecuadas.
		// Si es privado, igual necesitamos firmar la URL.
		if (this.publicUrl) {
			// Si el archivo es público, podríamos retornar directo la URL pública
			// return `${this.publicUrl}/${key}`;
		}

		const command = new GetObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		try {
			return await getSignedUrl(this.client, command, { expiresIn });
		} catch (error) {
			this.logger.error(`Error generating GET presigned URL for ${key}`, error);
			throw error;
		}
	}

	async deleteFile(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		try {
			await this.client.send(command);
			this.logger.log(`File deleted successfully: ${key}`);
		} catch (error) {
			this.logger.error(`Error deleting file ${key}`, error);
			throw error;
		}
	}

	async headObject(
		key: string,
	): Promise<{ size: number; contentType: string } | null> {
		const command = new HeadObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		try {
			const response = await this.client.send(command);
			return {
				size: response.ContentLength || 0,
				contentType: response.ContentType || 'application/octet-stream',
			};
		} catch (error: unknown) {
			if (
				error instanceof Error &&
				((error as Error & { name: string }).name === 'NotFound' ||
					(error as Error & { $metadata?: { httpStatusCode?: number } })
						.$metadata?.httpStatusCode === 404)
			) {
				return null;
			}
			this.logger.error(`Error checking file ${key}`, error);
			throw error;
		}
	}

	async uploadFile(
		key: string,
		body: Buffer,
		contentType: string,
	): Promise<void> {
		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: key,
			Body: body,
			ContentType: contentType,
		});

		try {
			await this.client.send(command);
			this.logger.log(
				`File uploaded successfully: ${key} (${body.length} bytes)`,
			);
		} catch (error) {
			this.logger.error(`Error uploading file ${key}`, error);
			throw error;
		}
	}
}
