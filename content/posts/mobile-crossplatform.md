---
title: "모바일 크로스 플랫폼 — 하나의 코드로 iOS와 Android를 잡을 수 있는가"
date: 2026-07-04T14:00:00+09:00
draft: false
tags: ["모바일", "크로스플랫폼", "React Native", "Flutter", "KMP", "Capacitor", "iOS", "Android"]
categories: ["프로그래밍"]
---

모바일 앱을 만들 때 가장 먼저 부딪히는 현실이 있다. iOS와 Android는 언어도 다르고, UI 시스템도 다르고, 철학도 다르다. 두 팀을 따로 꾸리거나, 한 팀이 두 배로 일하거나, 둘을 동시에 공략하는 도구를 쓰거나 — 세 갈래뿐이다. 모바일 크로스 플랫폼은 세 번째 선택지를 만들기 위한 40년 가까운 시도다.

---

## 1. 왜 크로스 플랫폼이 필요한가

### 두 플랫폼의 간극

```
iOS 네이티브:
  언어:  Swift / Objective-C
  UI:    UIKit (코드) / SwiftUI (선언형)
  배포:  App Store
  IDE:   Xcode (Mac 전용)

Android 네이티브:
  언어:  Kotlin / Java
  UI:    View (XML) / Jetpack Compose (선언형)
  배포:  Google Play
  IDE:   Android Studio

공통점:
  거의 없음
  OS 수준의 API, 파일 시스템, 권한 모델이 다름
  같은 기능도 구현 방식이 완전히 다름
```

### 비용의 구조

```
네이티브 두 팀 체제:
  iOS 팀 + Android 팀 = 인건비 2배
  기능 A 개발 → iOS 완료 후 Android 개발 → 출시 시점 차이
  버그 수정 → 두 코드베이스에서 따로 수정
  코드 리뷰, 테스트, QA → 각각 별도 진행

스타트업의 현실:
  초기에 두 팀을 꾸릴 여유 없음
  → 한 플랫폼만 먼저 출시 (보통 iOS)
  → Android 사용자 이탈
  → 또는 크로스 플랫폼 도구 선택
```

---

## 2. 접근법의 종류 — 세 가지 철학

크로스 플랫폼 솔루션은 기술 방식에 따라 세 가지 철학으로 나뉜다.

### 철학 1: 웹 기술로 앱을 만든다 (WebView 기반)

```
원리:
  웹 앱(HTML/CSS/JS)을 만들고
  → 모바일 앱의 WebView 안에서 실행
  → 앱스토어에 배포

구조:
  앱 껍데기 (네이티브)
    └── WebView
          └── 웹앱 (HTML/CSS/JS)

네이티브 기능 접근:
  JS ↔ 네이티브 브릿지로 카메라, 위치, 파일 접근
```

```
대표 도구:

Cordova / PhoneGap (Adobe, 2009~레거시):
  최초의 하이브리드 앱 프레임워크
  현재는 실질적으로 종료

Capacitor (Ionic, 2019~현재):
  Cordova의 현대적 후계자
  Web + Native 플러그인 시스템
  기존 웹앱을 그대로 래핑 가능

장점:
  웹 개발자가 그대로 투입 가능
  한 코드베이스로 iOS/Android/웹 동시 배포
  개발 속도 빠름

단점:
  네이티브 UX와 다른 느낌 (스크롤, 애니메이션)
  성능이 네이티브보다 낮음 (JS → WebView 렌더링)
  플랫폼 최신 UI 컴포넌트 사용 불가
```

### 철학 2: JS로 네이티브 컴포넌트를 조종한다 (JS 브릿지)

```
원리:
  JS로 UI 로직을 작성하고
  → JS 브릿지를 통해 플랫폼 네이티브 컴포넌트를 호출
  → 렌더링은 진짜 네이티브 위젯이 담당

구조:
  JS 코드 (React 등)
    └── JS 브릿지
          └── 네이티브 컴포넌트 (UIButton, TextView 등)

결과:
  화면에 그려지는 것은 진짜 네이티브 위젯
  → WebView보다 UX가 훨씬 자연스럽다
```

대표 도구가 **React Native**다.

### 철학 3: 자체 엔진으로 직접 그린다 (Custom Rendering)

```
원리:
  플랫폼 네이티브 위젯을 쓰지 않는다
  → 자체 렌더링 엔진이 캔버스에 직접 픽셀을 그린다
  → 모든 플랫폼에서 완전히 동일한 화면

구조:
  앱 코드 (Dart 등)
    └── 렌더링 엔진 (Skia / Impeller)
          └── GPU (OpenGL / Metal / Vulkan)

결과:
  iOS/Android/Web/Desktop 픽셀 단위로 완전 동일
  플랫폼 위젯 의존 없음
```

