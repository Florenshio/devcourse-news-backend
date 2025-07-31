import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { News } from '../../news/entities/news.entity';
import { Source } from '../../source/entities/source.entity';

@Entity('summarized_news')
export class SummarizedNews {
  @PrimaryGeneratedColumn({ name: 'sum_news_id' })
  sumNewsId: number;

  @Column({ name: 'news_id', nullable: false, type: 'int' })
  newsId: number;

  @Column({ name: 'summarized_content', type: 'text', nullable: false })
  summarizedContent: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @Column({ name: 'source_id', nullable: false, type: 'int' })
  sourceId: number;

  @OneToOne(() => News, (news) => news.summarizedNews)
  @JoinColumn({ name: 'news_id' })
  news: News;

  @ManyToOne(() => Source, (source) => source.summarizedNews)
  @JoinColumn({ name: 'source_id' })
  source: Source;
}
