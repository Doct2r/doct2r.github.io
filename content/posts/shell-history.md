---
title: "쉘(Shell)이란 — 진짜 껍질에서 온 이름, bash부터 PowerShell까지"
date: 2026-07-02T21:30:00+09:00
draft: false
tags: ["쉘", "bash", "zsh", "PowerShell", "CLI", "운영체제", "터미널"]
categories: ["운영체제"]
---

터미널을 열면 마주치는 `$` 또는 `>`로 시작하는 프롬프트. 그것이 쉘(Shell)이다. 이름이 왜 껍질인지, bash와 zsh가 어떻게 다른지, Windows의 cmd와 PowerShell은 어디서 왔는지, 그리고 한때 존재했다가 잊혀진 쉘들까지 전부 다룬다.

---

## 1. 어원 — 진짜 껍질에서 왔다

그렇다. 쉘은 **진짜 껍질(shell)**에서 온 이름이다.

1960년대 MIT와 Bell Labs가 공동 개발하던 운영체제 **Multics**에서 이 개념이 처음 명명됐다. Multics 설계자들은 운영체제를 계층으로 나눴다.

```
달걀 구조로 비유하면:

  하드웨어
  └── 커널 (Kernel) — 노른자: 핵심, 실제 권한을 가진 코어
      └── 시스템 서비스 — 흰자: OS가 제공하는 기능들
          └── 쉘 (Shell) — 껍질: 사용자와 맞닿는 바깥층
```

커널(Kernel)도 같은 맥락이다. Kernel은 씨앗의 알맹이(곡물의 핵심)라는 뜻이다. 핵심 주위를 감싸는 껍질이 Shell. 사용자는 껍질과 대화하고, 껍질이 알맹이(커널)에 요청을 전달한다.

**Louis Pouzin**이 1964년 Multics에서 쉘을 독립된 프로그램으로 구현한 선구자다. 이전에는 OS와 사용자 인터페이스가 분리되지 않았다. "쉘을 교체할 수 있다"는 개념이 여기서 시작됐다.

### 쉘 vs 터미널 vs 콘솔

혼용되는 세 단어를 구분해야 한다.

```
터미널(Terminal) / 터미널 에뮬레이터:
  텍스트 입출력을 처리하는 창 프로그램
  예: macOS Terminal.app, Windows Terminal, iTerm2, Alacritty
  → 쉘을 실행하는 "창"

콘솔(Console):
  물리적 터미널 장치에서 온 개념
  지금은 터미널과 거의 같은 의미로 혼용

쉘(Shell):
  터미널 안에서 실행되는 프로그램
  명령을 해석하고 실행하는 인터프리터
  예: bash, zsh, PowerShell

관계:
  터미널(창) → 쉘(프로그램) → 커널(OS 코어)
```

터미널은 화면과 키보드를 연결하는 도구이고, 쉘은 그 안에서 돌아가는 명령 해석기다.

### GUI 쉘도 쉘이다

쉘이 반드시 텍스트 기반일 필요는 없다. **Windows Explorer**는 Windows의 그래픽 쉘이다. **macOS Finder**도 쉘이다. 아이콘을 더블클릭하면 Explorer(쉘)가 커널에 "이 프로그램을 실행해달라"고 요청하는 것이다.

일반적으로 "쉘"이라고 하면 CLI(Command-Line Interface) 쉘을 가리키는 관례가 있을 뿐이다.

---

## 2. Unix/Linux 쉘의 역사

### Thompson Shell — 모든 것의 시작 (1971)

1971년 Ken Thompson이 Unix 초기 버전에 만든 첫 번째 쉘. 지금도 쓰이는 파이프(`|`) 개념이 여기서 처음 구현됐다.

```sh
# 파이프: 첫 번째 명령의 출력이 두 번째 명령의 입력이 된다
ls | grep ".txt"
```

그러나 매우 기초적이었다. 변수도, 반복문도, 조건문도 제대로 없었다. 스크립팅이 불가능했다.

**현재**: 사용되지 않는다. 역사적 의의만.

---

### Bourne Shell — sh의 탄생 (1979)

