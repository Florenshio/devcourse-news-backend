import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../entities/source.entity';
import { CreateSourceDto } from '../dto/create-source.dto';

@Injectable()
export class SourceService {
  constructor(
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
  ) {}

  async create(createSourceDto: CreateSourceDto): Promise<Source> {
    const source = this.sourceRepository.create(createSourceDto);
    return this.sourceRepository.save(source);
  }

  async findAll(): Promise<Source[]> {
    return this.sourceRepository.find();
  }

  async findOne(id: number): Promise<Source> {
    const source = await this.sourceRepository.findOne({
      where: { sourceId: id },
    });
    
    if (!source) {
      throw new Error(`Source with ID ${id} not found`);
    }
    
    return source;
  }

  async findByCategory(category: string): Promise<Source[]> {
    return this.sourceRepository.find({
      where: { newsCategory: category },
    });
  }

  async findOrCreate(
    publisher: string,
    country: string,
    language: string,
    category: string,
  ): Promise<Source> {
    let source = await this.sourceRepository.findOne({
      where: {
        newsPublisher: publisher,
        country,
        language,
        newsCategory: category,
      },
    });

    if (!source) {
      source = this.sourceRepository.create({
        newsPublisher: publisher,
        country,
        language,
        newsCategory: category,
      });
      await this.sourceRepository.save(source);
    }

    return source;
  }
}
