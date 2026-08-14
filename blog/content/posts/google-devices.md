---
title: "구글의 하드웨어 — 소프트웨어 회사가 기기를 만드는 이유"
date: 2026-07-04T20:00:00+09:00
draft: false
tags: ["Google", "Pixel", "Nexus", "Nest", "Chromebook", "Tensor", "하드웨어"]
categories: ["하드웨어"]
---

구글은 검색·광고 회사로 시작했지만 지금은 스마트폰, 스마트홈, 노트북, 웨어러블까지 만드는 하드웨어 제조사이기도 하다. 이 글은 구글이 실제로 출시해 판매한 하드웨어 라인업을 계보 순으로 정리한다. 왜 만들었는지, 어떻게 세대를 거쳤는지가 중심이고, 사업 구조나 단종 사유 분석은 다루지 않는다.

---

## 1. Nexus — Android의 "기준 기기" (2010～2016)

구글의 첫 자체 브랜드 하드웨어는 스스로 설계·제조하지 않았다. **Nexus**는 매번 다른 제조사와 협업해 "Android를 만든 회사가 의도한 대로 동작하는 레퍼런스 폰"을 만드는 프로젝트였다.

| 기기 | 연도 | 제조 파트너 | 비고 |
|---|---|---|---|
| Nexus One | 2010 | HTC | 구글 최초의 자체 브랜드 폰 |
| Nexus S | 2010 | Samsung | NFC 최초 탑재 |
| Galaxy Nexus | 2011 | Samsung | Android 4.0 ICS 런칭 기기 |
| Nexus 4 | 2012 | LG | 무선충전 지원 |
| Nexus 5 | 2013 | LG | Android 4.4 KitKat 런칭 기기 |
| Nexus 6 | 2014 | Motorola | 대화면(6인치) 전환 |
| Nexus 5X / 6P | 2015 | LG / Huawei | 두 종류 동시 출시, USB-C 최초 적용 |

Nexus 라인은 최신 Android 버전을 가장 먼저(때로는 유일하게) 받는 기기였고, 개발자들이 자기 앱을 "순정 Android"에서 테스트하는 표준 기기 역할을 했다. 태블릿(Nexus 7, 9, 10)도 같은 방식으로 나왔다.

---

## 2. Pixel — 제조를 직접 통제하기 시작하다 (2016～)

2016년 구글은 Nexus를 접고 **Pixel**을 시작했다. 제조는 여전히 외주(초기 HTC, 이후 폭스콘 등)였지만, 하드웨어 설계·소프트웨어 통합을 구글이 훨씬 깊이 관여하는 방식으로 바뀌었다. 브랜드에서 제조사 이름이 완전히 빠진 것도 이때부터다("Pixel by HTC"가 아니라 그냥 "Pixel").

### 초기 세대 — 카메라로 승부

| 기기 | 연도 | 특징 |
|---|---|---|
| Pixel / Pixel XL | 2016 | Google Assistant 최초 탑재, 단일 카메라로 DxOMark 최고점 |
| Pixel 2 / 2 XL | 2017 | Active Edge(스퀴즈 제스처), 야간 사진 알고리즘 강화 |
| Pixel 3 / 3 XL | 2018 | Night Sight, Call Screen |
| Pixel 4 | 2019 | Soli 레이더 칩(제스처 인식), 첫 듀얼 카메라 |
| Pixel 5 | 2020 | 플래그십 등급을 낮추고 중가로 포지셔닝 전환 |

이 시기 Pixel의 전략은 단순했다. 카메라 하드웨어 스펙(멀티 렌즈, 고화소)에서는 삼성·애플에 밀렸지만, HDR+·Night Sight 같은 **연산 사진(Computational Photography)** 소프트웨어로 이를 상쇄했다.

### Tensor 세대 — 자체 실리콘으로 전환

| 기기 | 연도 | 칩 | 특징 |
|---|---|---|---|
| Pixel 6 / 6 Pro | 2021 | Tensor (1세대) | 구글 자체 설계 AP 최초 탑재, 삼성 파운드리 생산 |
| Pixel 7 / 7 Pro | 2022 | Tensor G2 | AI 기능(실시간 번역, Magic Eraser) 고도화 |
| Pixel 8 / 8 Pro | 2023 | Tensor G3 | 온디바이스 생성형 AI(Best Take, Audio Magic Eraser) |
| Pixel 9 / 9 Pro | 2024 | Tensor G4 | Gemini Nano 통합, AI 비서 기능 확장 |

Pixel 6부터 자체 칩 **Tensor**를 탑재한 건 퀄컴 Snapdragon 의존을 줄이고, AI 연산(NPU)을 소프트웨어 로드맵에 맞춰 직접 설계하기 위해서였다. 애플이 아이폰에 자체 실리콘(A시리즈)을 쓰는 것과 같은 논리를 뒤늦게 따라간 것에 가깝다. Tensor는 CPU·GPU 성능 자체보다 카메라 ISP와 온디바이스 AI 가속에 설계 우선순위를 둔다.

