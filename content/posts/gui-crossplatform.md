---
title: "크로스 플랫폼 GUI — 통일된 사용성을 만들 수 있는가"
date: 2026-07-03T19:00:00+09:00
draft: false
tags: ["GUI", "크로스플랫폼", "WinUI3", "Flutter", "Qt", "Electron", "프로그래밍"]
categories: ["프로그래밍"]
---

기획자가 말한다. "Windows, macOS, 모바일 전부 같은 UI/UX로 가야 합니다." 개발자는 속으로 생각한다. _WinUI3이랑 SwiftUI가 같은 API를 공유하는 세계가 오면 그때 얘기하자._ 같은 디자인 시안을 각 플랫폼에 구현하는 것은 가능하다. 하지만 "사용성이 같다"는 것과 "생김새가 같다"는 것은 다른 문제이고, 그 차이가 크로스 플랫폼 GUI의 핵심 갈등이다.

---

## 1. 왜 네이티브 GUI는 근본적으로 다른가

같아 보여도 다른 것이 아니라, 아예 다른 철학으로 만들어졌다.

### 이벤트 모델부터 다르다

```
Windows (Win32 / WinUI3):
  메시지 펌프 (Message Pump)
  GetMessage() → TranslateMessage() → DispatchMessage()
  → 창에 WM_PAINT, WM_KEYDOWN 같은 메시지를 전달
  → HWND가 창의 핸들, 모든 것의 중심

macOS (AppKit / SwiftUI):
  NSRunLoop / Combine / async-await
  NSApplication.shared.run() → 내부적으로 이벤트 루프
  → Delegate 패턴: "이 이벤트가 왔을 때 이 객체에게 물어봐"
  → NSWindow, NSView 계층

Linux (GTK):
  GLib 이벤트 루프
  gtk_main() → GObject 시그널-슬롯
  → GtkWidget* 포인터 기반

Android:
  Looper / Handler / Message
  Activity → View → ViewGroup 계층
  터치 이벤트: MotionEvent로 전달

iOS (UIKit):
  NSRunLoop (CFRunLoop 기반)
  UIApplication → UIWindow → UIViewController → UIView
  Responder Chain: 이벤트를 계층 위로 전달
```

단순히 함수 이름이 다른 게 아니다. **이벤트가 어디서 발생하고, 어디로 전달되고, 누가 처리하는지의 철학**이 다르다.

### 타입 시스템이 다르다

```
Windows WinUI3:
  HWND hwnd = CreateWindowEx(...);   // Win32 핸들
  ComPtr<IUIElement> element;        // COM 인터페이스
  winrt::Windows::UI::Color color;   // WinRT 타입

macOS:
  NSWindow *window = [[NSWindow alloc] init];  // ObjC 포인터
  // 또는 SwiftUI
  struct ContentView: View { var body: some View { ... } }

GTK (C):
  GtkWidget *window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
  g_signal_connect(window, "destroy", G_CALLBACK(gtk_main_quit), NULL);

Android (Kotlin):
  val button = Button(context).apply {
      text = "확인"
      setOnClickListener { ... }
  }
```

HWND, NSWindow, GtkWidget*, View — 이것들은 이름만 다른 것이 아니라 메모리 관리, 생명주기, 스레드 안전성 모델이 전부 다르다.

### 렌더링 파이프라인이 다르다

```
Windows:
  DirectX / Direct2D / DirectComposition
  → GPU 가속 컴포지션

macOS:
  Core Animation / Metal
  → 레이어 기반 합성

Linux:
  X11 또는 Wayland → OpenGL / Vulkan / Cairo
  → 컴포지터(Mutter, KWin 등)에 의존

Android:
  RenderThread → Skia / HWUI
  → Choreographer가 VSync 동기화

iOS:
  Core Animation / Metal
  → 60/120Hz ProMotion 동기화
```

같은 버튼 하나를 그리는 데도 경로가 완전히 다르다.

---

## 2. "사용성이 같다"의 문제

여기서 기획자가 말하는 "사용성이 같다"를 분해해야 한다.

### 사용성을 구성하는 것

```
① 시각적 일관성 (Visual Consistency)
   → 색상, 폰트, 컴포넌트 생김새가 같다
   → 달성 가능. 어렵지 않음.

② 인터랙션 일관성 (Interaction Consistency)
   → 버튼 클릭, 스크롤, 드래그의 동작이 같다
   → 어느 정도 달성 가능. 그러나...

③ 플랫폼 관례 (Platform Convention)
   → Windows: 닫기 버튼이 오른쪽 위
   → macOS: 닫기 버튼이 왼쪽 위
   → iOS: 뒤로가기는 스와이프
   → Android: 뒤로가기는 제스처 또는 버튼
   → 이것을 통일하면 한 플랫폼에서 어색해짐

④ 접근성 (Accessibility)
   → Windows: UI Automation API
   → macOS: NSAccessibility
   → Android: AccessibilityService
   → 스크린 리더가 각 플랫폼마다 다르게 동작
   → 통일하면 접근성이 무너짐
```