대표 도구가 **Flutter**다.

### 번외 철학: 로직만 공유하고 UI는 네이티브 (Shared Logic)

```
원리:
  "UI는 각 플랫폼이 가장 잘 안다"
  → UI는 각각 네이티브로 작성
  → 비즈니스 로직·네트워크·DB·데이터 모델만 공유

구조:
  iOS UI (SwiftUI)   Android UI (Compose)
       └──────────────────┘
               │
        공유 Kotlin 코드
        (로직, 네트워크, DB)
```

대표 도구가 **Kotlin Multiplatform (KMP)**이다.

---

## 3. React Native — JS 브릿지의 대표

```
출시: 2015년 (Meta)
언어: JavaScript / TypeScript
UI:   네이티브 컴포넌트
```

### 구 아키텍처 (2015~2022)

```
JS 스레드 ──(JSON 직렬화)──▶ 브릿지 ──▶ 네이티브 스레드
     ◀──(JSON 직렬화)──────────────────────────────────

문제점:
  모든 통신이 JSON 직렬화·역직렬화를 거침
  → 데이터가 클수록, 호출이 잦을수록 느려짐
  → JS 스레드와 UI 스레드가 동기화되지 않아 프레임 드롭 발생
```

### 새 아키텍처 (JSI, 2022~)

```
JS ──(C++ JSI 직접 호출)──▶ 네이티브 모듈
  ◀──────────────────────────────────────

변화:
  브릿지 제거 → C++ 레이어(JSI)로 직접 호출
  JSON 직렬화 없음 → 성능 크게 향상
  동기 호출 가능 (구 브릿지는 비동기만)
  Fabric (새 렌더러) + Turbo Modules 조합

현재 상태 (2024):
  신규 프로젝트는 새 아키텍처 기본
  레거시 라이브러리의 마이그레이션 진행 중
```

### 장점

```
React 생태계 그대로:
  React 개발자가 즉시 투입 가능
  npm 라이브러리 대부분 사용 가능
  웹과 일부 코드 공유 가능 (React Native Web)

핫 리로드:
  코드 변경 → 앱 재빌드 없이 즉시 반영
  개발 속도 체감이 빠름

네이티브 UX:
  WebView 방식과 달리 실제 네이티브 컴포넌트
  스크롤, 애니메이션이 OS 기본 동작과 일치

빅테크 검증:
  Meta, Shopify, Microsoft (Outlook), 카카오, 라인 등
```

### 단점

```
네이티브 모듈 필요 시:
  React Native에 없는 기능 → 각 플랫폼 코드 직접 작성
  → 결국 iOS(Swift) + Android(Kotlin) 코드 필요
  → 순수 크로스플랫폼의 한계

플랫폼 차이 흡수:
  iOS와 Android의 동작이 다른 경우
  → 플랫폼별 분기 코드 작성 필요
  if (Platform.OS === 'ios') { ... }

업그레이드:
  RN 버전업 시 네이티브 의존성 충돌 빈번
  → 대규모 앱의 버전업이 까다로움

성능 한계:
  CPU 집중 작업, 복잡한 애니메이션
  → JS 레이어를 통하는 한계
  → 해결: Reanimated (UI 스레드에서 직접 애니메이션)
```

---

## 4. Flutter — 자체 렌더링의 도전

```
출시: 2018년 (Google)
언어: Dart
렌더링: Skia → Impeller (2023~)
지원: iOS / Android / Web / Windows / Mac / Linux
```

### 왜 자체 렌더링인가

```
React Native의 한계:
  플랫폼 네이티브 컴포넌트에 의존
  → iOS 버전 업그레이드 시 컴포넌트 동작 바뀔 수 있음
  → Android와 iOS에서 같은 코드인데 UI가 미묘하게 다름

Flutter의 선택:
  "플랫폼 위젯을 쓰지 않는다"
  → 모든 UI를 직접 GPU로 그린다
  → 어떤 플랫폼이든 완전히 동일한 픽셀

결과:
  Flutter 앱은 iOS에서도 Android에서도 완전히 동일하게 보임
  플랫폼 UI 업데이트에 영향받지 않음
```

### Dart 언어

```
Dart (Google, 2011):
  Java/C# 계열 문법 (배우기 쉬움)
  AOT 컴파일 + JIT 컴파일 지원
    AOT: 배포 시 빠른 실행
    JIT: 개발 시 핫 리로드

Flutter 개발자 경험:
  hot reload: UI 변경 즉시 반영
  hot restart: 상태 초기화 후 재시작

단점:
  JS/TS만큼 생태계가 크지 않음
  pub.dev (Flutter 패키지) vs npm 규모 차이 있음
  웹 생태계와 코드 공유 안 됨
```

### 장점

