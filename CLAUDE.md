---
created: 2026-07-04
updated: 2026-08-14
---
# CLAUDE.md — Doct2r 사이트 (허브 + 블로그)

## 이 저장소

- **종류**: 두 개의 정적 사이트를 한 저장소에서 빌드해 GitHub Pages 하나로 합쳐 배포
  - `hub/` — Astro. 루트(`/`)에서 서빙되는 홈페이지(히어로 섹션 + 서브 웹 링크: 블로그, 관계도 그래프 등)
  - `blog/` — Hugo. `/blog/` 서브패스에서 서빙되는 기존 블로그(500편+)
- **URL**: `https://doct2r.github.io/`(허브), `https://doct2r.github.io/blog/`(블로그)
- **Git repo**: `/Volumes/Personal_4_macOS/Source/Blog/doct2r.github.io/`
- **Obsidian 심링크**: `2_Learn/hugo-ml/` (macOS + 볼륨 마운트 전제, 대상은 `blog/content/`)

500편 도달 시점(2026-08-14)에 블로그를 접거나 비공개로 돌리는 대신 이 구조로 재편했다 — 루트는 허브로, 기존 블로그는 `/blog`로 이동. 이 문서는 그 이후 구조를 반영한다.

## 저장소 구조

```
hub/                 ← Astro 홈페이지 (루트에서 서빙)
  src/pages/          index.astro(히어로), graph.astro(관계도 그래프)
  src/data/           graph-data.json (인물·기업 관계, 현재 더미 데이터)
  public/             robots.txt, 404.html — 사이트 전체의 유일한 유효본
blog/                ← Hugo 블로그 (/blog 서브패스에서 서빙)
  content/
    posts/     ← 블로그 포스트 (.md)
    about/
    archive/
    search/
  archetypes/  ← hugo new 템플릿
  layouts/     ← 테마 오버라이드
  static/      ← 정적 파일 (이미지 등)
  themes/      ← CleanWhite 테마
  hugo.toml    ← 사이트 설정
  POST_INDEX.md      ← 중복 방지용 포스트 색인
  about-archive/     ← About 페이지 과거 버전 보관(Hugo 빌드 대상 아님)
  ops/               ← 기능 도입 주기 정책 등 운영 메모(Hugo 빌드 대상 아님)
.github/workflows/deploy.yml   ← 허브+블로그 순차 빌드 후 조립·배포
```

## 포스팅 규칙

### 파일 위치

모든 포스트는 `blog/content/posts/` 에 작성.

### 파일명

**kebab-case** 필수. 한글 파일명 사용 금지 (Hugo URL 인코딩 문제).

```
good: ai-history-taxonomy.md
bad:  AI 역사 분류.md
```

### 프론트매터

YAML 형식 사용 (아키타입 기본값은 TOML이지만 실제 포스트는 YAML 통일).

```yaml
---
title: "제목"
date: 2026-07-04T12:00:00+09:00
draft: false
tags: ["태그1", "태그2"]
categories: ["카테고리"]
---
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `title` | 필수 | Hugo가 H1으로 렌더링 — **본문에 H1 작성 금지** |
| `date` | 필수 | ISO 8601, 시간대 `+09:00` 포함 |
| `draft` | 필수 | `false` = 발행, `true` = 미발행 |
| `tags` | 권장 | 문자열 배열 |
| `categories` | 권장 | 문자열 배열 |

### 본문

- Hugo가 `title`을 H1으로 렌더링하므로 **본문 첫 줄 H1 작성 금지**
- 섹션 헤딩(`##`, `###`)은 자유롭게 사용
- Obsidian `[[위키링크]]` 사용 금지 — Hugo 파싱 불가
- 이미지: `blog/static/` 에 넣고 `/이미지명.png` 형태로 참조

## 내용 기준

- **주제 제한 없음**: 기술, 생각, 기록 등 무엇이든 가능
- **공개 발행 전제**: 회사 기밀·내부 정보·개인정보 포함 금지
- **언어 제한 없음**: 한국어, 영어, 혼용 모두 허용

## 배포

GitHub Actions(`deploy.yml`)가 `main` 브랜치 push 시 자동으로 두 사이트를 순서대로 빌드한다 — `hub/`(Astro, `npm run build`) → `blog/`(Hugo, `--source blog --baseURL .../blog/`) → Pagefind로 `blog/public` 인덱싱 → 둘을 `_site/`(허브)와 `_site/blog/`(블로그)로 합쳐 Pages에 업로드. 별도 배포 명령 불필요 — commit + push 하면 끝.