### 보급형 라인

**Pixel A 시리즈**(3a, 4a, 5a, 6a, 7a, 8a…)는 플래그십 카메라·AI 기능 상당수를 절반 이하 가격에 제공하며 중저가 시장을 담당한다.

---

## 3. Chromebook / Pixelbook — ChromeOS 하드웨어

구글은 서드파티(Acer, HP, Samsung, Lenovo 등)의 저가 Chromebook 생태계와 별개로, 자체 프리미엄 라인도 운영했다.

| 기기 | 연도 | 포지션 |
|---|---|---|
| Chromebook Pixel | 2013 | 고해상도 디스플레이 탑재 첫 프리미엄 Chromebook, 가격 논란($1,299) |
| Pixelbook | 2017 | 컨버터블 폼팩터, Google Assistant 전용 키 탑재 |
| Pixel Slate | 2018 | ChromeOS 태블릿 시도 |
| Pixelbook Go | 2019 | 가볍고 저렴한 라인으로 재조정 |

Chromebook 생태계 전체의 주력은 구글이 아니라 서드파티 제조사들이며, 특히 미국 K-12 교육 시장에서 관리 편의성(Google Admin Console)과 저가 하드웨어 조합으로 점유율을 확보했다. Pixelbook 라인 자체는 "레퍼런스 프리미엄 기기" 성격이 강하다.

---

## 4. 스마트홈 — Nest와 Google Home의 통합

### Nest (인수 이전 자체 라인)

Nest Labs는 2014년 구글에 인수되기 전부터 자체 제품을 팔던 회사였다. 인수 이후에도 한동안 "Nest"는 별도 브랜드로 운영됐다.

| 기기 | 최초 연도 | 제품군 |
|---|---|---|
| Nest Learning Thermostat | 2011 | 사용 패턴을 학습하는 온도조절기 |
| Nest Protect | 2013 | 연기·일산화탄소 경보기 |
| Nest Cam | 2015 | 실내외 보안 카메라 |
| Nest Hello | 2018 | 스마트 초인종 |

### Google Home → Nest 브랜드 통합

구글은 별도로 스마트 스피커 **Google Home**(2016)을 냈다가, 2019년 **Nest** 브랜드로 스마트홈 제품군 전체를 통합했다.

| 기기 | 연도 | 특징 |
|---|---|---|
| Google Home | 2016 | 구글 어시스턴트 탑재 스마트 스피커 |
| Google Home Mini | 2017 | 저가 소형 스피커 |
| Google Home Max | 2017 | 고음질 프리미엄 스피커 |
| Nest Hub | 2018 (구 Google Home Hub) | 화면 탑재 스마트 디스플레이 |
| Nest Hub Max | 2019 | 카메라 내장 대형 스마트 디스플레이 |
| Nest Audio | 2020 | Google Home 후속 스피커, Nest 브랜드로 재출시 |
| Nest Mini | 2019 | Home Mini 후속 |

브랜드 통합 이후 신제품은 전부 "Nest" 이름으로 나오고 있고, "Google Home" 앱 자체도 2024년 이후 Google Home 앱으로 재편되는 등 두 브랜드가 오갔다.

---

## 5. Chromecast — 스트리밍 동글

| 기기 | 연도 | 특징 |
|---|---|---|
| Chromecast (1세대) | 2013 | HDMI 동글, 스마트폰 앱으로 TV에 캐스팅, $35 |
| Chromecast (2세대) | 2015 | 소형화, Wi-Fi 성능 개선 |
| Chromecast Ultra | 2016 | 4K/HDR 지원 |
| Chromecast (3세대) | 2018 | 1080p 60fps 개선 |
| Chromecast with Google TV | 2020 | 리모컨 포함, 자체 UI(Google TV 런처) 탑재로 방향 전환 |

초기 Chromecast는 "리모컨도 UI도 없이 폰이 리모컨"이라는 컨셉이었지만, Chromecast with Google TV부터는 리모컨과 자체 홈 화면을 갖춘 일반적인 스트리밍 박스 형태(Roku, Fire TV Stick과 유사한 포지션)로 바뀌었다.

---

## 6. 네트워크 기기 — Google Wifi / Nest Wifi

| 기기 | 연도 | 특징 |
|---|---|---|
| OnHub | 2015 | TP-Link·ASUS 제조, 구글 설계 첫 라우터 |
| Google Wifi | 2016 | 메시 라우터, 앱 기반 관리 |
| Nest Wifi | 2019 | 라우터 포인트에 스피커(Google Assistant) 내장 |
| Nest Wifi Pro | 2022 | Wi-Fi 6E 지원 |

가정용 메시 네트워크가 대중화되기 시작한 시점에 진입해, 복잡한 라우터 설정을 앱 UI로 단순화하는 데 초점을 맞췄다.