```
픽셀 완전 일치:
  iOS와 Android에서 동일한 화면
  디자이너가 하나의 시안만 필요

성능:
  자체 렌더링 엔진 → 60/120fps 일관적으로 달성
  Impeller (2023~): Metal/Vulkan 기반 새 엔진
  → 기존 Skia의 쉐이더 컴파일 지연 문제 해결

빅테크 검증:
  Google Pay, Alibaba (Xianyu), BMW, Nubank, eBay

데스크톱까지:
  같은 코드베이스로 Win/Mac/Linux까지 지원
  (성숙도는 모바일보다 낮음)
```

### 단점

```
플랫폼 느낌 없음:
  자체 위젯 → iOS의 Cupertino 느낌, Android Material 느낌이 약함
  Material 3 위젯은 있지만 OS 기본 UX와 미묘하게 다름

앱 크기:
  Flutter 엔진이 포함되어 기본 10~20MB 추가
  (React Native보다 큰 경향)

플랫폼 API 지연:
  iOS 신기능 출시 → Flutter 플러그인 개발 → 사용 가능
  → 네이티브보다 항상 지연

웹 지원:
  Flutter Web은 성숙도 낮고 SEO 문제 있음
  → 웹은 별도 React 앱을 만드는 경우가 현실
```

---

## 5. Kotlin Multiplatform — 로직만 공유하는 현실주의

```
출시: 2023년 안정화 (JetBrains)
언어: Kotlin
전략: UI는 네이티브, 로직만 공유
```

### 철학의 차이

```
React Native / Flutter:
  "하나의 코드로 모든 것을 한다"
  → 이상적이지만 타협이 많음

KMP (Kotlin Multiplatform):
  "UI는 각 플랫폼이 가장 잘 안다"
  → UI는 포기. 대신 나머지를 공유

공유 가능한 것:
  비즈니스 로직
  네트워크 레이어 (API 호출, 파싱)
  데이터베이스 (SQLDelight)
  뷰모델 / 상태 관리
  유틸리티 함수

공유하지 않는 것:
  UI (iOS는 SwiftUI, Android는 Compose)
```

### 실제 구조

```
공유 모듈 (Kotlin):
  class UserRepository {
    suspend fun getUser(id: String): User { ... }
  }

iOS 앱 (Swift):
  let repo = UserRepository()
  let user = try await repo.getUser(id: "123")

Android 앱 (Kotlin/Compose):
  val repo = UserRepository()
  val user = repo.getUser("123")

→ 네트워크, 파싱, 캐싱 로직은 한 번만 작성
→ UI는 각 플랫폼이 가장 자연스러운 방식으로
```

### 장점

```
진짜 네이티브 UX:
  iOS → SwiftUI, HIG 완벽 준수
  Android → Compose, Material 3 완벽 준수
  "이 앱 크로스플랫폼이야?" 소비자가 모름

플랫폼 최신 기능 즉시 사용:
  iOS 신 API → 그날 바로 사용 가능
  네이티브 팀이 각자 개발

중복 코드 감소:
  전체 코드의 40~70%가 비즈니스 로직
  → 이 부분을 공유하면 상당한 절감

Android 팀에서 iOS로 확장 용이:
  Kotlin 사용하던 팀이 KMP 도입하면 진입장벽 낮음
```

### 단점

```
UI는 두 번 작성:
  여전히 iOS 개발자 + Android 개발자 필요
  → 팀 규모 절감 효과가 크지 않음
  → 스타트업 초기에 혼자 두 플랫폼 커버 불가

Swift 연동 복잡성:
  KMP에서 Swift로 내보낼 때 타입 변환, Coroutine 처리 등 어색함
  → Kotlin-Swift 연동 레이어가 이상적이지 않음

iOS 개발자 Kotlin 학습:
  iOS 팀이 Kotlin을 알아야 공유 코드를 유지 보수 가능
```

---

## 6. MAUI — Microsoft의 선택

```
출시: 2022년 (.NET 7)
언어: C#
지원: iOS / Android / Windows / Mac
이전 이름: Xamarin → .NET MAUI
```

```
특성:
  C# 개발자가 모바일을 만들 수 있다
  .NET 생태계 전부 사용 가능
  기업용 앱에서 강점 (Azure 연동, Blazor 통합)

현실:
  Flutter, React Native에 비해 커뮤니티 작음
  iOS/Android 지원 완성도 격차 있음
  Microsoft 내부 도구, 기업 B2B 앱 중심으로 사용

선택 기준:
  팀이 C#/.NET → MAUI
  Azure 기반 서비스 → MAUI
  나머지 경우 → 다른 선택지
```

---

## 7. 크로스 플랫폼의 근본적 한계

어떤 도구를 쓰든 구조적으로 피할 수 없는 한계가 있다.

### 플랫폼 신기능 지연

