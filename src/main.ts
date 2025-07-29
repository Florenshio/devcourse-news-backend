import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SchedulerService } from './scheduler/scheduler.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Set up validation pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Devcourse News API')
    .setDescription('API for fetching, translating, and summarizing news articles')
    .setVersion('1.0')
    .addTag('news')
    .addTag('source')
    .addTag('summarized-news')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Start the application
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  
  // Trigger initial news fetch after app starts
  const schedulerService = app.get(SchedulerService);
  setTimeout(() => {
    schedulerService.triggerInitialNewsFetch()
      .catch(err => console.error('Failed to fetch initial news:', err));
  }, 5000); // Wait 5 seconds after app start to fetch news
}
bootstrap();
