import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SummarizedNews } from '../entities/summarized-news.entity';
import { CreateSummarizedNewsDto } from '../dto/create-summarized-news.dto';

@Injectable()
export class SummarizedNewsService {
  constructor(
    @InjectRepository(SummarizedNews)
    private summarizedNewsRepository: Repository<SummarizedNews>,
  ) {}

  async create(createSummarizedNewsDto: CreateSummarizedNewsDto): Promise<SummarizedNews> {
    const summarizedNews = this.summarizedNewsRepository.create(createSummarizedNewsDto);
    return this.summarizedNewsRepository.save(summarizedNews);
  }

  async findAll(): Promise<SummarizedNews[]> {
    return this.summarizedNewsRepository.find({
      relations: ['news', 'source'],
    });
  }

  async findOne(id: number): Promise<SummarizedNews> {
    const summarizedNews = await this.summarizedNewsRepository.findOne({
      where: { sumNewsId: id },
      relations: ['news', 'source'],
    });
    
    if (!summarizedNews) {
      throw new Error(`Summarized News with ID ${id} not found`);
    }
    
    return summarizedNews;
  }

  async findByNewsId(newsId: number): Promise<SummarizedNews> {
    const summarizedNews = await this.summarizedNewsRepository.findOne({
      where: { newsId: newsId },
      relations: ['news', 'source'],
    });
    
    if (!summarizedNews) {
      throw new Error(`Summarized News for News ID ${newsId} not found`);
    }
    
    return summarizedNews;
  }

  async findByDate(date: Date): Promise<SummarizedNews[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.summarizedNewsRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['news', 'source'],
    });
  }

  async findByCategory(category: string): Promise<SummarizedNews[]> {
    return this.summarizedNewsRepository.find({
      where: {
        source: {
          newsCategory: category,
        },
      },
      relations: ['news', 'source'],
    });
  }

  async findTodaysSummarizedNews(): Promise<SummarizedNews[]> {
    const today = new Date();
    return this.findByDate(today);
  }

  /**
   * 뉴스 ID로 요약 내용을 업데이트하거나 없으면 새로 생성
   * @param createSummarizedNewsDto 업데이트할 요약 뉴스 데이터
   * @returns 업데이트되거나 생성된 요약 뉴스 객체
   */
  async updateByNewsId(createSummarizedNewsDto: CreateSummarizedNewsDto): Promise<SummarizedNews> {
    // 해당 newsId로 요약 뉴스가 이미 존재하는지 확인
    const existingSummarizedNews = await this.summarizedNewsRepository.findOne({
      where: { newsId: createSummarizedNewsDto.newsId }
    });
    
    if (existingSummarizedNews) {
      // 이미 존재하면 업데이트
      existingSummarizedNews.summarizedContent = createSummarizedNewsDto.summarizedContent;
      existingSummarizedNews.updatedAt = new Date();
      return this.summarizedNewsRepository.save(existingSummarizedNews);
    } else {
      // 존재하지 않으면 새로 생성
      return this.create(createSummarizedNewsDto);
    }
  }
}
