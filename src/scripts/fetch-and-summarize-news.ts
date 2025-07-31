import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { NewsFetcherService } from '../news/services/news-fetcher.service';
import { NewsSummarizerService } from '../news/services/news-summarizer.service';
import { NewsService } from '../news/services/news.service';

/**
 * 뉴스 기사를 가져오고 요약하는 스크립트
 * 1. NewsAPI에서 최신 기사를 가져옴
 * 2. 기사 본문을 크롤링하여 news 테이블에 저장
 * 3. LLM을 이용해 기사를 요약 및 번역하여 summarized_news 테이블에 저장
 */
async function bootstrap() {
  const logger = new Logger('FetchAndSummarizeNews');
  logger.log('Starting fetch and summarize news process...');

  try {
    // NestJS 앱 생성
    const app = await NestFactory.createApplicationContext(AppModule);

    // 서비스 가져오기
    const newsFetcherService = app.get(NewsFetcherService);
    const newsSummarizerService = app.get(NewsSummarizerService);
    const newsService = app.get(NewsService);

    logger.log('Fetching news headlines...');
    
    // 1. 뉴스 가져오기 및 저장 (fetchAndStoreHeadlines는 public 메서드)
    await newsFetcherService.fetchAndStoreHeadlines();
    
    // 2. 최근 저장된 뉴스 조회 (오늘 저장된 뉴스)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentNews = await newsService.findByDate(today);
    logger.log(`Found ${recentNews.length} recent news articles to summarize`);
    
    if (recentNews.length > 0) {
      // 3. 뉴스 ID 추출
      const newsIds = recentNews.map(news => news.newsId);
      
      // 4. 뉴스 요약 및 번역하여 저장
      logger.log(`Summarizing ${newsIds.length} news articles`);
      const summarizedNews = await newsSummarizerService.summarizeAndSaveMultipleNews(newsIds);
      logger.log(`Successfully summarized and saved ${summarizedNews.length} news articles`);
    }

    logger.log('News fetch and summarize process completed successfully');
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Error in fetch and summarize process: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
