import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { CreateNewsDto } from '../dto/create-news.dto';
import { Source } from '../../source/entities/source.entity';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create(createNewsDto);
    return this.newsRepository.save(news);
  }
  
  async createMany(createNewsDtos: CreateNewsDto[]): Promise<News[]> {
    if (!createNewsDtos.length) {
      return [];
    }
    
    // 중복 검사를 통해 새로운 기사만 필터링
    const uniqueNewsDtos = await this.filterDuplicates(createNewsDtos);
    
    if (!uniqueNewsDtos.length) {
      this.logger.log('No unique articles to insert');
      return [];
    }
    
    this.logger.log(`Batch inserting ${uniqueNewsDtos.length} unique news articles`);
    const newsEntities = this.newsRepository.create(uniqueNewsDtos);
    return this.newsRepository.save(newsEntities);
  }
  
  /**
   * URL, 제목, 발행일을 기준으로 중복된 기사를 필터링하는 메서드
   * @param newsDtos 중복 검사할 뉴스 DTO 배열
   * @returns 중복되지 않은 뉴스 DTO 배열
   */
  private async filterDuplicates(newsDtos: CreateNewsDto[]): Promise<CreateNewsDto[]> {
    const uniqueNewsDtos: CreateNewsDto[] = [];
    
    for (const newsDto of newsDtos) {
      // URL이 없는 경우 중복 검사를 제목과 발행일로만 수행
      if (!newsDto.url) {
        // URL이 없는 경우 제목과 발행일로만 중복 검사
        const existingNews = await this.newsRepository.findOne({
          where: {
            title: newsDto.title,
            publishedAt: newsDto.publishedAt
          }
        });
        
        if (!existingNews) {
          uniqueNewsDtos.push(newsDto);
        } else {
          this.logger.log(`Skipping duplicate article (by title and date): ${newsDto.title}`);
        }
        continue;
      }
      
      // URL이 있는 경우 URL, 제목, 발행일 모두로 중복 검사
      try {
        const existingNews = await this.newsRepository.findOne({
          where: {
            url: newsDto.url
          }
        });
        
        if (!existingNews) {
          // URL로 검색한 결과가 없으면 제목과 발행일로 한 번 더 검색
          const existingByTitleAndDate = await this.newsRepository.findOne({
            where: {
              title: newsDto.title,
              publishedAt: newsDto.publishedAt
            }
          });
          
          if (!existingByTitleAndDate) {
            uniqueNewsDtos.push(newsDto);
          } else {
            this.logger.log(`Skipping duplicate article (by title and date): ${newsDto.title}`);
          }
        } else {
          this.logger.log(`Skipping duplicate article (by URL): ${newsDto.title}`);
        }
      } catch (error) {
        this.logger.error(`Error checking for duplicates: ${error.message}`);
        // 오류 발생 시 안전하게 처리
        uniqueNewsDtos.push(newsDto);
      }
    }
    
    return uniqueNewsDtos;
  }

  async findAll(): Promise<News[]> {
    return this.newsRepository.find({
      relations: ['source'],
    });
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { newsId: id },
      relations: ['source'],
    });
    
    if (!news) {
      throw new Error(`News with ID ${id} not found`);
    }
    
    return news;
  }

  async findByDate(date: Date): Promise<News[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.newsRepository.find({
      where: {
        // publishedAt: Between(startDate, endDate),
        updatedAt: Between(startDate, endDate),
      },
      relations: ['source'],
    });
  }

  async findByCategory(category: string): Promise<News[]> {
    return this.newsRepository.find({
      where: {
        source: {
          newsCategory: category,
        },
      },
      relations: ['source'],
    });
  }

  async findTodaysNews(): Promise<News[]> {
    const today = new Date();
    return this.findByDate(today);
  }
}
