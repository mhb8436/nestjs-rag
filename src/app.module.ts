import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [ConfigModule.forRoot(), RagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
