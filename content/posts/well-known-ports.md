---
title: "서비스 포트 총정리 — 알아야 할 공식 포트 목록"
date: 2026-07-02
draft: false
tags: ["네트워크", "포트", "보안", "인프라"]
categories: ["네트워크"]
---

서버를 다루다 보면 포트 번호가 끊임없이 등장한다. 방화벽 설정, 도커 포트 매핑, 보안 점검, 트러블슈팅 — 어디서든 포트를 알아야 한다. 이 글에서는 실무에서 반드시 알아야 할 포트들을 정리한다.

---

## 1. 서비스 포트란

TCP/IP에서 하나의 IP 주소는 여러 서비스를 동시에 제공할 수 있다. 이때 어떤 패킷이 어떤 서비스로 가야 하는지 구분하는 번호가 **포트(Port)**다.

포트는 0~65535 범위의 16비트 정수다. IANA(Internet Assigned Numbers Authority)가 범위별로 용도를 정의한다.

| 범위 | 이름 | 용도 |
|---|---|---|
| 0 ~ 1023 | Well-known Ports | OS가 관리. 표준 프로토콜 전용 |
| 1024 ~ 49151 | Registered Ports | 벤더/애플리케이션이 IANA에 등록 |
| 49152 ~ 65535 | Dynamic / Ephemeral Ports | OS가 클라이언트 연결 시 임시 할당 |

Well-known Ports(0~1023)는 Unix 계열에서 **root 권한 없이는 바인딩이 불가능**하다. 이 범위가 신뢰의 근거다.

---

## 2. 왜 알아야 하나

### 약속이기 때문에

포트는 전 세계가 합의한 약속이다. 클라이언트가 `http://example.com`에 접속할 때 포트를 명시하지 않으면 브라우저는 자동으로 80번 포트를 찍는다. 이 약속이 깨지면 인터넷이 동작하지 않는다. 개발자가 포트를 모르면 프로토콜 자체를 모르는 것과 같다.

### 서비스 제공자라면

서버를 운영할 때 방화벽에서 어떤 포트를 열고 닫아야 하는지 알아야 한다. 필요한 포트를 막으면 서비스가 죽고, 필요 없는 포트를 열면 공격 표면이 넓어진다. 포트를 모르고 방화벽 규칙을 짜는 것은 눈 감고 수술하는 것과 같다.

### 보안과 해킹

공격자가 서버에 접근할 때 가장 먼저 하는 것이 포트 스캔이다. `nmap` 한 줄이면 어떤 서비스가 열려 있는지 30초 만에 파악된다.

```bash
nmap -sV 192.168.1.1
```

방어하는 입장에서도 포트를 알아야 한다. 예상치 못한 포트가 열려 있다면 침해의 흔적일 수 있다. 반대로 공격자들이 자주 노리는 포트가 어딘지 알아야 선제적으로 막거나 모니터링할 수 있다.

---

## 3. 포트 목록

### 파일 전송

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 20 | TCP | FTP-DATA | FTP 데이터 전송 |
| 21 | TCP | FTP | FTP 제어 채널. 명령어 송수신 |
| 22 | TCP | SFTP | SSH 위에서 동작하는 파일 전송 (SSH와 같은 포트) |
| 69 | UDP | TFTP | 인증 없는 단순 파일 전송. PXE 부팅에 사용 |
| 445 | TCP | SMB | Windows 파일 공유. Samba도 이 포트 사용 |
| 548 | TCP | AFP | macOS 파일 공유 프로토콜 |
| 2049 | TCP/UDP | NFS | Unix/Linux 네트워크 파일 시스템 |

### 원격 접속

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 22 | TCP | SSH | 암호화 원격 셸. 사실상 표준 |
| 23 | TCP | Telnet | 암호화 없는 원격 셸. 현재는 사용 금지 수준 |
| 3389 | TCP | RDP | Windows 원격 데스크탑 |
| 5900 | TCP | VNC | 화면 공유 프로토콜. GUI 원격 제어 |

