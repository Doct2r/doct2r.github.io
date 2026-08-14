---
title: "Electron — 왜 나왔고, 무엇이 문제이며, 지금은 어디에 쓰는가"
date: 2026-07-04T12:00:00+09:00
draft: false
tags: ["Electron", "크로스플랫폼", "데스크톱", "Node.js", "Tauri", "프레임워크"]
categories: ["프로그래밍"]
---

웹 개발자가 데스크톱 앱을 만들고 싶을 때 가장 먼저 떠오르는 이름이 Electron이다. VS Code, Slack, Discord, Notion이 전부 Electron으로 만들어졌다. "그런데 왜 이렇게 느리고 무거운가?"라는 불만도 함께 따라온다. Electron이 왜 생겼고, 실제로 무엇이 문제인지, 그리고 지금 어디에 쓰는 게 맞는지를 정리한다.

---

## 1. Electron이 나온 이유

### 2013년의 데스크톱 개발 환경

Electron이 등장하기 전, 크로스 플랫폼 데스크톱 GUI를 만들려면 선택지가 거의 없었다.

```
크로스 플랫폼 데스크톱 GUI (2013년 기준):

Qt:
  장점: 성능 우수, 진짜 크로스 플랫폼
  단점: C++ 기반, 상업용 라이선스 비용, 진입장벽 높음

wxWidgets:
  장점: 네이티브 룩앤필
  단점: C++ API 복잡, 커뮤니티 작음

Java Swing / JavaFX:
  장점: 크로스 플랫폼
  단점: JVM 의존, 실행 속도 느림, 룩앤필 어색함

.NET WinForms / WPF:
  Windows 전용 (당시 Xamarin은 초기 단계)

결론:
  네이티브 성능이 필요하면 C++ (Qt)
  간단하면 Java, 하지만 둘 다 웹 개발자가 쓰기 어려움
```

### GitHub이 Atom을 만들던 2013년

GitHub은 웹 회사다. 루비·자바스크립트가 주력이었다. "웹 기술로 코드 에디터를 만들자"는 목표로 Atom 에디터 개발이 시작됐고, 이를 위해 내부적으로 만든 것이 **Atom Shell**이다. 2015년 이름이 **Electron**으로 바뀌며 독립 프로젝트로 공개됐다.

```
Electron의 핵심 아이디어:
  "브라우저가 OS 위에서 앱을 실행하듯이,
   Chromium을 앱 컨테이너로 쓰면 되지 않나?"

  + 브라우저가 할 수 없는 것 (파일 시스템, 네이티브 API)
    → Node.js로 채운다

결과:
  Chromium (렌더링) + Node.js (시스템 접근) = Electron
```

타이밍도 절묘했다. 2009년 Node.js, 2010년 npm이 나오면서 자바스크립트 생태계가 폭발적으로 성장하던 시기였다. 웹 개발자가 급격히 늘어났고, 이들이 데스크톱 앱을 만들 수 있는 도구가 필요했다.

---

## 2. 구조 — 어떻게 작동하는가

```
Electron 앱의 프로세스 구조:

┌─────────────────────────────────────────┐
│  Main Process (Node.js)                 │
│  - 앱 생명주기 관리                       │
│  - 파일 시스템, OS API 접근               │
│  - 메뉴, 트레이, 알림                     │
│  - 창(BrowserWindow) 생성                │
│  - IPC 허브                              │
└──────────────┬──────────────────────────┘
               │ IPC (ipcMain / ipcRenderer)
    ┌──────────┴──────────────────┐
    │                             │
┌───▼──────────┐        ┌────────▼─────────┐
│ Renderer #1  │        │ Renderer #2      │
│ (Chromium)   │        │ (Chromium)       │
│ - HTML/CSS/JS│        │ - 창마다 별도     │
│ - UI 렌더링  │        │   프로세스        │
└──────────────┘        └──────────────────┘

각 Renderer는 격리된 Chromium 프로세스
→ 창이 많을수록 메모리 사용량 선형 증가
```

Chromium 자체가 멀티 프로세스 아키텍처다 (탭마다 별도 프로세스). Electron은 이 구조를 그대로 가져온다. 브라우저에서 탭이 하나씩 프로세스를 쓰듯, Electron 앱의 창마다 별도 프로세스가 뜬다.

