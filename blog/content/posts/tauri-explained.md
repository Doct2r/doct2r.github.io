---
title: "Tauri — Electron의 대안인가, 진짜 후계자인가"
date: 2026-07-04T13:00:00+09:00
draft: false
tags: ["Tauri", "Rust", "크로스플랫폼", "데스크톱", "Electron", "WebView", "프레임워크"]
categories: ["프로그래밍"]
---

Electron의 단점을 한 줄로 요약하면 "Chromium을 통째로 들고 다닌다"는 것이다. Tauri는 그 전제 자체를 뒤집는다. OS가 이미 WebView를 제공하는데 왜 Chromium을 번들하는가? 이 질문에서 출발했다.

---

## 1. 왜 나왔나

### Electron의 근본적인 비효율

```
Electron이 앱을 만드는 방법:
  1. Chromium 전체를 앱에 포함
  2. Node.js를 앱에 포함
  3. 앱 코드 포함

결과:
  Hello World 앱 = 앱 코드 수KB + Chromium ~100MB + Node.js ~20MB
  → 실제 앱 크기: 100~200MB

비효율의 원인:
  Windows에는 이미 WebView2 (Chromium 기반) 내장
  macOS에는 이미 WKWebView (WebKit) 내장
  Linux에는 WebKitGTK 설치 가능

→ "OS가 이미 WebView를 갖고 있는데 왜 또 넣는가?"
```

### Tauri의 출발점 (2019～2022)

Tauri 프로젝트는 2019년 소규모 오픈소스 팀으로 시작했다. 핵심 아이디어는 두 가지였다.

```
아이디어 1: OS 기본 WebView를 사용한다
  번들 크기 문제 → Chromium 제거

아이디어 2: 백엔드는 Rust로 만든다
  Node.js 제거 → Rust로 성능·보안 확보

결과:
  앱 크기: 3~15MB (Electron 대비 1/10~1/20)
  메모리:  ~50MB (Electron 대비 1/4~1/8)
```

2022년 v1.0이 공개됐고, 2024년 v2.0에서 **모바일(iOS/Android) 지원**이 추가됐다. 데스크톱 전용에서 하나의 코드베이스로 데스크톱 + 모바일을 모두 지원하는 방향으로 확장됐다.

---

## 2. 구조 — 어떻게 작동하는가

```
Tauri 앱의 구조:

┌────────────────────────────────────────────┐
│  Core (Rust)                               │
│  - 파일 시스템, OS API                      │
│  - IPC (Commands / Events)                 │
│  - 권한 시스템 (Capabilities)               │
│  - 플러그인 시스템                          │
│  - 앱 생명주기                              │
└──────────────┬─────────────────────────────┘
               │ IPC (invoke / emit)
┌──────────────▼─────────────────────────────┐
│  WebView (OS 기본)                          │
│  Windows:  WebView2 (Chromium 기반)         │
│  macOS:    WKWebView (WebKit / Safari 엔진) │
│  Linux:    WebKitGTK                        │
│                                            │
│  프론트엔드: React / Vue / Svelte / 아무거나 │
└────────────────────────────────────────────┘
```

Electron과 가장 다른 점은 **WebView가 앱 안에 포함된 것이 아니라 OS에서 빌려온다**는 것이다.

```
Tauri의 IPC 구조:

Rust 쪽에서 함수를 정의:
  #[tauri::command]
  fn read_file(path: String) -> Result<String, String> {
      std::fs::read_to_string(path).map_err(|e| e.to_string())
  }

JS 쪽에서 호출:
  import { invoke } from '@tauri-apps/api/core'
  const content = await invoke('read_file', { path: '/tmp/test.txt' })

→ JS → Rust 함수 호출 → 결과 반환
→ Node.js IPC 없이, Rust 직접 호출
```

### Capabilities — 권한 시스템

Tauri v2에서 가장 강조하는 부분이다.

```
capabilities/default.json:
  {
    "identifier": "default",
    "windows": ["main"],
    "permissions": [
      "fs:read-files",
      "shell:open"
    ]
  }

의미:
  "main" 창은 파일 읽기와 shell open만 허용
  → 파일 쓰기, 프로세스 실행 등은 명시적으로 허용해야 함
  → 선언하지 않은 API는 자동으로 차단

Electron과의 차이:
  Electron: "어디까지 허용할지" 개발자가 구성
  Tauri:    "명시적으로 허용한 것만" 동작 (기본값이 차단)
```

---

## 3. 실질적 장점

