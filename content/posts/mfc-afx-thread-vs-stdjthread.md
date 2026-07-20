---
title: "AFX란 무엇인가 — MFC 스레드가 std::jthread를 못 쓰는 진짜 이유"
date: 2026-07-28T05:00:00+09:00
draft: false
tags: ["MFC", "AFX", "CWinThread", "C++20", "스레드"]
categories: ["Windows 개발"]
---

[ATL 글](/posts/atl-active-template-library-explained/)에서 "ATL은 MFC의 하위 라이브러리가 아니다"를 다뤘는데, 정작 MFC 코드 곳곳에 박혀 있는 `Afx`라는 접두어의 정체는 따로 짚어본 적이 없다. 이번엔 AFX가 뭔지, MFC의 스레드(`AfxBeginThread`/`CWinThread`)가 어떻게 동작하는지, 그리고 C++20의 `std::jthread`를 왜 순수 MFC 코드에 그냥 가져다 쓸 수 없는지를 정리했다. 참고로 표준에 "ClassThread"라는 이름은 없고, C++20에서 새로 들어온 스레드 타입의 정식 이름은 `std::jthread`다 — 아래에서 이 이름으로 다룬다.

## 1. AFX의 정체 — 마케팅팀이 이름을 바꾼 뒤에도 코드엔 남은 흔적

MFC는 개발 초기에 "Application Framework Extensions", 줄여서 "Afx"라는 이름으로 불렸다. 이후 마케팅 조직이 이름을 "Microsoft Foundation Classes(MFC)"로 바꿨지만, 그 시점엔 이미 코드 전체에 `Afx` 접두어가 너무 깊이 박혀 있어 되돌리기엔 늦었다 — 1994년 4월 "AFX"라는 팀 이름 자체는 사라지고 팀원들이 비주얼 C++ 그룹 내 더 작은 팀들로 흩어졌지만, 코드에 남은 `Afx` 흔적은 그대로 남았다. 비주얼 스튜디오가 MFC 프로젝트를 만들 때 자동 생성하는 미리 컴파일된 헤더 파일 이름이 지금도 `StdAfx.h`인 게 대표적인 흔적이다. 즉 AFX는 "MFC 안의 어떤 하위 기능"이 아니라, MFC 자신의 옛 이름이 코드 표면에 화석처럼 남은 것이다.

## 2. MFC의 스레드 모델 — CWinThread와 AfxBeginThread

MFC 애플리케이션의 모든 스레드는 `CWinThread` 객체로 표현된다. 대부분의 경우 이 객체를 직접 만들 필요 없이 프레임워크가 제공하는 헬퍼 함수 `AfxBeginThread`를 호출하면 되는데, 이 함수는 두 가지 형태로 오버로드돼 있다 — 워커 스레드만 만드는 형태와, 사용자 인터페이스 스레드까지 만들 수 있는 형태다. 워커 스레드(worker thread)는 재계산처럼 사용자 입력이 필요 없는 작업을 처리하고, UI 스레드(user-interface thread)는 사용자 입력에 반응하는 자체 메시지 펌프(message pump)를 갖는다 — 오래 걸리는 무거운 작업을 메인 스레드에서 그대로 돌리면 GUI가 멈추므로, 워커 스레드가 새 CPU 컨텍스트에서 작업을 처리하는 동안 메인 스레드는 곧바로 이벤트 큐로 돌아갈 수 있게 하는 구조다.

## 3. AfxBeginThread는 단순 CreateThread 래퍼가 아니다

`AfxBeginThread`는 겉보기엔 Win32의 `CreateThread`를 감싼 함수처럼 보이지만, 실제로는 그보다 한 단계 더 해주는 일이 있다 — 스레드가 실제로 실행을 시작하기 전에, MFC가 스레드마다 유지하는 상태(`AFX_THREAD_STATE`)를 스레드 로컬 저장소(TLS)에 먼저 심어준다. `CWinThread`가 관리하는 이 스레드별 데이터에는 임시·영구 윈도우 핸들 맵(temporary/permanent window handle map)이 들어 있는데, 이는 여러 스레드가 동시에 같은 MFC 객체에 접근하는 걸 막는 보호 장치 역할을 한다. 즉 `AfxBeginThread`가 하는 일은 "OS 스레드를 하나 만드는 것"이 아니라 "OS 스레드를 만들고 그 위에 MFC가 자기 자신을 인식할 수 있는 장부를 먼저 펼쳐두는 것"이다.

## 4. "핸들이 없어서"가 아니라 "장부가 없어서" 안 되는 것이다