### 이메일

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 25 | TCP | SMTP | 서버 간 메일 전송. 스팸 악용으로 ISP가 대부분 차단 |
| 465 | TCP | SMTPS | SMTP over SSL. 암호화 메일 전송 |
| 587 | TCP | SMTP Submission | 클라이언트 → 서버 메일 발송. 현재 표준 포트 |
| 110 | TCP | POP3 | 메일 수신. 서버에서 다운로드 후 삭제 방식 |
| 995 | TCP | POP3S | POP3 over SSL |
| 143 | TCP | IMAP | 메일 수신. 서버에 메일이 남는 방식 |
| 993 | TCP | IMAPS | IMAP over SSL |

### 웹

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 80 | TCP | HTTP | 웹 기본 포트 |
| 443 | TCP | HTTPS | TLS 암호화 웹 |
| 8080 | TCP | HTTP Alt | 개발 서버, Tomcat, 프록시의 관례적 대안 포트 |
| 8443 | TCP | HTTPS Alt | HTTPS 대안 포트 |

### 이름 해석 / 디렉터리

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 53 | TCP/UDP | DNS | 도메인 이름 해석. UDP가 기본, 응답이 클 때 TCP 사용 |
| 389 | TCP | LDAP | 디렉터리 서비스. Active Directory |
| 636 | TCP | LDAPS | LDAP over SSL |
| 5353 | UDP | mDNS | 로컬 네트워크 이름 해석. Bonjour, Avahi |

### 네트워크 인프라

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 67 | UDP | DHCP Server | IP 주소 할당 서버 |
| 68 | UDP | DHCP Client | IP 주소 요청 클라이언트 |
| 123 | UDP | NTP | 시간 동기화. 클러스터 환경에서 필수 |
| 161 | UDP | SNMP | 네트워크 장비 모니터링 |
| 162 | UDP | SNMP Trap | 장비가 관리 서버에 알림 전송 |
| 179 | TCP | BGP | 인터넷 라우팅 프로토콜 |
| 514 | UDP | Syslog | 로그 전송 (TCP 514도 사용) |

### 데이터베이스

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 1433 | TCP | MS SQL Server | Microsoft SQL Server |
| 1521 | TCP | Oracle DB | Oracle Database |
| 3306 | TCP | MySQL / MariaDB | 가장 널리 쓰이는 오픈소스 RDBMS |
| 5432 | TCP | PostgreSQL | |
| 6379 | TCP | Redis | 인메모리 데이터 구조 저장소 |
| 11211 | TCP/UDP | Memcached | 분산 메모리 캐시 |
| 27017 | TCP | MongoDB | 도큐먼트 DB |
| 9042 | TCP | Cassandra | 분산 와이드칼럼 DB |

### 메시지 / 스트리밍

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 5672 | TCP | AMQP (RabbitMQ) | 메시지 브로커 |
| 15672 | TCP | RabbitMQ Management | 웹 관리 UI |
| 9092 | TCP | Kafka | 분산 이벤트 스트리밍 |
| 2181 | TCP | ZooKeeper | Kafka 등의 분산 코디네이터 |

### 인프라 / DevOps

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 2376 | TCP | Docker TLS | Docker 데몬 원격 TLS 접속 |
| 2377 | TCP | Docker Swarm | Swarm 클러스터 관리 |
| 6443 | TCP | Kubernetes API | kubectl이 통신하는 API 서버 |
| 10250 | TCP | Kubelet | 노드 에이전트 API |
| 2379/2380 | TCP | etcd | Kubernetes 클러스터 상태 저장소 |
| 9090 | TCP | Prometheus | 메트릭 수집 서버 |
| 3000 | TCP | Grafana | 모니터링 대시보드 |
| 9200 | TCP | Elasticsearch HTTP | REST API |
| 9300 | TCP | Elasticsearch Transport | 클러스터 노드 간 통신 |
| 5601 | TCP | Kibana | Elasticsearch 웹 UI |
| 8888 | TCP | Jupyter Notebook | 데이터 분석 환경 |
| 8500 | TCP | Consul | 서비스 디스커버리 |
| 4646 | TCP | Nomad | 오케스트레이션 |

