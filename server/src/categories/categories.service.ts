import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Categories } from 'generated/prisma';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoriesCreateInput): Promise<Categories> {
    return this.prisma.categories.create({ data });
  }

  async getCategories(name?: string): Promise<Categories[]> {
    return this.prisma.categories.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
      },
    });
  }

  async getCategory(
    categoryWhereUniqueInput: Prisma.CategoriesWhereUniqueInput,
  ): Promise<Categories | null> {
    return this.prisma.categories.findUnique({
      where: categoryWhereUniqueInput,
    });
  }

  async updateCategory(
    id: string,
    data: Prisma.CategoriesUpdateInput,
  ): Promise<Categories> {
    return this.prisma.categories.update({
      where: {
        id,
      },
      data,
    });
  }

  async deletePost(
    where: Prisma.CategoriesWhereUniqueInput,
  ): Promise<Categories> {
    return this.prisma.categories.delete({
      where,
    });
  }
}
