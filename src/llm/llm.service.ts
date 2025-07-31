import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface ArticleData {
  title: string;
  content: string;
  url?: string;
}

interface SummarizedArticle {
  summarized_title: string;
  summarized_content: string;
  original_title: string;
  original_url?: string;
}

interface BatchSummarizeResponse {
  results: SummarizedArticle[];
  failed_indices: number[];
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly llmServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // LLM 서비스 URL 설정 (기본값: http://localhost:8000)
    this.llmServiceUrl = this.configService.get<string>('LLM_SERVICE_URL', 'http://localhost:8000');
  }

  /**
   * 단일 기사를 요약 및 번역
   * @param article 요약할 기사 데이터
   * @returns 요약 및 번역된 기사
   */
  async summarizeArticle(article: ArticleData): Promise<SummarizedArticle> {
    try {
      this.logger.log(`Summarizing article: ${article.title}`);
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.llmServiceUrl}/summarize`, article)
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Error summarizing article: ${error.message}`);
      throw new Error(`Failed to summarize article: ${error.message}`);
    }
  }

  /**
   * 여러 기사를 병렬로 요약 및 번역
   * @param articles 요약할 기사 데이터 배열
   * @returns 요약 및 번역된 기사 배열
   */
  async summarizeArticles(articles: ArticleData[]): Promise<SummarizedArticle[]> {
    try {
      this.logger.log(`Batch summarizing ${articles.length} articles`);
      
      if (articles.length === 0) {
        return [];
      }
      
      const response = await firstValueFrom(
        this.httpService.post<BatchSummarizeResponse>(`${this.llmServiceUrl}/batch-summarize`, {
          articles: articles
        })
      );
      
      // 실패한 인덱스가 있으면 로그 기록
      if (response.data.failed_indices.length > 0) {
        this.logger.warn(`Failed to summarize ${response.data.failed_indices.length} articles`);
      }
      
      return response.data.results;
    } catch (error) {
      this.logger.error(`Error batch summarizing articles: ${error.message}`);
      throw new Error(`Failed to batch summarize articles: ${error.message}`);
    }
  }

  /**
   * LLM 서비스 상태 확인
   * @returns 서비스 상태
   */
  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.llmServiceUrl}/health`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`LLM service health check failed: ${error.message}`);
      return { status: 'error' };
    }
  }
}
