---
title: "XAML Islands와 WinRT — Win32 앱에 최신 윈도우 UI를 심는 방법"
date: 2026-08-08T15:00:00+09:00
draft: false
tags: ["XAML Islands", "WinRT", "C++/WinRT", "WinUI", "Windows개발", "COM"]
categories: ["Windows 개발"]
---

[MFC를 WinUI3로 옮기는 글](/blog/posts/mfc-to-winui3/)에서는 두 프레임워크를 같은 프로세스에 넣을 수 없어 프로세스를 분리하고 IPC로 연결하는 우회로를 다뤘다. 그런데 마이크로소프트가 실제로 내놓은 공식 해법은 그것과 결이 다르다. 프로세스를 나누지 않고, 같은 프로세스 안에서 최신 윈도우 컨트롤을 기존 Win32 창 한구석에 "섬(island)"처럼 심는 방식이다. 이 기술이 XAML Islands이고, 그 밑바탕에는 2012년부터 존재해온 WinRT(Windows Runtime)가 있다. 둘을 순서대로 정리한다.

## 1. WinRT란 무엇인가 — COM을 다시 설계하다

WinRT는 2011년 빌드(Build) 컨퍼런스에서 예고되고 2012년 윈도우 8과 함께 정식 등장한 플랫폼 계층이다. 흔히 ".NET의 후계자"로 오해되지만 실제로는 COM(Component Object Model)의 후계자에 더 가깝다 — WinRT 객체는 여전히 언매니지드 바이너리 인터페이스이고, `IUnknown` 기반이라는 COM의 뼈대를 그대로 물려받았다.

다만 COM 위에 세 가지를 새로 얹었다.

**`IInspectable` 인터페이스**: 모든 WinRT 객체가 구현하는 인터페이스로, `IUnknown`에 `GetIids`(구현하는 인터페이스 목록 조회)·`GetRuntimeClassName`(런타임 클래스 이름 조회)·`GetTrustLevel`(신뢰 수준 조회) 세 메서드를 추가한다. 순수 COM 객체는 자신이 어떤 인터페이스를 구현하는지 스스로 답할 방법이 없었는데, `IInspectable`이 이 자기소개 기능을 표준화했다.

**`.winmd` 메타데이터**: WinRT 타입 정보는 ECMA-335 — .NET 어셈블리와 같은 메타데이터 포맷 — 로 기술된 `.winmd` 파일에 담긴다. COM은 타입 정보를 알려주는 `.idl`/타입 라이브러리가 있었지만 언어마다 파싱 방식이 제각각이었던 반면, WinRT는 .NET과 같은 메타데이터 표준을 재사용해 어떤 언어든 같은 방식으로 타입을 읽어갈 수 있게 했다.

**언어 프로젝션(projection)**: 이 표준화된 메타데이터를 근거로, 같은 WinRT API를 C++·C#·자바스크립트(당시 UWP 앱은 차크라JS 엔진으로 JS도 1급 언어였다)에서 각자의 언어 문법에 맞게 자동으로 바인딩할 수 있다. C++ 쪽 초기 프로젝션은 C++/CX(2012, 비주얼 스튜디오 2012와 함께 등장한 C++ 언어 확장)였다.

## 2. WinRT와 UWP는 같은 게 아니다

UWP(Universal Windows Platform, 2015 윈도우 10과 함께 등장)는 자주 WinRT와 같은 말로 쓰이지만, 정확히는 **UWP가 WinRT 위에 지어진 애플리케이션 모델**이다. WinRT는 타입 시스템·ABI·COM 활성화 메커니즘이고, UWP는 그 위에 AppContainer 샌드박스·앱 패키지(MSIX 전신)·XAML UI 프레임워크(Windows.UI.Xaml, 지금의 WinUI 2 계열)를 얹어 "하나의 앱을 PC·태블릿·Xbox·홀로렌즈에 동시 배포한다"는 목표를 실현한 것이다. WinRT 자체는 UWP 샌드박스 밖에서도 활성화할 수 있는 더 기초적인 계층이다 — 이 사실이 뒤에 나올 XAML Islands가 가능해지는 전제조건이다.

## 3. XAML Islands가 풀려던 문제

UWP는 최신 컨트롤(잉크 캔버스, 지도, 사람 사진 피커, 플루언트 디자인의 어크릴릭·리빌 효과 등)을 계속 새로 내놓았지만, 이 컨트롤들은 UWP 앱 안에서만 쓸 수 있었다. WPF·WinForms·MFC 같은 기존 Win32 데스크톱 앱을 쓰던 회사들은 딜레마에 놓였다 — 앱 전체를 UWP로 재작성하지 않고는 이 최신 컨트롤을 쓸 방법이 없었던 것이다. 앱 전체 재작성은 [MFC→WinUI3 마이그레이션 글](/blog/posts/mfc-to-winui3/)에서 다룬 것과 같은 비용(생태계 단절·배포 방식 변화·학습 곡선)을 그대로 요구한다.

