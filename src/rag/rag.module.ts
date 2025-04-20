import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { Document } from './entities/document.entity';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Document])],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
