import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NewsController } from './controllers/news.controller';
import { NewsService } from './services/news.service';
import { NewsFetcherService } from './services/news-fetcher.service';
import { NewsSummarizerService } from './services/news-summarizer.service';
import { News } from './entities/news.entity';
import { SourceModule } from '../source/source.module';
import { LlmModule } from '../llm/llm.module';
import { SummarizedNewsModule } from '../summarized-news/summarized-news.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([News]),
    ConfigModule,
    SourceModule,
    LlmModule,
    SummarizedNewsModule,
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsFetcherService, NewsSummarizerService],
  exports: [NewsService, NewsFetcherService, NewsSummarizerService],
})
export class NewsModule {}
