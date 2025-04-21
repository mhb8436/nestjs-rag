import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('index-pdfs')
  async indexPDFs(@Body('directoryPath') directoryPath: string) {
    await this.ragService.indexPDF(directoryPath);
    return { message: 'PDFs indexed successfully' };
  }

  @Get('search')
  async searchWeb(@Query('query') query: string) {
    return this.ragService.searchWeb(query);
  }

  @Get('query')
  async queryRAG(@Query('query') query: string) {
    return this.ragService.queryRAG(query);
  }

  @Post('complete-code')
  async completeCode(
    @Body('context') context: string,
    @Body('language') language: string,
  ) {
    return this.ragService.completeCode(context, language);
  }

  @Post('suggest-improvements')
  async suggestCodeImprovements(
    @Body('code') code: string,
    @Body('language') language: string,
  ) {
    return this.ragService.suggestCodeImprovements(code, language);
  }

  @Post('generate-code')
  async generateCodeFromDescription(
    @Body('description') description: string,
    @Body('language') language: string,
  ) {
    return this.ragService.generateCodeFromDescription(description, language);
  }

  @Get('query-with-web-search')
  async queryWithWebSearch(@Query('query') query: string) {
    return this.ragService.queryWithWebSearch(query);
  }

  @Post('index-directory')
  async indexDirectory(@Body('directoryPath') directoryPath: string) {
    await this.ragService.indexDirectory(directoryPath);
    return { message: 'Directory indexed successfully' };
  }

  @Post('index-text')
  async indexTextFile(@Body('filePath') filePath: string) {
    await this.ragService.indexTextFile(filePath);
    return { message: 'Text file indexed successfully' };
  }

  @Post('index-html')
  async indexHTMLFile(@Body('filePath') filePath: string) {
    await this.ragService.indexHTMLFile(filePath);
    return { message: 'HTML file indexed successfully' };
  }

  @Post('index-url')
  async indexURL(@Body('url') url: string) {
    await this.ragService.indexURL(url);
    return { message: 'URL indexed successfully' };
  }

  @Post('index-pdf')
  async indexPDF(@Body('filePath') filePath: string) {
    await this.ragService.indexPDF(filePath);
    return { message: 'PDF file indexed successfully' };
  }
}
