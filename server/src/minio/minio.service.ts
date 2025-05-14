import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {

  private s3Client: S3Client;
  private bucketName: string;  private readonly S3Endpoint = `https://${process.env.S3_URL}`;

  constructor(
    @InjectModel(Dialoge.name) private DialogeModel: Model<Dialoge>,
    @InjectModel(File.name) private FileModel: Model<File>,
    @InjectModel(User.name) private UserModel: Model<User>,
    private CryptService: CryptService
  ) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: this.S3Endpoint,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY
      },
      forcePathStyle: true
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || "storage";    this.ensureBucketExists(this.bucketName);
  }

private async ensureBucketExists(
    bucketName: string,
    isPublic: boolean = false
  ) {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Бакет ${bucketName} существует`);
    }
    catch(error) {
      if(error.name === "NotFound") {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));

        if(isPublic) {
          const publicPolicy = {
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "PublicReadGetObject",
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                Resource: `arn:aws:s3:::${bucketName}/*`
              }
            ]
          };
          await this.s3Client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(publicPolicy)
          }));
          console.log(`Бакет ${bucketName} публичный`);
        }

        console.log(`Бакет ${bucketName} создан`);
      }
      else {
        console.error(`Ошибка при проверке бакета:\n${JSON.stringify(error)}\n`);
      }
    }
  }

async createFile(
    filebuffer: Buffer,
    filepath: string,
    filename: string,
    filesize: number,
    isPublic: boolean,
    dialogeId?: string,
  ) : Promise<{ fileId: string, filename: string, filesize: string }> {
    const bucket = isPublic ? this.publicBucketName : this.bucketName;
    await this.s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filepath,
      Body: filebuffer,
      ContentType: 'application/octet-stream',
      ACL: isPublic ? 'public-read' : undefined
    }));

    const filesizeString = this.formatFileSize(filesize);
    const { encryptedData, iv } = this.CryptService.encrypt(filename);
    if(isPublic) {
      const publicUrl = `${this.S3Endpoint}/${bucket}/${filepath}`;
      const file = await this.FileModel.create({
        filename: encryptedData,
        iv: iv,
        path: publicUrl,
        size: filesizeString,
        isPublic: true,
      });
      return {
        fileId: file._id.toString(),
        filename: filename,
        filesize: file.size
      }
    }

    if(dialogeId) {
      const dialoge = await this.DialogeModel.findById(dialogeId);
      if(!dialoge) {
        throw new BadRequestException(["Такого диалога не существует"]);
      }

      const file = await this.FileModel.create({
        filename: encryptedData,
        iv: iv,
        path: filepath,
        size: filesizeString,
        isPublic: false,
        dialoge: dialoge._id
      });

      return {
        fileId: file._id.toString(),
        filename: filename,
        filesize: file.size
      }
    }
  }

async getFile(
    fileId: string,
    userId: string,
  ) : Promise<FileDocument> {
    const file = await this.FileModel.findById(fileId);
    if(!file) {
      throw new BadRequestException(["Такого файла не существует"]);
    }

    if(file.isPublic) {
      const filename = this.CryptService.decrypt(file.filename, file.iv);
      file.filename = filename;
      return file;
    }

    if(file.dialoge) {
      const dialoge = await this.DialogeModel.findById(file.dialoge);
      if(!dialoge) {
        throw new BadRequestException(["Такого диалога не существует"]);
      }

      const userIdObject = new mongoose.Types.ObjectId(userId);
      if(!dialoge.participants.includes(userIdObject)) {
        throw new UnauthorizedException(["У вас нет доступа к этому файлу"]);
      }
    }
    else {
      throw new BadRequestException(["У вас нет доступа к этому файлу"]);
    }

    const filename = this.CryptService.decrypt(file.filename, file.iv);
    file.filename = filename;
    return file;
  }

async getPresignedUrl(
    fileId: string,
    userId: string,
    isImage: boolean = false
  ) : Promise<string> {
    const file = await this.getFile(fileId, userId);
    if(file.isPublic) {
      if(isImage) {
        const mimeType = this.getMimeType(file.filename);
        return ${file.path}?response-cache-control=public&response-content-type=${mimeType}&response-content-disposition=inline;
      }
      else {
        return ${file.path}?response-content-disposition=attachment";
      }
    }

    const bucket = file.isPublic ? this.publicBucketName : this.bucketName;
    const commandInput: GetObjectCommandInput = {
      Bucket: bucket,
      Key: file.path
    };

    if(isImage) {
      const mimeType = this.getMimeType(file.filename);
      commandInput.ResponseContentType = mimeType;
      commandInput.ResponseContentDisposition = "inline";
    }
    else {
      commandInput.ResponseContentDisposition = attachment; filename="${file.filename}";
    }

    const command = new GetObjectCommand(commandInput);

    const signedUrl = await getSignedUrl(
      this.s3Client,
      command,
      { expiresIn: 3600 }
    );
    
    return signedUrl;
  }

private getMimeType(filename: string): string {
    const extension = extname(filename);

    switch(extension) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".webp":
        return "image/webp";
      
      default:
        return "application/octet-stream";
    }
  }

private formatFileSize(size: number): string {
    if (size < 1024) return ${size} Б;
    if (size < 1024 * 1024) return ${(size / 1024).toFixed(2)} Кб;
    if (size < 1024 * 1024 * 1024) return ${(size / (1024 * 1024)).toFixed(2)} Мб;
    return ${(size / (1024 * 1024 * 1024)).toFixed(2)} Гб;
  }
}