```
보안 모델 (Electron v12+ 기본값):

contextIsolation: true
  → Renderer가 Node.js에 직접 접근 불가
  → preload.js를 통해 필요한 API만 노출

sandbox: true
  → Renderer를 완전히 격리된 환경에서 실행

ipcRenderer → ipcMain → Node.js API → 결과 반환
  → 중간에 검증 레이어를 끼워넣을 수 있음

(과거에는 nodeIntegration: true가 기본값이었음
 → Renderer에서 Node.js 직접 접근 가능
 → XSS 취약점이 곧 시스템 접근 취약점)
```

---

## 3. 장점

### 웹 스택 그대로 사용

```
기술 스택 진입장벽:
  네이티브 개발: Obj-C/Swift (Mac), C++/C# (Win), C++ (Linux) → 별도 학습
  Electron:     HTML + CSS + JavaScript (TypeScript)
                → 프론트엔드 개발자가 즉시 투입 가능

개발 도구:
  Chrome DevTools를 그대로 사용
  → 익숙한 브레이크포인트, 네트워크 탭, 콘솔
  → 웹 디버깅과 동일한 경험
```

### npm 생태계 전부

```
npm 패키지 수 (2024): 약 200만 개
  → 인증, 암호화, HTTP, 파싱, UI 라이브러리 전부 사용 가능
  → 네이티브 C++ 애드온도 node-gyp로 포함 가능

실제로 쓰는 것들:
  - React / Vue / Svelte (UI)
  - electron-store (로컬 설정 저장)
  - electron-updater (자동 업데이트)
  - better-sqlite3 (로컬 DB)
```

### 크로스 플랫폼 하나의 코드베이스

```
플랫폼별 분기가 필요한 경우:
  - 파일 경로 구분자 (자동 처리됨)
  - 메뉴 위치 (Mac: 메뉴바 / Win: 앱 내부)
  - 알림 API (Notification API로 통일)

실제 플랫폼 분기 코드:
  if (process.platform === 'darwin') { /* Mac 전용 */ }
  if (process.platform === 'win32')  { /* Windows 전용 */ }

나머지 99%는 동일한 코드로 동작
```

---

## 4. 단점과 한계

### 메모리

```
Electron 앱 메모리 사용량 (실 측정치):

VS Code (창 하나 + 확장 없음): 약 250~400MB
Slack (채널 목록 보는 상태):   약 500MB~1GB
Discord:                       약 300~600MB
Notion:                        약 400~700MB

비교:
  메모장 (Windows): ~10MB
  네이티브 채팅앱:  ~50~100MB

이유:
  Chromium 렌더링 엔진 자체가 무거움
  V8 엔진 + JIT 컴파일러 메모리
  창마다 별도 프로세스 (각각 Chromium 인스턴스)
  Node.js 런타임
  → 앱 로직과 무관하게 기본 200MB는 소비
```

### 실행 파일 크기

```
패키징 시 포함되는 것:
  Chromium 바이너리: ~100MB
  Node.js 런타임:   ~20MB
  앱 코드:          수MB ~ 수십MB

결과:
  Hello World 수준의 Electron 앱: 설치 파일 ~50~100MB
  실제 앱: 150~300MB

비교:
  Tauri (동일 기능): 5~15MB
  네이티브 앱:       수MB
```

### 성능

```
CPU 집중 작업:
  이미지·영상 처리, 암호화, 대용량 파싱
  → JS는 네이티브 코드 대비 여전히 느림
  → Node.js Worker Thread로 일부 완화 가능
  → 무거운 작업은 C++ Native Module 필요

렌더링:
  Chromium이 렌더링하므로 CSS/DOM 중심
  → 3D 그래픽, 실시간 애니메이션: 한계 있음
  → WebGL로 어느 정도 커버 가능

초기 로딩:
  Chromium 엔진 초기화 시간 존재
  → 가벼운 앱임에도 체감 로딩이 있음
```

### 보안 (구조적 주의 필요)

```
위협 시나리오:
  Renderer가 외부 URL을 로드 → XSS 발생
  → nodeIntegration: true이면 시스템 명령 실행 가능

현재 기본값 (Electron v12+):
  contextIsolation: true (Renderer 격리)
  sandbox: true
  → 방어됨, 하지만 설정을 잘못 풀면 즉시 취약

예전 코드베이스가 위험한 이유:
  2018년 이전 Electron 앱 상당수가
  nodeIntegration: true로 만들어졌음
  → 업그레이드 안 하면 구조적 취약점 유지
```

