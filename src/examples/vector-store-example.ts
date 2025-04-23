import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as fs from 'fs';
import * as path from 'path';

async function demonstrateVectorStore() {
  // 1. 임베딩 모델 초기화
  const embeddings = new OllamaEmbeddings({
    baseUrl: 'http://localhost:11434',
    model: 'deepseek-r1',
  });

  // 2. 샘플 문서 준비
  const documents = [
    {
      content: '파이썬은 간단하고 배우기 쉬운 프로그래밍 언어입니다.',
      metadata: { source: 'python_intro.txt' },
    },
    {
      content: '자바스크립트는 웹 브라우저에서 실행되는 프로그래밍 언어입니다.',
      metadata: { source: 'javascript_intro.txt' },
    },
    {
      content: '타입스크립트는 자바스크립트의 상위 집합 언어입니다.',
      metadata: { source: 'typescript_intro.txt' },
    },
    {
      content: 'Node.js는 자바스크립트 런타임 환경입니다.',
      metadata: { source: 'nodejs_intro.txt' },
    },
  ];

  // 3. 텍스트 분할기 초기화
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
  });

  // 4. 문서 분할
  const splitDocs = await splitter.createDocuments(
    documents.map((doc) => doc.content),
    documents.map((doc) => doc.metadata),
  );

  // 5. 메모리 벡터 저장소 생성 및 문서 저장
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings,
  );

  // 6. 검색 예제
  const searchQueries = [
    '프로그래밍 언어에 대해 알려줘',
    '웹 개발과 관련된 기술은?',
    'Node.js는 무엇인가요?',
  ];

  console.log('=== 검색 결과 ===');
  for (const query of searchQueries) {
    console.log(`\n검색어: "${query}"`);
    const results = await vectorStore.similaritySearch(query, 2);

    results.forEach((doc, index) => {
      console.log(`\n[결과 ${index + 1}]`);
      console.log('내용:', doc.pageContent);
      console.log('출처:', doc.metadata.source);
    });
  }
}

// 실행
demonstrateVectorStore().catch(console.error);
