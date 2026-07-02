---
title: "각 OS별 프로세스 간 통신(IPC) 방식 총정리"
date: 2026-07-02
draft: false
tags: ["IPC", "Windows", "macOS", "Linux", "시스템 프로그래밍"]
categories: ["시스템"]
---

프로세스는 기본적으로 서로의 메모리를 볼 수 없다. 그 격리를 넘어 데이터를 주고받는 메커니즘이 IPC(Inter-Process Communication)다. OS마다 지원하는 방식이 다르고, 같은 이름이라도 동작 방식이 조금씩 다르다. 이 글에서는 Windows, macOS, Linux 각각의 IPC 방식을 사용법과 주의사항 중심으로 정리한다.

---

## 1. 파이프 (Pipe)

### 익명 파이프 (Anonymous Pipe)

부모-자식 프로세스 간 단방향 통신에 사용한다. 가장 단순한 IPC 방식이다.

| | Windows | macOS | Linux |
|---|---|---|---|
| API | `CreatePipe()` | `pipe()` | `pipe()` |
| 지원 버전 | Windows XP+ | macOS 10.0+ | 커널 2.0+ |
| 방향 | 단방향 | 단방향 | 단방향 |

**Linux / macOS:**
```c
int fd[2];
pipe(fd);  // fd[0]: 읽기, fd[1]: 쓰기

if (fork() == 0) {
    // 자식: 쓰기
    close(fd[0]);
    write(fd[1], "hello", 5);
} else {
    // 부모: 읽기
    close(fd[1]);
    char buf[16];
    read(fd[0], buf, sizeof(buf));
}
```

**Windows:**
```c
HANDLE hRead, hWrite;
SECURITY_ATTRIBUTES sa = { sizeof(sa), NULL, TRUE };
CreatePipe(&hRead, &hWrite, &sa, 0);

// 자식 프로세스에 핸들 상속 후 WriteFile/ReadFile 사용
```

**주의사항**
- 양방향이 필요하면 파이프를 2개 만들어야 한다.
- 버퍼가 가득 차면 `write()`가 블로킹된다.
- 읽는 쪽이 닫히면 쓰는 쪽에서 `SIGPIPE`가 발생한다 (Linux/macOS).

---

### 네임드 파이프 (Named Pipe)

이름이 있어서 **관계없는 프로세스 간**에도 통신 가능하다.

| | Windows | macOS | Linux |
|---|---|---|---|
| API | `CreateNamedPipe()` | `mkfifo()` | `mkfifo()` |
| 경로 | `\\.\pipe\이름` | 파일시스템 경로 | 파일시스템 경로 |
| 양방향 | 지원 (`PIPE_ACCESS_DUPLEX`) | 불가 (FIFO는 단방향) | 불가 |

**Linux / macOS (FIFO):**
```bash
mkfifo /tmp/my_pipe
```
```c
// 서버
int fd = open("/tmp/my_pipe", O_RDONLY);
read(fd, buf, sizeof(buf));

// 클라이언트
int fd = open("/tmp/my_pipe", O_WRONLY);
write(fd, "data", 4);
```

**Windows:**
```c
// 서버
HANDLE h = CreateNamedPipe(
    L"\\\\.\\pipe\\mypipe",
    PIPE_ACCESS_DUPLEX,
    PIPE_TYPE_MESSAGE | PIPE_READMODE_MESSAGE | PIPE_WAIT,
    1, 4096, 4096, 0, NULL
);
ConnectNamedPipe(h, NULL);

// 클라이언트
HANDLE h = CreateFile(
    L"\\\\.\\pipe\\mypipe",
    GENERIC_READ | GENERIC_WRITE,
    0, NULL, OPEN_EXISTING, 0, NULL
);
```

**주의사항**
- Windows 네임드 파이프는 네트워크 경유(`\\서버명\pipe\이름`)도 가능하다.
- Linux FIFO는 양쪽이 모두 open해야 블로킹이 풀린다. 한쪽만 열면 영원히 대기한다.
- macOS에서 FIFO 경로는 일반 파일처럼 퍼미션 관리가 필요하다.

---

## 2. 공유 메모리 (Shared Memory)

가장 빠른 IPC 방식이다. 커널을 거치지 않고 메모리를 직접 공유한다. 단, 동기화는 직접 해야 한다.

| | Windows | macOS | Linux |
|---|---|---|---|
| API | `CreateFileMapping()` / `MapViewOfFile()` | `shm_open()` + `mmap()` | `shmget()` / `shm_open()` + `mmap()` |
| 네임스페이스 | 전역(`Global\`) / 세션(`Local\`) | `/dev/shm/` | `/dev/shm/` |

**Linux / macOS (POSIX):**
```c
// 생성
int fd = shm_open("/my_shm", O_CREAT | O_RDWR, 0600);
ftruncate(fd, 4096);
void *ptr = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);