---

## 5. 빅테크와 유명 사례

### 시장을 만든 앱들

```
VS Code (Microsoft, 2015~현재):
  Electron 성공을 증명한 케이스
  무거움에도 개발자 에디터 1위 유지
  → 풍부한 확장 생태계 + 웹 기반 UI 자유도가 이겼음
  → 확장도 HTML/JS로 만들기 때문에 생태계 성장이 쉬움

Slack (Salesforce, 2013~현재):
  기업 메신저 1위
  메모리 사용량으로 악명 높음
  2019년에 일부 WebSocket 통신 레이어를 네이티브로 교체
  → 완전히 버리지는 않음, 지금도 Electron

Discord (2015~현재):
  게이밍 커뮤니티 메신저
  Electron 기반이지만 음성/영상은 WebRTC + 네이티브 모듈
  → 무거운 작업만 선택적으로 네이티브 처리

Figma Desktop (2021~현재):
  웹 앱을 데스크톱으로 래핑한 케이스
  렌더링 핵심은 WebGL (Chromium이 처리)
  → 2D CAD 수준의 성능을 브라우저에서 구현

GitHub Desktop (GitHub):
  Git GUI 클라이언트
  원조 Atom과 같은 팀이 만듦

WhatsApp Desktop (Meta):
  웹앱 래핑 형태

Notion Desktop:
  마찬가지로 웹앱 래핑
  → 웹과 데스크톱이 사실상 동일한 코드베이스

Atom (GitHub, 2008~2022):
  Electron의 원조
  VS Code에 밀려 2022년 서비스 종료
  (VS Code도 Electron이라는 아이러니)
```

### Microsoft Teams의 경우

```
Microsoft Teams v1 (2017~2023):
  Electron 기반
  메모리 사용량이 Slack과 함께 워스트 케이스로 자주 거론됨

Microsoft Teams v2 (2023~현재):
  React Native for Desktop으로 전면 재작성
  메모리 사용량 절반 이하로 감소, 실행 속도 개선
  → Electron의 한계를 인정하고 이탈한 대형 사례
```

---

## 6. 이럴 때 사용하자

```
Electron이 적합한 상황:

✅ 팀 전체가 웹 개발자
   네이티브 개발자 없음 → Electron이 현실적 유일 선택

✅ 이미 웹앱이 있고 데스크톱으로 래핑만 필요
   Notion, Figma처럼 웹 ↔ 데스크톱 동일 코드베이스

✅ 파일 시스템 접근이 필요한데 PWA로 부족
   브라우저 샌드박스 밖의 파일 작업 필요 시

✅ B2B 내부 도구, 사내 관리 툴
   사용자가 제한적 → 메모리 비용보다 개발 속도 중요

✅ MVP, 프로토타입
   빠른 시장 검증이 목표 → 네이티브 최적화는 나중에

✅ 풍부한 UI가 필요한 생산성 앱
   CSS로 자유도 극대화, 디자인 시스템 웹과 공유
```

```
Electron을 피해야 하는 상황:

❌ 경량 시스템 트레이 앱
   알림이나 상태 표시용 → 200MB 오버헤드가 납득 안 됨

❌ CPU/GPU 집중 작업
   영상 인코딩, 3D 렌더링, 실시간 신호 처리

❌ 배터리 민감한 환경
   Chromium 렌더링 루프가 지속적으로 CPU 사용

❌ 패키지 크기가 제약인 환경
   임베디드, 저장공간 제한 기기

❌ 빠른 시작이 핵심인 앱
   런처, 빠른 메모 같은 즉각 반응 요구 앱
```

---

## 7. 자매품 — 유사한 프레임워크들

### Tauri — 현실적인 다음 선택지

