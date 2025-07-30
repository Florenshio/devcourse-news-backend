import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Source } from '../../source/entities/source.entity';
import { SummarizedNews } from '../../summarized-news/entities/summarized-news.entity';

@Entity()
export class News {
  @PrimaryGeneratedColumn({ name: 'news_id' })
  newsId: number;

  @Column({ name: 'title', nullable: false, type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'author', nullable: true, type: 'varchar', length: 255 })
  author: string;

  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @Column({ name: 'url', type: 'varchar', length: 512, nullable: true })
  url: string;

  @Column({ name: 'published_at', type: 'datetime', nullable: false })
  publishedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @Column({ name: 'source_id', nullable: false })
  sourceId: number;

  @ManyToOne(() => Source, (source) => source.news)
  @JoinColumn({ name: 'source_id' })
  source: Source;

  @OneToOne(() => SummarizedNews, (summarizedNews) => summarizedNews.news)
  @JoinColumn({ name: 'summarized_news_id' })
  summarizedNews: SummarizedNews;
}
