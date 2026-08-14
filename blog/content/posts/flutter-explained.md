---
title: "Flutter — 플랫폼 위젯을 버리고 직접 그리는 선택"
date: 2026-07-04T16:00:00+09:00
draft: false
tags: ["Flutter", "Dart", "모바일", "iOS", "Android", "크로스플랫폼", "Google"]
categories: ["프로그래밍"]
---

Flutter의 선택은 단순하고 급진적이다. iOS의 UIButton도, Android의 MaterialButton도 쓰지 않는다. 대신 엔진이 GPU 위에 직접 픽셀을 그린다. 어떤 플랫폼이든 동일한 캔버스에 동일한 결과물을 만들어낸다. 이 선택이 가져오는 것과 포기하는 것을 정리한다.

---

## 1. 어떻게 나왔는가

### Google의 내부 프로젝트 "Sky" (2014～2015)

```
배경:
  Chrome 팀 엔지니어들이 실험한 프로젝트
  "웹 렌더링 파이프라인을 모바일에서 120fps로 돌릴 수 있는가?"

초기 데모 (2015):
  120fps로 스크롤되는 UI 시연
  당시 기준으로 충격적인 성능

→ 이것이 Flutter의 원형
```

### Dart 언어 선택

```
왜 Dart인가?

1. Google이 소유 (언어 자체를 수정 가능)
2. AOT 컴파일: 릴리즈 빌드에서 C처럼 빠른 실행
3. JIT 컴파일: 개발 중 핫 리로드 지원
4. 정적 타입 + null safety (Dart 2.12, 2021)
5. 문법이 Java/C# 계열 → 학습 곡선 낮음

왜 JS가 아닌가?
  "React Native는 JS를 쓰는데 왜 Dart?"
  → JS는 AOT 컴파일이 어렵고 런타임 동작이 예측 어려움
  → Flutter는 언어 수준에서 렌더링 파이프라인과 통합 필요

왜 Swift/Kotlin이 아닌가?
  → 크로스 플랫폼이 목표 → 특정 플랫폼 언어를 선택 불가
```

### 출시 역사

```
2018년 12월:  Flutter 1.0 (iOS/Android)
2021년 3월:   Flutter 2.0 (Web/Desktop 스테이블)
2021년 5월:   Dart null safety 안정화
2022년 5월:   Flutter 3.0 (Linux/macOS/Windows 스테이블)
2023년 5월:   Flutter 3.10 (iOS Impeller 기본 활성화)
2023년 11월:  Flutter 3.16 (Android Impeller 기본 활성화)
2024년:       Flutter 3.22+ (WebAssembly 지원)
```

---

## 2. 구조 — 왜 다른 프레임워크와 다른가

```
플랫폼별 앱 구조 비교:

네이티브 앱:
  앱 코드 (Swift/Kotlin)
    → OS UI 프레임워크 (UIKit/Compose)
      → GPU

React Native:
  JS 코드
    → JSI (C++)
      → 네이티브 위젯 (UIView, TextView)
        → GPU

Flutter:
  Dart 코드
    → Flutter 위젯 트리
      → Flutter 엔진 (C++)
        → Skia/Impeller
          → GPU (Metal/Vulkan/OpenGL)

핵심 차이:
  Flutter는 OS의 UI 프레임워크를 완전히 우회
  → OS는 캔버스(Surface)만 제공
  → 나머지는 Flutter가 직접 그림
```

### Skia에서 Impeller로

```
Skia (구 렌더러):
  2D 그래픽 라이브러리 (Chrome도 사용)
  OpenGL 기반
  
  문제: 쉐이더 컴파일 지연(Shader Compilation Jank)
    첫 프레임에 새 쉐이더 컴파일 → 화면 멈춤 (수십ms)
    → "Flutter 앱이 처음에 버벅인다"는 불만의 원인

Impeller (신 렌더러, 2023~):
  쉐이더를 앱 빌드 시 미리 컴파일
  → 첫 프레임도 즉각 렌더링
  Metal (iOS), Vulkan (Android), OpenGL (fallback)
  → 더 적극적인 GPU 활용

현재:
  iOS: Flutter 3.10부터 Impeller 기본
  Android: Flutter 3.16부터 Impeller 기본
  → Skia의 쉐이더 지연 문제 사실상 해결
```

