import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SourceService } from '../services/source.service';
import { Source } from '../entities/source.entity';
import { CreateSourceDto } from '../dto/create-source.dto';

@ApiTags('source')
@Controller('source')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a news source' })
  @ApiResponse({ status: 201, description: 'News source created successfully', type: Source })
  create(@Body() createSourceDto: CreateSourceDto): Promise<Source> {
    return this.sourceService.create(createSourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all news sources' })
  @ApiResponse({ status: 200, description: 'Return all news sources', type: [Source] })
  findAll(): Promise<Source[]> {
    return this.sourceService.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get news sources by category' })
  @ApiResponse({ status: 200, description: 'Return news sources by category', type: [Source] })
  findByCategory(@Param('category') category: string): Promise<Source[]> {
    return this.sourceService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a news source by ID' })
  @ApiResponse({ status: 200, description: 'Return a news source by ID', type: Source })
  findOne(@Param('id') id: string): Promise<Source> {
    return this.sourceService.findOne(+id);
  }
}
