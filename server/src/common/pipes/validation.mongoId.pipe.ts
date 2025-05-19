import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isMongoId, isString } from 'class-validator';

@Injectable()
export class ValidationMongoIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!isMongoId(value) || !isString(value)) {
      throw new BadRequestException(`Передан невалиданый ID: ${value}`);
    }
    return value;
  }
}
