---
title: "개발자의 발표 시즌 — 각 기업의 컨퍼런스 캘린더와 특징"
date: 2026-07-02T23:00:00+09:00
draft: false
tags: ["컨퍼런스", "WWDC", "Google I/O", "Build", "AWS", "개발자"]
categories: ["개발문화"]
---

게이머에게 E3·게임스컴·닌텐도 다이렉트가 있다면, 개발자에게는 WWDC·Google I/O·Build·re:Invent가 있다. 어느 달에 어느 회사가 무엇을 발표하는지 알면, 한 해의 기술 트렌드를 미리 읽을 수 있다. 각 컨퍼런스의 시기, 성격, 그리고 "이 회사는 이런 발표를 이렇게 한다"는 특징까지 정리한다.

---

## 연간 캘린더 개요

```
1월  ────── CES (하드웨어 전반)
2월  ────── MWC (모바일)
3월  ────── GDC (게임 개발), NVIDIA GTC, KubeCon EU
4월  ────── Google Cloud Next
5월  ────── Google I/O, Microsoft Build
6월  ────── Apple WWDC
9월  ────── Apple 제품 발표 (아이폰), Meta Connect
10월 ────── GitHub Universe, Qualcomm Snapdragon Summit, KubeCon NA
11월 ────── AWS re:Invent, Samsung SDC
12월 ────── AWS re:Invent (일부 연도)
```

봄(4～6월)이 소프트웨어 플랫폼 발표의 집중 시기다. 연말(11～12월)은 클라우드와 인프라 발표가 많다.

---

## 1. Apple WWDC — 가장 연출이 정교한 발표

**Worldwide Developers Conference**
**시기**: 매년 6월 첫째 또는 둘째 주 월요일
**장소**: 온라인 (2020년부터) + Apple Park 현장 관람 (일부 참가자)

### 성격

Apple의 개발자 대상 연례 행사다. 제품 하드웨어 발표가 아니라 **소프트웨어 플랫폼과 개발 도구** 중심이다. 이 자리에서 iOS, macOS, watchOS, tvOS, visionOS의 차기 버전이 처음 공개된다.

```
WWDC에서 발표되는 것들:
  iOS/iPadOS  → 다음 버전 (예: iOS 19)
  macOS       → 다음 버전
  watchOS/tvOS
  Xcode       → 최신 버전 + 새 기능
  Swift       → 언어 업데이트
  SwiftUI     → UI 프레임워크 변화
  Metal       → 그래픽 API
  Core ML     → AI/ML 프레임워크
  새 API      → MapKit, ARKit, HealthKit 등 수백 개
  Apple Intelligence → AI 기능 (최근)
```

### 특징 — 철저한 비밀 유지와 연출

Apple의 WWDC는 업계에서 비밀 유지로 유명하다. 발표 전날까지 무엇이 나오는지 알 수 없다. 비공개 정보가 유출되면 내부적으로 조사가 시작된다는 소문도 있다.

키노트(Keynote)는 사전에 촬영된 영상이다. 2020년부터 온라인 전환 후 더욱 영화처럼 제작된다. 촬영·편집·음악·타이밍이 한 편의 단편 영화 수준이다.

키노트 이후 일주일간 수백 개의 **세션 영상**이 공개된다. 각 새로운 API나 프레임워크에 대해 Apple 엔지니어가 직접 설명하는 30～60분짜리 세션들이다. 개발자라면 관심 분야의 세션을 챙겨보는 것이 필수다.

**Lab (실습)**: 현장 또는 화상으로 Apple 엔지니어와 1:1로 자신의 코드 문제를 상담할 수 있다. 유료 개발자 멤버십 보유자 대상.

**Apple Design Awards**: WWDC에서 그해 가장 뛰어난 앱·게임에 시상한다. 수상하면 App Store 홍보와 함께 개발사의 인지도가 크게 오른다.

### 주목해야 하는 이유