// 해제
munmap(ptr, 4096);
shm_unlink("/my_shm");
```

**Windows:**
```c
// 생성
HANDLE h = CreateFileMapping(
    INVALID_HANDLE_VALUE, NULL,
    PAGE_READWRITE, 0, 4096, L"Global\\MyShm"
);
void *ptr = MapViewOfFile(h, FILE_MAP_ALL_ACCESS, 0, 0, 4096);

// 연결 (다른 프로세스)
HANDLE h = OpenFileMapping(FILE_MAP_ALL_ACCESS, FALSE, L"Global\\MyShm");
void *ptr = MapViewOfFile(h, FILE_MAP_ALL_ACCESS, 0, 0, 4096);
```

**주의사항**
- **반드시 동기화**가 필요하다. 뮤텍스나 세마포어를 함께 사용해야 한다.
- Linux의 구형 System V API(`shmget`)와 POSIX API(`shm_open`)는 네임스페이스가 다르다. POSIX를 권장한다.
- Windows에서 `Global\` 접두사는 관리자 권한이나 `SeCreateGlobalPrivilege`가 필요하다.
- macOS는 샌드박스 환경(앱스토어 배포 앱)에서 공유 메모리 사용이 제한된다.

---

## 3. 메시지 큐 (Message Queue)

비동기 메시지 전달 방식. 송신자와 수신자가 동시에 실행 중일 필요가 없다.

| | Windows | macOS | Linux |
|---|---|---|---|
| System V API | 없음 | 지원 | 지원 (`msgget`, `msgsnd`, `msgrcv`) |
| POSIX API | 없음 | 지원 | 지원 (`mq_open`, `mq_send`, `mq_receive`) |
| 네이티브 | MSMQ | `NSXPCConnection` (상위 레이어) | - |

**Linux / macOS (POSIX):**
```c
#include <mqueue.h>

// 생성
mqd_t mq = mq_open("/my_queue", O_CREAT | O_RDWR, 0600, NULL);

// 송신
mq_send(mq, "hello", 5, 0);  // 마지막 인자: 우선순위

// 수신
char buf[256];
mq_receive(mq, buf, sizeof(buf), NULL);

// 정리
mq_close(mq);
mq_unlink("/my_queue");
```

**주의사항**
- Linux에서 `mq_open` 실패 시 `/proc/sys/fs/mqueue/` 설정값을 확인한다 (큐 수 제한).
- macOS는 POSIX 메시지 큐를 지원하지만 성능이 우수하지 않다. 앱 간 통신은 XPC를 권장한다.
- 프로세스가 죽어도 큐 안의 메시지는 남는다. `mq_unlink()`로 명시적으로 삭제해야 한다.

---

## 4. 소켓 (Socket)

네트워크 통신과 동일한 API로 IPC를 구현한다. 가장 범용적이고 언어 제약이 없다.

### Unix 도메인 소켓 (Unix Domain Socket)

TCP/IP를 쓰지 않고 파일시스템 경로로 연결한다. 루프백보다 빠르고, 로컬 전용이다.

| | Windows | macOS | Linux |
|---|---|---|---|
| 지원 | Windows 10 1803+ (빌드 17063) | macOS 10.0+ | 커널 2.0+ |
| 경로 | `C:\temp\sock` 등 일반 경로 | `/tmp/sock` 등 | `/tmp/sock` 등 |

**Linux / macOS:**
```c
// 서버
int sock = socket(AF_UNIX, SOCK_STREAM, 0);
struct sockaddr_un addr = { .sun_family = AF_UNIX };
strcpy(addr.sun_path, "/tmp/my.sock");
bind(sock, (struct sockaddr*)&addr, sizeof(addr));
listen(sock, 5);
int client = accept(sock, NULL, NULL);

// 클라이언트
int sock = socket(AF_UNIX, SOCK_STREAM, 0);
connect(sock, (struct sockaddr*)&addr, sizeof(addr));
```

**주의사항**
- 소켓 파일(`/tmp/my.sock`)이 남아 있으면 `bind()`가 실패한다. 서버 시작 전 `unlink()`로 제거한다.
- Windows 유닉스 도메인 소켓은 WSL 환경과 네이티브 환경 간 통신도 가능하다.
- macOS 샌드박스 환경에서는 소켓 경로에 접근 권한이 필요하다.

---

## 5. 시그널 (Signal)

프로세스에 비동기적으로 이벤트를 전달한다. 데이터를 전달하는 것이 아니라 **사건을 알리는** 용도다.

| | Windows | macOS | Linux |
|---|---|---|---|
| API | `GenerateConsoleCtrlEvent()`, `TerminateProcess()` | `kill()`, `sigaction()` | `kill()`, `sigaction()` |
| 실시간 시그널 | 없음 | 없음 | `SIGRTMIN`~`SIGRTMAX` |

**Linux / macOS:**
```c
// 핸들러 등록
void handler(int sig) { /* 처리 */ }
signal(SIGTERM, handler);
// 또는 (권장)
struct sigaction sa = { .sa_handler = handler };
sigaction(SIGTERM, &sa, NULL);

