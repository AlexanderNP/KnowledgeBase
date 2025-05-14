import { Module } from '@nestjs/common';
import { StorageController } from './minio.controller';
import { StorageService } from './minio.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
})
export class MinioModule {}
