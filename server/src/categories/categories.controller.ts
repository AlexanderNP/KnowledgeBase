import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateСategoryDto } from './dto/create-categories';
import { Categories as CategoriesModel } from 'generated/prisma';
import { MinioService } from 'src/minio/minio.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @Body() categoryData: CreateСategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CategoriesModel> {
    const { description, name } = categoryData;

    let imageUrl;

    if (image) {
      const fileName = await this.minioService.uploadFile(image);
      imageUrl = this.minioService.getFileUrl(fileName);
    }

    return this.categoriesService.create({
      description,
      name,
      imageUrl,
    });
  }

  @Get()
  async getCategories(): Promise<CategoriesModel[]> {
    return this.categoriesService.getCategories();
  }
}
