import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // Продумать логику парсинга url файлов для корректного сохранения в таблицу MediaFiles

  @Post()
  async create(@Body() articleData: CreateArticleDto) {}

  // Сделать логику загрузки файлов
  // Файлы могут быть как изображения, так и обычные файлы
  // Продумать логику отчистика бакета, если пользователь в моменте передумал создавать статью, а ссылка уже есть

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File,) {}
}