**Stephen Bourne**이 AT&T Bell Labs에서 개발. Unix 7판(Version 7 Unix)에 포함됐다.

```sh
#!/bin/sh
# Bourne Shell 스크립트

name="World"
echo "Hello, $name"

if [ -f "file.txt" ]; then
    echo "파일이 존재합니다"
fi

for i in 1 2 3; do
    echo $i
done
```

변수, 조건문(`if`), 반복문(`for`, `while`), 함수, 리다이렉션(`>`, `<`), 파이프(`|`) — 현재 쉘 스크립트의 기본 문법이 여기서 확립됐다.

`/bin/sh`라는 경로가 지금도 유지되는 이유가 Bourne Shell이다. POSIX 표준 쉘의 기준점이 됐다.

**약점**: 대화형 사용이 불편했다. 히스토리 기능이 없어 이전 명령을 위 화살표로 불러올 수 없었다. 명령어 자동완성도 없었다.

---

### C Shell — csh (1978)

**Bill Joy**가 UC Berkeley에서 개발. BSD Unix에 포함됐다. 나중에 Sun Microsystems의 공동창업자가 되는 인물이다.

```csh
#!/bin/csh
# C Shell 스크립트 — C 언어와 유사한 문법

set name = "World"
echo "Hello, $name"

if (-f "file.txt") then
    echo "파일이 존재합니다"
endif

foreach i (1 2 3)
    echo $i
end
```

C 언어 문법과 유사하게 설계됐다. 당시 C 언어 사용자가 많았으므로 친숙했다.

**csh가 처음 도입한 것들:**
- 명령어 히스토리: `!!`(이전 명령 재실행), `!n`(n번째 명령)
- 별칭(Alias): `alias ll='ls -la'`
- 작업 제어(Job Control): `Ctrl+Z`로 중지, `bg`/`fg`로 백그라운드/포어그라운드 전환
- 스택 기반 디렉토리: `pushd`/`popd`

**약점**: 스크립팅에서 치명적 버그와 불일치가 많았다. 1995년 Tom Christiansen의 유명한 문서 "Csh Programming Considered Harmful"이 csh의 스크립팅 문제를 조목조목 비판했다. 대화형 사용엔 좋지만 스크립팅엔 쓰지 말라는 것이 업계 통설이 됐다.

**현재**: macOS에서 과거에 기본 쉘이었다. 지금은 tcsh로 대체됐고, 주로 BSD 계열과 일부 레거시 시스템에만 남아 있다.

---

### Korn Shell — ksh (1983)

**David Korn**이 AT&T Bell Labs에서 개발. Bourne Shell의 스크립팅 능력 + C Shell의 대화형 편의성을 결합했다.

```ksh
#!/bin/ksh
# Korn Shell

typeset -i count=0      # 정수형 변수 선언
while (( count < 5 )); do
    print "count: $count"
    (( count++ ))
done
```

- Bourne Shell 완전 호환 (sh 스크립트가 ksh에서 돌아감)
- C Shell처럼 히스토리, 별칭 지원
- 연산식: `(( count++ ))` 같은 산술 표현
- 배열 지원
- 코프로세스(Coprocess): 두 프로세스 간 양방향 통신

ksh는 당시 가장 강력한 쉘이었으나 AT&T 소유여서 초기에는 상업용이었다. 이것이 GNU가 Bash를 만든 이유 중 하나다.

**현재**: ksh93(1993 버전)은 지금도 일부 유닉스 시스템, 특히 IBM AIX, HP-UX에서 기본 쉘이다. 2020년 AT&T가 오픈소스로 공개했다.

---

### Bash — GNU의 대답 (1989)

**Brian Fox**가 GNU 프로젝트의 일환으로 개발. 이름: **B**ourne **A**gain **SH**ell. "다시 태어난 Bourne Shell"이라는 말장난이다.

ksh가 상업용이고 csh의 스크립팅이 문제가 많으니, GNU가 자유롭게 쓸 수 있는 표준 쉘을 만든 것이다.