```bash
git add blog/content/posts/새-포스트.md
git commit -m "post: 포스트 제목"
git push
```

**주의**: 이 파이프라인은 실서비스 배포다. `hub/`나 `blog/hugo.toml`, `.github/workflows/deploy.yml` 등 구조에 영향을 주는 변경은 push 전에 로컬에서 먼저 빌드·조립·서빙까지 확인할 것 (Pages는 별도 프리뷰 환경이 없어 push=즉시 라이브 반영).

## 토큰 절약 — 기계적 작업의 하이쿠 위임

새 포스트 본문이 완성되고 팩트체크가 끝난 뒤, `blog/POST_INDEX.md`에 넣을 밀집 요약 엔트리(공백 없는 키워드 나열 형식)는 `post-index-haiku` 스킬(`.claude/skills/post-index-haiku/SKILL.md`)로 하이쿠 서브에이전트에 백그라운드로 위임한다.

- **위임 대상**: 이미 본문에 쓰인 사실을 정해진 포맷으로 다시 눌러 담는 기계적 압축뿐.
- **위임하지 않는 것**: 어떤 사실을 넣을지 고르는 리서치, 기존 포스트와의 중복 여부 판단, About 페이지 재작성(20편 단위 갱신) — 이런 판단이 필요한 작업은 계속 메인 모델이 직접 한다.
- 절차·프롬프트 구성은 스킬 파일에 정리돼 있음.

## 로컬 미리보기

```bash
cd /Volumes/Personal_4_macOS/Source/Blog/doct2r.github.io/
docker compose up   # compose.yml 기준 — hugo(:1313)와 hub(:4321) 둘 다 기동
# 또는 개별 실행
hugo server -D -s blog     # 블로그만, draft 포함 미리보기
cd hub && npm run dev      # 허브만
```

로컬에서는 두 사이트가 각자 기본 포트(`:1313`, `:4321`)에서 독립적으로 뜬다 — `/blog` 서브패스 중첩은 재현하지 않는다. 서브패스 상대경로까지 확인하려면 `hugo server -s blog --baseURL http://localhost:1313/blog/`처럼 수동으로 baseURL을 지정하거나, `.github/workflows/deploy.yml`의 빌드·조립 스텝을 그대로 로컬에서 재현한다(`hugo --source blog ...` → `hub`에서 `npm run build` → `_site/`, `_site/blog/`로 복사 → 정적 서버로 서빙).

## About 페이지 갱신 규칙

`blog/content/about/index.md`의 소개글은 게시물이 늘어날 때마다 실제 다룬 주제를 반영해 주기적으로 재작성한다.

### 갱신 기준

- 기준은 **마지막 갱신 시점 +20편이 아니라, 항상 20의 배수 그 자체**다 — 게시물 수가 20의 배수에 도달하거나 그걸 넘어서면 갱신한다.
- 컨텍스트 초기화 등으로 마지막 갱신이 20의 배수가 아닌 시점(예: 209편)에 이뤄졌더라도 "엇갈린 기준"을 그대로 이어받지 않는다. 다음 갱신 시점은 209+20=229가 아니라, 209 다음에 오는 20의 배수인 **220**이다. 즉 매번 `ceil(현재개수 / 20) * 20`을 다음 갱신 기준으로 삼는다.
- `blog/content/about/index.md` 맨 아래 HTML 주석(`<!-- about-refresh-baseline: N posts / 날짜 — 다음 갱신은 M편(20의 배수) 도달 시 -->`)에 마지막 갱신 시점의 게시물 수(N)와 다음 갱신 기준이 되는 20의 배수(M)를 함께 기록해둔다. 새 포스트를 커밋하기 전 `ls blog/content/posts/*.md | wc -l`로 현재 개수를 확인하고, 그 개수가 주석에 적힌 M 이상이면 즉시 About을 갱신한다.

### 갱신 절차

