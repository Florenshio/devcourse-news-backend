import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { CreateNewsDto } from '../dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create(createNewsDto);
    return this.newsRepository.save(news);
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
        publishedAt: Between(startDate, endDate),
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
