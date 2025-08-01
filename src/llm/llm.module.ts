import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
