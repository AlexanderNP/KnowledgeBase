import { Injectable } from '@nestjs/common';
import { Prisma, Articles } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.ArticlesCreateInput): Promise<Articles> {
    return this.prisma.articles.create({ data });
  }
}
