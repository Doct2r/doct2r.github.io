---
title: "NPU — AI 이전부터 있었던 전용 연산 칩의 역사"
date: 2026-07-02T17:30:00+09:00
draft: false
tags: ["NPU", "AI", "하드웨어", "온디바이스", "Apple Neural Engine", "CUDA"]
categories: ["하드웨어"]
---

NPU(Neural Processing Unit)라는 이름이 대중에게 알려진 건 AI 열풍이 불면서다. 하지만 "특정 연산만 전담하는 전용 칩"이라는 개념은 훨씬 오래됐다. NPU가 왜 필요해졌는지, 어떻게 만들어졌는지, 그리고 지금 어디까지 왔는지를 처음부터 따라가 보자.

---

## 1. NPU 이전 — 전용 가속기의 역사

"특정 연산만 빠르게 처리하는 칩"이라는 개념은 NPU보다 수십 년 앞선다.

### DSP (Digital Signal Processor)

1970～80년대, 오디오·통신·레이더 처리에 **DSP(디지털 신호 처리 칩)**가 등장했다. CPU는 범용이라 느리고, 신호 처리는 **곱셈-누적 연산(MAC, Multiply-Accumulate)**이 반복적으로 필요했다.

```
MAC 연산:
  결과 += 입력 × 계수
  결과 += 입력 × 계수
  결과 += 입력 × 계수
  ... (수천 번 반복)
```

DSP는 이 MAC 연산을 1클럭에 처리하는 하드웨어 구조를 가졌다. FIR 필터, FFT, 에코 제거 — 전부 MAC의 반복이다. 피처폰 시대의 통화 품질을 담당한 게 바로 DSP였다.

**핵심**: 특정 연산 패턴을 하드웨어로 고정하면 CPU보다 훨씬 빠르고 전력도 적게 든다. NPU의 설계 철학이 여기서 출발한다.

### 물리 엔진 칩, 암호화 가속기

같은 맥락의 사례들이 2000년대까지 계속됐다.

- **물리 엔진 칩**: AGEIA PhysX (2006) — 게임 물리 시뮬레이션 전담 (나중에 NVIDIA가 인수해 GPU로 통합)
- **AES 가속기**: CPU 안에 내장된 `AES-NI` 명령어 세트 — 암호화 연산 전담 회로
- **비디오 인코더/디코더**: H.264, H.265 하드웨어 디코더 — 스마트폰이 유튜브를 배터리 적게 쓰며 재생할 수 있는 이유

이처럼 "자주 쓰이는 특정 연산을 전용 회로로 뽑아내는" 방식은 이미 반도체 업계의 오래된 관행이었다. NPU는 그 대상이 **신경망 연산**이 됐을 때의 이름이다.

---

## 2. 왜 CPU도 GPU도 부족했나

2010년대 중반, 스마트폰에서 AI 기능(얼굴 인식, 음성 인식, 사진 보정)이 요구되기 시작했다. 그때 선택지는 두 가지였다.

### CPU로 처리하면

- 순차 처리 구조, 신경망의 행렬 연산에 비효율적
- 발열과 배터리 소모가 심각
- 실시간 처리가 불가능하거나 버벅임

### GPU로 처리하면

- 병렬 행렬 연산에는 맞음
- 그러나 스마트폰 GPU는 **전력 예산**이 작음 (모바일 GPU를 데이터센터 GPU처럼 쓸 수 없음)
- GPU를 AI 연산에 계속 쓰면 게임 성능이나 배터리에 영향
- **항상 켜놓기(always-on)** 불가능 — 음성 인식 wake word 감지를 GPU로 하면 배터리가 반나절

**핵심 문제**: 신경망 연산은 패턴이 일정하다. 매번 같은 구조의 행렬 곱셈과 활성화 함수의 반복이다. 이 패턴을 전용 하드웨어로 고정하면 GPU보다 훨씬 적은 전력으로 같은 연산이 가능하다.

이것이 NPU를 만든 이유다.

---

## 3. NPU의 탄생 — 2017년이 원년

### Apple A11 Bionic — Neural Engine (2017)

2017년 iPhone 8과 X에 탑재된 **Apple A11 Bionic**이 최초로 "Neural Engine"을 공개했다. Apple이 붙인 이름은 ANE(Apple Neural Engine).

- 2개의 전용 코어
- 초당 600억(60 Giga) 연산 처리
- Face ID 얼굴 인식, Animoji 표정 추적 전담

