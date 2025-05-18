import { IsString, IsNotEmpty } from 'class-validator';

export class CreateСategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
