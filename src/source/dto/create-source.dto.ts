import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSourceDto {
  @ApiProperty({ description: 'Country of the news source' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Language of the news source' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ description: 'News publisher name' })
  @IsString()
  @IsNotEmpty()
  news_publisher: string;

  @ApiProperty({ description: 'News category' })
  @IsString()
  @IsNotEmpty()
  news_category: string;
}