CPU나 GPU를 쓰지 않고 ANE만으로 Face ID 인식을 처리하므로, 나머지 코어는 다른 작업에 집중할 수 있었다. 전력 소비도 CPU 대비 수십 배 효율적이었다.

### Huawei Kirin 970 — 최초의 모바일 NPU (2017)

같은 해 Huawei는 Kirin 970을 발표하며 **NPU**라는 이름을 처음 공식 사용했다. 캠브리콘(Cambricon)과 공동 개발한 전용 신경망 처리 코어를 AP에 통합했다.

- 얼굴 인식, 사진 씬 감지, 번역 가속

Huawei가 "NPU"를 상표처럼 사용하면서 이 이름이 업계 표준 용어로 퍼졌다.

---

## 4. NPU 안은 어떻게 생겼나

### 시스톨릭 어레이 (Systolic Array)

NPU의 핵심 연산 구조는 **시스톨릭 어레이**다. Google TPU가 이 구조를 유명하게 만들었다.

```
시스톨릭 어레이 개념도:

입력 →  [MAC] → [MAC] → [MAC]
            ↓        ↓        ↓
         [MAC] → [MAC] → [MAC]
            ↓        ↓        ↓
         [MAC] → [MAC] → [MAC]

MAC = Multiply-Accumulate 유닛
데이터가 흐르면서(혈액처럼 pulsating) 각 MAC이 연산
```

일반 프로세서는 연산할 때마다 메모리에서 데이터를 가져온다. 시스톨릭 어레이는 데이터가 배열을 흐르는 동안 각 유닛이 연산을 수행하므로 **메모리 접근 횟수가 극적으로 줄어든다**. 신경망의 행렬 곱셈에 최적이다.

### NPU vs GPU vs CPU 연산 방식

| | CPU | GPU | NPU |
|---|---|---|---|
| 코어 수 | 수～수십 | 수천～수만 | 수십～수백 (단순) |
| 제어 회로 | 복잡 (분기 예측 등) | 중간 | 극단적으로 단순 |
| 전력 효율 | 낮음 | 중간 | 높음 (특정 연산에서) |
| 유연성 | 최고 | 높음 | 낮음 (특정 연산만) |
| 메모리 구조 | 캐시 계층 | VRAM | 온칩 SRAM 중심 |
| 최적 용도 | 범용 | 병렬 행렬 연산 | 신경망 추론 |

NPU는 GPU보다 코어가 훨씬 적다. 대신 **각 코어가 신경망 연산에만 집중**하도록 불필요한 회로(복잡한 분기 예측, 대형 캐시)를 제거한다. 면적당 연산량과 전력당 연산량이 GPU보다 높다.

---

## 5. 주요 NPU 계보

### Apple ANE (Apple Neural Engine)

| 칩 | 연도 | 성능 |
|---|---|---|
| A11 Bionic | 2017 | 0.6 TOPS |
| A12 Bionic | 2018 | 5 TOPS |
| A15 Bionic | 2021 | 15.8 TOPS |
| A17 Pro | 2023 | 35 TOPS |
| A18 Pro | 2024 | 35+ TOPS |
| M4 | 2024 | 38 TOPS |

TOPS = Tera Operations Per Second (초당 1조 연산)

Apple ANE는 iOS/macOS의 Core ML 프레임워크와 직접 연동된다. 앱 개발자가 Core ML 모델을 쓰면 자동으로 ANE를 활용한다. 운영체제 수준의 통합이라 CPU/GPU/ANE 작업 분배를 OS가 투명하게 처리한다.

### Qualcomm Hexagon NPU

Qualcomm Snapdragon에 통합된 NPU. Hexagon DSP에서 출발해 AI 전용 기능이 추가됐다.

| 칩 | 연도 | 성능 |
|---|---|---|
| Snapdragon 855 | 2018 | 7 TOPS |
| Snapdragon 888 | 2020 | 26 TOPS |
| Snapdragon 8 Gen 2 | 2022 | 75 TOPS |
| Snapdragon 8 Elite | 2024 | 45+ TOPS (구조 개선) |

Android AI 앱의 NPU 활용은 주로 Qualcomm의 **AI Engine Direct** SDK나 Google의 **NNAPI(Neural Networks API)**를 통해 이뤄진다. Apple ANE만큼 통합이 매끄럽지 않다는 것이 Android 생태계의 오래된 숙제다.