```bash
#!/bin/bash

# 배열
fruits=("apple" "banana" "cherry")
echo ${fruits[1]}          # banana

# 연관 배열 (bash 4+)
declare -A person
person[name]="홍길동"
person[age]="30"
echo ${person[name]}

# 함수
greet() {
    local name=$1          # 지역 변수
    echo "Hello, $name"
}
greet "World"

# 프로세스 치환
diff <(ls dir1) <(ls dir2)

# 산술
echo $(( 2 ** 10 ))        # 1024
```

**Bash가 표준이 된 이유:**
- GNU/Linux의 기본 쉘 → Linux 배포판 기본
- 무료, 오픈소스 (GPL)
- Bourne Shell 호환 + csh/ksh 편의 기능 통합
- 활발한 업데이트

**중요 사건:**
- **Shellshock (2014)**: Bash의 환경 변수 처리 버그. 웹 서버가 CGI로 bash를 실행할 때 환경 변수를 통해 임의 코드 실행 가능. CVSS 10점 만점. 전 세계 수십억 시스템에 영향. Heartbleed와 함께 2014년 최대 보안 사건.

**현재**: Linux의 사실상 표준. macOS도 2019년 이전까지 기본이었다. 대부분의 쉘 스크립트가 Bash를 가정한다.

---

### tcsh — csh의 개선판 (1975~)

**Ken Greer**, **Paul Placeway** 등이 csh를 개선. "TENEX C Shell"에서 유래 (TENEX는 DEC 운영체제).

csh에 Bash처럼 명령어 자동완성, 스펠링 교정, 히스토리 편집을 추가했다.

macOS는 10.2(2002)부터 tcsh를 기본 쉘로 채택했다가 10.3(2003)에 Bash로 전환했다.

**현재**: FreeBSD의 기본 쉘. 일부 BSD 계열에서 사용.

---

### dash — 작고 빠른 POSIX sh (1997~)

Debian에서 만든 **Almquist Shell(ash)**의 포크. **D**ebian **A**lmquist **SH**ell.

```bash
# dash는 bash 고유 기능을 지원하지 않는다
#!/bin/dash

# 동작: POSIX sh 문법
if [ -f "file" ]; then echo "있음"; fi

# 동작하지 않음: bash 전용
# declare -A assoc_array  → dash에서 오류
```

Bash보다 5~10배 빠르게 시작한다. Ubuntu는 `/bin/sh`를 dash로 연결해 시스템 스크립트 실행 속도를 높였다. `#!/bin/bash`와 `#!/bin/sh`는 다르다 — Ubuntu에서 후자는 dash가 실행한다.

**현재**: Ubuntu, Debian의 `/bin/sh`. 경량 임베디드 시스템. 빠른 시작이 중요한 시스템 스크립트.

---

### zsh — Z Shell (1990)

**Paul Falstad**가 Princeton 대학생 시절 만들었다. 이름의 유래는 Zhong Shao라는 Yale 조교수의 로그인 이름 "zsh".

```zsh
#!/bin/zsh

# 강력한 globbing
ls **/*.txt          # 하위 디렉토리까지 재귀 검색

# 연관 배열 (zsh는 기본 지원)
typeset -A person
person[name]="홍길동"

# 파라미터 확장 플래그
text="hello world"
echo ${(U)text}      # HELLO WORLD (대문자 변환)

# zmv — 패턴 기반 파일 이름 변경
zmv '(*).txt' '$1.md'
```

**zsh의 특징:**
- **강력한 자동완성**: 명령어, 옵션, 파일 경로, Git 브랜치 이름까지
- **Glob 확장**: `**/*.txt`로 재귀 검색
- **테마와 플러그인**: Oh My Zsh 생태계
- **오른쪽 프롬프트(RPROMPT)**: 왼쪽 프롬프트 외에 오른쪽에도 정보 표시
- **공유 히스토리**: 여러 터미널 탭이 히스토리를 공유
- **스펠링 교정**: `git comit` → "git commit을 의미합니까?"

**Oh My Zsh**: zsh 플러그인·테마 관리 프레임워크. 2009년 Robby Russell이 만들었다. 현재 GitHub 17만 스타(2025 기준). 수백 개의 테마, 수백 개의 플러그인.

