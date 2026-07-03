---
title: "React Native — 페이스북이 HTML5를 포기한 날부터 시작된 이야기"
date: 2026-07-04T15:00:00+09:00
draft: false
tags: ["React Native", "모바일", "JavaScript", "iOS", "Android", "Expo", "크로스플랫폼"]
categories: ["프로그래밍"]
---

2012년 마크 저커버그는 공개 석상에서 말했다. "HTML5에 베팅한 것이 가장 큰 실수였다." 당시 Facebook 앱은 WebView로 만들어진 하이브리드 앱이었고, 느리고 버벅거렸다. 그 반성에서 시작된 것이 React Native다.

---

## 1. 어떻게 나왔는가

### HTML5 실패의 교훈

```
2012년 Facebook 앱:
  WebView 기반 하이브리드 앱
  → 리스트 스크롤이 끊김
  → 애니메이션이 불자연스러움
  → "이것이 앱인가 웹인가" 구분이 안 됨

결과:
  Facebook은 iOS/Android 앱을 네이티브로 전면 재작성
  → 성능과 UX 즉각 개선

교훈:
  "모바일은 웹이 아니다. 네이티브가 필요하다."
  그러나: 두 팀을 따로 꾸리는 비용도 크다
```

### React Native의 탄생 (2013~2015)

```
2013년: Facebook 내부 해커톤
  React (웹 UI 라이브러리)를 만든 Jordan Walke가
  "React 패러다임을 네이티브 앱에 적용하면 어떨까?" 시도

핵심 통찰:
  React의 선언형 UI + Virtual DOM 개념
  → 플랫폼이 달라도 "어떻게 그릴지" 로직은 동일
  → 실제 렌더링만 플랫폼별로 다르게

2015년: 오픈소스 공개
  슬로건: "Learn once, write anywhere"
  (Write once, run anywhere가 아님 — 처음부터 플랫폼 차이를 인정)
```

---

## 2. 구조 — 어떻게 작동하는가

### 구 아키텍처 (2015~2022)

```
JS 스레드                  브릿지                네이티브 스레드
─────────────────────────────────────────────────────────────

React 컴포넌트 렌더링
     │
     ▼
Virtual DOM diff
     │
     ▼ JSON 직렬화
─────────────────────── Bridge ────────────────────────────
                                        │
                                        ▼ JSON 역직렬화
                               네이티브 컴포넌트 생성·수정
                               (UIView, TextView 등)

반대 방향 (터치 이벤트):
네이티브 → JSON 직렬화 → Bridge → JS → React 상태 업데이트
```

```
브릿지의 문제:

1. 비동기만 지원
   → JS에서 레이아웃 정보를 동기적으로 읽을 수 없음
   → onLayout 등에서 타이밍 이슈

2. JSON 직렬화 비용
   → 데이터가 클수록, 호출이 잦을수록 느려짐
   → 애니메이션 프레임마다 JS↔Native 통신 → 프레임 드롭

3. 두 스레드 동기화 불가
   → JS 스레드와 UI 스레드가 독립 실행
   → 스크롤 중 JS 블로킹 → UI가 멈추지 않지만 응답 지연
```

### 새 아키텍처 (JSI, 2022~)

```
JSI (JavaScript Interface):
  C++ 레이어가 JS ↔ 네이티브를 직접 연결
  → JSON 직렬화 없음
  → 동기 호출 가능
  → 메모리 공유 가능 (C++ 객체를 JS에서 직접 참조)

Fabric (새 렌더러):
  React의 렌더링 로직을 C++로 이식
  → 여러 스레드에서 렌더링 계산 가능 (동시성)
  → React 18의 Concurrent Features 지원

Turbo Modules:
  네이티브 모듈의 지연 로딩 (Lazy Loading)
  → 앱 시작 시 모든 모듈 로드하던 것을 필요할 때만 로드
  → 초기 실행 시간 단축

새 아키텍처 전환 현황:
  React Native 0.71 (2023): 신규 프로젝트 기본 활성화
  레거시 라이브러리: 마이그레이션 진행 중
  Expo SDK 50+: 새 아키텍처 지원
```

---

## 3. 핵심 개념

### 컴포넌트

```jsx
// 네이티브 위젯을 감싼 기본 컴포넌트들
import { View, Text, Image, ScrollView, FlatList, Pressable } from 'react-native'

// View = div 역할 (UIView / android.view.View)
// Text = 텍스트 (UILabel / TextView)
// FlatList = 성능 최적화된 스크롤 리스트
// Pressable = 터치 인터랙션 (버튼 등)

function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  )
}
```

