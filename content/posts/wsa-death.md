---
title: "WSA의 죽음 — Windows에서 Android가 실패한 이유"
date: 2026-07-02T22:30:00+09:00
draft: false
tags: ["WSA", "Windows", "Android", "Microsoft", "실패사례"]
categories: ["운영체제"]
---

WSL(Windows Subsystem for Linux)과 WSA(Windows Subsystem for Android)는 이름이 비슷하고 같은 "Subsystem" 브랜드를 달았다. 하지만 하나는 살아남았고, 하나는 조용히 사라졌다. 왜 같은 전략이 다른 결과를 낳았는지를 보면, 기술 제품이 성공하는 조건과 실패하는 조건이 보인다.

---

## 1. WSA란 무엇이었나

### 발표 — Windows 11의 킬러 피처 (2021)

2021년 6월, Microsoft가 Windows 11을 발표했다. 새 디자인, 새 시작 메뉴, 새 시스템 요구사항(TPM 2.0)과 함께 눈을 끈 기능이 있었다.

> **"Windows 11에서 Android 앱을 실행할 수 있습니다."**

발표 영상에서 Windows 11 바탕화면에 TikTok, Instagram 같은 Android 앱이 일반 Windows 창처럼 실행되는 장면이 나왔다. 반응은 뜨거웠다.

WSA의 공식 이름은 **Windows Subsystem for Android**. 줄여서 WSA, 내부 코드명으로는 "Lorca".

### 어떻게 동작했나

```
WSA의 구조:

  Android 앱 (ARM 바이너리)
      ↓
  Intel Bridge Technology (ARM → x86 번역, JIT 컴파일)
      ↓
  AOSP 기반 Android 런타임 (구글 없는 Android)
      ↓
  Hyper-V 경량 가상 머신
      ↓
  Windows 11 (x86_64)
```

WSL 2와 구조가 유사했다. Hyper-V 기반의 경량 VM 안에서 Android를 실행하고, 앱을 Windows 창으로 띄운다.

**핵심 기술: Intel Bridge Technology**
대부분의 Android 앱은 ARM 아키텍처용으로 컴파일됐다. Windows PC는 x86(혹은 x64)이다. Intel Bridge Technology는 이 간극을 JIT(Just-in-Time) 컴파일로 메운다. ARM 코드를 실시간으로 x86 코드로 번역한다.

**AOSP 기반**
WSA의 Android는 **AOSP(Android Open Source Project)** 기반이었다. 즉, 구글이 관리하는 순정 오픈소스 Android였다. 여기에 구글의 독점 서비스가 없었다.

### Amazon Appstore — 파트너의 선택

Google Play Store가 없다면 어디서 앱을 받는가? Microsoft는 **Amazon Appstore**와 파트너십을 맺었다.

Windows 11 Microsoft Store에서 Amazon Appstore 앱을 설치하면, 그 안에서 Android 앱을 받을 수 있었다.

```
사용자 경험:
  1. Microsoft Store 열기
  2. Amazon Appstore 설치
  3. Amazon 계정으로 로그인
  4. Amazon Appstore에서 앱 검색·설치
  5. 앱이 Windows 바탕화면에 아이콘으로 등록
  6. 클릭하면 Windows 창으로 실행
```

---

## 2. 왜 만들었나

### 앱 갭(App Gap) 문제

Microsoft Windows는 오랫동안 "앱이 없다"는 문제로 고통받았다.

2012년 Windows 8에서 Metro 앱 스토어를 만들었다. 2015년 Windows 10에서 UWP(Universal Windows Platform)로 확장했다. 개발자들이 스토어용 앱을 만들어주길 기대했다. 그러나 스토어는 항상 반쪽짜리였다.

왜 개발자가 Windows 스토어용 앱을 따로 만들지 않았나?

```
개발자 입장:
  Windows 사용자 → 이미 Win32(.exe) 프로그램을 씀
  Win32로 만들어도 Windows에서 잘 돌아감
  굳이 UWP를 따로 만들 이유가 없음

모바일 개발자:
  Android/iOS 앱을 이미 만들었음
  Windows PC 버전? → 웹 버전이 있으니 됐음
```

결과: Windows Store는 10년이 지나도 앱이 빈약했다.

### iPad OS의 충격

2021년 Apple이 iPad/Mac에서 iPhone·iPad 앱을 그대로 실행할 수 있음을 보여줬다. Apple Silicon(M1) 덕분에 가능한 일이었다. CPU 아키텍처(ARM)가 iPhone/iPad/Mac 모두 같았으니까.

