import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from './news.service';
import { SummarizedNewsService } from '../../summarized-news/services/summarized-news.service';
import { LlmService } from '../../llm/llm.service';
import { News } from '../entities/news.entity';
import { SummarizedNews } from '../../summarized-news/entities/summarized-news.entity';
import { CreateSummarizedNewsDto } from '../../summarized-news/dto/create-summarized-news.dto';

@Injectable()
export class NewsSummarizerService {
  private readonly logger = new Logger(NewsSummarizerService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly summarizedNewsService: SummarizedNewsService,
    private readonly llmService: LlmService,
  ) {}

  /**
   * 뉴스 기사를 요약하고 SummarizedNews 테이블에 저장
   * @param newsId 요약할 뉴스 ID
   * @returns 요약된 뉴스 객체
   */
  async summarizeAndSaveNews(newsId: number): Promise<SummarizedNews> {
    try {
      this.logger.log(`Summarizing news with ID: ${newsId}`);
      
      // 뉴스 기사 조회
      const news = await this.newsService.findOne(newsId);
      
      // LLM 서비스를 통해 요약 및 번역
      const summarizedArticle = await this.llmService.summarizeArticle({
        title: news.title,
        content: news.content,
        url: news.url,
      });
      
      // 요약된 내용 저장
      const summarizedNewsDto: CreateSummarizedNewsDto = {
        newsId: news.newsId,
        summarizedContent: `${summarizedArticle.summarized_title}\n\n${summarizedArticle.summarized_content}`,
        sourceId: news.sourceId,
      };
      
      // create 대신 updateByNewsId를 사용하여 중복 키 오류 방지
      const savedSummarizedNews = await this.summarizedNewsService.updateByNewsId(summarizedNewsDto);
      this.logger.log(`Successfully summarized and saved news with ID: ${newsId}`);
      
      return savedSummarizedNews;
    } catch (error) {
      this.logger.error(`Error summarizing news with ID ${newsId}: ${error.message}`);
      throw new Error(`Failed to summarize news: ${error.message}`);
    }
  }

  /**
   * 여러 뉴스 기사를 병렬로 요약하고 저장
   * @param newsIds 요약할 뉴스 ID 배열
   * @returns 요약된 뉴스 객체 배열
   */
  async summarizeAndSaveMultipleNews(newsIds: number[]): Promise<SummarizedNews[]> {
    try {
      this.logger.log(`Summarizing ${newsIds.length} news articles`);
      
      if (newsIds.length === 0) {
        return [];
      }
      
      // 뉴스 기사 조회
      const newsArticles = await Promise.all(
        newsIds.map(id => this.newsService.findOne(id))
      );
      
      // LLM 서비스를 통해 병렬로 요약 및 번역
      const articlesToSummarize = newsArticles.map(news => ({
        title: news.title,
        content: news.content,
        url: news.url,
      }));
      
      const summarizedArticles = await this.llmService.summarizeArticles(articlesToSummarize);
      
      // 요약된 내용 저장
      const summarizedNewsDtos = newsArticles.map((news, index) => ({
        newsId: news.newsId,
        summarizedContent: `${summarizedArticles[index].summarized_title}\n\n${summarizedArticles[index].summarized_content}`,
        sourceId: news.sourceId,
      }));
      
      // 병렬로 저장
      const savedSummarizedNews = await Promise.all(
        // summarizedNewsDtos.map(dto => this.summarizedNewsService.create(dto)
        summarizedNewsDtos.map(dto => this.summarizedNewsService.updateByNewsId(dto))
      );
      
      this.logger.log(`Successfully summarized and saved ${savedSummarizedNews.length} news articles`);
      return savedSummarizedNews;
    } catch (error) {
      this.logger.error(`Error batch summarizing news: ${error.message}`);
      throw new Error(`Failed to batch summarize news: ${error.message}`);
    }
  }

  /**
   * 아직 요약되지 않은 모든 뉴스 기사를 요약하고 저장
   * @returns 요약된 뉴스 객체 배열
   */
  async summarizeAllUnsummarizedNews(): Promise<SummarizedNews[]> {
    try {
      // 모든 뉴스 기사 조회
      const allNews = await this.newsService.findAll();
      
      // 이미 요약된 뉴스 ID 조회
      const summarizedNewsIds = (await this.summarizedNewsService.findAll())
        .map(sumNews => sumNews.newsId);
      
      // 아직 요약되지 않은 뉴스 필터링
      const unsummarizedNews = allNews.filter(
        news => !summarizedNewsIds.includes(news.newsId)
      );
      
      if (unsummarizedNews.length === 0) {
        this.logger.log('No unsummarized news articles found');
        return [];
      }
      
      this.logger.log(`Found ${unsummarizedNews.length} unsummarized news articles`);
      
      // 요약 및 저장
      return this.summarizeAndSaveMultipleNews(
        unsummarizedNews.map(news => news.newsId)
      );
    } catch (error) {
      this.logger.error(`Error summarizing unsummarized news: ${error.message}`);
      throw new Error(`Failed to summarize unsummarized news: ${error.message}`);
    }
  }
}
