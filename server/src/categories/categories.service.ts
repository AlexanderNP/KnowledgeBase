import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Categories } from 'generated/prisma';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoriesCreateInput): Promise<Categories> {
    return this.prisma.categories.create({ data });
  }

  async getCategories(): Promise<Categories[]> {
    return this.prisma.categories.findMany();
  }
}
