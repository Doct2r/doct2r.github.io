---
title: "WPF는 언제 써야만 하는가?"
date: 2026-07-02T12:00:00+09:00
draft: false
tags: ["WPF", "Windows", "C#", ".NET", "UI 프레임워크"]
categories: ["Windows 개발"]
---

결론부터 말하면, WPF를 써야 하는 상황은 생각보다 좁다. 그러나 그 좁은 상황 안에서는 WPF만큼 빠르고 든든한 선택이 없다. 언제 쓰고 언제 피해야 하는지를 제대로 알면 불필요한 삽질을 크게 줄일 수 있다.

---

## 1. WPF가 뭔가

WPF(Windows Presentation Foundation)는 2006년 .NET Framework 3.0과 함께 등장한 Windows 데스크탑 UI 프레임워크다. Microsoft가 WinForms의 한계를 넘기 위해 설계했고, 핵심은 두 가지다.

**XAML**: UI를 XML 기반의 마크업 언어로 선언적으로 정의한다. 레이아웃, 스타일, 애니메이션, 바인딩을 코드 없이 표현할 수 있다.

**DirectX 기반 렌더링**: GDI 대신 DirectX로 그린다. 하드웨어 가속을 활용하므로 WinForms보다 부드럽고 유연한 그래픽이 가능하다.

```xml
<Window x:Class="MyApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="My App" Height="400" Width="600">
    <Grid>
        <Button Content="클릭" Click="OnClick"
                Background="#308572" Foreground="White"
                Width="100" Height="40"/>
    </Grid>
</Window>
```

지원 범위는 넓다.

| 항목 | 내용 |
|---|---|
| 지원 OS | Windows 7 SP1 ~ Windows 11 |
| 런타임 | .NET Framework 3.0+ / .NET 6+ (Core 계열) |
| 언어 | C#, VB.NET, F# |
| 라이선스 | MIT (오픈소스, 2018년 이후) |

Windows 7부터 11까지 한 코드베이스로 커버된다는 것이 WPF의 가장 강력한 실용적 장점이다.

---

## 1-2. 그럼에도 WPF를 쓰는 이유

### 지원 범위

엔터프라이즈 환경, 특히 제조업·금융·공공기관을 보면 아직도 Windows 7, 10이 혼재한다. 심한 경우 Windows XP도 살아있다(XP는 .NET 3.5까지만 지원하므로 WPF 가능). WinUI3는 Windows 10 1809 이상, MAUI는 Windows 10 1809 이상이 요구된다. WPF는 이 모든 환경을 단일 코드로 대응할 수 있는 사실상 유일한 선택이다.

### 개발 속도

MVVM 패턴과 데이터 바인딩이 잘 맞물리면 개발 속도가 빠르다. UI와 비즈니스 로직을 바인딩으로 연결하면 코드비하인드에 UI 조작 코드가 거의 없어진다.

```csharp
// ViewModel
public class MainViewModel : INotifyPropertyChanged
{
    private string _status;
    public string Status
    {
        get => _status;
        set { _status = value; OnPropertyChanged(); }
    }
}
```
```xml
<!-- XAML: 코드 없이 바인딩 -->
<TextBlock Text="{Binding Status}" />
```

### 생태계와 레퍼런스

20년치 레퍼런스와 라이브러리가 쌓여 있다. 웬만한 문제는 Stack Overflow 검색 한 번으로 해결된다. Telerik, DevExpress, Syncfusion 같은 서드파티 컨트롤 라이브러리도 WPF 지원이 가장 성숙해 있다. 차트, 그리드, 스케줄러 같은 컴포넌트를 직접 만들 필요가 없다.

### 커스터마이징

WPF의 Control Template은 거의 모든 UI 요소를 뼈대부터 다시 그릴 수 있게 해준다. 버튼의 기본 사각형 모양 자체를 XAML로 교체하는 것도 가능하다. 픽셀 단위 커스텀 UI가 필요한 산업용 HMI나 내부 도구에서 WPF가 잘 맞는 이유다.

---

## 2. 한계 — 왜 다른 프레임워크가 나왔는가

WPF가 충분히 좋다면 WinUI3, MAUI, Avalonia, Uno Platform이 나올 이유가 없었다. 이것들이 나온 이유가 곧 WPF의 한계다.

### Windows 전용

WPF는 Windows API와 DirectX에 깊게 결합되어 있다. macOS, Linux에서 실행되지 않는다. 크로스플랫폼이 필요해지자 Avalonia, MAUI가 등장했다.

### .NET Framework 시절의 설계 부채

WPF는 .NET Framework 시대에 설계되었다. 비동기 처리(`async/await`)가 없던 시절의 API가 그대로 남아있어 Dispatcher를 통한 UI 스레드 마샬링이 여전히 필요하다.

```csharp
// WPF에서 다른 스레드에서 UI 업데이트할 때
Application.Current.Dispatcher.Invoke(() =>
{
    MyLabel.Content = "완료";
});
```