**결정적 전환점**: 2019년 Apple이 macOS Catalina에서 **기본 쉘을 Bash에서 zsh로 변경**했다. 이유: Bash의 최신 버전(4.x, 5.x)이 GPLv3 라이선스인데 Apple은 GPLv3를 macOS에 포함하기 꺼렸다. zsh는 MIT 라이선스다. 이 전환으로 zsh 사용자가 폭발적으로 늘었다.

**현재**: macOS 기본 쉘. 개발자 커뮤니티에서 Bash를 대체하는 추세. Oh My Zsh와 Powerlevel10k 테마 조합이 사실상 표준처럼 쓰인다.

---

### fish — 친절한 대화형 쉘 (2005)

**Axel Liljencrantz**가 스웨덴 개발자로 개발. **F**riendly **I**nteractive **SH**ell.

```fish
#!/usr/bin/env fish

# fish 문법 — bash/sh와 다르다
set name "World"
echo "Hello, $name"

# 함수
function greet
    echo "Hello, $argv"
end
greet "World"

# 조건문 (fi 대신 end)
if test -f "file.txt"
    echo "있음"
end

# for 루프
for i in (seq 1 3)
    echo $i
end
```

**fish의 철학**: "설정 없이도 좋아야 한다(out of the box experience)". Bash처럼 `.bashrc`에 설정을 잔뜩 넣지 않아도 기본부터 편리하다.

- **자동 제안(Autosuggestion)**: 타이핑하는 순간 이전 히스토리 기반으로 회색으로 제안. 오른쪽 화살표로 수락.
- **24비트 컬러**: 터미널 색상이 풍부
- **문법 강조**: 타이핑하면서 명령어가 맞으면 파란색, 없으면 빨간색
- **웹 기반 설정**: `fish_config` 명령으로 브라우저에서 테마·프롬프트 설정

**단점**: POSIX 호환이 아니다. `#!/bin/sh` 스크립트를 fish에서 실행하면 문법 오류가 난다. `if`/`fi` 대신 `if`/`end`를 쓴다. 기존 Bash 스크립트를 fish용으로 변환해야 한다. 따라서 스크립팅보다 대화형 사용에 집중하는 철학이다.

**현재**: 마니아층이 있다. "설정에 시간 쓰기 싫은 개발자"에게 추천된다. 그러나 POSIX 비호환으로 인해 주류가 되기 어렵다.

---

### 잊혀진 Unix 쉘들

**rc Shell (1980s, Plan 9)**

AT&T Bell Labs의 실험적 OS **Plan 9 from Bell Labs**의 쉘. Tom Duff가 설계. C Shell이나 Bourne Shell과 완전히 다른 문법.

```rc
# rc shell
fn greet {
    echo Hello $1
}
greet World
```

인용 규칙이 다르고, 문법이 더 일관적이라는 평가. 그러나 Plan 9가 주류가 되지 못하면서 잊혔다.

**es Shell**

rc를 기반으로 한 확장형 쉘. 일급 함수, 예외 처리. 학문적 관심의 대상이었으나 실용 영역에서 사라졌다.

**ash — Almquist Shell (1989)**

Kenneth Almquist가 Bourne Shell의 자유 소프트웨어 대안으로 만들었다. dash의 선조. NetBSD, OpenBSD의 기본 sh. BusyBox의 sh도 ash 기반이다.

**scsh — Scheme Shell (1994)**

Olin Shivers가 만든 Scheme 언어 기반 쉘. 프로그래밍 언어로서 쉘 스크립팅을 하는 철학. 학문적 영향은 있었지만 실용 세계에서는 사라졌다.

---

## 3. 현대 쉘들 — 새로운 물결

기존 쉘과 다른 철학을 가진 신세대 쉘이 등장하고 있다.

### Nushell (nu) — 구조화된 데이터의 쉘 (2019)

```nu
# nushell — 모든 것이 구조화된 데이터
ls | where size > 1mb | sort-by size
# 파일 목록을 테이블로 보고, size가 1MB 이상인 것만 필터링

ps | where name == "chrome" | get pid
# 프로세스 목록에서 chrome의 pid만 추출
```

