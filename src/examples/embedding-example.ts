import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ConfigService } from '@nestjs/config';
import { cosineSimilarity } from '@langchain/core/utils/math';

async function demonstrateEmbeddings() {
  // 1. 임베딩 모델 초기화
  const embeddings = new OllamaEmbeddings({
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
  });

  // 2. 단일 텍스트 임베딩
  const text = "안녕하세요, 반갑습니다.";
  const embedding = await embeddings.embedQuery(text);
  console.log('단일 텍스트 임베딩 결과:', embedding);
  console.log('임베딩 벡터 차원:', embedding.length);

  // 3. 유사한 의미의 문장들 임베딩
  const similarSentences = [
    "안녕하세요, 반갑습니다.",
    "안녕하세요, 만나서 반갑습니다.",
    "안녕하세요, 오랜만입니다.",
  ];

  const similarEmbeddings = await embeddings.embedDocuments(similarSentences);
  console.log('\n유사한 문장들의 임베딩:', similarEmbeddings);

  // 4. 다른 의미의 문장 임베딩
  const differentSentence = "오늘 날씨가 좋네요.";
  const differentEmbedding = await embeddings.embedQuery(differentSentence);
  console.log('\n다른 의미의 문장 임베딩:', differentEmbedding);

  // 5. 유사도 비교 (LangChain의 내장 함수 사용)
  console.log('\n유사도 비교:');
  console.log('유사한 문장들 간의 유사도:', 
    cosineSimilarity([similarEmbeddings[0]], [similarEmbeddings[1]])[0][0]);
  console.log('다른 의미의 문장과의 유사도:', 
    cosineSimilarity([similarEmbeddings[0]], [differentEmbedding])[0][0]);
}

// 실행
demonstrateEmbeddings().catch(console.error); 