### Google Tensor — 픽셀폰의 자체 칩

Google은 Pixel 6(2021)부터 자체 AP인 **Google Tensor**를 탑재했다. 삼성 파운드리에서 생산하며 내부에 전용 TPU(Edge TPU) 코어를 포함한다.

- Google Tensor G4(2024): Pixel 9에 탑재
- 목표: 구글 어시스턴트, 음성 인식, 실시간 번역을 on-device로 처리

클라우드에서 처리하던 작업을 기기에서 직접 처리하면 **응답 속도가 빠르고, 인터넷이 없어도 동작하며, 개인 정보가 서버로 나가지 않는다**.

### Samsung Exynos NPU

삼성의 Exynos AP에는 자체 NPU가 통합돼 있다.

| 칩 | 연도 | 특징 |
|---|---|---|
| Exynos 9820 | 2018 | 최초 NPU 통합 |
| Exynos 2200 | 2022 | AMD RDNA2 GPU 통합 |
| Exynos 2500 | 2025 | 3nm, NPU 성능 강화 |

### Huawei Ascend / Kirin NPU

Huawei는 스마트폰용 Kirin NPU와 데이터센터용 **Ascend** 시리즈를 별도로 개발했다.

- **Ascend 910**: H100 이전 AI 데이터센터 GPU 대안으로 제시
- **Ascend 910B**: 미국 수출 규제 이후 자국 AI 인프라 대안으로 급부상
- MindSpore: Huawei의 CUDA 대응 AI 프레임워크

미중 반도체 갈등의 핵심에 Ascend가 있다. NVIDIA H100 수출이 막히자 중국 AI 업체들이 Ascend로 전환을 고려하는 상황이다.

### MediaTek APU

MediaTek Dimensity 시리즈에 통합된 **APU(AI Processing Unit)**. 중저가 스마트폰 시장을 주력으로 한다.

- Dimensity 9300: 4세대 APU, 33 TOPS
- 원가 대비 성능으로 중저가 AI 기능 보급에 기여

---

## 6. 데이터센터 NPU — 추론 전용 칩

NPU의 개념은 스마트폰을 넘어 데이터센터까지 확장됐다. 학습(Training)은 GPU가 필요하지만, **추론(Inference)**은 NPU 같은 전용 칩이 훨씬 효율적이다.

### AWS Inferentia / Trainium

- **Inferentia2**: 추론 전용. H100 대비 낮은 비용으로 추론 서비스 운영
- **Trainium2**: 학습용. 대규모 클러스터 구성 가능

AWS가 NVIDIA 의존도를 줄이기 위해 자체 개발. 실제로 AWS 내부에서 Claude 추론을 Inferentia로 처리하는 부분이 있다.

### Google Edge TPU

저전력 기기용 TPU. 라즈베리파이 크기의 USB 동글(Coral USB Accelerator)로도 나온다. 카메라, IoT 기기에서 온디바이스 추론에 사용.

### Graphcore IPU (Intelligence Processing Unit)

영국 스타트업 Graphcore가 개발한 아키텍처. 기존 GPU/NPU와 전혀 다른 접근 — **Bulk Synchronous Parallel** 모델로 그래프 구조의 신경망을 다른 방식으로 처리. 일부 연구용 워크로드에서 강점을 보이지만 CUDA 생태계 부재가 약점.

---

## 7. NPU와 AI 가속의 경계가 흐려지고 있다

최근 경향은 GPU, NPU, DSP의 구분이 흐려지는 것이다.

**NVIDIA Blackwell**의 경우:
- GPU 코어 + Tensor Core + Transformer Engine
- GPU인데 AI 전용 유닛이 절반 이상

**Apple M4 Ultra**:
- CPU 코어 + GPU 코어 + ANE (NPU)
- 세 가지가 하나의 칩 패키지에서 UMA로 연결

```
통합 칩 아키텍처:
┌─────────────────────────────────────┐
│  CPU  │  GPU  │  NPU  │  메모리    │
│ 코어  │ 코어  │ 코어  │ 컨트롤러  │
│       │       │       │           │
│         공유 온칩 캐시/패브릭       │
│               UMA                  │
│         (Unified Memory Access)    │
└─────────────────────────────────────┘
```

CPU가 전처리 → NPU가 신경망 추론 → CPU가 후처리하는 과정에서 메모리 복사 없이 데이터를 공유할 수 있다. 이게 Apple Silicon이 모바일 AI에서 효율적인 핵심 이유다.