1. 기존 `blog/content/about/index.md` 내용을 `blog/about-archive/about-{현재 게시물 수 3자리}posts-{날짜}.md` 형식으로 복사(예: `about-084posts-2026-08-01.md`). 파일 맨 위에 아카이브 사유·시점을 HTML 주석으로 남긴다.
2. `blog/content/about/index.md`를 그 시점까지 쌓인 `blog/POST_INDEX.md` 카테고리·주제를 반영해 새로 작성.
3. 새 소개글 맨 아래에 갱신된 baseline 주석을 남긴다.
4. `blog/about-archive/`는 `blog/content/` 바깥에 있으므로 Hugo가 빌드하지 않는다 — 웹에는 노출되지 않고 레포지토리에만 보관됨.

## 기능 도입 주기 정책

`blog/ops/feature-rotation-policy.md`에 게시물 150편 단위로 새 기능(댓글, 후원, 시리즈 내비게이션 등)을 하나씩 도입하는 별도 주기 정책이 있다. About 갱신과 같은 `ceil(현재개수 / 150) * 150` 원칙을 쓰되 주기는 다르다 — 자세한 절차와 후보군은 해당 파일 참고.

## 허브(`hub/`) 관련 메모

- 관계도는 하나가 아니라 여러 개다 — `/graph`는 목록 페이지(`hub/src/pages/graph/index.astro`)이고, 각 그래프는 `/graph/<이름>`(예: `/graph/blog/`)으로 독립된 엔드포인트를 갖는다. 새 관계도를 추가할 땐 이 라우팅 관례를 따를 것.
- 테마 대응 Cytoscape 렌더링 로직은 `hub/src/lib/cytoscape-theme.ts`(`createThemedGraph`)에 공용화돼 있다 — Cytoscape는 캔버스에 직접 그려 CSS 변수를 못 읽으므로, 이 함수가 테마 토큰을 실제 색상값으로 읽어 스타일을 구성하고 `theme-change` 이벤트(토글 클릭·다른 탭의 storage 이벤트)에 맞춰 다시 칠한다. 새 그래프를 추가할 땐 이 함수를 재사용하고, 데이터 타입은 `hub/src/lib/graph-types.ts`의 `GraphNode`/`GraphEdge`/`GraphData`(`type`은 도메인에 고정되지 않은 `string`)를 따른다.
- 블로그 관계도(`hub/src/pages/graph/blog.astro`)는 500편에서 인물·기업·관계를 추출한 실제 데이터가 아직 없는 더미(`hub/src/data/blog-graph.json`)다 — 추출 작업은 별도 진행 예정.
- 성경 관계도는 시대별로 인물·왕국이 나타나고 사라지는 "시간 바" 레이어가 필요해 다른 그래프보다 요구사항이 복잡하다 — 노드/엣지에 연도(또는 시대) 필드를 추가하고 슬라이더 값에 따라 `cy.elements()`를 필터링/투명도 조절하는 식으로 지금의 Cytoscape.js 위에서 구현하는 게 1차 방향이며, 정말 감당 못 하는 부분이 확인되면 그때 별도 엔진을 검토한다. 데이터·시간 바 UI 모두 아직 미착수.
- `hub/`는 의도적으로 가볍게 유지한다 — React 등 UI 프레임워크 추가 없이 Astro + Cytoscape.js만 사용. 새 코드는 TypeScript로 작성하는 걸 기본으로 한다(`tsconfig.json`이 `astro/tsconfigs/strict` 적용 중).
- 테마 토큰에 accent 컬러 `--hub-accent-rgb`/`--hub-accent2-rgb`(라이트·다크 각각, `hub/src/layouts/Base.astro`)가 있다 — 그래프 페이지의 company/event 색과 톤을 맞춘 teal·gold 계열. RGB 트리플렛으로 저장해 `rgba(var(--hub-accent-rgb), 0.2)` 식으로 투명도를 줄 수 있게 한 것이니, 새 accent가 필요하면 이 형식을 따를 것.
- 히어로(`hub/src/pages/index.astro`)에는 타이핑 롤 로테이터 + 마우스 반응형 그라디언트 메시가 있다 — 프레임워크 없이 바닐라 `<script>`로 구현했고, `prefers-reduced-motion`을 항상 존중해 애니메이션을 끄고 정적 텍스트로 대체한다(스크린리더용 완성 문장은 `.sr-only`로 별도 제공). 이 페이지에 동적 요소를 더 추가할 때도 같은 패턴(모션 감산 대응 + 접근성 텍스트 분리)을 따를 것.
