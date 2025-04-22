import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

async function demonstrateTextSplitting() {
  // 1. 간단한 텍스트 예제
  const simpleText = `
    안녕하세요. 오늘은 텍스트 분할에 대해 알아보겠습니다.
    텍스트 분할은 긴 문서를 작은 청크로 나누는 과정입니다.
    이는 RAG 시스템에서 매우 중요한 단계입니다.
    왜냐하면 LLM은 한 번에 처리할 수 있는 텍스트의 길이가 제한되어 있기 때문입니다.
  `;

  // 2. 텍스트 분할기 초기화
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,        // 각 청크의 최대 길이
    chunkOverlap: 20,      // 청크 간 중복되는 문자 수
    separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""], // 분할 기준 문자들
  });

  // 3. 텍스트 분할 실행
  const chunks = await splitter.splitText(simpleText);
  
  // 4. 결과 출력
  console.log('원본 텍스트:', simpleText);
  console.log('\n분할된 청크 수:', chunks.length);
  console.log('\n분할된 청크들:');
  chunks.forEach((chunk, index) => {
    console.log(`\n[청크 ${index + 1}]`);
    console.log(chunk);
    console.log(`길이: ${chunk.length}자`);
  });

  // 5. 실제 문서 예제
  const documentText = `
    # RAG 시스템이란?
    
    RAG(Retrieval-Augmented Generation)는 검색과 생성이 결합된 시스템입니다.
    
    ## 주요 구성 요소
    
    1. 문서 로더
    - PDF, 텍스트, HTML 등 다양한 형식의 문서를 로드합니다.
    - 각 문서 형식에 맞는 로더를 사용합니다.
    
    2. 텍스트 분할기
    - 긴 문서를 작은 청크로 나눕니다.
    - 청크 크기와 중복 정도를 설정할 수 있습니다.
    
    3. 임베딩
    - 텍스트를 벡터로 변환합니다.
    - 의미적 유사성을 계산할 수 있게 합니다.
  `;

  // 6. 문서 분할 실행
  const documentChunks = await splitter.splitText(documentText);
  
  console.log('\n\n=== 실제 문서 분할 예제 ===');
  console.log('원본 문서 길이:', documentText.length);
  console.log('분할된 청크 수:', documentChunks.length);
  console.log('\n분할된 청크들:');
  documentChunks.forEach((chunk, index) => {
    console.log(`\n[청크 ${index + 1}]`);
    console.log(chunk);
    console.log(`길이: ${chunk.length}자`);
  });
}

// 실행
demonstrateTextSplitting().catch(console.error); 