---

## 8. 온디바이스 AI — NPU가 왜 지금 중요한가

최근 AI 트렌드의 핵심 중 하나가 **온디바이스(On-Device) AI**다. 클라우드 서버가 아닌 기기 자체에서 AI 모델을 실행하는 것.

### 온디바이스의 장점

| | 클라우드 AI | 온디바이스 AI |
|---|---|---|
| 응답 속도 | 네트워크 왕복 지연 | 즉시 (ms 수준) |
| 개인정보 | 서버로 전송 | 기기 밖으로 안 나감 |
| 오프라인 | 불가 | 가능 |
| 비용 | 서버 운영비 | 기기 구매 1회 |
| 모델 크기 | 제한 없음 | VRAM/메모리 제한 |

### 실제 사례

- **Apple Intelligence** (iOS 18): Siri 고도화, 텍스트 요약, 이미지 생성 — 대부분 ANE에서 온디바이스 처리, 복잡한 요청만 클라우드(Private Cloud Compute)로
- **Samsung Galaxy AI**: Generative Edit(사진 편집), Live Translate(통화 번역) — Qualcomm NPU + 클라우드 혼용
- **Google Gemini Nano**: Pixel 기기에서 온디바이스 실행 — Google Tensor NPU 활용
- **Microsoft Copilot+ PC**: NPU 40 TOPS 이상 요건을 PC에 부과 — Qualcomm Snapdragon X Elite, Intel Core Ultra, AMD Ryzen AI

Microsoft가 Copilot+ PC 인증 기준으로 **40 TOPS NPU**를 명시하면서 PC에서도 NPU가 필수 사양이 됐다.

---

## 9. NPU의 한계

NPU가 모든 것을 해결하지는 않는다.

**유연성 부족**: GPU는 어떤 연산이든 처리하지만 NPU는 신경망 추론에 특화됐다. 새로운 연산자(Operator)나 모델 구조가 나오면 하드웨어가 지원하지 않을 수 있다. 이때 NPU 대신 CPU나 GPU로 폴백(fallback)한다.

**모델 크기 제한**: 스마트폰 NPU에 올릴 수 있는 모델 크기는 제한적이다. GPT-4급(수천억 파라미터)은 불가능하고, 수십억 파라미터의 양자화 모델이 현실적 상한선이다.

**학습 불가**: NPU는 추론(Inference) 전용이다. 모델을 학습(Training)시키려면 GPU가 필요하다. 일부 NPU가 소규모 파인튜닝을 지원하기 시작했지만 아직 초기 수준이다.

**소프트웨어 분열**: GPU는 CUDA라는 사실상 표준이 있다. NPU는 각 제조사가 다른 SDK를 사용한다 — Apple Core ML, Qualcomm AI Engine Direct, Google NNAPI, MediaTek NeuroPilot... 개발자가 NPU를 최대한 활용하려면 플랫폼별 최적화를 따로 해야 한다.

---

## 정리

```
DSP (1970s~)       → MAC 연산 전용 칩. 통신/오디오
암호화 가속기       → AES-NI. 특정 연산의 하드웨어 고정
GPU (1990s~)       → 병렬 행렬 연산. CUDA로 AI까지 확장

2017 ─ 전환점 ─────────────────────────────────
Apple A11 ANE      → 최초 모바일 Neural Engine
Kirin 970 NPU      → 최초로 "NPU" 이름 공식 사용
2019~ ─────────────────────────────────────────
Snapdragon, Exynos → 모든 플래그십 AP에 NPU 통합
2021~ ─────────────────────────────────────────
Google Tensor      → 구글 자체 AP, Edge TPU 통합
AWS Inferentia     → 데이터센터 추론 전용 NPU
2023~ ─────────────────────────────────────────
Copilot+ PC        → PC에도 40 TOPS NPU 표준화
Apple Intelligence → 온디바이스 AI의 대중화
```

NPU는 "AI 시대의 새 발명"이 아니다. 수십 년간 반도체 업계가 해온 일 — 자주 쓰이는 연산을 전용 하드웨어로 뽑아내는 것 — 의 최신 버전이다. AI 연산이 스마트폰부터 데이터센터까지 모든 곳에서 요구되는 지금, NPU는 GPU와 함께 현대 컴퓨팅의 두 기둥이 됐다.
