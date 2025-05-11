import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Categories } from 'generated/prisma';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoriesCreateInput): Promise<Categories> {
    console.log(data);
    return this.prisma.categories.create({ data });
  }
}
