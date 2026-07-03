# 변경 내역

이 블로그의 설정·테마·구조 변경 사항을 기록합니다.
포스트 내용 변경은 git log로 확인하세요.

---

## [2026-07-03] 포스트 관리 규칙 수립 및 색인 파일 생성

### 변경 이유
- AI가 주제 생성·작성을 담당하기 때문에 중복 포스트 발생 가능성 존재
- 사전 체크 없이 비슷한 각도의 포스트가 누적되면 독자 혼란 및 관리 부담 증가

### 변경 내용
- `POST_INDEX.md` 생성 (프로젝트 루트)
  - 전체 포스트의 파일명·제목·핵심 논점 카테고리별 정리
  - 신규 주제 작성 전 중복 체크용 색인
  - 포스트 추가/삭제 시 함께 갱신

### 관리 규칙
1. **동일 논점 중복 작성 금지**: 같은 핵심 각도를 다루는 포스트는 하나만 유지
   - 리뉴얼 시: 기존 파일 아카이브 후 새 파일 작성
2. **비슷하지만 다른 각도는 허용**
   - OK: 소니 경영 실패 구조 ↔ 소니 하드웨어 이상한 결정 (범위 다름)
   - 금지: MFC→WinUI3 마이그레이션 ↔ MFC 안 쓸 수 있는가? (파이 겹침)
3. **판단 기준**: "독자가 한 포스트만 읽으면 다른 포스트가 불필요해지는가?"

---

## [2026-07-03] 배포 날짜 처리 수정: --buildFuture 추가

### 변경 이유
- 게임 관련 포스트 3개(아타리 쇼크, 게임산업 구조 변화, 소니 플레이스테이션)가 검색에서 누락
- 포스트 날짜가 KST 오후(T14:00~16:00)로 설정됐는데, GitHub Actions는 UTC 기준 빌드
- `buildFuture = false` 설정에 의해 UTC 기준 미래 시각 포스트가 빌드에서 제외됨
- 빌드에서 제외된 포스트는 pagefind 인덱싱도 안 돼 검색 불가

### 변경 내용
- `.github/workflows/deploy.yml` 빌드 명령에 `--buildFuture` 추가
- `date` 필드는 홈페이지 정렬 순서 용도로만 사용, KST/UTC 무관하게 모든 비-draft 포스트 배포

### 참고
- 포스팅 시 날짜는 KST 기준으로 자유롭게 작성 가능
- 시간대나 미래 날짜 여부에 관계없이 `draft: false`면 배포됨

---

## [2026-07-03] 검색·카테고리·태그·사이드바 기능 수정

### 변경 이유
- CleanWhite 테마가 내부적으로 `Type: "post"` / `Section: "post"` (단수)를 하드코딩
- 이 블로그의 콘텐츠 타입은 `content/posts/`라 `"posts"` (복수) → 카테고리·태그 페이지 빈 상태
- 사이드바 LAST POSTS 섹션도 동일 문제로 비어있었음
- 검색 페이지(`/search/`)가 없어 404, pagefind 인덱싱 미설정

### 변경 내용
- `layouts/_partials/category.html` 오버라이드: `Section "post"` → `"posts"`
- `layouts/_partials/sidebar.html` 오버라이드: `Type "post"` → `"posts"` (LAST POSTS 섹션)
- `content/search/_index.md` 생성: `/search/` URL 활성화
- `.github/workflows/deploy.yml`에 `npx pagefind --source public` 추가 (검색 인덱싱)
- `hugo.toml`: `featured_condition_size = 1` → `0` (태그 1개 포스트도 사이드바 표시)

---

## [2026-07-03] 파비콘 수정: 커스텀 파비콘 적용

### 변경 이유
- CleanWhite 테마 기본 파비콘(`img/favicon.ico`)이 탭에 표시되는 문제
- 프로젝트 고유 파비콘 파일(`favicon-16x16.png`, `favicon-32x32.png` 등) 미적용

### 변경 내용
- `layouts/_partials/head.html` 오버라이드 추가
- 테마의 `<link rel="shortcut icon" href="img/favicon.ico">` 단일 선언을 아래로 교체:
  - `favicon.ico` (기본)
  - `favicon-16x16.png` (탭용)
  - `favicon-32x32.png` (HiDPI)
  - `apple-touch-icon.png` (iOS 홈화면)

---

## [2026-07-03] 테마 변경: PaperMod → CleanWhite

### 변경 이유
- PaperMod 탭 파비콘 미표시 문제 (Chrome 캐시 이슈)
- 사이드바 레이아웃 기반의 블로그 형태로 전환

### 변경 내용

**테마**
- 제거: `themes/PaperMod` (adityatelange/hugo-PaperMod)
- 추가: `themes/CleanWhite` (zhaohuabing/hugo-theme-cleanwhite)

**hugo.toml**
- `theme = 'PaperMod'` → `theme = 'CleanWhite'`
- PaperMod 전용 params 제거 (`ShowReadingTime`, `homeInfoParams`, `socialIcons` 등)
- CleanWhite params 추가 (`header_image`, `SEOTitle`, `sidebar_about_description` 등)
- `[menu]` 섹션 제거 → `[[params.additional_menus]]` 방식으로 전환
- `[outputs] home` 에서 JSON 제거 (PaperMod 검색용이었음)
- `hasCJKLanguage = true` 추가

**추가된 파일**
- `layouts/_partials/portfolio.html` — 포스트 타입 오버라이드 (`post` → `posts`)
- `static/css/custom.css` — 헤더 그라디언트, 브랜드 색상 (#308572 / #4ab89d)
- `content/about/index.md` — About 페이지
- `content/archive/index.md` — Archive 페이지

**제거된 파일**
- `content/search.md` — PaperMod 전용 검색 페이지
- `assets/css/extended/custom.css` — PaperMod Hugo Pipes 전용 CSS

### 알려진 사항
- CleanWhite는 검색에 Algolia를 사용. 현재 비활성화(`algolia_search = false`) 상태.
- 헤더 배경은 CSS 그라디언트로 대체 (별도 이미지 없음).

---

## [2026-07-02] 포스트 정렬 수정

### 변경 이유
- 전체 포스트의 `date`가 `2026-07-02` (시간 없음)로 동일해 Hugo가 알파벳순 폴백

### 변경 내용
- 포스트 25개에 git 커밋 순서 기반 시간 추가 (T11:00 ~ T23:00, 30분 간격)
- 가장 최근 작성 포스트가 홈 화면 상단에 표시되도록 수정

---

## [2026-06-30] 블로그 초기 설정

### 설정 내용
- Hugo v0.154.5 extended + PaperMod 테마
- Docker/OrbStack 기반 로컬 빌드 환경 (hugomods/hugo:exts)
- GitHub Pages 자동 배포 (GitHub Actions)
- 기본 URL: `https://doct2r.github.io/`
- 언어: 한국어 (`languageCode = 'ko'`)
- 카테고리: 하드웨어, 프로그래밍, AI, 운영체제, 개발도구, 경영
