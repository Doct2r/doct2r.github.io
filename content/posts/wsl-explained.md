---
title: "WSL — Windows 안의 Linux, 왜 만들었고 실제로 쓸 만한가"
date: 2026-07-02
draft: false
tags: ["WSL", "Windows", "Linux", "개발환경", "Microsoft"]
categories: ["운영체제"]
---

WSL(Windows Subsystem for Linux)은 "Microsoft loves Linux"라는 말이 농담이 아닌 시대에 나온 산물이다. Windows에서 Linux 명령어를 실행하는 것은 오래된 개발자들의 바람이었다. Cygwin, Git Bash로 임시방편을 쓰던 시절과 무엇이 다른지, 그리고 결국 한계는 어디인지를 따진다.

---

## 1. 왜 나왔는가

### Microsoft의 위기와 전략 전환

2014년 사티아 나델라(Satya Nadella)가 CEO가 됐다. 그의 취임 직후 선언: **"Microsoft loves Linux."** 당시엔 충격적이었다. 스티브 발머가 CEO였을 때 Linux를 "암(cancer)"이라고 표현했던 회사였다.

왜 바뀌었나?

```
2014년 현실:
  Azure 클라우드의 VM 중 Linux 비율 → 이미 Windows를 넘어섬
  개발자 시장 → Mac + Linux 친화적
  Node.js, Python, Ruby, Docker → 전부 Linux 우선
  Git, curl, grep, make → Windows에 없는 도구들
  결론: 개발자를 잃으면 플랫폼을 잃는다
```

개발자들이 Mac을 선택하는 가장 큰 이유 중 하나가 Unix 환경이었다. Linux 서버에서 돌아가는 코드를 Mac에서 개발하면 명령어가 같다. Windows에서는 달랐다.

### 개발자들의 임시방편들

WSL 이전에 Windows에서 Linux 도구를 쓰는 방법들:

**Cygwin (1995~)**
Linux API를 Windows에서 에뮬레이션하는 레이어. bash, grep, sed, awk를 쓸 수 있었다. 하지만 컴파일된 바이너리가 Cygwin 전용이었다. 실제 Linux 바이너리(.so 라이브러리 포함)는 돌아가지 않았다.

**MinGW / MSYS2**
최소화된 GNU 도구. GCC로 Windows 실행 파일을 크로스컴파일하는 용도. Git for Windows가 MSYS2 기반이다. Git Bash가 여기서 나왔다.

**VirtualBox / VMware**
완전한 Linux VM을 돌리는 방법. 확실하지만 무겁다. Windows와 VM 사이 파일 공유가 번거롭다. 포트 포워딩 설정이 필요하다. 시작하는 데 수십 초가 걸린다.

개발자 커뮤니티에서 불만이 오랫동안 쌓였다.

### WSL의 시작 — Build 2016

2016년 Microsoft Build 개발자 컨퍼런스. 발표가 나왔다.

> "Ubuntu on Windows."

Canonical(Ubuntu 개발사)과 협력해, Windows 안에서 실제 Ubuntu 바이너리를 실행한다. 에뮬레이션이 아니다. VM도 아니다. 청중이 술렁였다.

이것이 **WSL 1**이었다.

---

## 2. WSL 1 — 번역 레이어의 아이디어

### 핵심 설계

WSL 1의 아이디어는 단순하면서 야심찼다.

```
Linux 프로그램이 시스템 콜을 호출할 때:
  일반 Linux:
    프로그램 → Linux 커널 시스템 콜 → 하드웨어

  WSL 1:
    Linux 프로그램 → Linux 시스템 콜 →
    [WSL 번역 레이어] → Windows NT 시스템 콜 →
    Windows NT 커널 → 하드웨어
```

Linux 바이너리(ELF 형식)를 그대로 실행한다. 단, 그 바이너리가 커널에 요청하는 시스템 콜을 실시간으로 번역해 Windows NT 커널에 전달한다.

Linux 커널을 올리는 게 아니라 **"Linux가 하는 말을 Windows가 알아듣도록 통역"**하는 방식이다.

### 강점

- **즉시 시작**: VM이 아니므로 `wsl` 명령 입력 후 1~2초 내로 Linux 프롬프트
- **메모리 오버헤드 없음**: Linux 커널 VM이 없다
- **파일 시스템 통합**: Windows 파일이 `/mnt/c/`로 보인다. 속도도 빠르다(같은 드라이브니까)

