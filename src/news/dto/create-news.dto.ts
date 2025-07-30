import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ description: 'News title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'News author', required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: 'News content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'News URL', required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'Published date' })
  @IsDate()
  @IsNotEmpty()
  publishedAt: Date;

  @ApiProperty({ description: 'Source ID' })
  @IsNumber()
  @IsNotEmpty()
  sourceId: number;
}