마이크로소프트는 2018년 빌드 컨퍼런스에서 케빈 갤로(Kevin Gallo)를 통해 이 문제의 해법을 발표했다 — 앱 전체를 UWP로 옮기지 않고, UWP의 XAML 컨트롤 일부만 기존 Win32 창 안에 "섬"처럼 심을 수 있게 하겠다는 것. 이것이 XAML Islands다. 2018년 10월 업데이트(SDK 17763)에 프리뷰로 처음 들어갔고, 2019년 5월 업데이트(버전 1903)에서 정식(v1) 기능이 됐다.

## 4. 어떻게 동작하는가 — 인프로세스 호스팅

핵심 API는 `DesktopWindowXamlSource`다. 이 WinRT 클래스가 하는 일은 단순하게 요약하면 이렇다.

```
1. DesktopWindowXamlSource 인스턴스 생성
2. 기존 Win32 창의 HWND를 부모로 지정 (AttachToWindow)
3. DesktopWindowXamlSource가 XAML 콘텐츠를 담을 자식 HWND를 새로 생성
4. 그 자식 HWND 안에 UWP XAML 비주얼 트리(Content 속성으로 지정)를 렌더링
```

이 전 과정이 **하나의 프로세스 안에서** 일어난다. WPF나 WinForms 앱이 `DesktopWindowXamlSource`를 호출하면, 그 프로세스 자체가 WinRT를 활성화하고 XAML 렌더링 엔진을 로드한다 — 별도 프로세스를 띄우고 IPC로 명령을 주고받는 게 아니라, 기존 창의 자식 창 자리에 WinRT XAML이 직접 그려지는 것이다. Windows Community Toolkit이 제공하는 `WindowsXamlHost` 컨트롤을 쓰면 이 `DesktopWindowXamlSource` 저수준 API를 감싸서 WPF·WinForms 디자이너 화면에 컨트롤 하나 끌어다 놓는 것처럼 쓸 수 있다.

```csharp
// WPF 안에 UWP InkCanvas를 XAML Islands로 심는 예
var inkHost = new WindowsXamlHostBaseExt();
inkHost.ChildInternal = new Windows.UI.Xaml.Controls.InkCanvas();
```

## 5. Native AoT 문제와는 애초에 무관하다

[WinUI3의 Native AoT를 시도한 글](/blog/posts/winui3-native-aot/)에서 봤듯, WinUI3 + Native AoT 조합은 XAML의 런타임 리플렉션 의존성과 AoT의 전제(리플렉션 없는 정적 컴파일)가 충돌해 바이너리가 100MB를 넘어가는 등 현실적으로 어려웠다. XAML Islands는 이 문제 자체가 발생하지 않는다 — XAML Islands를 쓰는 호스트 앱은 원래부터 일반 JIT 기반 .NET(Core 3.x 이상, .NET Framework는 지원 대상이 아니다)으로 동작하는 걸 전제하기 때문이다. Native AoT로 정적 컴파일해야 한다는 요구 자체가 없으니, 그 요구와 XAML의 리플렉션 의존성이 충돌할 일도 없다. 대신 대가는 다르게 치른다 — .NET 런타임을 그대로 짊어져야 하고, 순수 네이티브 MFC/C++ 앱에서 XAML Islands를 쓰려면 C#/.NET 계층을 새로 들여오거나, 뒤에 나올 C++/WinRT로 직접 WinRT를 다뤄야 한다.

## 6. C++에서 쓰려면 — C++/WinRT

네이티브 C++ 앱(예: MFC)에서 WinRT를 직접 다루려면 언어 프로젝션이 필요하다. 초기 프로젝션이던 C++/CX(2012)는 C++ 문법에 `^`(hat) 포인터 같은 비표준 확장을 끼워 넣는 방식이라 표준 C++ 코드와 잘 어울리지 않았다. 케니 커(Kenny Kerr)가 2015년 개인 프로젝트로 시작해 마이크로소프트에 합류한 뒤 공식화한 **C++/WinRT**는 이 문제를 정반대 방식으로 풀었다 — 언어 확장이 아니라 표준 ISO C++17 헤더 파일만으로 `.winmd` 메타데이터를 코드로 생성해내는 라이브러리다. 2018년 윈도우 10 SDK(버전 1803, 17134)에 정식 포함되며 C++/CX의 공식 후계자가 됐다.

```
방식             언어 확장 필요   표준 C++    비고
C++/CX (2012)    필요 (^, ref 등)  아님        UWP 초기 표준
C++/WinRT (2018) 불필요           표준 C++17  현재 공식 권장
```