### 한계

시스템 콜 번역 방식은 구조적 한계가 있었다.

**번역 불가능한 시스템 콜**: Linux 특유의 일부 시스템 콜이 Windows NT에 대응하는 개념이 없었다. 예: `fork()`의 완전한 시멘틱 구현이 어려웠다.

**Docker 불가**: Docker는 Linux 커널의 namespace, cgroups를 직접 사용한다. WSL 1의 번역 레이어는 이를 지원하지 못했다.

**성능 문제**: 특정 연산에서 번역 오버헤드가 컸다. 특히 I/O 집약적 작업.

---

## 3. WSL 2 — 실제 Linux 커널 (2019)

WSL 1의 한계를 근본적으로 해결하는 방법: **진짜 Linux 커널을 올리자.**

### 설계 변경

```
WSL 2:
  Windows 10/11
  └── Hyper-V 경량 유틸리티 VM
      └── 실제 Linux 커널 (Microsoft가 빌드한 커널)
          └── Ubuntu / Debian / Fedora / ... (배포판)
```

완전한 Linux 커널이 Hyper-V 위의 경량 VM으로 실행된다. "경량"이라고 하는 이유는 일반 VM보다 빠르게 시작하고 자원을 동적으로 할당하기 때문이다.

**결과**:
- Docker가 동작한다 (Linux 커널 기능 100% 사용 가능)
- Linux 바이너리가 완전히 네이티브로 실행
- 성능이 대폭 향상 (특히 Linux 파일 시스템 내에서)
- 시스템 콜 번역 오버헤드 없음

### WSL 1 vs WSL 2 비교

| 항목 | WSL 1 | WSL 2 |
|---|---|---|
| Linux 커널 | 없음 (번역 레이어) | 실제 커널 |
| Docker | 불가 | 가능 |
| Linux 파일 I/O | 느림 | 빠름 |
| Windows 파일 접근 (`/mnt/c`) | 빠름 | 느림 |
| 메모리 사용 | 적음 | 더 많음 (VM 오버헤드) |
| 시작 속도 | 매우 빠름 | 빠름 (수초) |
| 호환성 | 부분적 | 거의 완전 |
| 네트워크 | Windows와 공유 | 별도 네트워크 (NAT) |

현재 WSL 2가 기본이다. WSL 1은 특정 상황(Windows 파일 집중 작업, 메모리 절약)에서 선택적으로 사용 가능하다.

---

## 4. 설치와 기본 사용법

### 설치 (Windows 10 2004 이후, Windows 11)

```powershell
# PowerShell 관리자 권한으로

# 기본 설치 (Ubuntu 자동 설치)
wsl --install

# 재부팅 후 Ubuntu 초기 설정 (사용자 이름, 비밀번호 입력)

# 특정 배포판 설치
wsl --install -d Debian
wsl --install -d kali-linux
wsl --install -d openSUSE-Leap-15-5

# 설치 가능한 배포판 목록
wsl --list --online

# 설치된 배포판 목록
wsl --list --verbose
```

### 기본 조작

```powershell
# WSL 시작 (기본 배포판)
wsl

# 특정 배포판 시작
wsl -d Ubuntu-22.04

# 특정 사용자로 시작
wsl -u root

# Linux 명령 직접 실행 (쉘 진입 없이)
wsl ls -la /home

# 종료
wsl --shutdown          # 모든 WSL 인스턴스 종료
wsl --terminate Ubuntu  # 특정 배포판만 종료
```

### 파일 시스템 접근

```bash
# WSL에서 Windows 파일 접근
ls /mnt/c/Users/username/Documents
cd /mnt/c/Users/username/Desktop

# Windows에서 WSL 파일 접근
# 탐색기 주소창에 입력:
\\wsl$\Ubuntu\home\username

# 또는 탐색기 왼쪽 패널에 "Linux" 섹션
```

**중요한 원칙**: 성능을 위해 **Linux에서 작업하는 파일은 Linux 파일 시스템(~/)에 두어야 한다.** `/mnt/c/`를 통한 Windows 파일 접근은 WSL 2에서 느리다.

```bash
# 좋은 방법: Linux 파일 시스템에서 작업
cd ~/projects
git clone https://github.com/...
npm install  # 빠름

# 느린 방법: Windows 파일 시스템에서 작업
cd /mnt/c/Users/user/projects
npm install  # 매우 느림 (파일 I/O가 VM 경계를 넘음)
```