WWDC에서 발표된 API와 기능은 그해 9월 iOS 정식 출시와 함께 수억 대 기기에 배포된다. Apple 플랫폼 개발자에게는 연중 가장 중요한 3시간이다. 이날 발표를 모르고 개발하면 시대에 뒤처진 방식으로 앱을 만들게 된다.

---

## 2. Google I/O — AI 중심으로 피벗한 플랫폼 발표

**Google I/O**
**시기**: 매년 5월 (보통 둘째 주 화·수·목)
**장소**: Shoreline Amphitheatre (마운틴뷰, 캘리포니아) + 온라인

### 성격

Google의 개발자 대상 연례 행사. Android, Flutter, Firebase, Chrome, Web API가 주무대였다. 2023년부터 **AI(Gemini)** 발표가 키노트의 절반 이상을 차지하면서 성격이 크게 바뀌었다.

```
Google I/O에서 발표되는 것들:
  Android  → 다음 버전 (예: Android 16)
  Flutter  → UI 프레임워크 업데이트
  Firebase → 백엔드 서비스 업데이트
  Gemini   → AI 모델, API, 기능
  Chrome   → 새 Web API
  Google Cloud (일부)
  Wear OS, Google TV
  ARCore   → 증강현실 SDK
```

### 특징 — 개방적이고 실험적

Apple WWDC와 비교하면 Google I/O는 더 개방적이다. 발표 전 일부 내용이 유출되거나 공식 예고편이 올라오기도 한다. 키노트도 실시간으로 공개된다.

**"실험적" 발표가 많다.** Google은 I/O에서 아직 출시되지 않은 기능, 연구 단계 프로젝트를 자주 보여준다. 그것이 실제로 제품이 되는 경우도 있고, 사라지는 경우도 있다.

**Codelabs**: 새 기술을 직접 실습하는 가이드. I/O 발표 내용을 바로 따라 해볼 수 있다. 온라인으로 무료 공개된다.

**Extended events**: 전 세계 GDG(Google Developer Group) 커뮤니티에서 I/O를 함께 보는 오프라인 모임이 열린다. 한국에도 Google I/O Extended Korea가 있다.

### 최근 변화

2023년부터 Gemini AI 발표가 I/O의 중심이 됐다. Android 업데이트보다 AI 기능 발표에 시간이 더 많이 할당된다. Flutter, Firebase 세션은 분리된 시간대로 밀렸다. Google의 전략 방향을 그대로 반영한다.

---

## 3. Microsoft Build — 클라우드·AI·개발 도구의 교차점

**Microsoft Build**
**시기**: 매년 5월 (Google I/O와 비슷한 시기)
**장소**: 시애틀 컨벤션 센터 + 온라인

### 성격

Microsoft의 개발자 대상 연례 행사. Azure, Windows 개발, .NET, GitHub, Visual Studio Code, Copilot이 주요 주제다. 세 컨퍼런스(WWDC, I/O, Build) 중 가장 **기업(Enterprise)** 색채가 강하다.

```
Build에서 발표되는 것들:
  Azure          → 새 클라우드 서비스
  GitHub         → Copilot, Actions, 새 기능
  .NET           → 언어·프레임워크 업데이트
  VS Code        → 확장과 새 기능
  Windows 개발   → WinUI, MSIX, 패키지 관리
  AI/Copilot     → Microsoft 365 Copilot, Azure OpenAI
  PowerShell     → 업데이트
  WSL, WinGet    → 개발자 도구
```

### 특징 — 역사적 발표들이 여기서 나왔다

WSL이 2016년 Build에서 처음 발표됐다. GitHub Copilot, Azure OpenAI Service도 Build를 통해 공개됐다.

Build는 키노트 외에도 하루 종일 여러 세션이 병렬로 진행된다. 주제가 Azure에서 Minecraft Bedrock까지 넓다. 개발자가 관심 트랙을 선택해 볼 수 있다.

