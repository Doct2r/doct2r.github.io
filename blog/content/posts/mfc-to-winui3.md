---
title: "MFC → WinUI3 마이그레이션 — 프로세스 분리가 답인 이유"
date: 2026-07-03T13:00:00+09:00
draft: false
tags: ["MFC", "WinUI3", "Native AoT", "Windows", "마이그레이션", "IPC"]
categories: ["프로그래밍"]
---

MFC 애플리케이션을 WinUI3로 옮기려 하면 직관적으로 떠오르는 경로가 있다. MFC(C++) → C# 인터롭 → WinUI3. 그런데 이 길을 실제로 걸어보면 벽이 나온다. C#을 끌어들이는 순간 Native AoT가 필요해지고, WinUI3는 Native AoT를 완전히 지원하지 않는다. 이 글은 그 막다른 골목의 구조를 설명하고, 프로세스 분리라는 우회로가 왜 합리적인지를 정리한다.

---

## 왜 MFC에서 C#으로 넘어갈 때 Native AoT가 필요해지나

MFC는 순수 Win32/COM 기반 C++ 세계다. .NET 런타임과는 태생적으로 다른 계층에 있다. 여기에 C#을 결합하려 하면 두 세계 사이에 다리가 필요하다.

### C++에서 .NET을 호출하는 방법들

```
방법 1: C++/CLI (Managed C++)
  → C++ 코드 안에 CLR을 내장
  → MFC + CLR 혼재 → 복잡성 폭발, 유지보수 어려움

방법 2: COM을 통한 .NET 컴포넌트 호출
  → .NET 어셈블리를 COM 서버로 등록
  → COM 활성화 시 CLR이 프로세스에 로드됨
  → MFC의 COM/ATL 인프라가 런타임 존재를 확인함 ← 여기서 문제 발생

방법 3: Native AoT C# 라이브러리
  → C#을 순수 네이티브 DLL로 컴파일
  → CLR 없음, 런타임 체크 없음
  → C++ 입장에서 그냥 일반 DLL
```

MFC의 COM 인프라는 .NET 컴포넌트를 활성화할 때 CLR의 존재를 확인한다. 이 런타임 체크가 통과되지 않으면 활성화가 실패하거나 예상치 못한 동작을 한다. Native AoT로 컴파일된 C# 라이브러리는 이 체크를 우회한다. CLR이 없는 순수 네이티브 바이너리이기 때문이다.

```
Native AoT C# DLL의 관점:
  C++ 쪽: dllexport 함수를 가진 일반 DLL
  C# 쪽: 런타임 없이 동작하는 네이티브 코드

MFC가 이 DLL을 로드할 때:
  → COM 활성화 없음
  → CLR 로드 없음
  → 런타임 체크 없음
  → 그냥 LoadLibrary + GetProcAddress
```

결론: MFC에서 C#을 호출하는 깔끔한 방법은 Native AoT 라이브러리다.

---

## 그런데 WinUI3는 Native AoT를 지원하지 않는다

문제는 WinUI3가 Native AoT와 호환되지 않는다는 것이다.

### WinUI3가 Native AoT를 못 쓰는 이유

**XAML 컴파일러의 리플렉션 의존성**

WinUI3의 XAML은 빌드 타임에 코드를 생성하지만, 런타임에도 리플렉션을 사용한다. 데이터 바인딩, x:Bind, ResourceDictionary 조회 등이 런타임 타입 정보에 의존한다.

```csharp
// x:Bind는 컴파일 타임 코드 생성처럼 보이지만
// 내부적으로 XamlTypeInfo 리플렉션 인프라를 사용함
<TextBlock Text="{x:Bind ViewModel.Title}" />
```

Native AoT는 리플렉션을 완전히 제거하거나 정적 분석으로 대체해야 한다. XAML의 동적 타입 해석은 이것과 충돌한다.

**WinRT 인터롭 레이어**