### 세 개의 트리

Flutter를 이해할 때 가장 중요한 개념이다.

```
Widget Tree (개발자가 작성):
  BuildContext → 위젯의 위치 정보
  불변(Immutable): setState마다 새로 생성

Element Tree (Flutter 내부):
  Widget과 실제 렌더링 사이의 중간 레이어
  Widget이 재생성되어도 Element는 재사용 (비용 절감)
  상태(State)가 여기에 붙음

RenderObject Tree (실제 레이아웃/페인팅):
  픽셀 계산, 레이아웃, 실제 그리기
  RenderBox: 크기·위치 계산
  RenderParagraph: 텍스트 렌더링

흐름:
  setState() 호출
    → Widget Tree 재생성
    → Element Tree가 diff 계산 (최소한만 변경)
    → RenderObject Tree가 레이아웃 재계산
    → GPU에 페인팅
```

---

## 3. Dart와 위젯 시스템

### StatelessWidget vs StatefulWidget

```dart
// StatelessWidget: 상태 없음. 항상 동일한 결과
class Greeting extends StatelessWidget {
  final String name;
  const Greeting({required this.name});

  @override
  Widget build(BuildContext context) {
    return Text('Hello, $name');
  }
}

// StatefulWidget: 상태 있음. setState로 업데이트
class Counter extends StatefulWidget {
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text('$count'),
      ElevatedButton(
        onPressed: () => setState(() => count++),
        child: const Text('+'),
      ),
    ]);
  }
}
```

### "모든 것은 위젯이다"

```dart
// 레이아웃도 위젯
Column(children: [...])   // 세로 배치
Row(children: [...])      // 가로 배치
Stack(children: [...])    // 겹치기
Padding(padding: ..., child: ...) // 패딩도 위젯

// 스타일도 위젯
Container(
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(8),
    boxShadow: [BoxShadow(...)],
  ),
  child: ...,
)

// 제스처도 위젯
GestureDetector(
  onTap: () => print('tapped'),
  child: ...,
)

// 애니메이션도 위젯
AnimatedContainer(duration: Duration(milliseconds: 300), ...)
Hero(tag: 'image', child: ...)
```

### Null Safety

```dart
// Dart 2.12+ null safety

// null 불가 (기본)
String name = 'hello';     // null 할당 시 컴파일 에러

// null 가능 (명시적)
String? nickname = null;   // OK

// null 처리
print(nickname?.length);          // null이면 null 반환
print(nickname ?? 'anonymous');   // null이면 기본값
print(nickname!.length);          // null이면 런타임 에러 (강제 unwrap)

// late: 나중에 초기화 (non-null 보장)
late String userId;
// 사용 전 초기화 안 하면 LateInitializationError
```

---

## 4. 상태 관리 — Flutter의 가장 복잡한 주제

Flutter 생태계에서 가장 논쟁이 많은 부분이 상태 관리다. 선택지가 많은 만큼 혼란도 크다.