### StyleSheet — CSS가 아니다

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,              // Flexbox (기본값)
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: 'red',       ← 가능
    // text-decoration: underline  ← 불가 (CSS가 아님)
  }
})

// 웹 CSS와의 차이:
//   단위: px 없음, 숫자만 (DPI 독립적 논리 픽셀)
//   상속: 없음 (Text 컴포넌트 내부만 일부 상속)
//   cascade: 없음 (컴포넌트마다 독립)
//   Flexbox만 지원 (Grid 없음)
//   position: absolute만 지원 (fixed 없음)
```

### 플랫폼 분기

```javascript
import { Platform } from 'react-native'

// 방법 1: 조건문
const style = {
  paddingTop: Platform.OS === 'ios' ? 44 : 0,  // 노치 대응
}

// 방법 2: Platform.select
const font = Platform.select({
  ios:     { fontFamily: 'SF Pro Text' },
  android: { fontFamily: 'Roboto' },
})

// 방법 3: 파일 확장자
// MyButton.ios.tsx  → iOS에서 자동 선택
// MyButton.android.tsx → Android에서 자동 선택
```

---

## 4. Expo — React Native를 쉽게 만드는 레이어

React Native를 처음 시작할 때 가장 먼저 만나는 도구다.

```
Expo 없이 React Native:
  Xcode 설치 필수 (Mac)
  Android Studio 설치 필수
  Java, Android SDK, NDK 설정
  CocoaPods 설정
  → 환경 구성에 하루

Expo Managed Workflow:
  npx create-expo-app MyApp
  npx expo start
  → Expo Go 앱으로 즉시 실행 (Mac 없이도)
  → 카메라, 위치, 알림 등 API 즉시 사용 가능
```

```
EAS (Expo Application Services):
  클라우드 빌드 → Mac 없이 iOS 앱 빌드
  OTA (Over The Air) 업데이트 → 앱스토어 심사 없이 JS 코드 업데이트
  EAS Submit → 앱스토어 자동 제출

Expo SDK:
  expo-camera, expo-location, expo-notifications
  expo-file-system, expo-sqlite, expo-av (오디오/비디오)
  → 자주 쓰는 네이티브 기능 대부분 래핑되어 있음

한계:
  Expo가 제공하지 않는 네이티브 기능 필요 시
  → Bare Workflow (순수 RN)로 전환 또는
  → Custom Development Build (expo-dev-client)
```

---

## 5. 생태계

### 네비게이션

```
React Navigation (사실상 표준):
  Stack Navigator: 스크린 스택 (iOS 슬라이드, Android 슬라이드)
  Bottom Tab Navigator: 하단 탭
  Drawer Navigator: 사이드 메뉴

  import { createNativeStackNavigator } from '@react-navigation/native-stack'
  // createNativeStackNavigator: 진짜 네이티브 네비게이션 사용
  //   → iOS UINavigationController
  //   → Android FragmentManager
  // (JS로 흉내낸 것이 아님)

Expo Router (2023~):
  파일 기반 라우팅 (Next.js 스타일)
  app/index.tsx → '/'
  app/profile/[id].tsx → '/profile/:id'
```

### UI 컴포넌트 라이브러리

```
React Native Paper:
  Material Design 3 컴포넌트
  Google의 가이드라인 준수

Tamagui:
  성능 최적화 (컴파일 타임 스타일 처리)
  웹과 공유 가능

NativeBase / GluestackUI:
  유틸리티 기반 스타일링
  (Tailwind와 유사한 접근)
```

### 애니메이션

```
Animated API (기본 내장):
  Animated.Value, Animated.timing
  → JS 스레드에서 실행 → 프레임 드롭 가능

React Native Reanimated 3:
  워크릿(Worklet): UI 스레드에서 직접 실행
  → 스크롤 연동 애니메이션도 60fps 유지
  → Gesture Handler와 함께 사용

  const translateX = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }))
  // translateX.value 변경 → UI 스레드에서 즉시 반영
```

---

## 6. 실사용 사례

### 검증된 대규모 사례

```
Meta (Facebook, Messenger):
  일부 화면에 React Native 사용
  성능 임계 화면은 네이티브 유지
  → RN과 네이티브 혼합 (브라운필드 방식)

Shopify:
  모바일 커머스 전체를 RN으로 전환 (2019~)
  내부 라이브러리 대거 오픈소스화
  → Flash List (FlatList 대체, 성능 개선)
  → React Native Skia (Skia 렌더링)

Microsoft:
  Outlook Mobile (iOS/Android)
  Xbox Game Pass 앱
  일부 Teams 화면

카카오, 라인:
  일부 기능 화면에 RN 적용 (네이티브 앱 내 혼합)