### Windows ↔ Linux 상호운용

WSL의 강력한 기능 중 하나가 양방향 상호운용이다.

```bash
# WSL 안에서 Windows 프로그램 실행
explorer.exe .          # 현재 디렉토리를 Windows 탐색기로 열기
notepad.exe file.txt    # Windows 메모장으로 파일 열기
code .                  # VS Code로 현재 디렉토리 열기
cmd.exe /c "ipconfig"   # Windows 명령 실행

# Windows PATH가 WSL에 자동으로 추가됨
# Windows의 git.exe, node.exe 등을 WSL에서 직접 호출 가능
```

```powershell
# Windows(PowerShell)에서 WSL Linux 명령 실행
wsl grep -r "pattern" /home/user/projects
wsl python3 script.py
wsl -- ls -la ~/

# 파이프도 가능
Get-Content file.txt | wsl grep "keyword"
```

---

## 5. 실제로 무엇에 쓰는가

### 개발 환경 구성

Node.js, Python, Ruby 개발에서 WSL이 진가를 발휘한다.

```bash
# Ubuntu on WSL에서 개발 환경 구성
sudo apt update && sudo apt upgrade

# Node.js (nvm 사용)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
node --version

# Python
sudo apt install python3 python3-pip
pip3 install virtualenv

# 개발에 필요한 도구
sudo apt install git curl wget build-essential
```

VS Code의 **Remote - WSL** 확장을 설치하면, Windows에서 VS Code를 열어 WSL 내부 파일을 편집하고, 터미널도 WSL bash가 된다. Windows에서 Linux 개발 환경을 거의 네이티브로 사용하는 것이 가능해진다.

### Docker

WSL 2와 Docker Desktop의 조합이 Windows에서 컨테이너 개발의 사실상 표준이 됐다.

```bash
# Docker Desktop (Windows)를 설치하면 WSL 2 통합 자동 설정
# WSL 내부에서 docker 명령 사용 가능

docker run -it ubuntu bash
docker-compose up -d
docker build -t myapp .
```

Docker Desktop의 "Use WSL 2 based engine" 옵션을 켜면, Docker 엔진이 WSL 2 VM 안에서 돌아간다. Linux 네이티브 Docker와 사실상 동일한 환경이다.

### 셸 스크립트와 자동화

Linux 서버에서 돌아가는 bash 스크립트를 로컬에서 그대로 테스트할 수 있다.

```bash
# Linux 서버 배포 스크립트를 로컬 WSL에서 테스트
./deploy.sh --env staging

# awk, sed, grep을 cmd.exe에서 찾는 고통 없이
cat log.txt | grep "ERROR" | awk '{print $3}' | sort | uniq -c
```

### GUI 앱 — WSLg (2021)

Windows 11과 함께 **WSLg(WSL GUI)**가 기본 탑재됐다.

```bash
# WSL에서 Linux GUI 앱 직접 실행
# 별도 설정 없이 Windows 화면에 Linux 앱 창이 뜸

sudo apt install gedit
gedit &             # Linux 텍스트 에디터가 Windows 창으로 열림

sudo apt install firefox
firefox &           # Linux Firefox가 Windows에서 실행

sudo apt install gimp
gimp &              # GNU Image Manipulation Program
```

내부적으로 Wayland 프로토콜을 사용한다. X11도 지원한다. 별도 X 서버(VcXsrv 같은 것) 설치 없이 동작한다.

### CUDA / GPU 가속

WSL 2에서 NVIDIA GPU 지원이 추가됐다.

```bash
# CUDA on WSL
nvidia-smi          # GPU 정보 확인
# → WSL에서 Windows의 GPU를 인식

# TensorFlow, PyTorch 등 GPU 가속 가능
pip3 install tensorflow
python3 -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```

이 기능으로 ML 개발자가 Windows PC에서 Linux 기반 AI 개발 환경을 구성할 수 있게 됐다.

### systemd 지원 (2022)

오랜 숙원이었던 **systemd**가 2022년부터 WSL에서 지원됐다.

```bash
# /etc/wsl.conf 설정
[boot]
systemd=true

# WSL 재시작 후
sudo systemctl status nginx
sudo systemctl start postgresql
sudo systemctl enable sshd
```

systemd가 없을 때는 많은 Linux 서비스가 WSL에서 수동으로 시작해야 했다. 이제 시스템 서비스를 Linux 서버와 동일하게 관리할 수 있다.

