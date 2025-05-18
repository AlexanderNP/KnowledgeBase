import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { extname } from 'path';

enum ImageExtname {
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  WEBP = 'webp',
}

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
    await this.minioClient.putObject(
      this.bucketName,
      file.originalname,
      file.buffer,
      file.size,
    );

    return file.originalname;
  }

  getFileUrl(fileName: string) {
    return `${this.minioFinalUrl}/${fileName}`;
  }

  getPreparedFileUrlForRequest(fileName: string, isImage: boolean = false) {
    const filePath = `${this.minioFinalUrl}/${fileName}`;

    if (isImage) {
      const mimeType = this.getMimeType(fileName);
      return `${filePath}?response-cache-control=public&response-content-type=${mimeType}&response-content-disposition=inline`;
    }

    return `${filePath}?response-content-disposition=attachment`;
  }

  async deleteFile(endPoint: string) {
    const fileName = endPoint.split('/').at(-1);
    await this.minioClient.removeObject(this.bucketName, fileName ?? '');
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

  private getMimeType(filename: string): string {
    const extension = extname(filename) as ImageExtname;

    switch (extension) {
      case ImageExtname.JPG:
      case ImageExtname.JPEG:
        return 'image/jpeg';
      case ImageExtname.PNG:
        return 'image/png';
      case ImageExtname.WEBP:
        return 'image/webp';

      default:
        return 'application/octet-stream';
    }
  }
}
