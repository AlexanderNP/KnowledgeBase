import {
  IsString,
  IsMongoId,
  Length,
  IsNotEmpty,
  ArrayNotEmpty,
} from 'class-validator';

import { IsMongoIdArray } from 'src/common/decorators/mongo-id-array.decorator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @Length(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(20)
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  authorId: string;

  @IsMongoIdArray()
  @ArrayNotEmpty({ message: 'Категории не должны быть пустыми' })
  categoryIds: string[];
}