### VPN / 터널

| 포트 | 프로토콜 | 서비스 | 설명 |
|---|---|---|---|
| 1194 | UDP | OpenVPN | 오픈소스 VPN |
| 1723 | TCP | PPTP | 구형 VPN. 현재는 보안 취약 |
| 500 | UDP | IKE (IPsec) | IPsec 키 교환 |
| 4500 | UDP | IPsec NAT-T | NAT 환경에서의 IPsec |
| 51820 | UDP | WireGuard | 현세대 고성능 VPN |

---

## 4. 주의사항 및 예외사항

### 포트는 바뀔 수 있다

기본 포트는 약속일 뿐, 강제가 아니다. SSH를 22번 대신 2222번에서 띄우는 것은 흔한 보안 관행이다. 반대로 말하면, 포트 번호만 보고 서비스를 단정하면 안 된다. `nmap -sV`의 `-sV`(버전 탐지)가 필요한 이유다.

### 포트 충돌

같은 포트에 두 서비스가 바인딩할 수 없다. 개발 환경에서 자주 발생하는 상황이다.

```bash
# 어떤 프로세스가 8080을 쓰고 있는지 확인
lsof -i :8080          # macOS / Linux
netstat -ano | findstr :8080  # Windows
```

### 방화벽과 포트 포워딩

포트가 열려 있어도 방화벽이 막으면 외부에서 접근할 수 없다. 클라우드 환경(AWS, GCP, Azure)은 Security Group / Firewall Rules에서 별도로 허용해야 한다. 공유기 환경에서 외부 접근이 필요하면 NAT 포트 포워딩도 설정해야 한다.

### Well-known Ports와 root 권한

Linux/macOS에서 1024 미만 포트를 바인딩하려면 root 권한이 필요하다. 프로덕션에서 서비스를 root로 실행하면 안 되므로, 보통 두 가지 방법을 쓴다.

```bash
# 방법 1: 포트 포워딩 (80 → 8080)
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080

# 방법 2: 바이너리에 cap_net_bind_service 권한 부여
setcap 'cap_net_bind_service=+ep' /usr/bin/node
```

### 0번 포트

포트 0은 OS에 포트 선택을 위임하는 특수 값이다. 바인딩하면 OS가 사용 가능한 임시 포트를 골라준다. 테스트 환경에서 포트 충돌을 피할 때 유용하다.

### TCP vs UDP

같은 포트 번호라도 TCP와 UDP는 독립적이다. 53번 포트는 TCP 53과 UDP 53이 별개로 존재한다. DNS가 두 프로토콜을 모두 쓰는 것이 대표적인 예다. 방화벽 규칙을 짤 때 프로토콜을 명시해야 하는 이유다.

### 공격자가 즐겨 노리는 포트

아래 포트가 불필요하게 열려 있다면 즉시 점검이 필요하다.

| 포트 | 이유 |
|---|---|
| 23 (Telnet) | 평문 전송. 패킷 스니핑으로 자격증명 탈취 |
| 3389 (RDP) | 브루트포스 공격의 단골 대상. 인터넷에 노출 금지 |
| 445 (SMB) | WannaCry 등 랜섬웨어가 주로 이용한 경로 |
| 1433 (MSSQL) | 인터넷에 직접 노출된 DB는 공격 1순위 |
| 27017 (MongoDB) | 인증 없이 열린 MongoDB가 대규모 데이터 유출 사고를 일으킨 전례 다수 |

인터넷에 직접 노출되어야 하는 포트는 80, 443이 전부인 경우가 대부분이다. 나머지는 VPN이나 내부망으로 제한하는 것이 원칙이다.