**기조연설자의 특성**: Satya Nadella가 직접 무대에 서는 경우가 많다. "생산성과 협업", "개발자 힘 부여"라는 메시지가 반복된다. Azure와 Copilot 중심으로 메시지가 집중된다.

**온라인 접근성**: Build는 모든 세션을 무료로 온라인 중계한다. Microsoft Learn에 이후 녹화 영상이 전부 올라온다.

---

## 4. AWS re:Invent — 클라우드 인프라의 슈퍼볼

**AWS re:Invent**
**시기**: 매년 11월 말 ～ 12월 초
**장소**: 라스베이거스 (여러 호텔 동시 사용)
**규모**: 약 5～6만 명 참가자

### 성격

Amazon Web Services의 연례 컨퍼런스. 규모로는 이 목록에서 압도적 1위다. 라스베이거스의 호텔 여러 곳을 동시에 사용하고, 일주일간 진행된다.

```
re:Invent에서 발표되는 것들:
  새 AWS 서비스 (연간 수십~수백 개)
  기존 서비스 업데이트
  요금 변경
  파트너십
  AI/ML (Bedrock, SageMaker 등)
  보안, 네트워킹, 데이터베이스
  서버리스, 컨테이너
```

### 특징 — 양으로 압도한다

re:Invent는 "발표의 홍수"로 유명하다. 키노트 하나에서 수십 개의 새 서비스와 기능이 발표되는 것이 보통이다. 일주일간 발표되는 새 서비스·기능을 전부 따라가는 것이 불가능할 정도다.

**복수의 키노트**: Adam Selipsky(AWS CEO), Werner Vogels(CTO)가 각각 키노트를 한다. CEO 키노트는 비즈니스·전략, CTO 키노트는 기술적 깊이가 다르다.

**비용이 많이 드는 컨퍼런스**: 라스베이거스 왕복 항공권 + 호텔 + 등록비(약 2,100달러). 기업이 보내주지 않으면 개인이 참가하기 부담스럽다. 온라인으로도 주요 세션을 볼 수 있다.

**"혁신가(Builder)" 문화**: 발표에서 "Builder"라는 표현을 반복 사용한다. AWS를 쓰는 개발자·아키텍트를 "빌더"라고 부른다. 커뮤니티 문화를 강조하는 방식이다.

**re:Play**: 마지막 날 밤에 열리는 대규모 파티. 유명 DJ가 공연한다. 참가자들 사이에서 re:Invent의 명물로 여겨진다.

---

## 5. NVIDIA GTC — AI 시대의 가장 뜨거운 발표

**GPU Technology Conference**
**시기**: 매년 3월 (봄 GTC) + 가끔 추가 이벤트
**장소**: SAP Center (새너제이) + 온라인

### 성격

원래 GPU·그래픽 개발자 대상 컨퍼런스였다. 2020년대 들어 AI·딥러닝·데이터센터가 중심이 됐다. NVIDIA의 새 GPU 아키텍처, AI 플랫폼, CUDA 업데이트가 주요 발표다.

```
GTC에서 발표되는 것들:
  새 GPU 아키텍처 (Hopper, Blackwell 등)
  CUDA 버전 업데이트
  cuDNN, TensorRT 업데이트
  NIM (NVIDIA Inference Microservices)
  Omniverse (3D 협업 플랫폼)
  Isaac (로봇 AI)
  DRIVE (자율주행 AI)
  새 DGX 시스템
```

### 특징 — 젠슨 황의 퍼포먼스

**Jensen Huang(젠슨 황)** NVIDIA CEO의 키노트가 GTC의 핵심이다. 검은 가죽 재킷을 입고 2～3시간짜리 키노트를 혼자 진행한다. "One more thing" 스타일로 마지막에 깜짝 발표를 넣는 경우가 많다.

Blackwell 아키텍처 발표(2024) 키노트에서 젠슨 황이 실제 Blackwell GPU 웨이퍼를 들고 나와 "아름답다"고 말하는 장면이 밈이 됐다.

