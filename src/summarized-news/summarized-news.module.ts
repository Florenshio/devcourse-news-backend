import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummarizedNewsController } from './controllers/summarized-news.controller';
import { SummarizedNewsService } from './services/summarized-news.service';
import { SummarizedNews } from './entities/summarized-news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SummarizedNews])],
  controllers: [SummarizedNewsController],
  providers: [SummarizedNewsService],
  exports: [SummarizedNewsService],
})
export class SummarizedNewsModule {}