// 전송
kill(target_pid, SIGUSR1);
```

**주의사항**
- 시그널 핸들러 안에서는 **async-signal-safe 함수만** 호출할 수 있다. `printf()`는 안전하지 않다.
- `SIGKILL`과 `SIGSTOP`은 캐치하거나 무시할 수 없다.
- Windows는 POSIX 시그널을 부분적으로만 지원한다 (`SIGINT`, `SIGTERM` 등 일부만 동작).
- 멀티스레드 환경에서 시그널은 임의의 스레드에 전달될 수 있다. `pthread_sigmask()`로 제어한다.

---

## 6. 세마포어 (Semaphore)

공유 자원 접근을 제어하는 카운터 기반 동기화 기법이다. IPC 데이터 전달보다는 **공유 메모리와 함께** 사용된다.

| | Windows | macOS | Linux |
|---|---|---|---|
| API | `CreateSemaphore()` | `sem_open()` | `sem_open()` / `semget()` |
| 프로세스 간 | 지원 | 지원 | 지원 |

**Linux / macOS (POSIX):**
```c
sem_t *sem = sem_open("/my_sem", O_CREAT, 0600, 1);  // 초기값 1

sem_wait(sem);   // P 연산 (카운터 감소, 0이면 블로킹)
// 임계 구역
sem_post(sem);   // V 연산 (카운터 증가)

sem_close(sem);
sem_unlink("/my_sem");
```

**Windows:**
```c
HANDLE h = CreateSemaphore(NULL, 1, 1, L"Global\\MySem");
WaitForSingleObject(h, INFINITE);  // P
// 임계 구역
ReleaseSemaphore(h, 1, NULL);      // V
```

**주의사항**
- `sem_wait()` 중 시그널을 받으면 `EINTR`로 실패할 수 있다. 루프로 재시도해야 한다.
- 프로세스가 비정상 종료되면 세마포어가 잠긴 채로 남는다. 이를 **세마포어 데드락**이라 하며 복구가 어렵다.
- Linux의 System V 세마포어(`semget`)는 `SEM_UNDO` 플래그로 프로세스 종료 시 자동 해제가 가능하다.

---

## 7. 메모리 맵 파일 (Memory-mapped File)

파일을 메모리 주소 공간에 직접 매핑한다. 공유 메모리처럼 쓸 수 있으면서 파일 영속성도 가진다.

| | Windows | macOS | Linux |
|---|---|---|---|
| API | `CreateFileMapping()` + `MapViewOfFile()` | `mmap()` | `mmap()` |

**Linux / macOS:**
```c
int fd = open("shared.bin", O_RDWR | O_CREAT, 0600);
ftruncate(fd, 1024);
void *ptr = mmap(NULL, 1024, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);

// ptr로 직접 읽기/쓰기
memcpy(ptr, "data", 4);
msync(ptr, 1024, MS_SYNC);  // 디스크에 플러시

munmap(ptr, 1024);
```

**주의사항**
- `MAP_SHARED`는 변경사항이 다른 프로세스에 즉시 반영되지만, 디스크 반영은 `msync()` 또는 OS 페이지 플러시 시점에 된다.
- `MAP_PRIVATE`은 Copy-on-Write 방식으로 다른 프로세스에 영향을 주지 않는다.
- 파일 크기보다 큰 영역을 매핑하면 `SIGBUS`가 발생한다.

---

## 8. OS별 고유 IPC 방식

### Windows — COM (Component Object Model)

Windows 고유의 객체 기반 IPC. 프로세스 경계를 넘어 메서드를 호출하는 방식(Out-of-process COM)이다.

- **지원 버전**: Windows 95+
- **사용 사례**: Office Automation, Shell 확장, WMI
- COM 객체를 `CoCreateInstance()`로 생성하면 레지스트리에 등록된 서버 프로세스가 자동 실행된다.
- 마샬링(Marshaling)을 통해 데이터 타입 변환을 자동 처리한다.

**주의사항**
- 아파트먼트 모델(STA/MTA) 이해 없이 쓰면 교착 상태가 발생한다.
- 32비트 COM 서버와 64비트 클라이언트 혼용 시 Surrogate 프로세스(`dllhost.exe`)가 개입한다.

---

### Windows — Mailslot

단방향, 브로드캐스트 가능한 Windows 전용 IPC. 네트워크를 통한 브로드캐스트가 특징이다.

- **지원 버전**: Windows NT+
- 신뢰성 없는 전송 (UDP 계열). 메시지 손실 가능.
- 로컬 및 도메인 내 브로드캐스트 가능: `\\*\mailslot\이름`

```c
// 서버 (수신)
HANDLE h = CreateMailslot(L"\\\\.\\mailslot\\mymailslot", 0, MAILSLOT_WAIT_FOREVER, NULL);
ReadFile(h, buf, sizeof(buf), &read, NULL);

