import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { News } from '../../news/entities/news.entity';
import { SummarizedNews } from '../../summarized-news/entities/summarized-news.entity';

@Entity('source')
export class Source {
  @PrimaryGeneratedColumn({ name: 'source_id' })
  sourceId: number;

  @Column({ name: 'country', nullable: false, type: 'varchar', length: 2 })
  country: string;

  @Column({ name: 'language', nullable: false, type: 'varchar', length: 2 })
  language: string;

  @Column({ name: 'news_publisher', nullable: false, type: 'varchar', length: 255 })
  newsPublisher: string;

  @Column({ name: 'news_category', nullable: false, type: 'varchar', length: 255 })
  newsCategory: string;

  @OneToMany(() => News, (news) => news.source)
  news: News[];

  @OneToMany(() => SummarizedNews, (summarizedNews) => summarizedNews.source)
  summarizedNews: SummarizedNews[];
}