```
사례:
  Apple이 iOS 18에서 새 API 출시
    → Flutter 팀이 플러그인 개발: 수주~수개월
    → React Native 팀이 모듈 개발: 수주~수개월
    → 네이티브 앱: 다음 날 바로 사용 가능

영향을 받는 경우:
  Apple Pay, Face ID, 위젯(WidgetKit), 동적 섬(Dynamic Island)
  → 초기 지원은 네이티브만 가능

KMP의 예외:
  UI가 네이티브이므로 신기능 즉시 사용 가능
  (공유 로직 레이어는 무관)
```

### 플랫폼 UX 가이드라인 충돌

```
iOS Human Interface Guidelines vs Android Material Design:

네비게이션:
  iOS: 하단 탭 + 우에서 좌로 밀기 (뒤로가기)
  Android: 하단 탭 + 시스템 뒤로가기 버튼

스위치:
  iOS: 우측 토글이 "켜짐"
  Android: 비슷하지만 색상·위치 다름

다이얼로그:
  iOS: 버튼이 오른쪽 "확인" 배치
  Android: 왼쪽 "취소", 오른쪽 "확인" (반대)

크로스 플랫폼의 선택:
  A. 하나의 디자인을 양쪽에 강제 (일관성 vs UX 이질감)
  B. 플랫폼별로 다른 컴포넌트 사용 (코드 복잡도 증가)
  C. KMP처럼 UI를 처음부터 따로 (비용 증가)
```

### 성능의 상한

```
네이티브 앱의 성능 vs 크로스 플랫폼:

Flutter:
  자체 렌더링 → GPU 직접 접근 → 네이티브에 매우 근접
  → 일반 앱에서는 차이 느끼기 어려움

React Native:
  새 아키텍처(JSI)로 크게 개선
  → 게임, 실시간 그래픽 등에서 여전히 네이티브가 우위

WebView 기반:
  눈에 띄는 성능 차이 가능
  → 리스트 스크롤, 복잡한 애니메이션에서 체감
```

---

## 8. 어떤 것을 선택해야 하는가

```
팀 구성이 React/JS 개발자:
  → React Native
  → 웹과 코드 공유 가능, 진입장벽 없음

처음부터 모바일 앱 전용으로:
  → Flutter
  → 러닝커브 있지만 장기적으로 일관성 높음
  → 플랫폼 간 완전한 UI 일치가 중요하다면 더 적합

이미 웹앱이 있고 앱스토어 배포만 필요:
  → Capacitor (Ionic)
  → 웹 코드 그대로 래핑

Android 팀이 있고 iOS로 확장하고 싶다:
  → KMP
  → 비즈니스 로직 공유 + iOS UI는 SwiftUI로

팀이 C#/.NET:
  → MAUI

완전한 네이티브 UX가 비즈니스 요구사항:
  → KMP 또는 풀 네이티브 (iOS + Android 각각)
  → 크로스 플랫폼 타협을 거부하는 경우
```

### 규모별 현실

```
스타트업·초기 MVP:
  Flutter 또는 React Native
  → 빠른 출시, 단일 팀으로 양쪽 커버

중간 규모 앱 (MAU 수십만):
  Flutter 또는 React Native (둘 다 검증됨)
  → 성능 이슈 발생 시 핫패스만 네이티브 모듈로 처리

대규모 앱 (카카오톡, 인스타그램 수준):
  보통 네이티브 또는 하이브리드
  → 핵심 피처는 네이티브, 내부 도구는 크로스플랫폼

기업 내부 도구:
  Capacitor 또는 MAUI
  → 성능보다 개발 비용이 중요
```

---

## 정리

```
접근법 비교:

                React Native   Flutter      KMP          Capacitor
언어            JS/TS          Dart         Kotlin        JS/TS
UI 렌더링       네이티브 위젯  자체 엔진    각 네이티브   WebView
UI 일치도       ★★★★         ★★★★★     ★★★★★     ★★
성능            ★★★★         ★★★★★    ★★★★★     ★★
네이티브 UX     ★★★★         ★★★        ★★★★★     ★★
생태계          ★★★★★        ★★★★       ★★★         ★★★
진입장벽        낮음           중간         높음          낮음
팀 절감         큼             큼           중간          큼
```

크로스 플랫폼은 "하나의 코드로 모든 것을 해결한다"는 약속을 완전히 지키지 않는다. 어느 도구든 결국 플랫폼별 분기 코드가 생기고, 네이티브 모듈이 필요한 순간이 온다. 그럼에도 선택 가치가 있는 이유는 단순하다. 전체 코드의 70%는 비즈니스 로직이고, 그것을 한 번만 작성하는 것만으로도 팀의 부담이 절반으로 준다. 나머지 30%의 플랫폼 차이를 어떻게 허용할 것인가가 도구 선택의 기준이다.
