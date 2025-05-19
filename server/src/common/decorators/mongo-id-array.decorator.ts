import { applyDecorators } from '@nestjs/common';
import { IsMongoId, IsString, IsArray } from 'class-validator';

export function IsMongoIdArray() {
  return applyDecorators(
    IsArray(),
    IsString({ each: true }),
    IsMongoId({ each: true }),
  );
}
