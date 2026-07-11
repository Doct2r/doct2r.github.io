---
created: 2026-07-04
updated: 2026-07-04
---
# CLAUDE.md — Hugo 블로그 공간

## 이 저장소

- **종류**: Hugo 정적 사이트 → GitHub Pages 배포
- **URL**: `https://doct2r.github.io/`
- **Git repo**: `/Volumes/Personal_4_macOS/Source/Blog/doct2r.github.io/`
- **Obsidian 심링크**: `2_Learn/hugo-ml/` (macOS + 볼륨 마운트 전제)

## 저장소 구조

```
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
```

## 포스팅 규칙

### 파일 위치

모든 포스트는 `content/posts/` 에 작성.

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
- 이미지: `static/` 에 넣고 `/이미지명.png` 형태로 참조

## 내용 기준

- **주제 제한 없음**: 기술, 생각, 기록 등 무엇이든 가능
- **공개 발행 전제**: 회사 기밀·내부 정보·개인정보 포함 금지
- **언어 제한 없음**: 한국어, 영어, 혼용 모두 허용

## 배포

GitHub Actions가 `main` 브랜치 push 시 자동으로 빌드 및 배포.
별도 배포 명령 불필요 — commit + push 하면 끝.

```bash
git add content/posts/새-포스트.md
git commit -m "post: 포스트 제목"
git push
```

## 로컬 미리보기

```bash
cd /Volumes/Personal_4_macOS/Source/Blog/doct2r.github.io/
docker compose up   # compose.yml 기준
# 또는
hugo server -D      # draft 포함 미리보기
```

## About 페이지 갱신 규칙

`content/about/index.md`의 소개글은 게시물이 늘어날 때마다 실제 다룬 주제를 반영해 주기적으로 재작성한다.

### 갱신 기준

- 기준은 **마지막 갱신 시점 +20편이 아니라, 항상 20의 배수 그 자체**다 — 게시물 수가 20의 배수에 도달하거나 그걸 넘어서면 갱신한다.
- 컨텍스트 초기화 등으로 마지막 갱신이 20의 배수가 아닌 시점(예: 209편)에 이뤄졌더라도 "엇갈린 기준"을 그대로 이어받지 않는다. 다음 갱신 시점은 209+20=229가 아니라, 209 다음에 오는 20의 배수인 **220**이다. 즉 매번 `ceil(현재개수 / 20) * 20`을 다음 갱신 기준으로 삼는다.
- `content/about/index.md` 맨 아래 HTML 주석(`<!-- about-refresh-baseline: N posts / 날짜 — 다음 갱신은 M편(20의 배수) 도달 시 -->`)에 마지막 갱신 시점의 게시물 수(N)와 다음 갱신 기준이 되는 20의 배수(M)를 함께 기록해둔다. 새 포스트를 커밋하기 전 `ls content/posts/*.md | wc -l`로 현재 개수를 확인하고, 그 개수가 주석에 적힌 M 이상이면 즉시 About을 갱신한다.

### 갱신 절차

1. 기존 `content/about/index.md` 내용을 `about-archive/about-{현재 게시물 수 3자리}posts-{날짜}.md` 형식으로 복사(예: `about-084posts-2026-08-01.md`). 파일 맨 위에 아카이브 사유·시점을 HTML 주석으로 남긴다.
2. `content/about/index.md`를 그 시점까지 쌓인 `POST_INDEX.md` 카테고리·주제를 반영해 새로 작성.
3. 새 소개글 맨 아래에 갱신된 baseline 주석을 남긴다.
4. `about-archive/`는 `content/` 바깥에 있으므로 Hugo가 빌드하지 않는다 — 웹에는 노출되지 않고 레포지토리에만 보관됨.
