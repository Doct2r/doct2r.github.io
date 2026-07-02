---
title: "VPN — 실체와 표준, 그리고 왜 주목해야 하는가"
date: 2026-07-02
draft: false
tags: ["VPN", "보안", "네트워크", "WireGuard", "OpenVPN"]
categories: ["네트워크"]
---

VPN이라는 단어는 두 개의 전혀 다른 맥락에서 쓰인다. 하나는 "내 IP를 숨겨주는 도구"고, 다른 하나는 "기업이 원격 근무자를 내부망에 연결하는 인프라"다. 이 둘은 같은 기술 위에서 동작하지만 목적이 다르다. 제대로 이해하려면 마케팅 언어가 아닌 기술적 실체부터 봐야 한다.

---

## 1. VPN이란

### 1-1. 실질적으로 무엇인가

VPN(Virtual Private Network)을 한 문장으로 정의하면 **암호화된 터널을 통해 두 네트워크를 하나처럼 연결하는 기술**이다.

인터넷은 기본적으로 공개된 공간이다. 내 컴퓨터에서 나간 패킷은 ISP, 라우터, 서버를 거치며 중간에서 누구든 볼 수 있다. VPN은 이 경로 위에 암호화된 "터널"을 만든다.

```
일반 통신:
[내 PC] ──평문──→ [ISP] ──평문──→ [목적지]

VPN 통신:
[내 PC] ──암호화──→ [VPN 서버] ──복호화 후 전달──→ [목적지]
          ↑
       이 구간은 외부에서 내용을 볼 수 없음
```

실질적으로 VPN이 하는 것은 세 가지다.

- **경로 변경**: 내 트래픽이 VPN 서버를 거쳐 나가므로 목적지 서버에는 VPN 서버의 IP가 보인다.
- **암호화**: 내 PC와 VPN 서버 사이 구간은 암호화된다. ISP나 중간 라우터가 내용을 볼 수 없다.
- **네트워크 확장**: 원격지의 내부망 리소스(파일 서버, DB 등)에 마치 같은 LAN에 있는 것처럼 접근할 수 있다.

흔히 "VPN을 쓰면 익명이 된다"고 하지만 이는 반만 맞다. ISP에서 VPN 서버까지의 구간은 숨겨지지만, VPN 서버 운영자는 내 트래픽을 볼 수 있다. 신뢰의 대상이 ISP에서 VPN 사업자로 옮겨갈 뿐이다.

---

### 1-2. 표준적으로 무엇인가

RFC와 IETF 관점에서 VPN은 특정 기술이 아니라 **개념**이다. 표준화된 구현 방식은 여러 가지가 있다.

**터널링(Tunneling)**이 핵심 메커니즘이다. 한 프로토콜의 패킷을 다른 프로토콜로 감싸서 전송한다. VPN은 사설 네트워크의 패킷을 공인 인터넷 패킷 안에 캡슐화해서 보낸다.

```
[원본 패킷: 사설 IP 10.0.0.1 → 10.0.0.2]
      ↓ 캡슐화
[외부 패킷: 공인 IP 203.x.x.x → 198.x.x.x + 암호화된 내부 패킷]
```

표준 레이어별 분류:

| OSI 레이어 | 대표 프로토콜 | 특징 |
|---|---|---|
| 2계층 (데이터링크) | L2TP, PPTP | MAC 주소까지 터널링. LAN 확장 효과 |
| 3계층 (네트워크) | IPsec, GRE | IP 패킷 단위 터널링. 가장 범용적 |
| 4계층 이상 | SSL/TLS VPN, WireGuard | 애플리케이션 레벨. 방화벽 우회에 유리 |

---

## 2. VPN의 종류

### 패킷(프로토콜) 관점

#### IPsec

가장 오래되고 표준화된 VPN 프로토콜. IETF RFC 4301~4309에 정의되어 있다. IP 레이어에서 동작하므로 상위 프로토콜(TCP, UDP)을 가리지 않는다.

두 가지 모드가 있다.

- **전송 모드(Transport Mode)**: IP 헤더는 그대로, 페이로드만 암호화. 호스트-호스트 통신에 사용.
- **터널 모드(Tunnel Mode)**: IP 패킷 전체를 새 IP 패킷으로 감쌈. 게이트웨이-게이트웨이, 클라이언트-게이트웨이에 사용.

구성 요소:
- **AH(Authentication Header)**: 무결성 + 인증. 암호화 없음.
- **ESP(Encapsulating Security Payload)**: 암호화 + 무결성 + 인증.
- **IKE(Internet Key Exchange)**: 키 협상 프로토콜. 현재는 IKEv2가 표준.

```
포트: UDP 500 (IKE), UDP 4500 (NAT-T)
암호화: AES-256, ChaCha20 등
인증: 인증서(PKI), PSK(사전 공유 키)
```

