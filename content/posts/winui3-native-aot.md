---
title: "WinUI3를 바이너리화 — 과연 MFC만큼의 장점이 나오는가?"
date: 2026-07-02T11:00:00+09:00
draft: false
tags: ["WinUI3", "Native AoT", "Windows App SDK", "C#", ".NET"]
categories: ["Windows 개발"]
---

WinUI3로 앱을 만들다 보면 한 가지 불편한 지점에 도달한다.  
배포다.

.NET 런타임 의존성, 무거운 설치 패키지. MFC로 만든 exe 하나를 툭 던져주던 시절이 그리워진다.  
그래서 Native AoT를 시도해봤다.

---

## 1. Native AoT란?

Native AoT(Ahead-of-Time Compilation)는 .NET 코드를 실행 시점이 아니라 **빌드 시점에 네이티브 코드로 컴파일**하는 기술이다.

기존 .NET 앱은 IL(Intermediate Language) 바이트코드로 배포되고, 실행 시 JIT(Just-in-Time) 컴파일러가 이를 기계어로 변환한다. Native AoT는 이 과정을 빌드 타임으로 당겨버린다.

이론상 얻을 수 있는 것들:

- **런타임 불필요** — .NET 런타임 없이 단독 실행 가능
- **빠른 시작** — JIT 워밍업 없음
- **작은 배포 단위** — 필요한 코드만 포함

MFC의 강점이 정확히 이것이었다. `MyApp.exe` 하나, 끝. Native AoT라면 .NET으로도 그게 가능할 것 같았다.

---

## 2. Windows App SDK란?

WinUI3는 **Windows App SDK** 위에서 동작한다.

Windows App SDK는 OS와 분리된 형태로 최신 Windows UI를 제공하는 프레임워크다. Windows 10까지 지원하면서도 최신 UI 컴포넌트를 쓸 수 있다는 게 장점이다.

문제는 이 SDK 자체가 상당히 무겁다는 것이다.

```
WinAppSDK 런타임
  ├── Microsoft.WindowsAppRuntime.*.msix
  ├── Microsoft.UI.Xaml.*.dll
  └── 기타 의존 패키지들...
```

기존 UWP는 OS에 통합되어 있었다. Windows App SDK는 그렇지 않다. 앱과 함께 SDK 런타임을 따로 설치하거나 패키지에 함께 묶어야 한다.

---

## 3. 결국 왜 안 되는가

Native AoT + WinUI3 조합을 실제로 빌드해보면 현실이 보인다.

**바이너리가 100MB를 넘는다.**

이유는 단순하다. Native AoT는 사용하는 코드만 포함(트리 쉐이킹)하는데, WinUI3와 Windows App SDK의 의존성 그래프가 워낙 방대하다. XAML 렌더링 엔진, DirectX 바인딩, WinRT 인터롭 레이어 — 이것들이 전부 바이너리 안으로 들어온다.

비교해보면:

| 방식 | 배포 크기 |
|---|---|
| MFC 앱 (정적 링크) | 1~5 MB |
| WinUI3 (MSIX 패키지) | 10~30 MB + SDK 런타임 별도 |
| WinUI3 + Native AoT | **100 MB+** |

MFC의 장점을 재현하려다 오히려 더 나빠진 셈이다.

### 근본적인 문제

Native AoT는 **리플렉션과 동적 코드 생성이 없는 환경**을 전제한다.  
WinUI3의 XAML은 런타임에 타입 정보를 해석하고, WinRT 인터롭은 COM 기반 동적 디스패치를 사용한다. 이 둘은 AoT의 전제와 정면으로 충돌한다.

현재(2026년 기준) WinUI3의 공식 Native AoT 지원은 없다. 커뮤니티에서 실험적인 시도들이 있지만, 프로덕션 수준과는 거리가 멀다.

---

## 결론

MFC의 "exe 하나로 끝"을 현대 Windows UI에서 재현하고 싶다면, 현재로서는 선택지가 제한적이다.

- **WPF + Native AoT** — WinUI3보다는 낫지만 역시 크다
- **C++/WinRT** — 진짜 네이티브. 개발 생산성을 포기해야 한다
- **Tauri (Rust + WebView2)** — 크로스플랫폼. 결이 다르다

WinUI3는 훌륭한 프레임워크지만, 경량 단독 실행 바이너리를 원한다면 아직은 맞지 않는다.
