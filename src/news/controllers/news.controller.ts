import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsService } from '../services/news.service';
import { News } from '../entities/news.entity';
import { CreateNewsDto } from '../dto/create-news.dto';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a news article' })
  @ApiResponse({ status: 201, description: 'News article created successfully', type: News })
  create(@Body() createNewsDto: CreateNewsDto): Promise<News> {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all news articles' })
  @ApiResponse({ status: 200, description: 'Return all news articles', type: [News] })
  findAll(): Promise<News[]> {
    return this.newsService.findAll();
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s news articles' })
  @ApiResponse({ status: 200, description: 'Return today\'s news articles', type: [News] })
  findTodaysNews(): Promise<News[]> {
    return this.newsService.findTodaysNews();
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get news articles by date' })
  @ApiResponse({ status: 200, description: 'Return news articles by date', type: [News] })
  findByDate(@Param('date') dateString: string): Promise<News[]> {
    const date = new Date(dateString);
    return this.newsService.findByDate(date);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get news articles by category' })
  @ApiResponse({ status: 200, description: 'Return news articles by category', type: [News] })
  findByCategory(@Param('category') category: string): Promise<News[]> {
    return this.newsService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a news article by ID' })
  @ApiResponse({ status: 200, description: 'Return a news article by ID', type: News })
  findOne(@Param('id') id: string): Promise<News> {
    return this.newsService.findOne(+id);
  }
}
