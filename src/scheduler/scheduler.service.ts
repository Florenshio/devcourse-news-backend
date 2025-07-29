import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsFetcherService } from '../news/services/news-fetcher.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly newsFetcherService: NewsFetcherService) {}

  // Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyNewsFetch() {
    this.logger.log('Starting daily news fetch');
    try {
      await this.newsFetcherService.fetchAndStoreHeadlines();
      this.logger.log('Daily news fetch completed successfully');
    } catch (error) {
      this.logger.error(`Error during daily news fetch: ${error.message}`);
    }
  }

  // Manual trigger for initial data load
  async triggerInitialNewsFetch() {
    this.logger.log('Triggering initial news fetch');
    try {
      await this.newsFetcherService.fetchAndStoreHeadlines();
      this.logger.log('Initial news fetch completed successfully');
    } catch (error) {
      this.logger.error(`Error during initial news fetch: ${error.message}`);
    }
  }
}
