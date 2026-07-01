---
title: "블로그를 시작하며"
date: 2026-07-01
draft: false
tags: ["Hugo", "GitHub Pages", "시작"]
categories: ["일반"]
---

오늘 블로그를 만들었다.

Hugo와 PaperMod 테마를 골랐고, OrbStack 위에서 Docker 컨테이너로 작업했다. 로컬에서 `docker compose up` 하나면 미리보기가 뜨고, `main` 브랜치에 push하면 GitHub Actions가 알아서 빌드해 배포한다.

처음엔 레포를 `Hugo_Blog_260630`으로 만들었다가 `doct2r.github.io`로 이름을 바꿨다. 덕분에 주소가 깔끔하게 `https://doct2r.github.io` 가 됐다.

삽질도 있었다. GitHub Pages가 Private 레포에선 유료라는 걸 몰랐고, Actions 워크플로가 두 번 실패했다. 첫 번째는 Pages 소스 설정 문제, 두 번째는 `enablement` 파라미터 누락이었다.

어쨌든 됐다.

앞으로 뭘 쓸지는 모르겠지만, 일단 시작했다는 게 중요하다.