이 패턴이 현대 C# 코드와 어색하게 섞인다.

### 고DPI / 다중 모니터 지원 미흡

WPF는 DPI 인식 모델이 오래됐다. 기본 설정으로는 고DPI(200%) 모니터에서 흐릿하게 렌더링된다. `PerMonitorV2` DPI 인식을 활성화해도 일부 서드파티 컨트롤이 깨지는 경우가 있다. WinUI3는 처음부터 이 문제를 고려해 설계됐다.

### 성능 한계 — 복잡한 UI에서 느려진다

WPF의 레이아웃 시스템은 재귀적 Measure/Arrange 패스를 거친다. 복잡하게 중첩된 Panel에 많은 요소를 넣으면 레이아웃 패스 비용이 누적된다. 가상화(`VirtualizingStackPanel`)를 써도 수만 건의 아이템을 실시간으로 다루는 데이터 그리드에서 체감 성능이 문제가 된다.

### UWP/WinUI3로의 단절

Microsoft가 Windows 8 시절 UWP를 밀면서 WPF를 사실상 레거시 취급했다. WPF는 2018년부터 오픈소스로 전환되고 유지보수는 계속되지만, 새로운 Windows API(알림, 위젯, 라이브 타일 등)의 WPF 지원은 뒤처진다. 최신 Windows 기능을 빠르게 쓰려면 WinUI3가 필요하다.

### 모바일 없음

WPF 코드를 iOS나 Android로 가져갈 방법이 없다. 처음부터 데스크탑 전용이다.

---

## 3. 실제 사례 — WPF가 잘 맞는 현장

### 산업용 HMI (Human-Machine Interface)

공장 설비나 장비를 제어하는 화면. Windows 기반 산업용 PC가 표준이고, 커스텀 계기판, 실시간 센서 데이터 시각화가 필요하다. 운영 환경이 Windows 7~10으로 고정되어 있는 경우가 많아 WPF가 최적이다.

### 사내 ERP / 업무 도구

수백 개의 입력 필드, 복잡한 데이터 그리드, 인쇄 기능이 필요한 사내 시스템. 서드파티 컨트롤 라이브러리를 쓰면 개발 기간을 크게 줄일 수 있고, 인터넷 연결 없이 사내망에서만 동작해 크로스플랫폼이 필요 없다.

### 개발 도구 / IDE 플러그인

Visual Studio 자체가 WPF로 만들어졌다. VS 플러그인(VSIX), 코드 분석 도구, 빌드 시각화 도구 등 개발자용 Windows 전용 도구는 WPF가 자연스러운 선택이다.

### CAD / 설계 도구 (경량)

2D 도면 편집, 회로도 작성 같은 벡터 기반 도구. WPF의 `DrawingVisual`, `StreamGeometry`를 활용하면 고성능 2D 렌더링을 비교적 쉽게 구현할 수 있다. OpenGL 수준의 3D가 필요하다면 WPF + HelixToolkit 조합도 있다.

### 기존 WinForms 마이그레이션

오래된 WinForms 앱을 현대화할 때. WPF는 `WindowsFormsHost`를 통해 기존 WinForms 컨트롤을 내부에 임베드할 수 있다. 전체를 한 번에 재작성하지 않고 점진적 이전이 가능하다.

---

## 4. 결론 — 이럴 때만 쓰면 정신건강에 이롭다

WPF를 선택해야 하는 조건을 하나씩 체크해보자.

```
✅ 대상 OS가 Windows 7~11을 모두 커버해야 한다
✅ 크로스플랫폼(macOS, Linux, 모바일)은 불필요하다
✅ 복잡한 커스텀 UI나 데이터 바인딩이 많다
✅ 개발 기간이 촉박하고 서드파티 컴포넌트를 써야 한다
✅ 팀이 C# / XAML에 익숙하다
```

이 다섯 개가 전부 체크되면 WPF가 답이다. 망설일 필요가 없다.

반대로 이런 상황이라면 WPF를 피해야 한다.

```
❌ Windows 10 이상만 지원하면 된다  →  WinUI3 검토
❌ macOS나 Linux도 지원해야 한다   →  Avalonia / MAUI
❌ 웹 배포나 브라우저 접근이 필요하다  →  Blazor / 웹 앱
❌ 모바일도 함께 지원해야 한다     →  MAUI
❌ 최신 Windows 11 API를 써야 한다  →  WinUI3
```

WPF는 죽지 않았다. 오픈소스로 전환된 이후에도 꾸준히 업데이트되고 있고, .NET 9에서도 새 기능이 추가됐다. 다만 모든 것에 쓸 수 있는 프레임워크가 아니라, **특정 조건을 만족하는 Windows 전용 애플리케이션에서 가장 검증된 선택**이라는 위치로 자리를 찾아가고 있다.

선택 기준이 명확하면 프레임워크 논쟁에 시간을 낭비하지 않아도 된다.
