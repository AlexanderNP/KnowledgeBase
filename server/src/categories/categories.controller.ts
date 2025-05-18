import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  NotFoundException,
  Query,
  Put,
  Delete,
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
  async getCategories(
    @Query() query: { name: string },
  ): Promise<CategoriesModel[]> {
    return this.categoriesService.getCategories(query.name);
  }

  @Get(':id')
  async getCategory(@Param('id') id: string): Promise<CategoriesModel> {
    const findCategory = await this.categoriesService.getCategory({ id });
    console.log(findCategory);

    if (!findCategory) {
      throw new NotFoundException(`Категория по ID ${id} не найдена`);
    }

    return findCategory;
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('id') id: string,
    @Body() categoryData?: CreateСategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CategoriesModel> {
    const findCategory = await this.categoriesService.getCategory({ id });

    if (!findCategory) {
      throw new NotFoundException(`Категория по ID ${id} не найдена`);
    }

    let imageUrl: string | undefined;

    if (image) {
      const fileName = await this.minioService.uploadFile(image);
      imageUrl = this.minioService.getFileUrl(fileName);
    }

    const updateData = { ...categoryData, imageUrl };

    return this.categoriesService.updateCategory(id, updateData);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<CategoriesModel> {
    const findCategory = await this.categoriesService.getCategory({ id });

    if (!findCategory) {
      throw new NotFoundException(`Категория по ID ${id} не найдена`);
    }

    const { imageUrl } = findCategory;

    if (imageUrl) {
      await this.minioService.deleteFile(imageUrl);
    }

    return this.categoriesService.deletePost({ id });
  }
}