### 크기 비교 (실측)

```
동일 기능의 앱 기준 패키지 크기:

                 Windows   macOS     Linux
Electron        ~150MB    ~160MB    ~140MB
Tauri           ~3~8MB    ~5~10MB   ~4~8MB

차이: 약 15~30배

이유:
  Tauri = 앱 코드 + Rust 바이너리
          (WebView는 OS가 제공하므로 미포함)

  Electron = 앱 코드 + Chromium + Node.js
```

### 메모리 비교

```
실행 중 메모리 사용량 (중간 복잡도 앱 기준):

Electron:   200~400MB (기본 오버헤드)
Tauri:      30~80MB

이유:
  WebView2/WKWebView는 OS가 관리하는 공유 자원
  → 여러 앱이 동일한 WebView 엔진을 공유
  → 앱이 실제로 차지하는 추가 메모리 줄어듦

  Electron:
  → 각 앱이 자체 Chromium 인스턴스 보유
  → 앱 3개 실행 = Chromium 3개 상주
```

### 성능

```
Rust 백엔드의 특성:
  - GC 없음 (Garbage Collector)
  - 메모리 안전 (컴파일 타임 보장)
  - C/C++ 수준의 실행 속도

무거운 작업에서 차이:
  파일 파싱, 암호화, 데이터 처리
  → Node.js보다 Rust가 수배~수십배 빠름
  → 메인 스레드 블로킹 없이 처리

JS 작업은 여전히 WebView에서:
  → 프론트엔드 렌더링은 동일
  → 무거운 로직만 Rust Command로 분리
```

### 보안

```
기본값의 차이:

Electron (초기):
  nodeIntegration: true가 기본
  → 렌더러에서 Node.js 직접 접근
  → XSS → 시스템 접근

Tauri:
  Capabilities 시스템으로 기본값이 최소 권한
  Rust: 메모리 안전 (버퍼 오버플로우, use-after-free 컴파일 타임 차단)
  IPC: JS → Rust Command만 허용, 역방향 직접 접근 없음

실제 영향:
  1Password 8이 Tauri를 선택한 이유 중 하나가 보안 모델
  패스워드 관리자 특성상 최소 권한 원칙이 필수
```

---

## 4. Electron을 누를 만한가 — 생태계와 성숙도

솔직하게 현황을 본다.

### GitHub Stars (2024년 기준)

```
Electron:  ~116,000 stars   (2013 시작)
Tauri:     ~90,000 stars    (2019 시작)

5년 차이를 고려하면 Tauri의 성장 속도가 빠름
하지만 절대적 커뮤니티 크기는 아직 Electron이 우세
```

### 플러그인 생태계

```
프론트엔드 (공통):
  React, Vue, Svelte, SolidJS, Next.js 등
  → npm 생태계 전부 사용 가능
  → 여기서는 Electron과 동일

Rust 백엔드 플러그인:
  tauri-plugin-store:    로컬 저장소
  tauri-plugin-sql:      SQLite
  tauri-plugin-updater:  자동 업데이트
  tauri-plugin-http:     HTTP 요청
  tauri-plugin-shell:    프로세스 실행
  tauri-plugin-fs:       파일 시스템
  tauri-plugin-dialog:   파일 다이얼로그

→ 기본 기능은 공식 플러그인으로 커버
→ 고급 기능은 Rust 크레이트(crate) 직접 사용
→ npm 플러그인 생태계 수준은 아직 아님
```

### 실제 프로덕션 사용 사례

```
검증된 사례:

GitButler (GitHub 공동창업자 Scott Chacon 창업):
  Git 브랜치 관리 GUI
  Tauri 선택 이유: 크기, 성능, Rust 팀 보유

1Password 8:
  패스워드 관리자
  Tauri 선택 이유: 보안 모델, 크기

Clash Verge / Clash Verge Rev:
  VPN/프록시 클라이언트
  오픈소스, 활발한 커뮤니티

Overlayed:
  게임 오버레이 앱

현황:
  VS Code, Slack 수준의 빅테크 레퍼런스는 아직 없음
  → 새로 시작하는 프로젝트 중심으로 채택
  → 기존 Electron 프로젝트가 전환한 사례는 드묾
```

### 성숙도 평가