---

## 7. Google Glass — 출시 하드웨어 관점

Google Glass가 시장에서 어떻게 실패했는지는 별도 문서에서 다룬다. 여기서는 실제로 출시된 하드웨어 버전만 짚는다.

| 버전 | 연도 | 대상 |
|---|---|---|
| Explorer Edition | 2013 | 일반 소비자(개발자 우선 판매), $1,500 |
| Enterprise Edition | 2017 | 제조·물류 현장 작업자용 |
| Enterprise Edition 2 | 2019 | Snapdragon XR1 탑재, 안전모 장착형 프레임 옵션 |

---

## 8. Daydream View — 모바일 VR 헤드셋

| 기기 | 연도 | 특징 |
|---|---|---|
| Daydream View | 2016 | 패브릭 소재 스마트폰 거치형 VR 헤드셋, 소형 컨트롤러 동봉 |
| Daydream View (2세대) | 2017 | 시야각 개선, 호환 기기 확대 |

Google Cardboard(2014)가 종이 상자 수준의 초저가 VR 뷰어였다면, Daydream View는 그보다 완성도를 높인 패브릭 하드웨어였다. Pixel 등 인증된 "Daydream-ready" 스마트폰을 끼워 사용하는 방식이었다.

---

## 9. 웨어러블 — Pixel Buds, Pixel Watch

| 기기 | 연도 | 특징 |
|---|---|---|
| Pixel Buds (1세대) | 2017 | 실시간 통역 기능(Google Translate 연동) 강조 |
| Pixel Buds 2 | 2020 | 완전 무선(TWS) 이어폰으로 재설계 |
| Pixel Buds Pro | 2022 | 액티브 노이즈 캔슬링 탑재 |
| Pixel Watch | 2022 | 구글 자체 브랜드 스마트워치 최초 출시, Fitbit 기술 통합 |
| Pixel Watch 2 | 2023 | 배터리·센서 개선 |
| Pixel Watch 3 | 2024 | 화면 대형화 |

Pixel Watch는 2019년 인수한 **Fitbit**의 헬스 트래킹 기술과 Wear OS를 결합한 결과물이다. 구글이 스마트워치 OS(Wear OS)는 오래전부터 갖고 있었지만, 자체 브랜드 워치 하드웨어는 2022년에야 처음 나왔다.

---

## 10. Stadia 컨트롤러 — 게임 스트리밍 전용 하드웨어

| 기기 | 연도 | 특징 |
|---|---|---|
| Stadia Controller | 2019 | Wi-Fi 직결(클라우드 서버와 직접 통신), 캡처·구글 어시스턴트 버튼 내장 |

Stadia 서비스 자체의 종료 경위는 다른 문서에서 다루지만, 컨트롤러 하드웨어 자체는 "게임 스트리밍에 최적화된 최초의 상용 컨트롤러" 중 하나였다는 점에서 기록할 만하다. 초기 설계는 컨트롤러가 TV의 Chromecast와 Wi-Fi로 직접 통신해 스마트폰/PC를 거치지 않는 구조를 목표로 했다.

---

## 정리

```
2010~2016  Nexus 시리즈        → 제조사 협업 기반 Android 레퍼런스 폰
2011~      Nest 온도조절기 등   → 인수(2014) 전부터 존재한 스마트홈 라인
2013       Chromecast 1세대    → 스트리밍 동글, $35 저가 전략
2013       Chromebook Pixel    → 프리미엄 ChromeOS 노트북
2013       Google Glass Explorer → 최초의 소비자용 AR 안경 하드웨어
2015       OnHub               → 구글 설계 첫 라우터
2016       Google Home         → 스마트 스피커 진입
2016       Pixel / Pixel XL    → Nexus 종료, 자체 브랜드 폰 시작
2016       Daydream View       → 모바일 VR 헤드셋
2017       Pixel Buds          → 첫 오디오 웨어러블
2019       Google Wifi → Nest Wifi → 스마트홈 브랜드 통합
2019       Stadia Controller   → 클라우드 게임 전용 컨트롤러
2021       Pixel 6 (Tensor)    → 자체 실리콘 설계 전환
2022       Pixel Watch         → 첫 자체 스마트워치, Fitbit 기술 결합
```

구글의 하드웨어 전략은 일관된 한 방향이 아니라 영역별로 다르다. 스마트폰은 Nexus(협업)에서 Pixel(직접 통제)로, 스마트홈은 인수(Nest)와 자체 개발(Home)을 합치는 방식으로, 웨어러블은 인수 기술(Fitbit)을 늦게 흡수하는 방식으로 움직여 왔다. 공통점은 하드웨어 자체보다 그 위에서 돌아가는 AI·서비스(어시스턴트, 연산 사진, Gemini)를 파는 것이 최종 목적이라는 점이다.