Unix 철학 "모든 것은 텍스트"를 거부하고 "모든 것은 구조화된 데이터"를 표방한다. `ls` 명령이 텍스트가 아닌 테이블을 반환하고, 파이프로 데이터베이스처럼 필터·정렬·변환한다. PowerShell의 객체 파이프라인과 유사한 개념.

**현재**: Rust로 작성. 성장하는 커뮤니티. 기존 sh 스크립트 호환 없음.

### xonsh — Python이 쉘이 되다 (2015)

```xonsh
# xonsh — Python 문법 + 쉘 명령
import os
files = $(ls -la)        # 쉘 명령 결과를 Python 변수로
for line in files.split('\n'):
    if '.py' in line:
        print(line)
```

Python과 쉘 명령을 자유롭게 섞어 쓴다. Python 개발자에게 친숙하다. 그러나 Python 프로세스가 시작돼야 하므로 시작 속도가 느리다.

### Oil Shell / OSH (2016~)

Andy Chu가 만든 "더 나은 bash". OSH(bash 호환 모드)와 Oil(새로운 언어)의 두 모드. Bash의 혼란스러운 문법을 정리하고 안전한 쉘 스크립팅을 목표로 한다.

### Elvish (2016~)

Go로 작성. 구조화된 파이프라인. 강력한 스크립팅 언어. Nushell과 유사한 철학.

---

## 4. Windows 쉘의 역사

Unix 계열과 별개로 Windows는 독자적인 쉘 역사를 가진다.

### COMMAND.COM — DOS의 쉘 (1981~)

MS-DOS의 기본 쉘. CP/M의 CCP(Console Command Processor)에서 영향을 받았다.

```batch
REM COMMAND.COM / 초기 DOS
DIR                     ← 파일 목록
COPY file1.txt file2    ← 파일 복사
TYPE file.txt           ← 파일 내용 출력
```

대소문자를 구분하지 않는다(지금도). 8.3 파일명만 지원했다. 파이프(`|`)와 리다이렉션(`>`, `<`)은 지원했지만 매우 제한적이었다. 환경 변수(`SET PATH=...`), 배치 파일(`.BAT`)을 지원했다.

**BAT 파일 (Batch File)**

```batch
@ECHO OFF
REM 배치 파일 예시

SET NAME=World
ECHO Hello, %NAME%

IF EXIST "file.txt" (
    ECHO 파일이 있습니다
) ELSE (
    ECHO 파일이 없습니다
)

FOR %%i IN (1 2 3) DO ECHO %%i
```

`COMMAND.COM`이 해석하는 스크립트 형식. DOS 시대부터 지금까지 살아있다. `%VARIABLE%` 문법, `GOTO` 레이블, `CALL` 서브루틴. 원시적이지만 여전히 Windows 자동화에 쓰인다.

**현재**: `COMMAND.COM`은 Windows XP까지 존재했다. 지금 32비트 Windows의 레거시로 남아있다.

---

### CMD.EXE — Windows NT의 쉘 (1993~)

Windows NT와 함께 등장. `COMMAND.COM`의 후계자이자 32비트 대응.

```cmd
@ECHO OFF
REM CMD.EXE

:: (더블 콜론도 주석으로 사용 가능)
SET /A result=2+3           ← 산술 연산
ECHO %result%

:: 문자열 처리
SET str=Hello World
ECHO %str:World=Korea%      ← 문자열 치환

:: 긴 파일명 지원 (COMMAND.COM과 다름)
MKDIR "내 폴더"
```

`COMMAND.COM`보다 개선됐지만 여전히 Unix sh와는 비교할 수 없이 제한적이었다. 환경 변수 처리, 문자열 조작이 불편했다. 특히 따옴표, 이스케이프, 유니코드 처리가 혼란스러웠다.

**현재**: Windows 기본 내장. 레거시 배치 파일 실행, 단순 스크립팅에 사용. PowerShell이 있지만 cmd.exe도 여전히 살아있다.

---

