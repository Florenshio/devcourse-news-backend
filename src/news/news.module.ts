import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NewsController } from './controllers/news.controller';
import { NewsService } from './services/news.service';
import { NewsFetcherService } from './services/news-fetcher.service';
import { News } from './entities/news.entity';
import { SourceModule } from '../source/source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([News]),
    ConfigModule,
    SourceModule,
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsFetcherService],
  exports: [NewsService, NewsFetcherService],
})
export class NewsModule {}