AI 산업의 관심이 NVIDIA에 집중되면서 GTC 키노트의 시청자 수가 폭발적으로 늘었다. 2024년 키노트는 수백만 명이 온라인으로 시청했다.

---

## 6. Google Cloud Next — 구글의 기업용 발표

**시기**: 매년 4월
**장소**: 라스베이거스 만달레이 베이 + 온라인

### 성격

Google Cloud의 기업 고객과 개발자 대상 컨퍼런스. Google I/O가 소비자·모바일 개발자 중심이라면, Cloud Next는 기업 IT·클라우드 아키텍트·DevOps 중심이다.

```
Cloud Next에서 발표되는 것들:
  새 GCP 서비스 (BigQuery, Spanner, Vertex AI 등)
  Workspace (Gmail, Docs) 업데이트
  Gemini API 기업용 기능
  Kubernetes, Anthos 업데이트
  보안 서비스
  파트너 솔루션
```

### 특징

AWS re:Invent보다 규모가 작지만, Google의 AI 전략이 강조되면서 주목도가 높아졌다. Gemini와 연계된 기업용 AI 기능이 최근 발표의 핵심이다.

---

## 7. Meta Connect — VR/AR 생태계 발표

**시기**: 매년 9월 ～ 10월
**장소**: 온라인 + 현장 (매년 다름)
**이전 이름**: Oculus Connect

### 성격

Meta의 VR/AR 플랫폼 개발자 대상 컨퍼런스. Quest 헤드셋 신제품, Horizon OS, VR 개발 도구, 메타버스 전략이 주요 발표다.

```
Connect에서 발표되는 것들:
  새 Quest 헤드셋 (하드웨어)
  Horizon OS 업데이트
  VR 개발 도구 (Unity/Unreal 연동)
  새 VR 앱·게임
  AI 기능 (Meta AI)
  Ray-Ban 스마트 안경 업데이트
```

### 특징

마크 저커버그가 직접 키노트를 진행한다. VR 헤드셋을 쓰고 등장하거나, 메타버스 아바타로 발표하는 연출을 종종 한다. 생태계가 아직 성숙하지 않아 매년 "올해는 진짜 도약"을 외치는 패턴이 반복된다.

게이밍·엔터테인먼트뿐 아니라 기업용 협업 도구(Quest for Business)에도 힘을 싣고 있다.

---

## 8. GitHub Universe — 개발자 도구의 핵심

**시기**: 매년 10월 ～ 11월
**장소**: 샌프란시스코 + 온라인

### 성격

GitHub의 연례 컨퍼런스. GitHub Copilot, Actions, Codespaces, GitHub Advanced Security 등의 새 기능이 발표된다. Microsoft Build에서 일부 발표되는 내용과 겹치지만, GitHub Universe는 더 개발자 도구에 특화됐다.

```
Universe에서 발표되는 것들:
  GitHub Copilot 업데이트
  Actions 새 기능
  Codespaces 업데이트
  GitHub Advanced Security
  Dependabot 업데이트
  오픈소스 관련 발표
```

### 특징

GitHub CEO의 키노트와 함께 개발자 커뮤니티 행사 성격이 강하다. 발표보다 커뮤니티 교류에 방점이 있다. GitHub Copilot의 AI 기능이 중심이 된 이후 관심도가 높아졌다.

---

## 9. KubeCon + CloudNativeCon — 오픈소스 클라우드의 축제

**주최**: CNCF (Cloud Native Computing Foundation)
**시기**: 연 2회 — 봄 (3～4월, 유럽) + 가을 (10～11월, 북미)
**규모**: 1만 명 이상

### 성격

Kubernetes, Prometheus, Envoy, Istio, Argo 등 CNCF 프로젝트 생태계 개발자들의 컨퍼런스. 특정 기업이 아닌 오픈소스 커뮤니티 중심이다.

