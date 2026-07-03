# 변경 내역

이 블로그의 설정·테마·구조 변경 사항을 기록합니다.
포스트 내용 변경은 git log로 확인하세요.

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