[ATL을 다룬 글](/blog/posts/atl-active-template-library-explained/)에서 봤듯 클래식 COM/ActiveX 코드는 여전히 ATL이 유일한 실질적 선택지로 남아 있지만, WinRT 상호운용이 목적이라면 지금은 C++/WinRT가 표준 경로다. MFC 앱이 XAML Islands를 직접 호스팅하려면 이 C++/WinRT를 통해 `DesktopWindowXamlSource`를 COM 수준에서 직접 다뤄야 한다 — WPF/WinForms용 `WindowsXamlHost` 같은 편의 래퍼가 없기 때문에 진입 장벽은 더 높다.

## 7. 한계와 지금의 위치

XAML Islands는 만능 해법이 아니다.

- **호스트 조건**: .NET Core 3.x 이상(또는 .NET 5+)에서만 지원되고, .NET Framework 앱에서는 쓸 수 없다.
- **컨트롤 범위**: UWP XAML 컨트롤 전부가 완전히 매끄럽게 동작하지는 않는다. 포커스 이동·키보드 내비게이션·IME 처리가 호스트 창과 완전히 자연스럽게 맞물리지 않는 경우가 보고돼 왔다.
- **DPI**: [MFC→WinUI3 글](/blog/posts/mfc-to-winui3/)에서 다룬 것과 같은 종류의 DPI 인식 방식 차이 문제가 여기서도 나타난다.
- **전략적 위치**: WinUI3(Windows App SDK)가 마이크로소프트의 현재 UI 투자 축이 되면서, XAML Islands(UWP XAML, 이른바 WinUI 2 컨트롤을 심는 원래 기술)는 유지 모드에 가깝다. WinUI3 자체 콘텐츠를 Win32 앱에 심는 "WinUI3 Islands"는 Windows App SDK 초기 버전에서 실험적으로 존재했으나 정식 기능으로 완성되지는 않았다 — 즉 지금 "XAML Islands"라는 이름이 가리키는 것은 대체로 여전히 WinUI 2/UWP 컨트롤을 심는 원래 기술이다.

## 정리

```
WinRT (2012)
  COM을 계승한 언매니지드 ABI + IInspectable 자기소개 인터페이스
  + ECMA-335 기반 .winmd 메타데이터 → 언어 프로젝션(C++/CX→C++/WinRT, C#, JS)

UWP (2015)
  WinRT 위에 AppContainer 샌드박스 + 앱 패키지 + XAML UI를 얹은 앱 모델
  (WinRT ≠ UWP, WinRT가 더 기초 계층)

XAML Islands (2018 발표 → 2019 정식, 버전 1903)
  UWP를 통째로 쓰지 않고 UWP XAML 컨트롤만 Win32 앱에 심는 기술
  DesktopWindowXamlSource로 같은 프로세스 안에 자식 HWND + XAML 비주얼 트리 호스팅
  → 프로세스 분리형 마이그레이션과 달리 IPC 불필요, Native AoT 문제와도 무관
  WPF/WinForms: WindowsXamlHost 래퍼로 편하게 / MFC 등 네이티브: C++/WinRT로 직접
```

MFC→WinUI3 마이그레이션 글에서 다룬 프로세스 분리가 "두 세계를 완전히 갈라놓는" 접근이라면, XAML Islands는 "한 세계 안에 다른 세계의 방 하나를 들이는" 접근이다. 어느 쪽을 택할지는 결국 얼마나 많은 최신 UI를 얼마나 빠르게 들여오고 싶은가, 그리고 그 대가로 .NET 런타임과 그에 따른 배포 복잡성을 얼마나 감당할 수 있는가의 문제로 좁혀진다.

Sources:
- [Windows Runtime - Wikipedia](https://en.wikipedia.org/wiki/WinRT)
- [XAML Islands - A deep dive - Part 1 - Windows Developer Blog](https://blogs.windows.com/windowsdeveloper/2018/11/02/xaml-islands-a-deep-dive-part-1/)
- [Host WinRT XAML controls in desktop apps - Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/desktop/modernize/xaml-islands/xaml-islands)
- [WindowsXAMLHost control - Windows Community Toolkit - Microsoft Learn](https://learn.microsoft.com/en-us/windows/communitytoolkit/controls/wpf-winforms/windowsxamlhost)
- [C++/WinRT - Wikipedia](https://en.wikipedia.org/wiki/C%2B%2B/WinRT)
- [Standard C++ and the Windows Runtime (C++/WinRT) - Windows Developer Blog](https://blogs.windows.com/windowsdeveloper/2016/11/28/standard-c-windows-runtime-cwinrt/)
- [What is the role of XAML Islands in WinUI 3? - microsoft/WindowsAppSDK Discussion](https://github.com/microsoft/WindowsAppSDK/discussions/465)