// 클라이언트 (송신)
HANDLE h = CreateFile(L"\\\\*\\mailslot\\mymailslot", GENERIC_WRITE, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL);
WriteFile(h, "msg", 3, &written, NULL);
```

---

### macOS — XPC

macOS 10.7+에서 도입된 Apple 공식 IPC 프레임워크. 샌드박스와 권한 분리 목적으로 설계되었다.

- **지원 버전**: macOS 10.7 (Lion)+, iOS 6+
- launchd와 연동되어 서비스 프로세스를 자동 관리한다.
- Objective-C(`NSXPCConnection`) 또는 C API(`xpc_connection_create`) 사용 가능.

```objc
// 서비스 연결 (클라이언트)
NSXPCConnection *conn = [[NSXPCConnection alloc]
    initWithServiceName:@"com.example.myservice"];
conn.remoteObjectInterface = [NSXPCInterface interfaceWithProtocol:@protocol(MyProtocol)];
[conn resume];

[[conn remoteObjectProxy] doSomethingWithReply:^(NSString *result) {
    NSLog(@"Result: %@", result);
}];
```

**주의사항**
- 앱스토어 배포 앱은 XPC Service 또는 XPC로만 IPC가 허용되는 경우가 많다.
- 전달 가능한 타입이 plist 직렬화 가능 타입으로 제한된다 (NSString, NSData, NSArray 등).

---

### macOS — Mach Port

macOS와 iOS의 최하위 IPC 메커니즘. XPC, NSMachPort, Distributed Objects 모두 내부적으로 Mach Port를 사용한다.

- **지원 버전**: macOS 전 버전 (NeXTSTEP 기원)
- 커널 수준의 메시지 패싱 기법
- `mach_msg()`로 메시지 송수신

**주의사항**
- 직접 사용은 매우 복잡하고, 잘못 사용하면 커널 자원 누수가 발생한다.
- 애플 프레임워크가 추상화한 XPC 사용을 권장한다.
- 보안 취약점의 단골 대상이다 (Mach Port 권한 탈취 등).

---

### Linux — D-Bus

데스크탑 환경(GNOME, KDE)에서 주로 쓰이는 메시지 버스 시스템.

- **지원 버전**: Linux 전반 (2002년 이후)
- System Bus (시스템 서비스)와 Session Bus (사용자 세션) 두 종류
- 서비스 이름은 역방향 도메인 표기: `org.freedesktop.NetworkManager`

```python
# Python (dbus-python)
import dbus
bus = dbus.SystemBus()
obj = bus.get_object('org.freedesktop.NetworkManager', '/org/freedesktop/NetworkManager')
iface = dbus.Interface(obj, 'org.freedesktop.NetworkManager')
state = iface.state()
```

**주의사항**
- D-Bus는 성능보다 편의성 중심이다. 고빈도 데이터 전송에는 적합하지 않다.
- 폴리시 파일(`/etc/dbus-1/system.d/`)로 접근 권한을 관리한다.
- systemd 서비스 활성화와 연동할 수 있다 (D-Bus Activation).

---

## 방식 선택 기준 요약

| 상황 | 권장 방식 |
|---|---|
| 부모-자식 간 단순 데이터 전달 | 익명 파이프 |
| 관계없는 프로세스 간 스트림 통신 | Unix 도메인 소켓 / 네임드 파이프 |
| 대용량 데이터 고속 공유 | 공유 메모리 + 세마포어 |
| 비동기 이벤트 알림 | 시그널 (Linux/macOS) / 이벤트 오브젝트 (Windows) |
| 언어/플랫폼 무관 범용 통신 | TCP 소켓 |
| macOS 앱 간 통신 | XPC |
| Windows COM 기반 서비스 | COM Out-of-process |
| Linux 데스크탑 서비스 | D-Bus |

IPC 방식은 성능, 보안, 유지보수성의 트레이드오프다. 가장 단순한 것부터 시작해서 병목이 생겼을 때 공유 메모리로 내려가는 방향이 현실적이다.
