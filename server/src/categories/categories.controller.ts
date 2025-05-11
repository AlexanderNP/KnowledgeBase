import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateСategoryDto } from './dto/create-categories';
import { Categories as CategoriesModel } from 'generated/prisma';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() categoryData: CreateСategoryDto): Promise<CategoriesModel> {
    const { description, name, imageUrl } = categoryData;

    return this.categoriesService.create({
      description,
      name,
      imageUrl,
    });
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
