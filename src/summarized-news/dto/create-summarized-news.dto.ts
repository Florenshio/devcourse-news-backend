import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSummarizedNewsDto {
  @ApiProperty({ description: 'News ID' })
  @IsNumber()
  @IsNotEmpty()
  newsId: number;

  @ApiProperty({ description: 'Summarized content' })
  @IsString()
  @IsNotEmpty()
  summarizedContent: string;

  @ApiProperty({ description: 'Source ID' })
  @IsNumber()
  @IsNotEmpty()
  sourceId: number;
}