### VBScript / WSH — 스크립팅의 시도 (1996~)

Windows Script Host(WSH)와 VBScript. 웹의 ASP에서 쓰던 VBScript를 시스템 스크립팅에 활용하려는 시도였다.

```vbscript
' VBScript 예시
Dim objFSO
Set objFSO = CreateObject("Scripting.FileSystemObject")

If objFSO.FileExists("test.txt") Then
    WScript.Echo "파일 있음"
End If
```

Windows 자동화에 쓰였지만 웹에서 IE의 VBScript 지원이 끝나면서 사실상 사라졌다. 보안 문제(악성 스크립트에 악용)도 많았다.

**현재**: Windows에 여전히 존재하지만 Microsoft가 더 이상 발전시키지 않는다. 레거시.

---

### PowerShell — 패러다임의 전환 (2006~)

**Jeffrey Snover**가 설계. Microsoft의 시스템 관리자들이 Unix의 강력한 쉘 스크립팅을 부러워하며 Windows에서 복잡한 자동화를 원한다는 현실에서 출발했다.

Snover의 핵심 통찰: **Unix는 텍스트 기반, Windows는 객체 기반이다.** Unix에서 `grep`으로 텍스트를 파싱하는 방식을 Windows에 가져오면 어색하다. 대신 파이프로 텍스트가 아닌 **객체(Object)**를 전달하면 어떨까?

```powershell
# PowerShell — 객체 파이프라인

# Get-Process는 텍스트가 아닌 Process 객체 배열을 반환
Get-Process | Where-Object { $_.CPU -gt 10 } | Sort-Object CPU -Descending

# 객체의 속성에 직접 접근
$process = Get-Process -Name "notepad"
$process.Id          # PID (텍스트 파싱 없이)
$process.WorkingSet  # 메모리 사용량

# CSV 파일 직접 파싱 → 객체 배열
Import-Csv "data.csv" | Where-Object { $_.Age -gt 30 }

# .NET 클래스 직접 사용
[System.DateTime]::Now
[System.Math]::Sqrt(144)

# 변수
$name = "World"
Write-Host "Hello, $name"

# 함수
function Get-Greeting {
    param([string]$Name)
    return "Hello, $Name"
}
Get-Greeting -Name "World"
```

**PS1 파일 (PowerShell Script)**

`.ps1` 확장자. 기본적으로 실행이 차단돼 있다 (보안 정책). 실행 정책(Execution Policy)을 변경해야 한다.

```powershell
# 실행 정책 확인
Get-ExecutionPolicy

# 로컬 스크립트 실행 허용 (서명 없는 스크립트)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**PowerShell의 진화:**

| 버전 | 연도 | 변화 |
|---|---|---|
| PowerShell 1.0 | 2006 | Windows 전용, .NET Framework |
| PowerShell 2.0 | 2009 | 원격 관리(Remoting), 백그라운드 작업 |
| PowerShell 3.0 | 2012 | 워크플로, ISE 개선 |
| PowerShell 5.0 | 2016 | 클래스 지원, PackageManagement |
| **PowerShell Core 6.0** | 2018 | **크로스플랫폼 (Mac, Linux 지원)**, .NET Core |
| PowerShell 7.x | 2020~ | .NET 5/6/7, 안정화, 기능 통합 |

**PowerShell Core/7의 등장**: Microsoft가 오픈소스화하고 Mac·Linux를 공식 지원하면서 "Windows 전용"의 한계를 벗어났다. 이것이 Satya Nadella 이후 Microsoft의 전략 전환을 상징한다.

**Azure, Windows Server**: 대부분의 Microsoft 서버 자동화가 PowerShell로 이뤄진다. Active Directory 관리, Exchange 관리, Azure 클라우드 자원 관리 — PowerShell 없이는 불가능하다.

**현재**: Windows 시스템 관리의 표준. 크로스플랫폼 스크립팅 도구로 진화 중.

---

### Windows Terminal — 현대적 터미널 에뮬레이터 (2019)

쉘이 아니라 터미널 에뮬레이터다. cmd.exe, PowerShell, WSL의 Bash, Azure Cloud Shell을 하나의 탭 인터페이스로 열 수 있다.

- GPU 가속 렌더링
- 유니코드·이모지 지원
- 24비트 컬러
- 탭, 창 분할
- JSON 기반 설정
- Microsoft Store에서 설치

Windows가 오랫동안 가졌던 "터미널이 형편없다"는 오명을 벗는 첫 단계였다.

---

### WSL — Windows 안의 Linux (2016~)

쉘이 아니라 Linux 커널 호환 레이어지만, 결과적으로 Windows에서 Bash를 네이티브에 가깝게 실행할 수 있게 됐다.

- **WSL 1**: Linux 시스템 콜을 Windows NT 커널 시스템 콜로 번역
- **WSL 2**: 실제 Linux 커널을 경량 VM 안에서 실행. Hyper-V 기반

```powershell
# Windows에서 Linux Bash 실행
wsl
# 이후부터는 Linux 쉘 환경

