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
      
      for (const article of response.articles) {
        await this.processArticle(article, category);
      }
    } catch (error) {
      this.logger.error(`Error fetching ${category} headlines: ${error.message}`);
      throw error;
    }
  }

  private async processArticle(article: Article, category: string): Promise<void> {
    const { title, author, url, publishedAt } = article;
    const sourceName = article.source.name;
    
    try {
      this.logger.log(`Processing article: ${title}`);
      
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
        return;
      }

      if (!content) {
        this.logger.warn(`No content extracted for article: ${title}`);
        return;
      }

      // Save news to database
      await this.newsService.create({
        title,
        author,
        content: content.textContent || content.excerpt || '',
        publishedAt: new Date(publishedAt),
        sourceId: source.sourceId,
      });

      this.logger.log(`Successfully processed article: ${title}`);
    } catch (error) {
      this.logger.error(`Error processing article ${title}: ${error.message}`);
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
