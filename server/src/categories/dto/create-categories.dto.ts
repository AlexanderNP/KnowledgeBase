import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateСategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(5)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(15)
  description: string;
}
