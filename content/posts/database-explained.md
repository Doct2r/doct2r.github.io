---
title: "데이터베이스란 — 레지스트리도 DB인가, 엑셀도 DB인가"
date: 2026-07-02
draft: false
tags: ["데이터베이스", "SQL", "NoSQL", "DBMS", "레지스트리"]
categories: ["프로그래밍"]
---

"데이터베이스"라고 하면 MySQL이나 Oracle을 떠올리는 경우가 많다. 그런데 Windows 레지스트리는? Excel 파일은? JSON 파일은? 어디까지가 데이터베이스이고 어디서부터는 아닌지, 명확히 선을 긋는 사람이 많지 않다. 종류를 열거하기 전에 정의부터 짚어야 한다.

---

## 1. 데이터베이스란 무엇인가

### 최소 정의

**데이터베이스(Database, DB)**: 구조화된 방식으로 저장되어, 효율적으로 검색·수정·삭제할 수 있는 데이터의 집합.

여기서 핵심 단어는 두 가지다.

- **구조화**: 데이터가 무작위로 쌓인 게 아니라 어떤 형태로 정렬·분류되어 있다
- **효율적 접근**: 원하는 데이터를 빠르게 찾고 바꿀 수 있다

이 두 조건만 따지면 레지스트리도, 파일 시스템도, 심지어 잘 만든 Excel 파일도 데이터베이스에 가깝다.

### DB vs DBMS

흔히 "DB를 설치했다"고 말할 때의 MySQL, PostgreSQL은 정확히는 **DBMS(Database Management System)**다.

```
DB  = 데이터 그 자체 (파일, 구조)
DBMS = 그 데이터를 관리하는 소프트웨어

MySQL을 설치한다 → DBMS를 설치하는 것
MySQL 안의 테이블들 → DB(데이터베이스)
```

DBMS는 DB에 없는 기능을 추가한다.

- **동시 접근 제어**: 여러 사용자가 동시에 읽고 쓸 때 충돌 방지
- **트랜잭션**: 연산 묶음을 원자적으로 처리 (전부 성공 or 전부 취소)
- **쿼리 언어**: SQL 같은 표준 언어로 데이터 조회
- **권한 관리**: 누가 무엇을 읽고 쓸 수 있는지
- **백업/복구**: 장애 시 데이터 보호

순수한 "데이터의 집합"은 DB지만, 실용적인 의미의 데이터베이스는 DBMS를 포함한다.

---

## 2. 레지스트리는 데이터베이스인가

결론부터: **맞다. 제한적 의미에서.**

Microsoft 공식 문서는 Windows Registry를 **"hierarchical database"(계층적 데이터베이스)**라고 직접 표현한다.

### 레지스트리의 구조

```
HKEY_LOCAL_MACHINE (HKLM)
└── SOFTWARE
    └── Microsoft
        └── Windows
            └── CurrentVersion
                ├── Run       (REG_SZ: 시작 프로그램 목록)
                └── Policies
                    └── ...

HKEY_CURRENT_USER (HKCU)
└── Software
    └── ...
```

트리(계층) 구조로 데이터를 저장한다. 각 노드는 **키(Key)**, 저장되는 값은 **값 항목(Value Entry)**이다.

### 레지스트리가 DB인 근거