```
v1.0 (2022):  데스크톱 Win/Mac/Linux 안정화
v2.0 (2024):  모바일(iOS/Android) 지원 추가
              Capabilities 시스템 전면 개편
              플러그인 API 재설계

문서화:
  공식 문서 품질 높음
  한국어 커뮤니티는 Electron보다 작음

디버깅:
  WebView DevTools 접근 가능
  Mac: Safari 개발자 도구로 WKWebView 디버깅
  Win: DevTools 자체 포함 (WebView2)
  → Chromium DevTools 통일 경험은 아님

Rust 에러:
  Rust 컴파일 에러가 길고 낯설 수 있음
  → 웹 개발자에게 높은 진입장벽
```

---

## 5. 핵심 약점

### OS WebView 버전 차이

이것이 Tauri의 가장 큰 구조적 약점이다.

```
플랫폼별 WebView 엔진:

Windows:  WebView2 (Microsoft, Chromium 기반)
          → Chrome과 거의 동일한 렌더링
          → 현대 Windows에 기본 포함

macOS:    WKWebView (Apple, WebKit / Safari 엔진)
          → Chromium이 아님
          → Safari에서 안 되는 것은 Mac Tauri 앱에서도 안 됨
          → CSS Grid, WASM 등 최신 기능 지원 시점이 다름

Linux:    WebKitGTK
          → 배포판마다 버전 다름
          → Ubuntu 22.04 vs Fedora 39 렌더링이 다를 수 있음
          → 가장 불안정한 플랫폼
```

```
실제 사례 유형:

CSS 기능 A:
  Chrome/Chromium: 지원 ✅
  Safari/WebKit:   미지원 ❌ (or 버전 뒤처짐)

→ Windows 앱은 정상, Mac 앱은 깨짐
→ Electron은 Chromium 고정이라 이 문제 없음

대응:
  @supports 로 분기
  Can I Use 기준으로 WebKit 지원 여부 사전 확인
  Safari 호환 CSS만 사용
  → 웹 개발 시 Safari 지원을 신경 쓰듯이 작업해야 함
```

### Rust 진입장벽

```
백엔드 로직 예시:

Electron (Node.js):
  const fs = require('fs')
  const content = fs.readFileSync(path, 'utf-8')

Tauri (Rust):
  use std::fs;
  #[tauri::command]
  fn read_file(path: String) -> Result<String, tauri::Error> {
      fs::read_to_string(&path)
          .map_err(|e| tauri::Error::Io(e))
  }

차이:
  Node.js: 동기식 1줄
  Rust: 타입 명시, 에러 처리 명시, 매크로

"Rust를 배우지 않고 Tauri를 쓸 수 있는가?"
  → 기본 명령 복사·붙여넣기: 가능
  → 커스텀 백엔드 로직: 사실상 Rust 필수
  → 팀에 Rust 개발자 없으면 생산성이 Electron보다 낮아질 수 있음
```

---

## 6. 다른 솔루션과의 비교

### Wails — Go 버전의 Tauri

```
Tauri와 개념이 거의 동일:
  OS WebView 사용 (Chromium 번들 없음)
  네이티브 언어 백엔드

차이:
  Tauri:  Rust 백엔드
  Wails:  Go 백엔드

크기:
  둘 다 소형 (5~20MB 수준)

선택 기준:
  팀이 Rust → Tauri
  팀이 Go   → Wails
  사실상 언어 취향 차이
```

### Electron — 여전히 강자

```
Tauri가 앞서는 것:    크기, 메모리, 성능, 보안 기본값
Electron이 앞서는 것: 생태계, 레퍼런스, 안정성, 진입장벽

Tauri로 전환이 어려운 이유:
  기존 Electron 앱의 백엔드 로직 = Node.js
  → Rust로 재작성 필요
  → Electron 레거시가 많은 팀은 전환 비용 큼

새 프로젝트라면:
  Rust 팀 있음 → Tauri 검토 가치 높음
  Rust 팀 없음 → Electron이 현실적
```

### Flutter Desktop — 다른 철학

```
Flutter:
  OS WebView 사용 안 함
  자체 렌더링 엔진 (Skia / Impeller)
  → 플랫폼 불문 픽셀 완전 동일
  → Dart 언어

Tauri:
  OS WebView 사용
  → 플랫폼별 렌더링 차이 가능
  → 웹 기술 스택 (HTML/CSS/JS)

차이가 나는 상황:
  "모든 플랫폼에서 완전히 동일한 UI 필요"
  → Flutter가 유리

  "웹 기술 스택 그대로 쓰고 싶다"
  → Tauri가 유리

  모바일 + 데스크톱 동시 지원:
  → Tauri v2: 가능 (iOS/Android 추가)
  → Flutter: 원래부터 모바일 중심, 성숙도 높음
```