---

## 6. 실제로 유용한가

결론부터: **개발자 환경으로는 충분히 유용하다. 그러나 Linux를 완전히 대체하지는 않는다.**

### 유용한 상황

**Linux 도구가 필요한 Windows 개발자**
grep, sed, awk, curl, ssh, rsync — 이것들이 필요한데 Linux VM을 올리기엔 번거로운 경우. WSL은 즉시 쓸 수 있는 Linux 환경이다.

**Docker 기반 개발**
Windows에서 Docker를 쓰는 가장 현실적인 방법이 WSL 2 + Docker Desktop이다.

**크로스플랫폼 개발**
Linux 서버에 배포할 코드를 Windows에서 개발하는 경우. 파일 권한, 줄 바꿈(LF vs CRLF), 경로 구분자 문제를 WSL이 완화한다.

**학습 환경**
Linux를 배우는 가장 쉬운 방법 중 하나. 별도 PC나 VM 없이 Windows에서 Ubuntu를 쓸 수 있다.

---

## 7. 문제점과 한계

### 파일 시스템 성능의 이중성

WSL 2의 가장 큰 실용적 단점이다.

```
Windows 파일 시스템 (NTFS) → WSL 2에서 접근:
  /mnt/c/ 경로
  → VM 경계를 넘는 I/O
  → 속도: 네이티브 Linux 대비 수 배~수십 배 느림
  → npm install, git 등 수천 개 파일 작업이 체감될 정도로 느림

Linux 파일 시스템 (ext4) → Windows에서 접근:
  \\wsl$\Ubuntu\ 경로
  → 마찬가지로 VM 경계를 넘음
  → 속도: 느림
```

결론: **"프로젝트 파일은 Linux 파일 시스템(~/projects)에 두어야 한다."** Windows 탐색기로 편집하고 싶으면 `\\wsl$\Ubuntu\`로 접근하면 되지만, 빌드·패키지 설치는 WSL 터미널에서 해야 한다.

### 메모리 사용

WSL 2는 VM이므로 메모리를 점유한다. 기본 설정에서 Windows 메모리의 최대 절반까지 쓸 수 있다.

```ini
# %USERPROFILE%\.wslconfig (Windows 측 설정 파일)
[wsl2]
memory=4GB          # WSL VM 최대 메모리
processors=4        # 최대 CPU 코어
swap=2GB            # 스왑 크기
```

설정하지 않으면 자동으로 조정되지만, 큰 빌드 작업 중에 WSL이 메모리를 많이 쓸 수 있다. 반환도 즉각적이지 않다.

### 네트워크 복잡성

WSL 2는 NAT 방식의 별도 네트워크를 사용한다.

```
Windows의 네트워크 뷰:
  192.168.1.x (실제 네트워크)
  172.x.x.x (WSL 가상 네트워크)

WSL의 네트워크 뷰:
  172.x.x.1 (Windows 호스트)
  172.x.x.x (자신의 IP)
```

**문제 1 — 포트 바인딩**: WSL 안에서 서버를 `0.0.0.0:3000`으로 실행하면, Windows의 `localhost:3000`에서 접근 가능하다. 자동 포트 포워딩이 대부분 동작한다. 그러나 외부 기기에서 접근하려면 추가 설정이 필요하다.

**문제 2 — Windows 11 Mirrored Mode**: Windows 11 22H2부터 실험적으로 네트워크 미러링 모드를 지원한다. WSL이 Windows와 동일한 IP를 갖게 된다. 이 경우 복잡성이 줄지만 아직 완전하지 않다.

```ini
# .wslconfig에서 네트워크 미러링 (Windows 11)
[wsl2]
networkingMode=mirrored
```

### WSL 종료 타이밍

WSL 2는 마지막 터미널을 닫아도 백그라운드에서 계속 실행된다. 명시적으로 종료해야 한다.

```powershell
wsl --shutdown   # 전체 WSL 종료
```

그리고 `wsl --shutdown` 후 재시작하면 systemd 서비스가 전부 다시 시작되어야 한다. 재부팅처럼 동작한다.

### systemd의 일부 제한

systemd를 지원하긴 하지만 완전한 Linux 시스템과 같지 않다.

- 부팅 시 자동 시작이 Windows 부팅에 맞물리지 않는다 (WSL이 켜질 때 시작)
- 일부 systemd 유닛이 WSL 환경에서 동작하지 않는다

### Windows 경로 오염

WSL의 PATH에 Windows 경로가 자동으로 추가된다. 편리하지만 충돌이 생기기도 한다.

```bash
# WSL에서 which python 하면 Windows Python이 나올 수 있음
which python
# → /mnt/c/Users/user/AppData/Local/Programs/Python/Python311/python.exe