시각적 일관성을 추구하다가 플랫폼 관례를 깨면, 사용자는 "뭔가 어색하다"고 느낀다. 이것이 Electron으로 만든 앱이 "웹 느낌 난다"는 비판을 받는 이유다.

### 피츠의 법칙과 플랫폼 관례

피츠의 법칙(Fitts's Law): 대상까지의 거리와 대상의 크기가 클릭 시간을 결정한다.

```
macOS 메뉴바:
  화면 맨 위에 고정 → 높이 방향으로 무한대 크기 효과
  → 마우스를 위로 쭉 올리면 항상 클릭 가능

Windows 메뉴:
  애플리케이션 창 안에 있음 → 유한한 크기
  → 정확하게 겨냥해야 함

macOS 앱을 Windows 스타일로 만들면:
  메뉴가 창 안으로 들어와야 함
  → macOS 사용자가 불편함을 느낌

Windows 앱을 macOS 스타일로 만들면:
  메뉴가 화면 상단으로 나가야 함
  → Windows 사용자가 혼란스러움
```

"같은 UX"를 만들면 양쪽 모두에서 어색한 앱이 만들어진다.

---

## 3. 크로스 플랫폼 접근법의 종류와 트레이드오프

### 방법 1: 커스텀 렌더링 — Flutter, Skia

네이티브 위젯을 쓰지 않고 캔버스 위에 직접 그린다.

```
Flutter 동작 방식:
  OS에 단 하나를 요청: "그릴 수 있는 캔버스"
  → Impeller (Metal/Vulkan/OpenGL로 캔버스 확보)
  → Dart로 작성된 위젯을 직접 픽셀로 렌더링
  → 네이티브 버튼, 텍스트필드 없음. 전부 Flutter가 그림

장점:
  어디서나 픽셀 단위로 동일
  플랫폼 API 불일치 문제 없음
  한 코드베이스

단점:
  "Flutter 앱 느낌"이 생김 → 네이티브처럼 안 느껴짐
  접근성: Flutter가 직접 구현 → 네이티브 수준 미달
  텍스트 렌더링: 각 OS의 폰트 힌팅이 적용 안 됨
  OS 기능 통합: 파일 선택 다이얼로그, 공유 시트 등 플러그인 필요
  IME(한글 입력): 복잡한 버그가 주기적으로 발생
```

픽셀 단위로 같지만 사용자가 느끼는 "느낌"은 다르다.

### 방법 2: 네이티브 위젯 추상화 — Qt, MAUI, React Native

각 플랫폼의 네이티브 컴포넌트를 통일된 API로 감싼다.

```
Qt의 방식:
  QPushButton → Windows에서는 Win32 버튼 / macOS에서는 NSButton
  같은 Qt 코드 → 각 플랫폼의 네이티브 렌더링

MAUI (.NET)의 방식:
  <Button Text="확인" /> → 
    iOS: UIButton
    Android: AppCompatButton
    Windows: WinUI Button
    macOS: NSButton

React Native의 방식:
  <TouchableOpacity> → 
    iOS: UIView + gesture recognizer
    Android: View + GestureDetector
```

얼핏 이상적으로 보인다. 그런데 여기서 **추상화의 누수(Leaky Abstraction)**가 발생한다.

```
MAUI의 현실:
  iOS에서는 되는데 Android에서 안 되는 것이 생김
  Windows에서는 되는데 macOS에서 레이아웃이 깨짐
  → 결국 플랫폼별 조건 분기 코드가 쌓임

#if ANDROID
    // Android 전용 처리
#elif IOS
    // iOS 전용 처리  
#elif WINDOWS
    // Windows 전용 처리
#endif

React Native의 현실:
  JS ↔ 네이티브 브리지 통신 오버헤드
  "이 컴포넌트는 iOS만 지원합니다"
  → react-native-community 패키지 찾아 헤매기
  → 패키지가 iOS만 잘 되고 Android는 부실한 경우
```

조엘 스폴스키(Joel Spolsky)의 표현: **"모든 추상화는 누수된다(All abstractions leak)."** 네이티브 차이를 완벽하게 숨기는 추상화는 존재하지 않는다. 결국 플랫폼 특수 케이스를 직접 처리해야 한다.

### 방법 3: 웹 기술 래핑 — Electron, Tauri

OS에 내장된 웹 엔진(또는 번들된 크로미엄)을 이용해 HTML/CSS/JS로 UI를 그린다.

```
Electron:
  Chromium 번들 + Node.js 번들
  → HTML/CSS/JS로 전부 구현
  → 어디서나 동일 (크로미엄이 렌더링)
  
  단점:
  최소 설치 용량: 100MB~
  메모리: Slack, VS Code 각각 수백 MB 상주
  "웹 앱 느낌" 완전히 남음
  네이티브 기능(드래그앤드롭, 트레이, 알림) 플러그인 필요

Tauri:
  OS 내장 웹뷰 사용 (Windows: WebView2/Edge, macOS: WKWebView, Linux: WebKitGTK)
  Rust 백엔드 → 번들 크기: 수 MB
  
  단점:
  각 OS의 웹뷰 버전이 다름 → CSS/JS 호환성 문제 재발
  WKWebView와 WebView2가 다르게 동작하는 경우 존재
  → 크로스 플랫폼 문제를 HTML/CSS 레벨로 이동시킨 것
```

Tauri는 Electron의 무거움을 해결했지만, 웹뷰 불일치라는 다른 문제를 갖는다.

### 방법 4: 플랫폼별 네이티브 코드 공유 없음

가장 솔직한 방법이다.

```
비즈니스 로직: 공유 (Kotlin Multiplatform, C 라이브러리, gRPC)
UI: 각 플랫폼에서 따로

iOS: SwiftUI
Android: Jetpack Compose
Windows: WinUI3
macOS: AppKit/SwiftUI
```

유지보수 비용이 플랫폼 수에 비례한다. 하지만 각 플랫폼에서 완벽하게 네이티브하다. 인력이 있으면 가장 좋은 선택이다.

---

## 4. 실제 어디서 무엇을 써야 하는가

프레임워크 선택은 제품과 팀의 상황에 따라 달라진다.

### 판단 기준표

```
대상 플랫폼이 하나:
  Windows만 → WinUI3 / WPF
  macOS만 → SwiftUI / AppKit
  웹만 → React / Vue / 브라우저

대상이 Desktop 멀티 플랫폼 (Windows + macOS + Linux):
  팀이 C++ 가능 → Qt (가장 성숙, 네이티브 느낌 좋음)
  팀이 Rust + 웹 기술 → Tauri
  웹 앱이어도 괜찮음 → Electron
  .NET 생태계 → MAUI (desktop 지원 포함)

대상이 모바일 (iOS + Android):
  네이티브 느낌 중요 → React Native
  픽셀 통일 + 빠른 개발 → Flutter
  팀이 네이티브 개발 가능 → Swift(iOS) + Kotlin(Android) 별도

대상이 모바일 + Desktop 전부:
  Flutter (가장 넓은 지원, 단 네이티브 느낌 희생)
  MAUI (Windows/macOS/iOS/Android, .NET 기반)
  React Native + Electron 조합 (웹 기술 재사용)
```

### Qt를 별도로 언급하는 이유

Qt는 1991년 시작된 오래된 프레임워크인데, 크로스 플랫폼 데스크탑 GUI에서는 여전히 최선에 가깝다.

```
Qt의 강점:
  각 플랫폼의 네이티브 위젯을 실제로 활용 (Qt Widgets)
  또는 커스텀 렌더링 (Qt Quick/QML)
  신호-슬롯 메커니즘: 이벤트 처리 추상화 잘 됨
  성숙도: 30년간 엣지케이스가 대부분 처리됨
  접근성: 각 플랫폼 접근성 API 연동

Qt의 단점:
  라이선스: 상업용 무료가 아님 (LGPL 조건 복잡)
  C++ 중심: 최신 언어 경험과 거리 있음
  QML 학습 곡선
  바이너리 크기

결론:
  Qt는 "크로스 플랫폼 GUI 프레임워크 중 추상화 누수가 가장 적은" 것에
  가장 오랫동안 근접해있다
  그래서 산업용 기기, 자동차 인포테인먼트, 의료기기 UI에 많이 쓰인다
```

---

## 5. API 레벨 차이 — 실제로 얼마나 다른가

기획자가 "같게 만들어"라고 할 때 개발자가 실제로 마주치는 것들.

### 파일 선택 다이얼로그

```
Windows (WinUI3):
  var picker = new FileOpenPicker();
  picker.FileTypeFilter.Add(".txt");
  StorageFile file = await picker.PickSingleFileAsync();
  // StorageFile이라는 WinRT 타입, 비동기 필수

macOS (SwiftUI):
  .fileImporter(isPresented: $showPicker, allowedContentTypes: [.plainText]) { result in
      // result: Result<URL, Error>
  }
  // URL 타입, SwiftUI 수식어(modifier)로 붙임

Linux (GTK, C):
  GtkWidget *dialog = gtk_file_chooser_dialog_new("파일 열기", parent,
      GTK_FILE_CHOOSER_ACTION_OPEN,
      "_취소", GTK_RESPONSE_CANCEL,
      "_열기", GTK_RESPONSE_ACCEPT, NULL);
  if (gtk_dialog_run(GTK_DIALOG(dialog)) == GTK_RESPONSE_ACCEPT) {
      char *filename = gtk_file_chooser_get_filename(...);
  }
  // 블로킹 실행, char* 반환, g_free() 필요

Android:
  val intent = Intent(Intent.ACTION_GET_CONTENT).apply { type = "text/*" }
  startActivityForResult(intent, REQUEST_CODE)
  // 별도 Activity로 전환, onActivityResult 콜백
```

파일 하나 여는 것만 해도 반환 타입, 실행 방식(동기/비동기), 에러 처리가 전부 다르다. 크로스 플랫폼 프레임워크는 이것을 전부 추상화해야 한다. 그리고 추상화할수록 각 플랫폼의 세밀한 동작(최근 파일 목록, 태그, 권한 모델)을 잃는다.

### 클립보드

```
Windows:
  DataPackage dataPackage = new DataPackage();
  dataPackage.SetText("복사할 텍스트");
  Clipboard.SetContent(dataPackage);

macOS:
  NSPasteboard.general.clearContents()
  NSPasteboard.general.setString("복사할 텍스트", forType: .string)

Android:
  val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
  clipboard.setPrimaryClip(ClipData.newPlainText("label", "복사할 텍스트"))

웹(Electron 내):
  navigator.clipboard.writeText("복사할 텍스트")
  // 또는 document.execCommand("copy") (deprecated)
```

### 시스템 트레이 (백그라운드 앱 아이콘)

```
Windows: System Tray → NotifyIcon (WinForms/WPF) 또는 TrayIcon (WinUI3 미지원, 별도 처리 필요)
macOS: Status Bar Item → NSStatusItem, 메뉴 직접 구성
Linux: AppIndicator / KStatusNotifierItem (데스크톱 환경마다 다름)
모바일: 개념 자체가 없음
```

트레이 아이콘 하나 추가하는 것도 "크로스 플랫폼"으로 깔끔하게 되지 않는다.

---

## 6. 추상화가 한계에 부딪히는 패턴

크로스 플랫폼 개발에서 반복적으로 마주치는 상황들.

```
패턴 1: "이 기능 이 플랫폼에서만 됩니다"
  React Native: <DatePickerIOS> (iOS만)
  MAUI: 일부 컴포넌트 Windows 전용
  → 플랫폼별 코드 경로 불가피

패턴 2: "생김새는 같은데 동작이 다릅니다"
  스크롤 동작:
    iOS: 관성 스크롤, 바운스 효과
    Android: 기본 관성 스크롤, 엣지 글로우
    Windows: 마우스 휠 기반, 관성 없음
  → 크로스 플랫폼 추상화 후 동작이 각 플랫폼에서 어색해짐

패턴 3: "키보드 단축키가 충돌합니다"
  복사: Windows Ctrl+C / macOS Cmd+C
  → Cmd+C를 Windows에 쓰면 작동 안 함
  → Ctrl+C를 macOS에 쓰면 관례 어김

패턴 4: "폰트가 이상합니다"
  같은 UI를 Windows(Segoe UI)와 macOS(SF Pro)에서 렌더링하면
  폰트 크기, 글자 간격, 줄 높이가 다름
  → 레이아웃이 깨지거나 잘림
```

---

## 실용적인 정리

```
"사용성이 같게"의 현실적인 해석:

가능한 것:
  디자인 시스템 (색상, 아이콘, 간격)을 통일
  핵심 기능과 동작의 시각적 유사성 유지
  브랜드 아이덴티티 일관성

어렵거나 나쁜 결과를 내는 것:
  플랫폼 관례를 무시한 완전한 UI 통일
  (macOS에서 창 닫기 버튼을 오른쪽으로 강제하는 등)

현실적인 타협:
  "Platform-Appropriate": 
  동일한 기능을 각 플랫폼의 관례에 맞게 구현
  → 사용자는 같은 앱으로 인식하지만
     각 플랫폼에서 자연스럽게 동작

프레임워크 선택 요약:
  데스크탑 멀티플랫폼: Qt > Electron > Tauri
  모바일: React Native(네이티브 느낌) or Flutter(픽셀 통일)
  전체 플랫폼: Flutter (느낌 희생) or MAUI (추상화 누수 감수)
  최선: 비즈니스 로직 공유 + 플랫폼별 UI
```

API가 다르고, 타입이 다르고, 이벤트 모델이 다른 것은 우연이 아니다. 각 플랫폼이 수십 년에 걸쳐 자신의 사용자 환경에 최적화된 결과다. 그것을 하나의 추상화로 완벽히 덮는 것은 조엘 스폴스키의 표현대로 "불가능한 이상"이다. 현실에서의 최선은, 어디서 공유하고 어디서 플랫폼별로 나눌지를 판단하는 것이다.
