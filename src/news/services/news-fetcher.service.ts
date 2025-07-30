import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { NewsService } from './news.service';
import { SourceService } from '../../source/services/source.service';

type NewsResponse = {
  status: string;
  totalResults: number;
  articles: Array<Article>;
};

type Article = {
  source: {
    id: string;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
};

@Injectable()
export class NewsFetcherService {
  private readonly logger = new Logger(NewsFetcherService.name);
  private readonly newsapi;

  constructor(
    private readonly configService: ConfigService,
    private readonly newsService: NewsService,
    private readonly sourceService: SourceService,
  ) {
    const NewsAPI = require('newsapi');
    this.newsapi = new NewsAPI(this.configService.get<string>('NEWSAPI'));
  }

  async fetchAndStoreHeadlines(): Promise<void> {
    this.logger.log('Starting to fetch headlines');
    
    try {
      await this.fetchCategoryHeadlines('business');
      await this.fetchCategoryHeadlines('technology');
      
      this.logger.log('Finished fetching headlines');
    } catch (error) {
      this.logger.error(`Error fetching headlines: ${error.message}`);
      throw error;
    }
  }

  private async fetchCategoryHeadlines(category: string): Promise<void> {
    this.logger.log(`Fetching ${category} headlines`);
    
    try {
      const response = await this.newsapi.v2.topHeadlines({
        category,
        language: 'en',
        country: 'us',
      });

      if (response.status !== 'ok') {
        throw new Error(`News API returned status: ${response.status}`);
      }

      this.logger.log(`Found ${response.articles.length} ${category} headlines`);
      
      // 병렬 처리로 기사 데이터 준비
      const articlesData = await this.processArticlesInParallel(response.articles, category);
      
      // 유효한 기사만 필터링하여 일괄 저장
      const validArticles = articlesData.filter(article => article !== null);
      if (validArticles.length > 0) {
        this.logger.log(`Saving ${validArticles.length} valid articles to database`);
        await this.newsService.createMany(validArticles);
      } else {
        this.logger.warn(`No valid articles found for category: ${category}`);
      }
    } catch (error) {
      this.logger.error(`Error fetching ${category} headlines: ${error.message}`);
      throw error;
    }
  }

  /**
   * 여러 기사를 병렬로 처리하는 메서드
   */
  private async processArticlesInParallel(articles: Article[], category: string): Promise<Array<any>> {
    this.logger.log(`Processing ${articles.length} articles in parallel`);
    
    // 병렬 처리를 위한 Promise.all 사용
    const results = await Promise.all(
      articles.map(article => this.processArticleData(article, category))
    );
    
    this.logger.log(`Completed parallel processing of ${articles.length} articles`);
    return results;
  }
  
  /**
   * 기사 데이터를 처리하고 DB에 저장할 데이터 객체를 반환하는 메서드
   * 실패 시 null 반환
   */
  private async processArticleData(article: Article, category: string): Promise<any | null> {
    const { title, author, url, publishedAt } = article;
    const sourceName = article.source.name;
    
    try {
      this.logger.log(`Processing article data: ${title}`);
      
      // Create or get source
      const source = await this.sourceService.findOrCreate(
        sourceName,
        'us', // Default country
        'en', // Default language
        category,
      );

      // Extract full article content with timeout
      let content;
      try {
        content = await this.extractArticleWithTimeout(url, 10000); // 10 seconds timeout
      } catch (error) {
        this.logger.warn(`Skipping article due to extraction timeout or error: ${title}`);
        return null;
      }

      if (!content) {
        this.logger.warn(`No content extracted for article: ${title}`);
        return null;
      }

      // 데이터베이스에 저장할 객체 반환 (실제 저장은 나중에 일괄 처리)
      const newsData = {
        title,
        author,
        content: content.textContent || content.excerpt || '',
        url, // URL 정보 추가
        publishedAt: new Date(publishedAt),
        sourceId: source.sourceId,
      };

      this.logger.log(`Successfully processed article data: ${title}`);
      return newsData;
    } catch (error) {
      this.logger.error(`Error processing article ${title}: ${error.message}`);
      return null;
    }
  }
  
  /**
   * 기존 메서드 - 하위 호환성을 위해 유지하지만 내부 로직은 새 메서드 사용
   */
  private async processArticle(article: Article, category: string): Promise<void> {
    const newsData = await this.processArticleData(article, category);
    
    if (newsData) {
      await this.newsService.create(newsData);
    }
  }

  private async extractArticleWithTimeout(url: string, timeoutMs: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Article extraction timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        const article = await this.extractArticle(url);
        clearTimeout(timeoutId);
        resolve(article);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private async extractArticle(url: string): Promise<any> {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article;
  }
}