# 이것이 원하지 않을 때
# /etc/wsl.conf에서 Windows PATH 비활성화
[interop]
appendWindowsPath=false
```

### 완전한 Linux 대체가 아닌 이유

WSL이 해결하지 못하는 경우:

**베어메탈 성능이 필요할 때**: ML 학습, 컴파일 집약적 작업에서 VM 오버헤드가 쌓인다. 네이티브 Linux 설치나 듀얼부팅이 낫다.

**Linux 커널 개발/드라이버 개발**: WSL의 커널은 Microsoft가 수정한 버전. 커널 모듈을 직접 빌드하고 올리는 작업은 제한적이다.

**USB 장치 직접 접근**: WSL 2는 기본적으로 USB 장치에 접근하지 못한다. `usbipd-win`이라는 별도 도구로 우회할 수 있지만 번거롭다.

**특정 보안 도구**: 패킷 캡처(Wireshark), 네트워크 인터페이스 직접 접근이 제한적이다.

---

## 8. WSL vs 대안들

### vs 듀얼부팅

| | WSL | 듀얼부팅 |
|---|---|---|
| 전환 방법 | 즉시 (같은 세션) | 재부팅 |
| 성능 | VM 오버헤드 있음 | 네이티브 |
| Windows 도구 사용 | 가능 | 별도 부팅 필요 |
| 디스크 | 공유 | 파티션 분리 |
| 설정 복잡도 | 낮음 | 중간 |

개발 작업이 많고 Linux/Windows를 자주 오가야 한다면 WSL이 편하다. Linux 성능이 최우선이면 듀얼부팅.

### vs VMware / VirtualBox

| | WSL 2 | VM (VMware) |
|---|---|---|
| 시작 속도 | 수초 | 수십초~수분 |
| 통합 | 높음 (Windows 파일, 앱 상호운용) | 낮음 |
| 메모리 | 동적 할당 | 고정 할당 |
| 그래픽 | WSLg (기본) | 별도 설정 |
| 완전성 | 약간 제한 | 완전한 VM |

WSL은 개발 도구로서 VM보다 가볍고 통합성이 높다. 완전한 Linux 데스크탑 환경(화면 전체)이 필요하면 VM이 맞다.

### vs Dev Container (VS Code)

Docker 기반으로 개발 환경을 컨테이너에 가두는 방식. WSL 없이도 동작하지만, Windows에서 Dev Container를 쓰면 결국 WSL 2 + Docker Desktop이 뒤에 있다.

---

## 정리

```
탄생 배경:
  개발자가 Mac으로 이탈하는 현실 + Azure가 Linux 기반
  → "개발자를 Windows에 묶어두려면 Linux 도구가 필요하다"
  → Satya Nadella 시대의 "Microsoft loves Linux"

WSL 1 (2016):
  Linux 시스템 콜 → Windows NT 시스템 콜 번역
  가볍지만 Docker 불가, 완전성 부족

WSL 2 (2019):
  실제 Linux 커널을 Hyper-V 경량 VM으로 실행
  Docker 가능, 성능 향상, 호환성 거의 완전
  단점: VM 오버헤드, 파일 시스템 경계 성능

실제로 유용한 경우:
  Linux 도구 + Windows 병행 개발
  Docker 기반 개발
  bash 스크립팅 학습/테스트
  크로스플랫폼 개발

문제가 있는 경우:
  Windows ↔ Linux 파일 시스템 경계 I/O (느림)
  네트워크 복잡성
  USB 장치 직접 접근 제한
  커널 개발, 베어메탈 성능 필요 시

결론:
  "Windows에서 Linux 개발 환경을 원하는 개발자"에게는
  현존하는 최선의 방법이다.
  하지만 "Linux가 필요한 모든 것"의 답은 아니다.
  VM이나 네이티브 Linux가 맞는 상황이 여전히 있다.
```

WSL은 Microsoft가 개발자 커뮤니티에 내민 화해의 손이다. 완벽하지 않지만, Cygwin과 Git Bash로 버티던 시절로 돌아가고 싶은 사람은 없을 것이다.
