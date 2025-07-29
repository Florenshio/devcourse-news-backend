import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SummarizedNewsService } from '../services/summarized-news.service';
import { SummarizedNews } from '../entities/summarized-news.entity';
import { CreateSummarizedNewsDto } from '../dto/create-summarized-news.dto';

@ApiTags('summarized-news')
@Controller('summarized-news')
export class SummarizedNewsController {
  constructor(private readonly summarizedNewsService: SummarizedNewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a summarized news article' })
  @ApiResponse({ status: 201, description: 'Summarized news created successfully', type: SummarizedNews })
  create(@Body() createSummarizedNewsDto: CreateSummarizedNewsDto): Promise<SummarizedNews> {
    return this.summarizedNewsService.create(createSummarizedNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all summarized news articles' })
  @ApiResponse({ status: 200, description: 'Return all summarized news articles', type: [SummarizedNews] })
  findAll(): Promise<SummarizedNews[]> {
    return this.summarizedNewsService.findAll();
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s summarized news articles' })
  @ApiResponse({ status: 200, description: 'Return today\'s summarized news articles', type: [SummarizedNews] })
  findTodaysSummarizedNews(): Promise<SummarizedNews[]> {
    return this.summarizedNewsService.findTodaysSummarizedNews();
  }

  @Get('news/:newsId')
  @ApiOperation({ summary: 'Get summarized news by news ID' })
  @ApiResponse({ status: 200, description: 'Return summarized news by news ID', type: SummarizedNews })
  findByNewsId(@Param('newsId') newsId: string): Promise<SummarizedNews> {
    return this.summarizedNewsService.findByNewsId(+newsId);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get summarized news articles by date' })
  @ApiResponse({ status: 200, description: 'Return summarized news articles by date', type: [SummarizedNews] })
  findByDate(@Param('date') dateString: string): Promise<SummarizedNews[]> {
    const date = new Date(dateString);
    return this.summarizedNewsService.findByDate(date);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get summarized news articles by category' })
  @ApiResponse({ status: 200, description: 'Return summarized news articles by category', type: [SummarizedNews] })
  findByCategory(@Param('category') category: string): Promise<SummarizedNews[]> {
    return this.summarizedNewsService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a summarized news article by ID' })
  @ApiResponse({ status: 200, description: 'Return a summarized news article by ID', type: SummarizedNews })
  findOne(@Param('id') id: string): Promise<SummarizedNews> {
    return this.summarizedNewsService.findOne(+id);
  }
}
