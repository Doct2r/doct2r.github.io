# Hugo Blog

Hugo + PaperMod 테마 기반의 개인 블로그 레포지토리입니다.

## 기술 스택

- **Static Site Generator**: [Hugo](https://gohugo.io/) v0.154.5 extended
- **Theme**: [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- **개발 환경**: Docker (OrbStack)
- **배포**: GitHub Actions → GitHub Pages (`https://doct2r.github.io`)

## 시작하기

### 요구사항

- [Docker](https://docs.docker.com/get-docker/) 또는 [OrbStack](https://orbstack.dev/)

### 개발 서버 실행

```bash
docker compose up
```

브라우저에서 http://localhost:1313 으로 접속합니다.

### 새 포스트 작성

```bash
docker run --rm -v $(pwd):/src -w /src hugomods/hugo:exts \
  hugo new content/posts/포스트-제목.md
```

생성된 파일(`content/posts/포스트-제목.md`)을 열어 내용을 작성합니다.  
작성 완료 후 frontmatter의 `draft: true`를 `draft: false`로 변경해야 게시됩니다.

### 빌드

```bash
docker run --rm -v $(pwd):/src -w /src hugomods/hugo:exts hugo --minify
```

빌드 결과물은 `public/` 디렉터리에 생성됩니다.

## 포스트 게시 워크플로

main 브랜치에 push되면 GitHub Actions가 자동으로 빌드 후 배포합니다.  
직접 main에 push하지 말고, 아래 브랜치 전략을 따릅니다.

```
작성 (draft 브랜치)
  └─→ 로컬 확인 (docker compose up)
        └─→ main 머지 (PR 또는 git merge)
              └─→ 자동 배포 (GitHub Actions)
```

### 브랜치 전략

```bash
# 새 포스트 작성 시
git checkout -b post/포스트-제목

# 로컬에서 확인 후 main에 머지
git checkout main
git merge post/포스트-제목
git push origin main        # ← 이 순간 배포 시작
```

## 공개 레포지토리 운영 원칙

GitHub Pages 무료 플랜은 **Public 레포지토리만 지원**합니다.  
레포가 공개되므로 아래 원칙을 지킵니다.

### 올려도 되는 것
- 블로그 포스트 (`content/posts/`)
- 테마, 레이아웃, 설정 파일
- 이미지 등 정적 파일

### 절대 올리면 안 되는 것
- API 키, 비밀번호, 토큰
- 미공개 초안이라도 민감한 개인정보가 담긴 파일

### 민감한 값 관리 방법

민감한 설정값은 GitHub Secrets에 저장하고 Actions에서 환경변수로 주입합니다.

```yaml
# .github/workflows/deploy.yml 에서
env:
  ANALYTICS_ID: ${{ secrets.ANALYTICS_ID }}
```

Secrets 등록: GitHub 레포 → **Settings** → **Secrets and variables** → **Actions**

### 초안 보호 (draft)

게시할 준비가 안 된 포스트는 frontmatter에 `draft: true`를 유지합니다.  
`hugo.toml`에 `buildDrafts = false`가 설정되어 있어 빌드 시 자동으로 제외됩니다.

```yaml
---
title: "아직 공개 안 할 포스트"
draft: true   # ← main에 올라가도 배포되지 않음
---
```

## 디렉터리 구조

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions 자동 배포
├── content/
│   └── posts/           # 블로그 포스트 (Markdown)
├── themes/
│   └── PaperMod/        # 테마 (git submodule)
├── static/              # 정적 파일 (이미지 등)
├── compose.yml          # Docker Compose 개발 환경
└── hugo.toml            # Hugo 설정
```

## 포스트 frontmatter

```yaml
---
title: "포스트 제목"
date: 2026-07-01
draft: false
tags: ["태그1", "태그2"]
categories: ["카테고리"]
---
```

## 서브모듈 업데이트

```bash
git submodule update --remote --merge
```
