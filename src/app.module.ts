import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { SourceModule } from './source/source.module';
import { SummarizedNewsModule } from './summarized-news/summarized-news.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { TypeOrmConfig } from '../model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmConfig,
    NewsModule,
    SourceModule,
    SummarizedNewsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