기업 VPN의 사실상 표준이다. Cisco, Palo Alto, Juniper 등 모든 네트워크 장비가 IPsec을 지원한다. 단, 설정이 복잡하고 NAT 환경에서 트러블이 잦다.

---

#### SSL/TLS VPN

SSL/TLS를 터널로 사용한다. 443번 포트(HTTPS)를 그대로 쓰므로 거의 모든 방화벽을 통과한다. 기업 방화벽이 IPsec을 막아도 SSL VPN은 통과하는 경우가 많다.

두 가지 방식이 있다.

- **전체 터널(Full Tunnel)**: 모든 트래픽을 VPN으로 보냄.
- **Split Tunnel**: 사내망 트래픽만 VPN, 나머지는 직접 연결.

OpenVPN이 대표적인 오픈소스 구현이며, Cisco AnyConnect, Palo Alto GlobalProtect 같은 상용 제품도 이 방식이다.

---

#### WireGuard

2015년 Jason Donenfeld가 개발한 현세대 VPN 프로토콜. 2020년 Linux 5.6 커널에 공식 포함됐다.

기존 프로토콜과 비교했을 때 코드 라인 수가 압도적으로 적다.

| 프로토콜 | 코드 라인 수 |
|---|---|
| OpenVPN | ~70,000 줄 |
| IPsec (strongSwan) | ~400,000 줄 |
| WireGuard | ~4,000 줄 |

코드가 작으면 취약점이 숨을 공간이 줄어든다. 감사(audit)도 쉽다.

암호화 알고리즘을 고정한 것도 특징이다. IPsec처럼 협상 과정에서 약한 알고리즘이 선택되는 문제가 없다.

```
키 교환: Curve25519
암호화: ChaCha20-Poly1305
해시: BLAKE2s
```

성능도 빠르다. 커널에서 직접 동작하고, 최신 암호화 알고리즘을 써서 AES-NI 없는 ARM 기기(라즈베리파이 등)에서도 OpenVPN보다 빠르다.

단점은 기업 환경에서의 아직 검증 기간이 짧다는 것이다. 또한 연결 상태를 유지하려면 주기적으로 핸드셰이크를 갱신해야 하며(기본 3분), IP를 로밍하는 환경에서는 추가 설정이 필요하다.

---

#### PPTP / L2TP

- **PPTP(Point-to-Point Tunneling Protocol)**: Microsoft가 1990년대에 개발. 현재는 심각한 보안 취약점이 알려져 사용해서는 안 된다. MS-CHAPv2 인증이 브루트포스로 뚫린다.
- **L2TP/IPsec**: L2TP로 터널을 만들고 IPsec으로 암호화한다. PPTP보다 안전하지만 설정이 복잡하고 NAT 환경에서 불안정하다.

두 프로토콜 모두 WireGuard나 OpenVPN으로 대체하는 것을 권장한다.

---

#### QUIC 기반 (신흥)

Google이 개발한 QUIC 프로토콜(HTTP/3의 기반)을 VPN 터널로 활용하는 방식이다. Cloudflare의 WARP, Tailscale 일부 기능이 이 방향으로 발전 중이다. UDP 기반이라 핸드오버(Wi-Fi ↔ 모바일 전환)에서 연결을 유지하는 이점이 있다.

---

### 솔루션(구성 방식) 관점

| 구분 | 설명 | 대표 사례 |
|---|---|---|
| **Remote Access VPN** | 개인 클라이언트 → 기업 내부망 | 재택근무, 출장 중 사내망 접속 |
| **Site-to-Site VPN** | 지사 ↔ 본사 네트워크 연결 | 두 IDC 간 내부망 연결 |
| **Client VPN (소비자)** | 퍼블릭 VPN 서비스 이용 | NordVPN, ExpressVPN |
| **Zero Trust (ZTNA)** | VPN 없이 애플리케이션 단위 접근 제어 | Cloudflare Access, Zscaler |

Zero Trust는 엄밀히 말해 VPN의 대체 개념이다. "내부망에 접속하면 신뢰"가 아니라 매번 인증하는 방식으로, 현대 클라우드 환경에서 주목받고 있다.

---

## 3. 주요 오픈소스 VPN

### WireGuard

- **라이선스**: GPLv2
- **언어**: C (커널), Go/Rust (클라이언트)
- **플랫폼**: Linux, macOS, Windows, Android, iOS
- **특징**: 커널 내장, 고성능, 설정 단순

```ini
# /etc/wireguard/wg0.conf (서버)
[Interface]
PrivateKey = <서버 개인키>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <클라이언트 공개키>
AllowedIPs = 10.0.0.2/32
```

```bash
wg-quick up wg0    # 시작
wg-quick down wg0  # 종료
wg show            # 상태 확인
```

---

### OpenVPN