WinUI3는 Windows Runtime(WinRT) 위에 구축된다. WinRT 인터롭은 COM 기반 런타임 마샬링을 사용한다. `IInspectable`, `IActivationFactory` 등의 인터페이스가 런타임에 동적으로 해석된다.

```
WinUI3 → Windows App SDK → WinRT API
                              ↓
                    런타임 COM 활성화
                    동적 인터페이스 조회
                    → Native AoT와 충돌
```

**Windows App SDK의 런타임 의존성**

Windows App SDK 자체가 런타임 초기화를 필요로 한다. `Bootstrap.Initialize()` 호출, DDLM(Dynamic Dependency Lifetime Manager) 연결 등이 런타임 환경을 전제한다.

**현실적인 지원 수준**

.NET 8/9 기준으로 WinUI3의 Native AoT 지원은 실험적이거나 부분적이다. 간단한 앱은 될 수 있지만, 실제 프로덕션 수준의 WinUI3 앱에서 완전한 Native AoT는 현실적으로 불가능하다.

```
지원 상태 요약 (2026 기준):
  WinForms      → Native AoT 지원 (제한적이지만 실용적)
  WPF           → Native AoT 미지원
  WinUI3        → 실험적, 많은 기능 제한
  MAUI          → Native AoT 부분 지원 (iOS/Android 위주)
```

---

## 막다른 골목의 구조

지금까지의 논리를 정리하면:

```
MFC(C++) → C# 호출 → Native AoT 필요
                             ↓
                    WinUI3는 Native AoT 미지원
                             ↓
                    MFC에서 WinUI3를 직접 호스팅 불가
```

같은 프로세스 안에서 MFC와 WinUI3를 함께 실행하는 것이 구조적으로 막혀있다.

---

## 해결책: 프로세스 분리

두 세계를 같은 프로세스에 넣으려 했기 때문에 충돌했다. 프로세스를 나누면 각자의 세계에서 온전히 동작할 수 있다.

```
┌──────────────────────┐              ┌──────────────────────┐
│   MFC 프로세스       │              │   WinUI3 프로세스    │
│                      │              │                      │
│   순수 C++           │◄────IPC────►│   순수 .NET          │
│   Win32/COM          │              │   풀 런타임          │
│   기존 비즈니스 로직 │              │   새 UI 레이어       │
│   Native AoT 불필요  │              │   Native AoT 불필요  │
└──────────────────────┘              └──────────────────────┘
```

**각 프로세스가 자기 세계에서만 동작한다.** MFC 프로세스는 CLR을 로드할 필요가 없다. WinUI3 프로세스는 .NET 런타임을 마음껏 쓴다. Native AoT 문제가 사라진다.

---

## IPC 방법 선택

두 프로세스가 통신하는 방법은 여러 가지다.

### Named Pipe (권장)

```csharp
// WinUI3 쪽 (서버)
var server = new NamedPipeServerStream("mfc-winui3-pipe",
    PipeDirection.InOut, 1, PipeTransmissionMode.Message);
await server.WaitForConnectionAsync();

// MFC 쪽 (클라이언트, C++)
HANDLE hPipe = CreateFile(
    L"\\\\.\\pipe\\mfc-winui3-pipe",
    GENERIC_READ | GENERIC_WRITE, 0, NULL,
    OPEN_EXISTING, 0, NULL);
```

**장점**: Windows 로컬 통신에 최적화, 낮은 지연시간, 양방향, 메시지 모드 지원.
**단점**: Windows 전용.

### Windows Message (WM_COPYDATA)

```cpp
// MFC → WinUI3 (데이터 전송)
COPYDATASTRUCT cds;
cds.dwData = MSG_TYPE_COMMAND;
cds.cbData = dataSize;
cds.lpData = pData;
SendMessage(hWinUI3Window, WM_COPYDATA, (WPARAM)hMFCWindow, (LPARAM)&cds);
```

**장점**: 추가 인프라 없이 Win32 메시지 루프만으로 동작.
**단점**: 데이터 크기 제한, 동기적, WinUI3 창 핸들을 알아야 함.

