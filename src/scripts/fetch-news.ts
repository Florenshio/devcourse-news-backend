import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { NewsFetcherService } from '../news/services/news-fetcher.service';

async function fetchNews() {
  console.log('Starting news fetch script...');
  
  try {
    // Create a standalone application
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get the news fetcher service
    const newsFetcherService = app.get(NewsFetcherService);
    
    console.log('Fetching news headlines...');
    await newsFetcherService.fetchAndStoreHeadlines();
    
    console.log('News fetch completed successfully!');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Error fetching news:', error);
    process.exit(1);
  }
}

fetchNews();