```
Apple의 우위:
  iPhone/iPad 앱 (ARM) → Mac (M1 = ARM) = 번역 없이 네이티브 실행
  수백만 개의 앱이 Mac에서 바로 돌아감

Microsoft의 상황:
  Android 앱 (ARM) → Windows PC (x86) = 번역 필요
  그리고 Google Play 없음
```

Apple이 보여준 가능성을 Microsoft도 Windows에서 실현하려 했다. 방법은 달랐지만 목표는 비슷했다 — "PC에서 모바일 앱을 쓸 수 있다."

### Surface 라인업의 정당성

Microsoft는 Surface Pro, Surface Go 같은 2-in-1 태블릿 라인을 팔고 있었다. 태블릿으로 쓸 때 터치 앱이 부족하다는 지적이 계속 있었다. Android 앱이 돌아간다면 이 문제가 해결될 수 있었다.

---

## 3. 왜 죽었나

### 죽음의 선언 (2024년 3월)

2024년 3월 5일, Microsoft가 조용히 발표했다.

> "Windows Subsystem for Android는 2025년 3월 5일에 지원이 종료됩니다."

출시 3년 만의 종료. 이유는 공식적으로 간략하게만 설명됐다. 그러나 실패 이유는 여러 층에 걸쳐 있었다.

---

### 실패 이유 1 — Google Play Services 부재

이것이 가장 결정적인 이유다.

현대 Android 앱의 대다수가 **Google Play Services**에 의존한다.

```
Google Play Services가 제공하는 것:
  Google 계정 연동 (로그인)
  Google Maps API (지도 기반 앱)
  Firebase 푸시 알림 (FCM)
  Google Pay
  Play Protect (보안)
  위치 서비스 (정확한 GPS)
  Google 광고 네트워크
  인앱 결제
  ...
```

이것 없이 Android 앱을 실행하면 어떻게 되는가?

- 앱이 시작할 때 "Google Play Services 필요" 오류가 뜨며 종료
- 로그인이 안 됨 (Google 계정 기반 앱)
- 지도가 로드되지 않음
- 알림이 오지 않음

Instagram, TikTok, YouTube, Gmail, Google Maps — 가장 쓰고 싶은 앱들이 죄다 Google Play Services에 얽혀 있었다.

**왜 Google Play Services를 포함하지 못했나?**

Google은 Play Services를 오픈소스로 공개하지 않는다. 독점 소프트웨어다. Microsoft가 WSA에 포함하려면 Google과 라이선스 계약이 필요했다. Google이 이를 허락하지 않았다. 이유는 추측할 수 있다 — Google의 Android 생태계 통제권을 Windows가 잠식하는 것을 원하지 않는다.

결국 WSA는 **앱이 있는 Android가 아니라, 앱이 없는 Android**였다.

---

### 실패 이유 2 — Amazon Appstore의 빈약함

Google Play Store에는 수백만 개의 앱이 있다. Amazon Appstore는 한때 수만 개 수준이었다.

그나마도 대부분 마이너 앱이었다. Amazon Appstore는 주로 Fire 태블릿(Amazon의 저가 Android 태블릿)을 위한 스토어였다. 주류 개발자들이 Amazon Appstore를 위해 앱을 별도로 등록하는 경우가 드물었다.

```
사용자가 WSA에서 찾으려 한 앱들:
  TikTok → Amazon Appstore에 있긴 했음
  Instagram → 없음 (Google Play Services 의존)
  YouTube → 없음 (Google 서비스)
  카카오톡 → 없음
  네이버 → 없음
  대부분의 게임 → 없거나, 있어도 Google Play Services 오류
```

WSA를 쓰는 사람이 실제로 원하는 앱을 설치하려 하면 대부분 막혔다.

---

### 실패 이유 3 — ADB 사이드로딩의 장벽

기술적 사용자들은 ADB(Android Debug Bridge)를 통해 APK를 직접 설치하는 방법을 썼다.

```powershell
# WSA에서 ADB 사이드로딩
# 1. WSA 설정에서 개발자 모드 활성화
# 2. ADB 연결
adb connect 127.0.0.1:58526

# 3. APK 설치
adb install app.apk
```