### gRPC (로컬)

```protobuf
// command.proto
service MfcBridge {
  rpc ExecuteCommand (CommandRequest) returns (CommandResponse);
  rpc StreamEvents (StreamRequest) returns (stream EventResponse);
}
```

```csharp
// WinUI3 쪽: gRPC 서버
// MFC 쪽: gRPC 클라이언트 (C++ gRPC 라이브러리 사용)
```

**장점**: 강타입 인터페이스 정의, 스트리밍 지원, 향후 네트워크 분리도 가능.
**단점**: 프로토콜 설계 비용, gRPC 라이브러리 의존성.

### 선택 기준

```
단순한 명령/응답 → Named Pipe + JSON
실시간 이벤트 많음 → Named Pipe (양방향 스트리밍)
이미 WCF 경험 있음 → Named Pipe + 커스텀 프로토콜
장기적으로 확장 예정 → gRPC
```

---

## 프로세스 생명주기 관리

두 프로세스 중 어느 쪽이 주(主)인지, 어떻게 시작하고 종료하는지를 설계해야 한다.

### 패턴 1: MFC가 WinUI3를 자식으로 실행

```cpp
// MFC가 WinUI3 프로세스를 시작
STARTUPINFO si = {};
PROCESS_INFORMATION pi = {};
CreateProcess(
    L"WinUI3App.exe",
    commandLine,  // --parent-pid=1234 등
    NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi);

// MFC 종료 시 WinUI3도 종료
TerminateProcess(pi.hProcess, 0);
```

MFC가 메인이고 WinUI3는 UI 서브시스템. MFC 종료 시 WinUI3도 함께 닫힌다.

### 패턴 2: WinUI3가 MFC를 백엔드로 실행

MFC 레거시 로직을 백엔드 서비스처럼 숨기고, WinUI3가 사용자가 직접 보는 프론트엔드가 되는 구조. 마이그레이션이 완료되면 MFC 부분을 점진적으로 제거할 수 있다.

### 프로세스 감시

한 프로세스가 비정상 종료할 때 다른 쪽도 정리해야 한다.

```csharp
// WinUI3에서 MFC 프로세스 감시 (C#)
var mfcProcess = Process.GetProcessById(mfcPid);
mfcProcess.EnableRaisingEvents = true;
mfcProcess.Exited += (s, e) => {
    // MFC가 종료되면 WinUI3도 종료
    Application.Current.Exit();
};
```

---

## 창 통합 — 별개 프로세스처럼 안 보이게

두 프로세스지만 사용자에게는 하나의 앱처럼 보여야 할 수 있다.

### WinUI3 창을 MFC 창의 자식으로 만들기

```cpp
// MFC 쪽: WinUI3 창의 핸들을 받아 자식으로 설정
HWND hWinUI3 = (HWND)receivedHandle;
SetParent(hWinUI3, m_hWnd);  // MFC 창이 부모가 됨

// WinUI3 창의 스타일을 자식 창으로 변경
LONG style = GetWindowLong(hWinUI3, GWL_STYLE);
style = (style & ~WS_POPUP) | WS_CHILD;
SetWindowLong(hWinUI3, GWL_STYLE, style);

// 위치 조정
SetWindowPos(hWinUI3, NULL, x, y, width, height, SWP_NOZORDER);
```

이 기법을 사용하면 WinUI3 창이 MFC 창 안에 임베드된 것처럼 보인다. 다른 프로세스임에도 불구하고.

### IInitializeWithWindow (WinUI3 대화상자)

WinUI3의 일부 대화상자(파일 열기, 색상 선택 등)는 부모 창 핸들을 요구한다. 다른 프로세스의 HWND를 넘겨줄 수 있다.

```csharp
// WinUI3에서 MFC 창을 부모로 지정
var picker = new FileOpenPicker();
var initializeWithWindow = picker.As<IInitializeWithWindow>();
initializeWithWindow.Initialize(mfcWindowHandle);  // MFC의 HWND
await picker.PickSingleFileAsync();
```