```
setState (내장):
  소규모, 로컬 상태
  단순하지만 컴포넌트 간 공유가 어려움
  → 작은 앱이나 개별 위젯 내부에 적합

Provider (공식 권장, Google):
  InheritedWidget 래퍼
  의존성 주입 + 상태 공유
  학습 곡선 낮음
  → 중간 규모 앱

Riverpod (Provider 개선판):
  Provider의 컴파일 타임 안전성 문제 해결
  코드 생성 기반 (riverpod_generator)
  Flutter 없이도 동작 (순수 Dart)
  → 현재 가장 활발하게 채택

BLoC / Cubit (Google 스타일):
  비즈니스 로직을 UI와 완전 분리
  Cubit: 단순한 상태 클래스
  BLoC: 이벤트→상태 변환 명시적

  // Cubit 예시
  class CounterCubit extends Cubit<int> {
    CounterCubit() : super(0);
    void increment() => emit(state + 1);
  }

GetX (논란 있음):
  상태·라우팅·의존성 주입 올인원
  코드가 간결하지만 Flutter 철학과 어긋남
  → 빠른 프로토타입에는 편리

결론:
  신규 프로젝트: Riverpod 또는 BLoC
  Google 스타일 대형 앱: BLoC
  팀이 작고 빠른 개발: Provider 또는 Riverpod
```

---

## 5. 생태계 (pub.dev)

```
pub.dev: Flutter/Dart 공식 패키지 저장소

네트워크:
  dio:  인터셉터, 에러 처리, FormData 지원
  http: 경량 HTTP 클라이언트

로컬 DB:
  sqflite:      SQLite (저수준)
  drift:        SQLite ORM (타입 안전, 코드 생성)
  hive:         NoSQL, 빠른 읽기·쓰기
  isar:         고성능 NoSQL (Hive 후계자)
  objectbox:    고성능 객체 DB

직렬화:
  json_serializable + freezed:
    코드 생성으로 fromJson/toJson 자동 생성
    불변 객체(Immutable) 자동 생성
    copyWith, == 연산자 자동 생성

네비게이션:
  go_router (공식):   선언형 라우팅, 딥링크 지원
  auto_route:        코드 생성 기반, 타입 안전

UI:
  flutter_svg:        SVG 렌더링
  cached_network_image: 이미지 캐싱
  shimmer:            로딩 스켈레톤 UI
  fl_chart:           차트 라이브러리
```

---

## 6. 실사용 사례

```
Google Pay:
  Flutter 도입 초기의 대표 사례
  결제 앱 특성상 성능·보안 중요
  → Flutter의 일관된 렌더링이 장점으로 작용

Alibaba (Xianyu, 한샨):
  2억 명 이상 MAU
  Flutter의 대규모 검증 사례 중 가장 중요
  → Flutter 엔진에 기여도 높음

BMW (MyBMW):
  차량 정보, 원격 제어
  플랫폼 간 동일한 UX 요구사항이 Flutter와 일치

Nubank (브라질 핀테크):
  중남미 최대 디지털 뱅크
  Flutter로 전환 후 개발 속도 개선

eBay Motors:
  중고차 거래 앱

한국:
  일부 스타트업·핀테크 앱에서 채택
  대형 앱은 여전히 네이티브 또는 RN이 많음
```

---

## 7. 장단점 정리

### 장점

```
픽셀 완전 일치:
  iOS와 Android에서 동일한 화면
  → 디자이너가 하나의 시안만 제작
  → QA가 한 번만 테스트해도 됨

성능:
  Impeller 이후 쉐이더 지연 해결
  60/120fps 일관적으로 달성
  → 복잡한 애니메이션도 부드러움

자체 렌더링의 독립성:
  OS UI 프레임워크 버전에 영향받지 않음
  iOS 업데이트 → Flutter 앱 UI 변경 없음

플랫폼 범위:
  iOS, Android, Web, Windows, macOS, Linux
  하나의 코드베이스 (성숙도는 모바일이 가장 높음)

Dart의 장점:
  null safety로 런타임 NPE 제거
  AOT 컴파일로 빠른 실행
  학습 곡선이 Java/C# 개발자에게 낮음
```

### 단점