이 방법으로 Google Play Services를 포함한 패키지를 설치하거나 (MindTheGapps 등), 원하는 APK를 직접 올릴 수 있었다. 그러나 이것은 일반 사용자가 할 수 있는 방법이 아니었다. 개발자 모드 활성화, ADB 설치, APK 파일 구하기 — 진입 장벽이 높았다.

WSA가 "일반 사용자를 위한 앱 생태계 확장"이라는 목표를 달성하려면 일반인이 쓸 수 있어야 했다. 사이드로딩은 그 목표와 거리가 멀었다.

---

### 실패 이유 4 — UX의 근본적 불일치

Android 앱은 **터치스크린**을 위해 설계됐다.

```
모바일 앱 UI 가정:
  손가락으로 탭 → 마우스 클릭으로 동작하긴 함
  스와이프 제스처 → 마우스로 드래그로 흉내냄
  핀치 줌 → 마우스 휠로 어느 정도 됨
  
  하지만:
  - 버튼이 손가락 크기로 크고 간격이 넓음
  - 화면 전체를 쓰는 레이아웃 → 창 크기 조정이 어색
  - 텍스트 입력 UI → 모바일 키보드 가정
  - 앱 내 뒤로가기 → Android 시스템 버튼 없음
```

Android 앱을 마우스와 키보드로 쓰는 것은 어색했다. 앱이 창 크기에 제대로 반응하지 않거나, 세로 모드로만 동작하거나, 버튼이 마우스로 클릭하기엔 너무 크거나 배치가 어색한 경우가 많았다.

Apple이 Mac에서 iPhone 앱을 실행할 때도 같은 문제가 있었다. Apple은 이것을 인정하고 앱 개발자가 "Mac에서 실행 허용" 여부를 선택하게 했다. 많은 앱이 Mac에서 비활성화를 선택했다. UX가 맞지 않는다는 이유로.

---

### 실패 이유 5 — 실수요가 없었다

근본적 질문: **PC에서 Android 앱을 쓰고 싶은 사람이 실제로 얼마나 있었나?**

PC 사용자가 모바일 앱을 원하는 상황을 생각해보면:

```
인스타그램 → 웹 브라우저에서 instagram.com으로 접속
유튜브     → 웹 브라우저에서 youtube.com
카카오톡   → 카카오톡 Windows 데스크탑 앱이 이미 있음
게임       → PC 게임이 따로 있거나, 에뮬레이터(BlueStacks)가 이미 있음
```

PC에서 Android 앱이 필요한 공백이 실제로 많지 않았다. 있었더라도 이미 해결책(웹 버전, 전용 PC 앱, 에뮬레이터)이 존재했다.

"있으면 좋겠다"와 "없으면 불편하다"는 완전히 다르다. WSA는 전자였다.

---

### 실패 이유 6 — 성능과 리소스

ARM → x86 JIT 번역은 오버헤드가 있었다. 게임처럼 성능이 중요한 앱에서 네이티브 실행보다 느렸다.

WSA는 메모리도 많이 썼다. VM이 기본 수 GB의 RAM을 점유했다. 앱을 쓰지 않을 때도 백그라운드에 떠 있었다.

처음 앱을 열 때 VM이 부팅되는 시간(수초)이 있었다. 가볍고 즉각적인 모바일 앱 경험과 달리 초기 로딩이 있었다.

---

### WSL과의 결정적 차이

WSL과 WSA를 나란히 놓으면 성공과 실패의 이유가 선명하게 보인다.

| | WSL | WSA |
|---|---|---|
| **해결하려 한 문제** | 개발자가 Linux 도구를 Windows에서 쓰고 싶다 | 일반 사용자가 Android 앱을 PC에서 쓰게 하자 |
| **실수요 존재 여부** | 명확히 있었음 | 불분명했음 |
| **핵심 생태계** | bash, git, curl, docker — 오픈소스, 구글 없음 | Google Play 앱들 — 구글의 허락 필요 |
| **구글의 협조** | 불필요 | 필수 (하지만 거절당함) |
| **UX 맥락** | CLI → CLI. 환경이 같음 | 터치 앱 → 마우스/키보드. 환경 불일치 |
| **대안 존재** | Cygwin/Git Bash로는 부족했음 | 웹 버전, 전용 PC 앱, 에뮬레이터가 이미 있었음 |
| **결과** | 개발자 표준으로 자리잡음 | 3년 만에 종료 |

WSL은 **실제 문제를 해결했다.** 개발자들이 Cygwin과 Git Bash로 버티는 고통이 명확했고, WSL이 그것을 제거했다.

