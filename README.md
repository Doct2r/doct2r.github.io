# Hugo Blog

Hugo + PaperMod 테마 기반의 개인 블로그 레포지토리입니다.

## 기술 스택

- **Static Site Generator**: [Hugo](https://gohugo.io/) v0.154.5 extended
- **Theme**: [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- **개발 환경**: Docker (OrbStack)

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

## 디렉터리 구조

```
.
├── content/
│   └── posts/       # 블로그 포스트 (Markdown)
├── themes/
│   └── PaperMod/    # 테마 (git submodule)
├── static/          # 정적 파일 (이미지 등)
├── compose.yml      # Docker Compose 개발 환경
└── hugo.toml        # Hugo 설정
```

## 포스트 frontmatter

```yaml
---
title: "포스트 제목"
date: 2026-06-30
draft: false
tags: ["태그1", "태그2"]
categories: ["카테고리"]
---
```

## 서브모듈 업데이트

```bash
git submodule update --remote --merge
```