### NW.js — 레거시

```
NW.js (2011):
  Electron보다 먼저 나온 원조
  Tauri와 접근법 자체가 다름 (Chromium 번들)
  현재 신규 채택 이유 없음
```

### CEF (Chromium Embedded Framework)

```
CEF:
  C++ 레벨에서 Chromium 직접 임베딩
  Electron의 기반 기술

Tauri와의 차이:
  CEF: Chromium 번들 (Electron과 동일한 크기 문제)
  Tauri: OS WebView 사용

CEF를 직접 쓰는 경우:
  Spotify Desktop, 일부 게임 런처
  → 엔지니어링 자원이 풍부하고 세밀한 Chromium 제어 필요
  → Tauri가 갈 수 없는 영역 (예: Chromium 렌더 파이프라인 직접 수정)
```

### 전체 비교 요약

```
프레임워크    언어              크기      메모리    렌더링 일관성  성숙도
──────────────────────────────────────────────────────────────────────
Electron     JS/TS + HTML     대형       높음      ★★★★★        ★★★★★
Tauri        Rust + HTML      소형       낮음      ★★★          ★★★★
Wails        Go + HTML        소형       낮음      ★★★          ★★★
Flutter      Dart             중형       중간      ★★★★★        ★★★★
CEF          C++ + HTML       대형       높음      ★★★★★        ★★★★★
Qt           C++              소형       낮음      ★★★★★        ★★★★★

렌더링 일관성: 플랫폼 간 UI가 동일하게 보이는 정도
  Electron/CEF: Chromium 고정 → 완전 동일
  Flutter:      자체 엔진 → 완전 동일
  Tauri/Wails:  OS WebView → 플랫폼마다 다소 다를 수 있음
  Qt:           네이티브 위젯 → OS 스타일 따름
```

---

## 7. 언제 Tauri를 선택해야 하는가

```
Tauri가 맞는 상황:

✅ 새 프로젝트 + 팀에 Rust 개발자 있음
   → 학습 비용 없이 Tauri의 이점 그대로

✅ 패키지 크기·메모리가 핵심 요구사항
   → 시스템 트레이 앱, 경량 유틸리티

✅ 보안이 중요한 앱
   → 패스워드 관리자, 금융 도구, 암호화 앱
   → Capabilities 최소 권한 모델이 적합

✅ 데스크톱 + 모바일 동시 지원 (v2)
   → 하나의 코드베이스로 Win/Mac/Linux/iOS/Android

✅ CPU 집중 백엔드 로직이 있음
   → Rust 성능이 필요한 데이터 처리, 암호화

Tauri를 피해야 하는 상황:

❌ 팀 전원이 웹 개발자, Rust 전무
   → Rust 학습 곡선이 개발 속도를 잡아먹음

❌ 기존 Electron 앱을 마이그레이션
   → 백엔드 Node.js 로직을 Rust로 재작성 비용 큼

❌ 플랫폼 간 완전히 동일한 렌더링이 필수
   → WebKit vs Chromium 차이를 허용할 수 없다면 Electron

❌ 검증된 레퍼런스가 필요한 기업 환경
   → Electron이 아직 레퍼런스 압도적으로 많음
```

---

## 정리

Tauri는 Electron의 근본적 문제인 "Chromium을 통째로 들고 다닌다"를 해결했다. 크기와 메모리에서의 차이는 숫자로 보면 극적이다. 새 프로젝트에서 Rust 팀이 있다면 Tauri가 기술적으로 더 나은 선택이다.

그러나 Electron을 대체하기엔 아직 약점이 있다. OS WebView 버전 차이로 인한 렌더링 불일치, Rust 진입장벽, Electron만큼의 빅테크 레퍼런스 부재가 그것이다.

결론적으로 Tauri는 "Electron의 후계자"보다 "다른 포지션의 도구"에 가깝다. Electron이 개척한 시장에서, 더 가볍고 안전한 것을 원하는 새 프로젝트를 위해 존재한다. 기존 Electron 생태계를 뒤집기보다는, 새로운 선택지로 자리를 잡아가고 있다.

```
한 줄 판단 기준:

Rust 팀 있고 새 프로젝트    → Tauri 적극 검토
Rust 팀 없고 빠른 개발 필요 → Electron
모바일까지 하나로 커버      → Tauri v2 또는 Flutter
플랫폼 간 완전 동일 UI 필수 → Electron 또는 Flutter
```