# 또는 직접 명령 실행
wsl ls -la /home/user
```

개발자가 Windows에서 Linux 개발 환경을 갖출 수 있게 됐다. "Windows를 쓰면서 Linux가 필요하다"는 딜레마를 해소했다.

---

## 5. 플랫폼별 현황 정리

```
Unix/Linux:
  /bin/sh → 보통 dash (Ubuntu) 또는 bash (다른 배포판)
  기본 대화형 → bash (대부분 Linux)
  macOS → zsh (2019 이후 기본)
  
  현재 주류:
    bash  → Linux 서버, 스크립팅 표준
    zsh   → macOS, Oh My Zsh 사용자
    fish  → 편의성 중시 사용자

  신흥:
    nushell → 구조화된 데이터 철학
    xonsh   → Python 개발자

  살아있지만 틈새:
    ksh93  → IBM AIX, HP-UX
    tcsh   → FreeBSD
    dash   → 시스템 스크립트, /bin/sh

Windows:
  cmd.exe     → 레거시, 배치 파일(.bat)
  PowerShell  → 현재 표준, 시스템 관리
  WSL Bash    → 개발자 환경

잊혀진 것들:
  Thompson sh → 1971, 역사적 의의만
  csh         → tcsh로 사실상 대체
  scsh        → 학문적 관심만
  rc/es       → Plan 9 관련 역사
  VBScript    → Windows 레거시
```

---

## 정리

```
어원:
  커널(Kernel) = 씨앗 알맹이
  쉘(Shell)   = 그 껍질
  사용자 ↔ 쉘 ↔ 커널 ↔ 하드웨어

Unix 쉘의 계보:
  Thompson sh (1971) → 파이프의 탄생
  Bourne sh   (1979) → 스크립팅 표준의 확립
  csh         (1978) → 대화형 편의 (히스토리, 별칭)
  ksh         (1983) → Bourne + csh의 통합
  Bash        (1989) → GNU의 자유 표준, Linux 기본
  tcsh        → csh 개선판, BSD 계열
  dash        → 경량 POSIX sh, 빠른 스크립팅
  zsh         (1990) → 강력한 완성, macOS 기본
  fish        (2005) → 친절한 대화형, POSIX 비호환

Windows 쉘의 계보:
  COMMAND.COM (1981) → DOS 시대
  cmd.exe     (1993) → NT 시대, 지금도 살아있음
  VBScript/WSH(1996) → 시도, 실패, 레거시
  PowerShell  (2006) → 객체 파이프라인, 패러다임 전환
  PowerShell 7(2018) → 크로스플랫폼, 오픈소스

공통 원칙:
  쉘은 교체할 수 있다 (Louis Pouzin의 유산)
  GUI 쉘(Explorer, Finder)도 쉘이다
  터미널 ≠ 쉘 (터미널은 창, 쉘은 그 안의 프로그램)
```

쉘의 역사는 "사용자가 OS와 어떻게 대화할 것인가"라는 질문의 역사다. 텍스트 기반 파이프에서 시작해, 대화형 편의를 더하고, 객체 기반으로 진화하고, 구조화된 데이터로 나아가는 흐름이 지금도 계속되고 있다.
