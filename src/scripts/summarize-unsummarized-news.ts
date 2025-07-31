import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { NewsSummarizerService } from '../news/services/news-summarizer.service';

/**
 * 아직 요약되지 않은 모든 뉴스 기사를 요약하는 스크립트
 * 1. 아직 summarized_news 테이블에 저장되지 않은 뉴스 기사를 찾음
 * 2. LLM을 이용해 기사를 요약 및 번역하여 summarized_news 테이블에 저장
 */
async function bootstrap() {
  const logger = new Logger('SummarizeUnsummarizedNews');
  logger.log('Starting summarize unsummarized news process...');

  try {
    // NestJS 앱 생성
    const app = await NestFactory.createApplicationContext(AppModule);

    // 서비스 가져오기
    const newsSummarizerService = app.get(NewsSummarizerService);

    logger.log('Finding and summarizing unsummarized news articles...');
    
    // 아직 요약되지 않은 모든 뉴스 기사 요약 및 저장
    const summarizedNews = await newsSummarizerService.summarizeAllUnsummarizedNews();
    
    logger.log(`Successfully summarized and saved ${summarizedNews.length} previously unsummarized news articles`);
    
    logger.log('Summarize unsummarized news process completed successfully');
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Error in summarize unsummarized news process: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