```

### Airbnb — 유명한 이탈 사례 (2018)

```
2018년 Airbnb 블로그: "Sunsetting React Native"

이탈 이유:
  1. 네이티브 모듈 유지 관리 비용
     → iOS 팀 + Android 팀 + JS 팀 = 오히려 3팀
  2. RN 버전 업그레이드 시 네이티브 의존성 충돌
  3. JS↔Native 경계에서 발생하는 이상한 버그
  4. 디버깅 복잡: JS 스택과 네이티브 스택이 섞임
  5. 초기화 시간 (앱 시작이 네이티브보다 느림)

중요한 맥락:
  이때는 구 아키텍처 (Bridge 시대)
  새 아키텍처(JSI/Fabric)가 해결한 문제들이 많음
  → 2024년 기준 Airbnb의 이탈 이유 대부분이 해소됨
  → 하지만 이미 전환한 팀이 다시 돌아오지는 않음
```

---

## 7. 장단점 정리

### 장점

```
React 생태계:
  전 세계 가장 많은 프론트엔드 개발자가 아는 패러다임
  → 웹 팀이 모바일로 확장 가능
  → React 경험이 그대로 전용

npm 생태계:
  200만 개 패키지 그대로 사용 (단, DOM 의존 패키지 제외)

Expo의 접근성:
  Mac 없이 iOS 개발 가능 (EAS Build)
  OTA 업데이트로 앱스토어 심사 우회 가능

핫 리로드:
  코드 변경 → 앱 상태 유지하면서 즉시 반영
  → 개발 속도 체감이 빠름

네이티브 UX:
  실제 네이티브 컴포넌트 렌더링
  → WebView 방식보다 훨씬 자연스러운 스크롤·제스처
```

### 단점

```
네이티브 모듈의 벽:
  RN에 없는 기능 → 각 플랫폼 코드 직접 작성
  Swift/Obj-C (iOS) + Kotlin/Java (Android)
  → 결국 네이티브 지식 필요

플랫폼 UX 차이:
  iOS HIG vs Android Material을 동시에 만족시키기 어려움
  → 하나의 디자인을 강제하면 어느 쪽도 자연스럽지 않음

버전 업그레이드:
  RN 버전업 → 네이티브 의존성 충돌 빈번
  → 대규모 앱에서 메이저 버전 업그레이드가 큰 작업

디버깅:
  JS 스택 + 네이티브 스택이 섞인 에러
  → 스택트레이스가 읽기 어려운 경우 있음

JavaScript의 한계:
  싱글 스레드 (Worker 사용으로 일부 완화)
  GC 일시 중단
  → 실시간 그래픽, 대규모 데이터 처리에서 한계
```

---

## 8. 언제 선택해야 하는가

```
React Native가 맞는 상황:

✅ 팀이 React/JS 경험 보유
   → 가장 빠른 출시, 진입장벽 없음

✅ 웹앱과 코드 일부 공유 필요
   → 비즈니스 로직, API 레이어, 상태 관리 공유 가능

✅ 빠른 MVP, 스타트업 초기
   → Expo로 빠르게 시작, 나중에 네이티브 모듈 추가

✅ 커머스, 콘텐츠 소비 앱
   → Shopify가 증명한 영역
   → 복잡한 그래픽보다 UI 집중 앱에 적합

✅ 기존 네이티브 앱에 일부 화면만 추가 (브라운필드)
   → 네이티브 앱 내에 RN 화면을 끼워 넣기 가능

React Native를 피해야 하는 상황:

❌ 실시간 그래픽, 게임
   → 네이티브 또는 Unity/Unreal

❌ 카메라 필터, 영상 처리
   → Core Image / Android Camera2 API 수준의 접근 필요

❌ 플랫폼별 완벽한 네이티브 UX가 요구사항
   → KMP + 네이티브 UI 조합이 더 적합
```

---

## 정리

React Native는 "웹 개발자가 모바일을 만들 수 있는 가장 자연스러운 경로"다. React 패러다임을 그대로 가져오면서 진짜 네이티브 컴포넌트를 렌더링한다는 것이 핵심이다. 구 아키텍처의 브릿지 한계는 새 아키텍처(JSI/Fabric)로 대부분 해결됐고, Expo 생태계가 진입장벽을 크게 낮췄다.

단, "하나의 코드로 완벽하게"는 여전히 이상이다. 복잡한 앱일수록 플랫폼별 코드가 늘어나고, 결국 양쪽 플랫폼의 지식이 필요한 순간이 온다. React Native는 그 비용을 최소화하는 도구지, 제거하는 도구가 아니다.