```
KubeCon에서 다루는 것들:
  Kubernetes 새 기능·릴리즈
  서비스 메시 (Istio, Linkerd)
  관측가능성 (OpenTelemetry, Prometheus, Grafana)
  GitOps (Argo, Flux)
  보안 (Falco, OPA)
  AI/ML 워크로드 on K8s
  각 CNCF 프로젝트 현황
```

### 특징

기업 컨퍼런스와 달리 **발표자가 커뮤니티 기여자, 현장 엔지니어**다. "우리가 Kubernetes로 X를 어떻게 해결했다"는 실제 사례 발표가 많다. 특정 회사의 마케팅 발표가 아닌, 엔지니어가 엔지니어에게 하는 발표다.

티켓 가격이 상대적으로 저렴하고(약 800～1,200달러), 학생 할인과 다양성 장학금도 제공한다.

---

## 10. NVIDIA GDC 주변 발표 / Epic State of Unreal

**GDC (Game Developers Conference)**
**시기**: 매년 3월
**장소**: 샌프란시스코 모스콘 센터

GDC는 게임 개발자 컨퍼런스지만, 그 주변에 주요 발표들이 몰린다.

**Epic Games "State of Unreal"**: GDC 직전에 Unreal Engine의 새 버전, 기능을 공개한다. UE5, Nanite, Lumen 같은 기술이 State of Unreal에서 처음 시연됐다.

**Unity Unite**: Unity 엔진의 연례 개발자 컨퍼런스. 시기가 해마다 다르다.

---

## 11. 하드웨어 중심 컨퍼런스

### CES (Consumer Electronics Show)
**시기**: 매년 1월 첫째 주
**장소**: 라스베이거스

소비자 가전 전시회. 개발자 컨퍼런스는 아니지만, 새 하드웨어 폼팩터·칩셋 발표가 여기서 나온다. Intel, AMD, NVIDIA, Qualcomm이 새 제품·아키텍처를 발표하는 경우가 있다. 개발자가 타깃 하드웨어를 파악하는 기준점이 된다.

### Qualcomm Snapdragon Summit
**시기**: 매년 10월 ～ 11월
**장소**: 마우이 (하와이) 또는 하와이

새 Snapdragon 칩셋 발표. Android 제조사들이 내년도 플래그십에 사용할 모바일 AP가 여기서 처음 공개된다. Android 앱 개발자라면 새 칩의 GPU, NPU, AI 기능이 앱에 어떤 영향을 주는지 파악해야 한다.

### Intel Innovation
**시기**: 매년 10월
**장소**: 새너제이

Intel의 새 CPU 아키텍처, 개발 도구, oneAPI 업데이트. 이전에는 Intel Developer Forum(IDF)이었으나 2017년 종료, Innovation으로 재편됐다.

### MWC (Mobile World Congress)
**시기**: 매년 2월 말 ～ 3월 초
**장소**: 바르셀로나

이동통신·모바일 업계 최대 전시회. 새 스마트폰 발표, 5G/6G 기술, Android 생태계 동향. 개발자보다는 제조사·통신사 중심이지만, 모바일 폼팩터 변화를 읽는 데 중요하다.

---

## 12. 커뮤니티·언어 특화 컨퍼런스

대형 기업 컨퍼런스 외에 언어·기술 특화 커뮤니티 행사들이 있다.

| 컨퍼런스 | 주제 | 시기 |
|---|---|---|
| PyCon US | Python | 5월 |
| RustConf | Rust 언어 | 9월 |
| JSConf | JavaScript | 시기 다양 |
| RailsConf | Ruby on Rails | 4～5월 |
| QCon | 소프트웨어 아키텍처 | 연 2회 |
| DockerCon | 컨테이너 | 시기 다양 |
| HashiConf | Terraform, Vault 등 | 10월 |
| MongoDB World | MongoDB | 6월 |
| Kafka Summit | Apache Kafka | 연 2회 |
| re:Inforce | AWS 보안 특화 | 6월 |

