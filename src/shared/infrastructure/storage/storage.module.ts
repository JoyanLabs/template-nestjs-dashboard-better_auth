import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { STORAGE_SERVICE } from '../../application/ports/storage-service.port.js';
import { CloudflareR2Adapter } from '../adapters/cloudflare-r2.adapter.js';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: STORAGE_SERVICE,
			useClass: CloudflareR2Adapter,
		},
	],
	exports: [STORAGE_SERVICE],
})
export class StorageModule {}