---

## 데이터 직렬화

두 프로세스 사이를 오가는 데이터는 직렬화가 필요하다.

### JSON (단순한 경우)

```cpp
// MFC 쪽 (nlohmann/json 등 사용)
nlohmann::json request;
request["action"] = "open_dialog";
request["title"] = "파일 선택";
std::string payload = request.dump();
// Named Pipe로 전송
```

```csharp
// WinUI3 쪽
var request = JsonSerializer.Deserialize<DialogRequest>(payload);
```

### Protocol Buffers (대용량 / 고성능)

타입이 명확하고 데이터 양이 많다면 protobuf가 낫다. gRPC와 함께 쓰면 인터페이스 정의까지 자동화된다.

---

## 마이그레이션 전략 — Strangler Fig 패턴

프로세스 분리는 마이그레이션의 중간 상태다. 최종 목표는 MFC를 완전히 제거하는 것일 수 있다.

```
단계 1: 두 프로세스 공존
  MFC: 모든 기능 담당
  WinUI3: 새 기능만 담당 (MFC UI 옆에 붙어서)

단계 2: 점진적 이전
  비즈니스 로직을 MFC C++에서 C# 서비스로 이전
  MFC는 점점 래퍼 역할만 하게 됨

단계 3: MFC 제거
  모든 로직이 C#/.NET으로 이전됨
  MFC 프로세스 삭제
  WinUI3만 남음
```

이 패턴을 **Strangler Fig(교살 무화과)**라고 부른다. 기존 시스템을 새 시스템이 조금씩 감싸며 결국 대체하는 방식이다. 한 번에 전부 바꾸지 않아도 된다.

---

## 실제로 생기는 문제들

프로세스 분리는 개념적으로 깔끔하지만 실제로 작업하다 보면 추가 문제가 나온다.

**디버깅**: 두 프로세스를 동시에 디버그하려면 Visual Studio에서 멀티프로세스 디버깅을 활성화해야 한다. 또는 WinUI3 쪽은 별도 디버그 세션으로 붙인다.

**설치/배포**: WinUI3 앱은 MSIX 패키지 또는 Windows App SDK 런타임 설치를 요구한다. MFC 앱은 보통 그냥 xcopy 배포가 가능했다. 배포 방식이 달라진다.

**프로세스 간 클립보드/드래그앤드롭**: 프로세스가 다르면 기본적인 UI 상호작용도 복잡해진다. 클립보드는 괜찮지만, 드래그앤드롭은 OLE를 통해야 한다.

**DPI 스케일링**: MFC와 WinUI3는 DPI 처리 방식이 다르다. MFC는 기본적으로 DPI-unaware이거나 system-aware인 경우가 많고, WinUI3는 per-monitor DPI-aware다. `SetParent`로 창을 합쳤을 때 DPI가 맞지 않으면 흐릿하거나 크기가 어긋난다.

---

## 정리

```
문제의 구조:
  MFC → C# 호출 → Native AoT 필요 (런타임 체크 우회)
  WinUI3 → Native AoT 미지원 (XAML/WinRT 리플렉션 의존)
  → 같은 프로세스에서 공존 불가

해결책:
  프로세스 분리
  MFC 프로세스: 순수 C++, 기존 비즈니스 로직
  WinUI3 프로세스: 풀 .NET 런타임, 새 UI
  IPC: Named Pipe / Windows Message / gRPC

창 통합:
  SetParent()로 WinUI3 창을 MFC 창 안에 임베드 가능
  사용자에게는 하나의 앱처럼 보임

장기 전략:
  Strangler Fig — 점진적으로 MFC를 제거하며 WinUI3로 완전 전환
```

같은 프로세스에서 해결하려는 시도를 포기하고 프로세스 경계를 존중하는 순간, 오히려 설계가 명확해진다. MFC는 MFC답게, WinUI3는 WinUI3답게 동작하도록 두고, 그 사이를 IPC로 연결하는 것이 현실적인 경로다.