여기서 질문하신 지점을 조금 더 정확히 짚을 필요가 있다 — `std::jthread`(그리고 그 전신인 `std::thread`)도 윈도우에서는 내부적으로 진짜 Win32 `HANDLE`을 갖고 있다. 실제로 MSVC의 표준 라이브러리 구현에서 `native_handle_type`은 그냥 `HANDLE`을 `void*`로 캐스팅한 것이고, `native_handle()`을 호출하면 이 진짜 핸들을 그대로 꺼낼 수 있다. 즉 "핸들 자체가 없어서" MFC와 못 섞이는 게 아니다. 마이크로소프트의 공식 문서가 명시하는 이유는 다르다 — "MFC를 쓰는 모든 스레드는 반드시 MFC가 만들어야 한다. 예를 들어 런타임 함수 `_beginthread`나 `_beginthreadex`로 만든 스레드는 어떤 MFC API도 쓸 수 없다"는 것이다. `std::jthread`도 내부적으로 결국 `_beginthreadex` 계열을 거쳐 스레드를 만들기 때문에 같은 제약을 그대로 물려받는다. 진짜 이유는 3번에서 본 그 "장부"(스레드별 윈도우 핸들 맵과 모듈 상태)가 `AfxBeginThread`의 진입점 트램폴린을 거치지 않은 스레드에는 아예 만들어지지 않는다는 데 있다 — 핸들은 있지만 그 핸들이 가리키는 스레드가 MFC 입장에서는 "존재를 모르는" 스레드인 셈이다. 그 상태로 `CWnd`를 만들거나 리소스를 읽는 등 실제 MFC API를 호출하면 ASSERT 실패나 일반 보호 오류, 엉뚱한 리소스 로딩으로 이어진다는 게 마이크로소프트 자체 기술 노트(TN058)의 설명이다.

## 5. std::jthread 자체는 무엇이 다른가

`std::jthread`는 C++20에 P0660 제안(니콜라이 조수티스·루이스 베이커가 주도하고 이후 앤서니 윌리엄스·허브 서터 등이 공저에 합류)으로 들어온 새 스레드 타입이다. 기존 `std::thread`와 다른 두 가지가 핵심이다 — 소멸자에서 자동으로 `join()`을 호출해 프로그래머가 깜빡 잊고 스레드를 방치해 프로그램이 죽는 사고(`std::thread`는 소멸 시 `join`도 `detach`도 안 돼 있으면 `std::terminate`를 부른다)를 근본적으로 없앴고, `stop_token`을 통한 협조적 취소(cooperative cancellation)를 표준으로 제공해 스레드에게 "이제 그만 멈춰도 된다"는 신호를 안전하게 보낼 수 있게 했다. 순수하게 계산만 하고 창(window)이나 MFC 객체를 건드리지 않는 백그라운드 작업이라면, `std::jthread`는 이 두 이점 덕분에 옛 `AfxBeginThread` 워커 스레드보다 다루기 쉬운 선택지가 될 수 있다.

## 6. 그래서 실무에서는 어떻게 구분해야 하는가

결론적으로 질문의 직관 — "핸들이 없는데 쓰기 어렵다" — 은 방향은 맞지만 정확한 포인트는 아니다. 정확히는 "`std::jthread`가 만든 스레드에는 MFC의 스레드별 장부(윈도우 핸들 맵·모듈 상태)가 아예 열려 있지 않다"는 게 진짜 이유다. 실무에서 이 경계는 명확하게 나뉜다 — 그 스레드 안에서 `CWnd`를 만들거나, `AfxGetApp()`으로 애플리케이션 객체에 접근하거나, MFC가 관리하는 리소스·핸들을 건드릴 계획이라면 반드시 `AfxBeginThread`로 만들어야 하고, 반대로 순수 계산이나 파일 I/O처럼 MFC API를 전혀 호출하지 않고 결과만 메인 스레드에 넘겨주는 작업이라면 `std::jthread`를 써도 무방하다 — 다만 그 결과를 UI에 반영하는 마지막 한 걸음(예: `PostMessage`)은 다시 MFC가 아는 스레드 쪽에서 처리해야 한다.

---

## 정리

AFX는 MFC의 하위 기능이 아니라 MFC 자신의 옛 이름("Application Framework Extensions")이 이름만 바뀐 채 코드에 화석으로 남은 흔적이고, `AfxBeginThread`는 단순 스레드 생성 함수가 아니라 그 스레드가 MFC의 스레드별 장부(윈도우 핸들 맵·모듈 상태)를 갖도록 초기화하는 진입점 트램폴린이다. `std::jthread`가 MFC와 섞이기 어려운 이유도 핸들 유무가 아니라 바로 이 장부가 열려 있느냐의 문제이며, 이는 마이크로소프트가 "`_beginthread`/`_beginthreadex`로 만든 스레드는 MFC API를 쓸 수 없다"고 명시적으로 규정해둔 지점과 정확히 일치한다. C++20의 `std::jthread`는 자동 join과 `stop_token` 기반 협조적 취소라는 확실한 이점을 갖고 있지만, MFC 객체를 직접 건드리는 순간에는 여전히 `AfxBeginThread`가 만든 스레드로 넘어와야 한다는 경계선은 그대로 남아 있다.