```
등장: 2022년 v1.0 (Rust 기반)

Electron과의 차이:
  Electron:  Chromium 번들 동봉
  Tauri:     OS 기본 WebView 사용 (WKWebView/WebView2/WebKitGTK)

패키지 크기:
  Electron: 100~200MB
  Tauri:    3~15MB

메모리:
  Electron: 200MB+
  Tauri:    ~50MB (WebView 공유)

백엔드:
  Electron: Node.js (JavaScript)
  Tauri:    Rust (성능, 메모리 안전성)

단점:
  OS별 WebView 버전이 달라 렌더링 미세 차이 가능
  Windows: WebView2 (Chromium 기반, 비교적 안정)
  Mac:     WKWebView (Safari 엔진)
  Linux:   WebKitGTK (버전 편차 있음)
  Rust 진입장벽 (프론트엔드 개발자에게)

선택 기준:
  번들 크기·메모리가 중요 → Tauri
  팀이 Rust 모름 + 빠른 개발 필요 → Electron
```

### NW.js — Electron의 선배

```
등장: 2011년 (Node-WebKit)

Electron과의 차이:
  NW.js:     Renderer에서 Node.js 직접 접근 가능
  Electron:  Main-Renderer IPC 분리

역사적 위치:
  Electron이 나오기 전의 원조
  현재는 시장 점유율 낮음
  → 레거시 유지 목적으로만 사용
```

### Flutter Desktop — 독자 렌더링

```
등장: 2021년 안정화 (Google, Dart 언어)

특징:
  시스템 WebView 없음
  Skia/Impeller 자체 렌더링 엔진
  → 플랫폼 무관하게 픽셀 완전 동일
  → "같은 UI를 다 플랫폼에서 픽셀 단위로 동일하게"

장점:
  Win/Mac/Linux/iOS/Android 하나의 코드베이스
  네이티브에 가까운 성능
  Google의 강력한 지원

단점:
  Dart 언어 (웹 생태계 아님, 별도 학습)
  데스크톱은 모바일보다 성숙도 낮음
  npm 생태계 사용 불가

선택 기준:
  모바일 + 데스크톱 동시 지원 필요 → Flutter
  웹 기술 스택 유지 필요 → Electron/Tauri
```

### CEF (Chromium Embedded Framework) — Electron의 기반

```
Electron은 CEF 위에서 만들어짐
CEF를 직접 쓰면:

장점:
  Chromium 동작을 C++ 레벨에서 완전 제어
  Electron이 제공하지 않는 저수준 커스터마이징

단점:
  C++ 코드 직접 작성
  Electron이 해주는 편의 기능 없음
  빌드 복잡

사용 사례:
  Spotify Desktop (CEF 직접 사용)
  게임 런처류 (Origin, 일부 스팀 컴포넌트)
  → 엔지니어링 자원이 충분하고 세밀한 제어 필요할 때
```

### 정리 비교

```
프레임워크     언어              크기     메모리    성숙도
─────────────────────────────────────────────────────────
Electron      JS/TS + HTML      대형     높음      매우 높음 ★★★★★
Tauri         Rust + JS/TS HTML 소형     낮음      높음      ★★★★
NW.js         JS + HTML         대형     높음      중간 (레거시)
Flutter       Dart              중형     중간      높음      ★★★★
CEF           C++ + HTML        중형     높음      높음 (B2B)
Qt            C++               소형     낮음      매우 높음 ★★★★★
```

---

## 정리

Electron이 나온 이유는 단순하다. 2013년에 웹 개발자가 데스크톱 앱을 만들 방법이 없었다. Chromium + Node.js라는 조합은 "브라우저로 앱을 만든다"는 발상을 현실로 만들었고, VS Code와 Slack이 그것이 통한다는 것을 증명했다.

단점도 명확하다. Chromium을 통째로 들고 다니기 때문에 무겁고, 파일이 크고, 배터리를 쓴다. 2022년부터 Tauri가 현실적인 대안이 됐고, Microsoft Teams는 이미 이탈했다.

그럼에도 Electron은 여전히 유효하다. 웹 스택으로 빠르게 데스크톱 앱을 만들어야 할 때, npm 생태계 전부를 써야 할 때, 웹앱과 코드를 공유해야 할 때는 Electron이 가장 빠른 선택이다. 메모리와 크기가 허용 가능한 범위라면 검증된 최선이다.

```
선택 공식:

가벼움·크기가 중요하다  → Tauri
모바일도 함께 간다      → Flutter
빠른 개발, 웹 스택 유지 → Electron
C++로 완전 제어 필요    → CEF / Qt
```