- **구조화**: 키-값 트리로 정렬된 데이터
- **영속성**: 디스크에 저장 (`.hive` 파일: `C:\Windows\System32\config\`)
- **ACID 일부 지원**: 시스템 장애 시 복구를 위한 트랜잭션 로그 존재
- **전용 API로 검색**: `RegQueryValueEx`, `RegOpenKeyEx` 등

### 레지스트리가 일반 DB와 다른 점

- SQL로 쿼리 불가 → 전용 Win32 API만 사용
- 범용 DBMS 기능 없음 (복잡한 쿼리, 조인, 인덱스 없음)
- OS와 통합된 단일 목적 저장소

결론적으로, 레지스트리는 **Key-Value 방식의 계층형 데이터베이스**이지만 범용 DBMS는 아니다. "넓은 의미의 DB"에는 해당하고, "DBMS"에는 해당하지 않는다.

---

## 3. 어디까지가 데이터베이스인가

### Excel 파일

엄밀히는 DB가 아니다. 하지만 실제로 쓸 때는 DB처럼 쓰인다.

| 비교 | Excel | DBMS |
|---|---|---|
| 구조화 | 행·열 (테이블과 유사) | 테이블 |
| 검색 | VLOOKUP, 필터 | SQL SELECT |
| 동시 접근 | 한 명 (잠금 파일) | 수천 명 동시 |
| 트랜잭션 | 없음 | 있음 |
| 데이터 무결성 | 없음 | 제약 조건 |
| 데이터 크기 | ~100만 행 한계 | 수십 억 행 |

"DB처럼 쓰이는 Excel"이 실무에서 흔하다. 소규모 데이터, 공유·협업이 단순할 때는 충분하다. 그러나 동시 수정, 대용량, 무결성이 필요한 순간 한계가 드러난다.

### JSON / CSV 파일

원시 데이터 저장 형식이다. DB라고 볼 수 없다.

- 검색하려면 파일 전체를 읽어야 한다 (인덱스 없음)
- 동시 쓰기 보호 없음
- 트랜잭션 없음

단, **SQLite**는 단일 `.db` 파일에 전체 DBMS 기능을 담는다. JSON 파일처럼 하나의 파일이지만 완전한 데이터베이스다.

### 파일 시스템

파일 시스템(NTFS, ext4, APFS)도 넓은 의미의 DB라고 볼 수 있다.

- 파일과 디렉토리 메타데이터를 구조화해 저장
- 빠른 검색 (inode, B-tree 구조)
- 저널링(Journaling)으로 일관성 보호

하지만 파일 시스템은 파일이라는 단위의 데이터를 관리할 뿐, 파일 **안의 내용**에 대한 쿼리는 불가능하다. 한 단계 위의 추상화가 필요하다.

---

## 4. 데이터베이스의 종류

크게 두 계통으로 나눈다. **관계형(Relational)**과 **비관계형(NoSQL)**이다.

### 관계형 데이터베이스 (RDBMS)

1970년 에드거 커드(Edgar Codd)가 제안한 수학적 모델. 데이터를 **테이블(행과 열)**로 표현하고, 테이블 간 관계를 정의한다.

```sql
-- 사용자 테이블
CREATE TABLE users (
    id      INT PRIMARY KEY,
    name    VARCHAR(50),
    email   VARCHAR(100) UNIQUE
);

-- 주문 테이블 (users와 관계)
CREATE TABLE orders (
    id      INT PRIMARY KEY,
    user_id INT REFERENCES users(id),  -- 외래키
    amount  DECIMAL
);

-- 조인으로 관계 조회
SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id;
```

**ACID 보장**이 핵심이다.

```
A — Atomicity   : 트랜잭션은 전부 성공하거나 전부 취소
C — Consistency : 항상 유효한 상태 유지
I — Isolation   : 동시 트랜잭션이 서로 간섭하지 않음
D — Durability  : 커밋된 데이터는 장애에도 유지
```

**주요 RDBMS:**

| DB | 특징 |
|---|---|
| **PostgreSQL** | 오픈소스 중 가장 기능 풍부. JSON, 배열, GIS 지원. 사실상 범용 표준 |
| **MySQL / MariaDB** | 웹 서비스 전통적 선택. LAMP 스택의 M. MariaDB는 MySQL 포크 |
| **SQLite** | 파일 하나가 전체 DB. 앱 내장, 모바일, 프로토타입에 적합. 서버 불필요 |
| **Microsoft SQL Server** | Windows/기업 환경. T-SQL 방언. Azure와 통합 |
| **Oracle DB** | 대형 기업 레거시. 라이선스 비용이 막대하지만 기능과 성능이 검증됨 |

---

### 비관계형 데이터베이스 (NoSQL)

2000년대 후반, 웹 서비스의 폭발적 성장으로 RDBMS의 한계가 드러났다.

- **수평 확장 어려움**: RDBMS는 서버를 늘리는 게 복잡하다
- **스키마 경직**: 테이블 구조를 바꾸면 대규모 마이그레이션 필요
- **데이터 다양성**: JSON, 로그, 그래프처럼 테이블로 담기 어려운 데이터

NoSQL은 ACID를 일부 포기하고 **BASE** 특성을 취한다.

```
B — Basically Available  : 항상 응답 (오류 상황에서도)
S — Soft state           : 일시적으로 일관성이 깨질 수 있음
E — Eventually consistent: 결국에는 일관성이 맞춰짐
```

NoSQL은 하나의 기술이 아니라 여러 종류의 집합이다.

#### Key-Value Store

가장 단순한 구조. 키를 넣으면 값이 나온다.

```
SET user:1001 "{"name":"홍길동","age":30}"
GET user:1001  → {"name":"홍길동","age":30}
```

**Redis**: 메모리 기반. 초당 수십만 연산. 캐시, 세션, 실시간 랭킹, pub/sub. 선택적 디스크 영속화.

**Memcached**: 순수 캐시. Redis보다 단순하지만 빠름. 영속화 없음.

단순하지만 강력하다. "복잡한 쿼리 없이 빠른 읽기"가 필요하면 Key-Value가 맞다.

#### Document Store

JSON(또는 BSON) 형태의 문서를 저장한다. 테이블 없이 유연한 구조.

```json
// MongoDB 문서 예시
{
  "_id": "abc123",
  "name": "홍길동",
  "address": {
    "city": "서울",
    "district": "강남구"
  },
  "tags": ["개발자", "블로거"],
  "posts": [
    {"title": "첫 글", "views": 100}
  ]
}
```

**MongoDB**: 가장 대표적. 스키마 유연성이 강점. 초기 스타트업, 빠른 프로토타입.

**Firestore** (Google): 모바일/웹 앱의 실시간 동기화. Firebase 생태계.

**CouchDB**: HTTP API 기반. 오프라인 동기화 지원.

구조가 자주 바뀌거나, 중첩 데이터(문서 안에 문서)가 자연스러운 경우에 적합하다.

#### Column-Family Store

행이 아닌 **열(Column)** 단위로 데이터를 저장한다. 분석 쿼리에서 특정 열만 읽으면 되므로 I/O가 적다.

```
행 기반 저장 (RDBMS):
  [id=1, name=홍, age=30] [id=2, name=김, age=25] ...

열 기반 저장:
  [id: 1,2,3,...] [name: 홍,김,...] [age: 30,25,...]
  → "모든 사용자의 age만 조회" 시 age 열만 읽으면 됨
```

**Cassandra**: 수평 확장에 강함. 노드를 추가할수록 선형으로 성능이 올라감. Netflix, Instagram 사용.

**HBase**: Hadoop 위에서 동작. 대규모 배치 처리.

**Google Bigtable**: Google의 내부 시스템. Cloud Bigtable로 공개.

시계열 데이터, 로그, 분석에 자주 쓰인다.

#### Graph DB

데이터를 **노드(Node)**와 **엣지(Edge)**로 표현한다. 관계 자체가 데이터다.

```
(홍길동) --[팔로우]--> (김철수)
(홍길동) --[좋아요]--> (게시글A)
(김철수) --[작성]--> (게시글A)

"홍길동이 팔로우하는 사람이 쓴 글" 같은 관계 탐색에 최적
```

**Neo4j**: 가장 대표적. Cypher 쿼리 언어.

**Amazon Neptune**: AWS 관리형 그래프 DB.

SNS 친구 관계, 추천 시스템, 사기 탐지(거래 관계망 분석), 지식 그래프에 쓰인다.

RDBMS에서 같은 작업을 하면 조인을 수십 번 해야 할 것을 그래프 DB는 관계를 따라가며 처리한다.

---

### 전문화된 데이터베이스

범용 DB로 해결하기 어려운 특수 목적 DB들이 있다.

#### 시계열 DB (Time-Series DB)

시간 순서로 생성되는 데이터(센서, 로그, 주가, 모니터링 메트릭) 전용.

```
timestamp           | cpu_usage | memory_usage
2026-07-02 10:00:00 | 23.5      | 4096
2026-07-02 10:00:01 | 24.1      | 4100
2026-07-02 10:00:02 | 22.8      | 4098
```

특화 기능: 시간 기반 집계(5분 평균, 1시간 최대), 오래된 데이터 자동 다운샘플링·삭제(Retention Policy).

**InfluxDB**: 가장 널리 쓰이는 오픈소스 시계열 DB. Grafana와 조합이 표준.

**TimescaleDB**: PostgreSQL 확장. SQL을 그대로 쓰면서 시계열 최적화.

**Prometheus**: 모니터링 전용. 당기기(Pull) 방식으로 메트릭 수집.

#### 벡터 DB (Vector DB)

AI 시대의 신생 DB. 텍스트나 이미지를 수백~수천 차원의 **벡터(숫자 배열)**로 변환해 저장하고, 유사도로 검색한다.

```
"고양이" → [0.23, -0.14, 0.87, ...]  (1536차원 벡터)
"강아지" → [0.21, -0.12, 0.85, ...]  (비슷한 벡터)
"자동차" → [-0.54, 0.33, -0.12, ...] (다른 벡터)

"고양이와 비슷한 것 찾기" → 벡터 거리 계산 → "강아지"가 가까움
```

LLM 기반 앱에서 **RAG(Retrieval-Augmented Generation)** 구현에 쓰인다. 긴 문서를 벡터로 저장해두고, 질문을 벡터화해 가장 관련 있는 문서 조각을 찾아 LLM에 전달하는 구조.

**Pinecone**: 관리형 벡터 DB 서비스.

**Chroma**: 오픈소스, 로컬 실행 가능. 개발·프로토타입에 적합.

**Weaviate, Qdrant**: 오픈소스 벡터 DB.

**pgvector**: PostgreSQL 확장. 범용 RDBMS에 벡터 검색을 추가.

#### 공간 DB (Spatial DB)

지리 정보(좌표, 경계, 거리)를 저장하고 쿼리한다.

```sql
-- "서울 강남구 내 카페 찾기"
SELECT name FROM places
WHERE ST_Within(location, ST_GeomFromText('POLYGON(...)'));
```

**PostGIS**: PostgreSQL 공간 확장. GIS(지리정보시스템)의 사실상 표준.

**SpatiaLite**: SQLite 공간 확장.

지도 앱, 배달 서비스, 물류 최적화에 쓰인다.

#### 검색 엔진 DB

전문 텍스트 검색에 특화. 역인덱스(Inverted Index) 구조로 키워드 검색을 빠르게 처리한다.

```
역인덱스 구조:
  "파이썬" → [문서3, 문서7, 문서12, ...]
  "데이터베이스" → [문서1, 문서3, 문서9, ...]
  → "파이썬" AND "데이터베이스" → [문서3]
```

**Elasticsearch**: 가장 대표적. 로그 분석(ELK 스택), 상품 검색, 전문 검색.

**Apache Solr**: Elasticsearch의 전신과 경쟁 관계.

**Meilisearch**: 가볍고 빠른 오픈소스. 개발자 친화적.

---

### NewSQL — 세 번째 길

RDBMS의 ACID를 포기하지 않으면서 NoSQL의 수평 확장을 얻으려는 시도.

**CockroachDB**: "바퀴벌레처럼 죽지 않는다"는 이름. 분산 환경에서 PostgreSQL 호환 SQL을 ACID 보장으로 실행.

**Google Spanner**: Google 내부 시스템에서 출발. 전 세계 데이터센터에 분산된 단일 데이터베이스. ACID 보장.

**TiDB**: MySQL 호환 분산 DB. 중국 PingCAP이 개발.

---

## 5. 범용인가, 전문인가

```
범용 (어디에든 쓸 수 있다)
  PostgreSQL  → 웹 서비스, ERP, 분석, GIS, JSON까지
  SQLite      → 앱 내장, 모바일, 프로토타입, 로컬 도구
  MySQL       → 웹 서비스, CMS (WordPress, Drupal)
  Redis       → 캐시, 세션, 실시간 기능 전반

전문 (특정 용도에서 범용보다 압도적)
  InfluxDB    → 시계열, 모니터링
  Neo4j       → 관계 그래프, 소셜 네트워크
  Elasticsearch → 전문 검색, 로그 분석
  Pinecone    → AI 벡터 검색, RAG
  PostGIS     → 지리공간 데이터
```

**실무 관점**: 대부분의 서비스는 "범용 하나 + 전문 하나"를 조합한다.

```
일반적인 스택 조합 예:
  PostgreSQL  → 핵심 비즈니스 데이터 (유저, 주문, 결제)
  Redis       → 세션, 캐시, 실시간 랭킹
  Elasticsearch → 상품/콘텐츠 검색
  InfluxDB    → 서버 모니터링 메트릭
```

하나의 DB로 모든 걸 해결하려 하면 어딘가에서 무리가 온다.

---

## 6. 그래서 어디까지가 데이터베이스인가

엄밀한 기준으로 정리하면:

| | 구조화 | 영속성 | 트랜잭션 | 쿼리 언어 | DB 여부 |
|---|---|---|---|---|---|
| RDBMS (MySQL 등) | ✓ | ✓ | ✓ | SQL | 완전한 DB |
| Redis | ✓ | 선택 | 제한적 | 전용 명령 | 완전한 DB |
| SQLite | ✓ | ✓ | ✓ | SQL | 완전한 DB |
| Windows 레지스트리 | ✓ | ✓ | 제한적 | Win32 API | 좁은 의미의 DB |
| Excel 파일 | ✓ | ✓ | ✗ | 수식/필터 | DB처럼 쓰이지만 DB 아님 |
| JSON 파일 | ✓ | ✓ | ✗ | 없음 | DB 아님 |
| 파일 시스템 | ✓ | ✓ | 제한적 (저널) | 없음 | 메타DB (파일 메타만) |

"데이터베이스"라는 말은 문맥에 따라 다르게 쓰인다.

- **좁은 의미**: ACID를 지원하는 DBMS
- **넓은 의미**: 구조화된 데이터 저장소라면 모두 (레지스트리 포함)
- **마케팅 의미**: MySQL, Oracle처럼 "DB 제품"으로 나온 것

---

## 정리

```
범위: [파일] ⊂ [넓은 의미 DB] ⊂ [DBMS]

계통:
  관계형(RDBMS)  — 테이블, SQL, ACID. PostgreSQL, MySQL, SQLite
  Key-Value      — 단순 빠름. Redis, Memcached
  Document       — JSON 유연성. MongoDB, Firestore
  Column-Family  — 대용량 분석. Cassandra, HBase
  Graph          — 관계 탐색. Neo4j
  Time-Series    — 시간 데이터. InfluxDB, Prometheus
  Vector         — AI 유사도 검색. Pinecone, Chroma
  Search Engine  — 전문 검색. Elasticsearch
  NewSQL         — ACID + 분산. CockroachDB, Spanner

레지스트리 = 계층적 Key-Value DB. 좁은 의미의 DB는 맞다.
Excel = DB처럼 쓰이지만, DBMS 기능이 없어 DB로 보지 않는다.

실무에서는 "하나의 DB로 모든 걸"이 아니라
목적에 맞는 DB를 조합해서 쓰는 것이 표준이다.
```