- **라이선스**: GPLv2
- **언어**: C
- **플랫폼**: Linux, macOS, Windows, Android, iOS, 라우터 펌웨어
- **특징**: 가장 오래된 검증, 풍부한 문서, SSL/TLS 기반

```bash
# 인증서 생성 (Easy-RSA)
./easyrsa init-pki
./easyrsa build-ca
./easyrsa gen-req server nopass
./easyrsa sign-req server server

# 서버 실행
openvpn --config server.conf
```

설정이 복잡하지만 세부 튜닝이 가능하다. pfSense, OpenWRT 등 오픈소스 라우터 운영체제에서 기본 VPN 솔루션이다.

---

### Tailscale

- **라이선스**: BSD (클라이언트 오픈소스), 서버는 비공개
- **기반**: WireGuard
- **특징**: 메시(Mesh) 네트워크, NAT 자동 통과, Zero-config

WireGuard의 설정 복잡도를 추상화한 제품이다. 설치 후 로그인만 하면 모든 기기가 같은 사설망에 들어온다. 개인/소규모 팀에게 사실상 가장 쉬운 VPN이다.

```bash
# 설치 및 시작
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
# → 브라우저로 인증 후 자동 연결
```

100대까지 무료. 단, 컨트롤 서버(코디네이터)가 Tailscale 소유다.

---

### Headscale

- **라이선스**: BSD
- **특징**: Tailscale 호환 컨트롤 서버를 자체 호스팅

Tailscale의 컨트롤 플레인을 직접 운영하고 싶을 때 쓴다. 클라이언트는 그대로 Tailscale 앱을 쓰고, 코디네이터 서버만 교체한다.

---

### SoftEther VPN

- **라이선스**: Apache 2.0
- **출신**: 일본 쓰쿠바 대학 연구 프로젝트
- **특징**: IPsec, L2TP, SSL VPN, OpenVPN을 하나의 서버로 지원

다중 프로토콜을 하나의 데몬으로 처리한다. 중국 방화벽(GFW) 우회에 설계된 측면이 있어 Deep Packet Inspection 환경에서 강하다.

---

### Pritunl

- **라이선스**: Enterprise 유료, Community는 오픈소스 (AGPLv3)
- **기반**: OpenVPN
- **특징**: 웹 UI 제공, 다중 서버 관리, MFA 지원

OpenVPN 설정의 복잡함을 웹 대시보드로 추상화했다. 소규모 기업에서 직접 VPN 서버를 운영할 때 적합하다.

---

## 4. 주목해야 하는 이유

### 재택근무가 표준이 되었다

코로나 이후 원격 근무가 일반화되면서 VPN은 선택이 아닌 필수 인프라가 됐다. 사내 시스템에 외부에서 접근해야 하는 상황이 일상이다. 인프라를 다루는 사람이라면 VPN을 구성하고 운영하는 것이 기본 역량이 됐다.

### WireGuard가 판을 바꾸고 있다

2020년 Linux 커널 포함 이후 WireGuard는 빠르게 업계 표준으로 자리 잡고 있다. OpenVPN 대비 설정이 단순하고 성능이 뛰어나다. 기존의 복잡한 VPN 설정 문화가 바뀌고 있다.

### Zero Trust로의 전환

기업 환경에서 "VPN으로 내부망에 들어오면 신뢰"하는 모델이 깨지고 있다. 내부망에 침투한 공격자가 VPN을 통해 내부를 자유롭게 움직이는 사고가 반복됐기 때문이다. Cloudflare Access, Zscaler, Google BeyondCorp처럼 VPN 없이도 애플리케이션 단위로 접근을 통제하는 Zero Trust 모델이 빠르게 확산되고 있다.

VPN을 이해해야 Zero Trust로 왜 전환하는지도 이해할 수 있다.

### 법과 규제

국가마다 VPN에 대한 법적 입장이 다르다. 러시아, 중국, 이란 등에서는 비인가 VPN 사용이 불법이거나 제한된다. 반대로 개인정보보호법(GDPR, CCPA)이 강화되면서 기업이 원격 근무자의 트래픽을 보호할 의무가 생기고 있다. VPN은 규제 준수의 도구로도 쓰인다.

### 개인 프라이버시

공용 Wi-Fi(카페, 호텔)에서 암호화되지 않은 HTTP 트래픽은 같은 네트워크의 누구든 볼 수 있다. VPN은 이 구간을 암호화한다. 사용하는 도구의 보안을 챙기는 것이 개발자의 기본 위생이다.

---

VPN은 IP를 숨기는 마법이 아니다. 암호화된 터널을 통해 신뢰의 대상을 옮기고, 네트워크 경계를 확장하는 기술이다. 이 실체를 알면 어떤 상황에서 어떤 VPN을 써야 하는지, 왜 Zero Trust가 대두되는지가 자연스럽게 이해된다.
