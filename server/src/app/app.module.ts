import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.modules';
import { MinioModule } from 'src/minio/minio.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CategoriesModule,
    PrismaModule,
    MinioModule,
  ],
  providers: [ConfigService],
})
export class AppModule {}
