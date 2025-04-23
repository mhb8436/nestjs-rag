# NestJS RAG 시스템

이 프로젝트는 NestJS, LangChain, TypeScript를 사용하여 구축된 RAG(Retrieval-Augmented Generation) 시스템입니다. Ollama LLM, PostgreSQL 벡터 데이터베이스, Google 검색 API를 통합하여 문서 검색 및 질의응답 기능을 제공합니다.

## 주요 기능

- PDF 문서 자동 인덱싱 및 벡터 저장
- Google 검색 통합
- Ollama LLM을 사용한 RAG 쿼리 처리
- PostgreSQL 벡터 데이터베이스 지원

## 사전 요구사항

- Node.js (v16 이상)
- PostgreSQL (v12 이상)
- Ollama
- Google API 키 및 CSE ID

## 설치 및 설정

1. 의존성 설치:

```bash
npm install
```

2. PostgreSQL 설정:

```bash
# PostgreSQL 설치 (macOS)
brew install postgresql@14
brew services start postgresql@14

# PostgreSQL 벡터 확장 설치
CREATE EXTENSION vector;
```

3. Ollama 설치:

```bash
# macOS
brew install ollama

# Ollama 실행
ollama serve
```

4. 검색 API 설정:

   - DuckDuckGo API를 사용합니다 (무료, API 키 불필요)
   - 추가 설정이 필요하지 않습니다

5. 환경 변수 설정:
   `.env` 파일을 생성하고 다음 내용을 입력:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=rag_db

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## 데이터베이스 설정

1. PostgreSQL 벡터 확장 설치:

```sql
-- PostgreSQL에 연결
psql -U postgres

-- 데이터베이스 생성
CREATE DATABASE rag_db;


-- 데이터베이스 연결
\c rag_db

-- 벡터 확장 설치
CREATE EXTENSION vector;
```

2. 테이블 생성 (TypeORM이 자동으로 생성)

## API 엔드포인트

### 문서 인덱싱 API

- PDF 파일 인덱싱: `POST /rag/index-pdf`

  ```bash
  curl -X POST http://localhost:3000/rag/index-pdf \
    -H "Content-Type: application/json" \
    -d '{"filePath": "/path/to/file.pdf"}'
  ```

- 디렉토리 인덱싱: `POST /rag/index-directory`

  ```bash
  curl -X POST http://localhost:3000/rag/index-directory \
    -H "Content-Type: application/json" \
    -d '{"directoryPath": "/path/to/directory"}'
  ```

  지정된 디렉토리 내의 모든 지원되는 파일 형식(PDF, TXT, MD, HTML)을 자동으로 인덱싱합니다.

- 텍스트 파일 인덱싱: `POST /rag/index-text`

  ```bash
  curl -X POST http://localhost:3000/rag/index-text \
    -H "Content-Type: application/json" \
    -d '{"filePath": "/path/to/file.txt"}'
  ```

- 마크다운 파일 인덱싱: `POST /rag/index-markdown`

  ```bash
  curl -X POST http://localhost:3000/rag/index-markdown \
    -H "Content-Type: application/json" \
    -d '{"filePath": "/path/to/file.md"}'
  ```

- HTML 파일 인덱싱: `POST /rag/index-html`

  ```bash
  curl -X POST http://localhost:3000/rag/index-html \
    -H "Content-Type: application/json" \
    -d '{"filePath": "/path/to/file.html"}'
  ```

- 웹 URL 인덱싱: `POST /rag/index-url`

  ```bash
  curl -X POST http://localhost:3000/rag/index-url \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com"}'
  ```

- 웹 검색: `GET /rag/search?query=your_query`

  ```bash
  curl -X GET "http://localhost:3000/rag/search?query=your_query"
  ```

### RAG 쿼리 API

- RAG 쿼리: `GET /rag/query?query=your_query`

  ```bash
  curl -X GET "http://localhost:3000/rag/query?query=your_query"
  ```

### 코드 자동완성 API

- 코드 완성: `POST /rag/complete-code`

  ```bash
  curl -X POST http://localhost:3030/rag/complete-code \
    -H "Content-Type: application/json" \
    -d '{
      "context": "function calculateSum(a, b) {",
      "language": "typescript"
    }'
  ```

- 코드 개선 제안: `POST /rag/suggest-improvements`

  ```bash
  curl -X POST http://localhost:3000/rag/suggest-improvements \
    -H "Content-Type: application/json" \
    -d '{
      "code": "function sum(a, b) { return a + b; }",
      "language": "typescript"
    }'
  ```

- 코드 생성: `POST /rag/generate-code`

  ```bash
  curl -X POST http://localhost:3000/rag/generate-code \
    -H "Content-Type: application/json" \
    -d '{
      "description": "Create a function that calculates the factorial of a number",
      "language": "typescript"
    }'
  ```

### LLM과 웹 검색 통합 API

- LLM과 웹 검색 통합 쿼리: `GET /rag/query-with-web-search?query=your_question`

  ```bash
  curl -X GET "http://localhost:3000/rag/query-with-web-search?query=What is the latest version of TypeScript?"
  ```

  이 엔드포인트는 LLM의 답변 품질을 자동으로 개선하는 기능을 제공합니다:

  1. 먼저 LLM이 직접 질문에 답변을 시도합니다.
  2. LLM의 답변이 너무 짧거나 불확실한 경우, 자동으로 웹 검색을 수행합니다.
  3. 웹 검색 결과를 바탕으로 LLM이 더 나은 답변을 제공합니다.

## 사용 예시

### 코드 자동완성 사용 예시

1. 코드 완성:

```bash
curl -X POST http://localhost:3000/rag/complete-code \
  -H "Content-Type: application/json" \
  -d '{
    "context": "function calculateSum(a, b) {",
    "language": "typescript"
  }'
```

2. 코드 개선 제안:

```bash
curl -X POST http://localhost:3000/rag/suggest-improvements \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function sum(a, b) { return a + b; }",
    "language": "typescript"
  }'
```

3. 코드 생성:

```bash
curl -X POST http://localhost:3000/rag/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a function that calculates the factorial of a number",
    "language": "typescript"
  }'
```

## 실행

개발 모드:

```bash
npm run start:dev
```

프로덕션 모드:

```bash
npm run build
npm run start:prod
```

## 테스트

```bash
# 단위 테스트
npm run test

# e2e 테스트
npm run test:e2e
```

## 문제 해결

1. 벡터 데이터베이스 오류:

   - PostgreSQL 벡터 확장이 설치되어 있는지 확인
   - 데이터베이스 연결 설정 확인

2. Ollama 연결 오류:

   - Ollama 서비스가 실행 중인지 확인
   - OLLAMA_BASE_URL 설정 확인

3. 검색 API 오류:
   - 네트워크 연결 확인
   - DuckDuckGo API 서버 상태 확인

## 라이선스

MIT
