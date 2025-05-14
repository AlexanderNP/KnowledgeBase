import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;
  private readonly minioFinalUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') as string,
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: false,
      accessKey: this.configService.get('MINIO_ACCESS_KEY') as string,
      secretKey: this.configService.get('MINIO_SECRET_KEY') as string,
    });

    this.bucketName = this.configService.get('MINIO_BUCKET_NAME') as string;
    this.minioFinalUrl = this.configService.get('MINIO_FINAL_URL') as string;
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'eu-west-1');
      await this.setPublicBucketPolicy();
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const fileName = `${file.originalname}`;
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
    );

    return fileName;
  }

  getFileUrl(fileName: string) {
    return `${this.minioFinalUrl}/${fileName}`;
  }

  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  private async setPublicBucketPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucketName}/*`,
        },
      ],
    };
    await this.minioClient.setBucketPolicy(
      this.bucketName,
      JSON.stringify(policy),
    );
  }
}