WSA는 **문제가 있을 것이라고 가정한 것을 해결하려 했다.** "PC에서 모바일 앱을 쓰고 싶을 것"이라는 가정 자체가 맞지 않았다.

---

### Apple은 왜 됐나 (상대적으로)

Apple의 iPhone/iPad 앱 on Mac은 WSA와 비교할 때 유리한 조건이 있었다.

```
Apple의 조건:
  ├ 동일한 CPU 아키텍처 (모두 ARM) → 번역 불필요, 네이티브 성능
  ├ 동일한 Apple 생태계 → App Store 계정, iCloud, Face ID 공유
  └ 개발자가 같은 사람 → iOS 앱 개발자가 Mac 지원 여부 선택 가능

Microsoft의 조건:
  ├ 다른 CPU 아키텍처 (Android ARM → Windows x86) → 번역 오버헤드
  ├ Google 생태계 → Microsoft가 통제 불가
  └ 개발자가 다른 사람 → Android 앱 개발자가 WSA 최적화 동기 없음
```

그리고 Apple의 경우도 "Mac에서 iPhone 앱 실행"이 살아있긴 하지만 크게 활성화되지는 않았다. UX 불일치 문제는 Apple도 해결하지 못했다.

---

## 4. WSA의 유산

### 남긴 것

WSA 자체는 종료됐지만, 기술은 흔적을 남겼다.

**Intel Bridge Technology**: ARM Android 앱을 x86에서 번역 실행하는 기술은 Intel과 Microsoft가 협력한 결과다. ARM Windows(Surface Pro X, Copilot+ PC)에서 Android 앱을 번역 실행하는 데 재활용될 수 있는 기술 자산이다.

**교훈**: "기술적으로 가능하다"와 "사람들이 원한다"는 다르다. 이것은 Microsoft뿐 아니라 모든 기술 제품 개발자가 배워야 할 교훈이다.

### BlueStacks는 살아있다

WSA가 사라졌지만, 그 이전부터 PC에서 Android 앱을 쓰는 방법이 있었다 — **BlueStacks**, LDPlayer 같은 Android 에뮬레이터들이다.

BlueStacks는 2011년 출시 이후 지금도 운영된다. 주로 모바일 게임을 PC의 키보드·마우스로 플레이하는 용도로 쓰인다. 게이밍 특화라는 명확한 니치(niche)가 있었다. 반면 WSA는 모든 Android 앱을 대상으로 했으나 그 어느 것도 제대로 되지 않았다.

**특화 vs 범용**: BlueStacks가 게임에 집중해 살아남은 반면, WSA는 "모든 Android 앱"을 목표로 했다가 Google Play Services 장벽에 막혔다.

---

## 정리

```
WSA의 생애:
  2021년 6월  → Windows 11 발표와 함께 등장 (마케팅 킬러 피처)
  2021년 10월 → Windows 11 정식 출시 (WSA 포함)
  2022년 초   → Amazon Appstore 일반 공개
  2024년 3월  → 종료 발표
  2025년 3월  → 공식 지원 종료

왜 만들었나:
  앱 갭 해소, Apple의 Mac에서 iOS 앱 실행 대응
  Surface 태블릿 앱 생태계 강화
  Windows 11 홍보 킬러 피처

왜 죽었나:
  1. Google Play Services 없음 → 원하는 앱이 안 됨
  2. Amazon Appstore의 빈약한 앱 목록
  3. 터치 UI ↔ 마우스 환경 불일치
  4. 실수요 없음 → 웹 버전, PC 앱, 에뮬레이터가 이미 있었음
  5. 성능 오버헤드 (ARM → x86 번역)
  6. Google의 협조 없음 (Play Services 라이선스 거절)

WSL vs WSA의 교훈:
  WSL → 명확한 고통(pain point) 해결 → 성공
  WSA → 가상의 수요를 상정 → 핵심 생태계(Google) 없이 → 실패

기술이 작동하는 것과 사람들이 쓰고 싶어하는 것은 다르다
```

WSA는 "기술적으로 가능하다"를 증명하는 데는 성공했다. Windows 위에서 Android 앱이 창으로 뜨는 것이 실제로 동작했다. 그러나 그 기술이 해결하려 한 문제 자체가 명확하지 않았고, 해결할 수 있는 생태계(Google Play)의 협조를 얻지 못했다. 기술의 실패가 아닌 **전략의 실패**였다.
