import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';

@Controller('api/storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private StorageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('dialogeId') dialogeId?: string,
  ): Promise<{ fileId: string; filename: string; filesize: string }> {
    const extension = extname(file.originalname);
    const filename = `${uuid.v4()}${extension}`;
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    const newFile = await this.StorageService.createFile(
      file.buffer,
      filename,
      file.originalname,
      file.size,
      false,
      dialogeId,
    );
    return newFile;
  }

  @Get('download/:fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @UserId() userId: string,
  ) {
    const fileUrl = await this.StorageService.getPresignedUrl(fileId, userId);
    return fileUrl;
  }

  @Get('image/:fileId')
  async getImage(@Param('fileId') fileId: string, @UserId() userId: string) {
    const imageUrl = await this.StorageService.getPresignedUrl(
      fileId,
      userId,
      true,
    );
    return imageUrl;
  }
}