---

## 각 컨퍼런스의 "온도" 비교

기업마다 발표 스타일이 다르다.

```
비밀 유지 정도:
  Apple WWDC    ████████████ 극도로 비밀 (전날까지 모름)
  NVIDIA GTC    ████████░░░░ 유출 거의 없음
  Microsoft Build ██████░░░░░░ 일부 사전 유출
  Google I/O    ████░░░░░░░░ 일부 사전 발표 있음
  AWS re:Invent ██░░░░░░░░░░ 점진적 공개

연출 완성도:
  Apple WWDC    ████████████ 영화 수준 편집
  NVIDIA GTC    ██████████░░ 젠슨 황 원맨쇼
  Google I/O    ████████░░░░ 세련된 프레젠테이션
  Microsoft Build ██████░░░░░░ 실용적
  AWS re:Invent ████░░░░░░░░ 내용 중심, 연출 미흡

발표 양:
  AWS re:Invent ████████████ 수십~수백 개
  Google I/O    ████████░░░░ 많음
  Microsoft Build ██████░░░░░░ 중간
  NVIDIA GTC    ████░░░░░░░░ 핵심 위주
  Apple WWDC    ████░░░░░░░░ 핵심 위주, 세션은 많음

기업용 색채:
  AWS re:Invent ████████████
  Microsoft Build ██████████░░
  Google Cloud Next ████████░░░░
  GitHub Universe █████░░░░░░░
  Google I/O    ██░░░░░░░░░░ (소비자·개발자 중심)
  Apple WWDC    █░░░░░░░░░░░ (소비자·개발자)
```

---

## 개발자가 챙겨봐야 할 우선순위

모든 컨퍼런스를 다 볼 수는 없다. 역할에 따라 우선순위가 달라진다.

**iOS/macOS 개발자**
→ Apple WWDC (필수)

**Android 개발자**
→ Google I/O (필수) + Qualcomm Snapdragon Summit

**웹 프론트엔드 개발자**
→ Google I/O (Chrome, Web API), GitHub Universe

**백엔드/클라우드 개발자**
→ AWS re:Invent (필수), Google Cloud Next, Microsoft Build 중 사용 클라우드 선택

**AI/ML 개발자**
→ NVIDIA GTC (필수), Google I/O (Gemini), Microsoft Build (Copilot)

**DevOps/인프라 엔지니어**
→ KubeCon, AWS re:Invent, GitHub Universe

**게임 개발자**
→ GDC, Epic State of Unreal, Unity Unite

**모든 개발자**
→ GitHub Universe (GitHub은 거의 모든 개발자가 씀)

---

## 정리

```
봄 (4~6월) = 플랫폼/OS 발표 시즌
  Google Cloud Next (4월)
  Google I/O / Microsoft Build (5월)
  Apple WWDC (6월)

가을 (9~11월) = 하드웨어/인프라 발표 시즌
  Meta Connect (9~10월)
  Qualcomm Snapdragon Summit (10~11월)
  GitHub Universe (10~11월)
  AWS re:Invent (11~12월)

겨울/봄 = 기술 선행 발표
  CES (1월) — 하드웨어 폼팩터
  MWC (2~3월) — 모바일
  NVIDIA GTC (3월) — AI/GPU

게임 업계의 E3/게임스컴처럼:
  개발자에게 이 캘린더가 한 해의 리듬이다.
  "빌드에서 Copilot 발표 → WWDC에서 Apple Intelligence →
   re:Invent에서 Bedrock 업데이트"
  이런 흐름으로 AI 기능의 발전을 추적할 수 있다.
```

컨퍼런스 시즌을 따라가다 보면 기술 트렌드가 보인다. 어떤 회사가 AI에 집중하고, 어떤 회사가 클라우드를 강화하고, 어떤 플랫폼이 개발자를 유인하려 하는지가 발표의 우선순위와 연출에서 드러난다.
