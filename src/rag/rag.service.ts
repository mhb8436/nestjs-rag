import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Ollama } from '@langchain/community/llms/ollama';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RagService {
  private llm: Ollama;
  private embeddings: OllamaEmbeddings;
  private vectorStore: HNSWLib;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {
    this.llm = new Ollama({
      baseUrl: this.configService.get('OLLAMA_BASE_URL'),
      model: this.configService.get('OLLAMA_MODEL'),
    });

    this.embeddings = new OllamaEmbeddings({
      baseUrl: this.configService.get('OLLAMA_BASE_URL'),
      model: this.configService.get('OLLAMA_MODEL'),
    });
  }

  async indexDirectory(directoryPath: string): Promise<void> {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileExt = path.extname(file).toLowerCase();

      if (fs.statSync(filePath).isDirectory()) {
        await this.indexDirectory(filePath);
        continue;
      }

      switch (fileExt) {
        case '.pdf':
          await this.indexPDF(filePath);
          break;
        case '.txt':
          await this.indexTextFile(filePath);
          break;
        case '.html':
          await this.indexHTMLFile(filePath);
          break;
      }
    }
  }

  async indexTextFile(filePath: string): Promise<void> {
    const loader = new TextLoader(filePath);
    const docs = await loader.load();
    await this.processDocuments(docs, 'text');
  }

  async indexHTMLFile(filePath: string): Promise<void> {
    const loader = new CheerioWebBaseLoader(`file://${filePath}`);
    const docs = await loader.load();
    await this.processDocuments(docs, 'html');
  }

  async indexURL(url: string): Promise<void> {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    await this.processDocuments(docs, 'web');
  }

  async indexPDF(filePath: string): Promise<void> {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    await this.processDocuments(docs, 'pdf');
  }

  private async processDocuments(
    docs: any[],
    sourceType: string,
  ): Promise<void> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    for (const doc of splitDocs) {
      const embedding = await this.embeddings.embedQuery(doc.pageContent);

      const document = new Document();
      document.title = doc.metadata.source;
      document.content = doc.pageContent;
      document.source = sourceType;
      document.embedding = embedding;

      await this.documentRepository.save(document);
    }
  }

  async searchWeb(query: string): Promise<string> {
    try {
      const response = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: query,
          format: 'json',
          no_html: 1,
          skip_disambig: 1,
        },
      });

      const result = response.data;
      if (result.Abstract) {
        return result.Abstract;
      } else if (result.RelatedTopics && result.RelatedTopics.length > 0) {
        return result.RelatedTopics[0].Text;
      } else {
        return '검색 결과를 찾을 수 없습니다.';
      }
    } catch (error) {
      console.error('DuckDuckGo API 오류:', error);
      return '검색 중 오류가 발생했습니다.';
    }
  }

  async queryRAG(query: string): Promise<string> {
    const queryEmbedding = await this.embeddings.embedQuery(query);

    const similarDocs = await this.documentRepository
      .createQueryBuilder('document')
      .select()
      .addSelect('document.embedding <-> :embedding', 'distance')
      .setParameter('embedding', queryEmbedding)
      .orderBy('distance', 'ASC')
      .limit(5)
      .getMany();

    const context = similarDocs.map((doc) => doc.content).join('\n\n');

    const prompt = `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`;

    return this.llm.invoke(prompt);
  }

  async completeCode(context: string, language: string): Promise<string> {
    const prompt = `You are an expert ${language} programmer. Complete the following code:\n\n${context}\n\nComplete the code:`;

    return this.llm.invoke(prompt);
  }

  async suggestCodeImprovements(
    code: string,
    language: string,
  ): Promise<string> {
    const prompt = `You are an expert ${language} programmer. Review the following code and suggest improvements:\n\n${code}\n\nSuggestions:`;

    return this.llm.invoke(prompt);
  }

  async generateCodeFromDescription(
    description: string,
    language: string,
  ): Promise<string> {
    const prompt = `You are an expert ${language} programmer. Generate code based on the following description:\n\n${description}\n\nGenerated code:`;

    return this.llm.invoke(prompt);
  }

  async queryWithWebSearch(query: string): Promise<string> {
    // First try to get answer from LLM
    const initialAnswer = await this.llm.invoke(query);

    // Check if the answer is too short or contains uncertainty indicators
    const isLowConfidence =
      initialAnswer.length < 50 ||
      initialAnswer.toLowerCase().includes("i don't know") ||
      initialAnswer.toLowerCase().includes("i'm not sure") ||
      initialAnswer.toLowerCase().includes("i'm uncertain") ||
      initialAnswer.toLowerCase().includes("i can't answer");

    if (isLowConfidence) {
      // If LLM is uncertain, perform web search
      const webSearchResult = await this.searchWeb(query);

      // Create a new prompt that includes the web search results
      const enhancedPrompt = `Based on the following web search results, please provide a more detailed answer to the question: ${query}\n\nWeb Search Results:\n${webSearchResult}\n\nAnswer:`;

      // Get enhanced answer from LLM
      return this.llm.invoke(enhancedPrompt);
    }

    return initialAnswer;
  }
}