```
"플랫폼 느낌"의 부재:
  자체 위젯 → iOS Cupertino 느낌, Android Material 느낌이 약함
  Material 3 위젯은 있지만 완전히 같지는 않음
  → "이 앱 뭔가 어색해"를 사용자가 느낄 수 있음

  대응:
  CupertinoWidget 패키지: iOS 스타일 위젯
  하지만 완벽한 재현은 한계 있음

플랫폼 최신 API 지연:
  Apple의 새 API → Flutter 플러그인 개발 → 사용 가능
  Dynamic Island, WidgetKit, Vision Pro 등
  → 항상 네이티브보다 늦음

앱 크기:
  Flutter 엔진 포함 → 기본 10~20MB 추가
  (React Native보다 큰 경향)

Dart 생태계:
  pub.dev vs npm: 패키지 수가 상대적으로 적음
  특수 영역(ML, 복잡한 데이터 처리)은 라이브러리 부족
  → JS/Python 생태계 수준 기대 불가

Web 지원:
  Flutter Web은 성숙도 낮음
  SEO 불리 (Canvas 렌더링 → 텍스트 크롤링 어려움)
  → 웹은 별도 React 앱을 따로 만드는 경우가 현실적
```

---

## 8. React Native와의 핵심 차이

```
                React Native         Flutter
───────────────────────────────────────────────────
렌더링          네이티브 위젯        자체 엔진 (Impeller)
언어            JS/TS               Dart
생태계          npm (거대)           pub.dev (중간)
개발자 진입     낮음 (React 경험)   중간 (Dart 학습 필요)
UI 일치도       플랫폼간 차이 있음  완전 동일
네이티브 UX     높음                낮음 (자체 위젯)
플랫폼 신기능   지연 있음           지연 있음
데스크톱 지원  제한적              스테이블 (성숙도 낮음)
웹 지원         RN Web (제한적)     Flutter Web (SEO 불리)
```

---

## 9. 언제 선택해야 하는가

```
Flutter가 맞는 상황:

✅ 플랫폼 간 완전히 동일한 UI가 요구사항
   → 브랜드 앱, 금융 앱, 의료 앱
   → 플랫폼별 UI 차이가 허용 안 되는 경우

✅ 팀이 처음 모바일 앱을 만드는 경우
   → 네이티브 경험 없이 시작
   → React 경험도 없다면 Flutter가 러닝커브가 더 균일함

✅ 애니메이션·그래픽이 많은 앱
   → Impeller 기반 고성능 애니메이션
   → UI 인터랙션이 핵심인 앱

✅ 모바일 + 데스크톱 동시 지원
   → 하나의 코드베이스로 Win/Mac/Linux까지
   → (웹은 별도 고려 필요)

Flutter를 피해야 하는 상황:

❌ 팀이 React/JS 경험으로 구성
   → React Native가 자연스러운 선택

❌ 플랫폼 최신 기능 빠른 지원이 요구사항
   → 네이티브 또는 KMP

❌ 웹과 동일한 코드베이스 목표
   → Flutter Web은 SEO 불리, 성숙도 낮음
   → React Native Web이 더 현실적

❌ 이미 대규모 네이티브 앱이 있고 일부만 크로스플랫폼화
   → 브라운필드에서 Flutter 통합이 React Native보다 복잡
```

---

## 정리

Flutter의 핵심 베팅은 "플랫폼 위젯을 쓰지 않는 대신, 렌더링을 완전히 제어한다"는 것이다. 이로 인해 얻은 것은 플랫폼 간 완전한 UI 일치와 Impeller 기반의 고성능 렌더링이다. 포기한 것은 각 플랫폼의 네이티브 UX 느낌과 플랫폼 최신 기능의 즉각적인 사용이다.

React Native가 "웹 개발자의 모바일 진출로"라면, Flutter는 "처음부터 크로스 플랫폼을 위해 설계된 길"이다. 어느 것이 더 좋다는 판단보다, 팀의 기술 배경과 앱의 UI 요구사항이 선택을 결정한다.

```
마지막 판단 공식:

React 팀 + 웹 공유 필요        → React Native
처음 모바일 + UI 완전 동일 중요 → Flutter
Android 팀 + iOS 확장          → KMP
빠른 래핑, 최소 투자            → Capacitor
```
