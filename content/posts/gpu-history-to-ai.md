---
title: "GPU — 픽셀을 그리던 칩이 AI 산업의 심장이 된 이유"
date: 2026-07-02
draft: false
tags: ["GPU", "CUDA", "AI", "딥러닝", "NVIDIA", "그래픽"]
categories: ["하드웨어"]
---

GPU는 원래 화면에 픽셀을 그리는 칩이었다. 그것이 지금은 AI 모델을 학습시키고, 자율주행을 계산하고, 기후 모델을 시뮬레이션한다. 이 변화는 기술의 우연한 발견이 아니다. GPU의 구조 자체가 현대 컴퓨팅이 요구하는 것과 정확히 맞아떨어졌다. 어떻게 이렇게 됐는지 처음부터 따라가 보자.

---

## 1. GPU 이전 — CPU가 다 했다

1980년대 PC에는 GPU가 없었다. CPU가 화면에 그릴 픽셀을 직접 계산하고 프레임버퍼(화면 메모리)에 썼다. CGA, EGA, VGA 같은 그래픽 어댑터는 색상 팔레트와 해상도를 정의하는 단순한 메모리 인터페이스였고, 연산은 전부 CPU 몫이었다.

```
[CPU] → 픽셀 좌표 + 색상 계산 → [프레임버퍼] → [모니터]
```

텍스트 모드와 단순한 2D 도형이 전부였으므로 이 구조가 충분했다. 문제가 생긴 건 3D 게임이 등장하면서다.

---

## 2. 2D 가속기의 시대 (1990~1995)

윈도우 3.x가 보급되면서 GUI 작업(창 이동, 비트맵 복사, 폰트 렌더링)이 CPU를 잡아먹기 시작했다. 이를 해결하기 위해 2D 그래픽 연산을 전담하는 **그래픽 가속기**가 등장했다.

S3 Trio, Cirrus Logic, ATI Mach64 같은 카드들이 이 시기를 대표한다. BitBLT(비트맵 복사), 직선 그리기, 직사각형 채우기 같은 2D 연산을 CPU 대신 전담했다. 지금 기준으로는 미미하지만, 당시에는 Windows 체감 속도를 극적으로 높였다.

---

## 3. 3D 그래픽 혁명 (1995~1999)

### Voodoo 카드의 등장

1996년 3dfx Interactive의 **Voodoo**가 등장하면서 판이 바뀌었다. Quake, Tomb Raider 같은 3D 게임이 소비자용 하드웨어에서 실시간으로 돌아갔다.

Voodoo는 **고정 파이프라인(Fixed-Function Pipeline)** 방식이었다. 3D 그래픽을 위한 연산 단계가 하드웨어에 고정되어 있었다.

```
3D 고정 파이프라인:
[정점(Vertex)] → 변환(Transform) → 조명(Lighting) → 클리핑
→ 래스터화(Rasterization) → 텍스처 매핑 → Z버퍼 테스트 → 프레임버퍼
```

각 단계가 칩에 고정되어 있어 프로그래머가 알고리즘을 바꿀 수 없었다. 빠르지만 유연하지 않았다.

### DirectX와 OpenGL의 표준화

Microsoft의 **DirectX**(1995)와 SGI의 **OpenGL**이 각각 Windows와 크로스플랫폼 표준으로 자리 잡았다. 하드웨어 제조사는 이 API를 지원하는 드라이버를 작성했고, 개발자는 API 위에서 코드를 짰다.

이 시기 GPU 경쟁: 3dfx Voodoo, NVIDIA RIVA TNT, ATI Rage

---

## 4. 프로그래머블 셰이더 혁명 (1999~2006)

### NVIDIA GeForce 256 — "GPU"라는 이름의 탄생

1999년 NVIDIA는 GeForce 256을 발표하면서 처음으로 **GPU(Graphics Processing Unit)**라는 이름을 사용했다. 이 칩은 변환·조명(T&L, Transform & Lighting) 연산을 CPU에서 GPU로 가져왔다.

### 셰이더 프로그래밍의 등장

DirectX 8(2001), DirectX 9(2002)와 함께 **프로그래머블 셰이더**가 도입됐다. 고정 파이프라인의 각 단계를 개발자가 직접 프로그래밍할 수 있게 됐다.

- **버텍스 셰이더(Vertex Shader)**: 각 정점의 위치, 색상, 텍스처 좌표를 계산
- **픽셀/프래그먼트 셰이더(Pixel Shader)**: 각 픽셀의 최종 색상을 계산

```glsl
// GLSL 픽셀 셰이더 예시
void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPos - vFragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    FragColor = vec4(diff * color, 1.0);
}
```

프로그래머블 셰이더는 단순한 기능 확장이 아니었다. "GPU는 이것만 한다"는 고정된 역할을 깨고, **작은 프로그램을 수천 개 동시에 실행하는 병렬 프로세서**로 GPU의 정체성을 바꿨다.

### 이 시기의 CPU vs GPU 구조 차이

```
CPU (당시):                    GPU (당시):
├ 4~8개 복잡한 코어            ├ 수백~수천 개 단순한 코어
├ 복잡한 제어 로직             ├ 단순한 제어 로직
├ 큰 캐시                     ├ 작은 캐시
└ 범용 (어떤 작업이든)         └ 전용 (그래픽 병렬 연산)
```

CPU는 단일 복잡한 작업을 빠르게(레이턴시 최소화). GPU는 단순한 작업을 대규모로 동시에(처리량 최대화).

---

## 5. GPGPU의 발견 (2003~2006)

프로그래머블 셰이더가 등장하자, 그래픽과 관계없는 연구자들이 눈을 빛냈다. 셰이더는 결국 작은 프로그램이었다. 그래픽 데이터 대신 **과학 계산 데이터**를 넣으면 GPU를 범용 계산에 쓸 수 있지 않을까?

이것이 **GPGPU(General-Purpose computing on GPU)**의 시작이다. 2003~2006년 연구자들이 그래픽 API(OpenGL)를 통해 유체 시뮬레이션, 행렬 연산, 물리 계산을 GPU에서 수행하는 실험을 했다. 결과는 CPU 대비 수십 배 빨랐다.

하지만 그래픽 API를 억지로 우회하는 방식이라 매우 불편했다. 행렬 곱셈을 하려면 텍스처 좌표로 데이터를 변환해야 했다.

---

## 6. CUDA — 게임 체인저 (2007)

2007년 NVIDIA가 **CUDA(Compute Unified Device Architecture)**를 발표했다. GPGPU를 위한 전용 프로그래밍 모델이었다.

```c
// CUDA 커널 — GPU에서 병렬로 실행
__global__ void vectorAdd(float *a, float *b, float *c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}

// 호출: 1024개 블록 × 256 스레드 = 262,144개 동시 실행
vectorAdd<<<1024, 256>>>(a, b, c, n);
```

그래픽 API 우회 없이 C 언어로 GPU 프로그램을 작성할 수 있게 됐다. NVIDIA는 동시에 GPU 아키텍처를 그래픽과 컴퓨팅을 모두 지원하도록 재설계했다.

### CUDA vs OpenCL

| 항목 | CUDA | OpenCL |
|---|---|---|
| 개발 | NVIDIA | Khronos Group (표준화 기구) |
| 지원 하드웨어 | NVIDIA GPU 전용 | NVIDIA, AMD, Intel, FPGA, CPU |
| 생태계 | 압도적으로 풍부 | 제한적 |
| 성능 | 최적화 수준 높음 | 하드웨어별 편차 |

CUDA가 NVIDIA GPU 전용임에도 AI/HPC 업계 표준이 된 이유는 단순하다 — 라이브러리가 압도적으로 많다(cuDNN, cuBLAS, NCCL 등). PyTorch, TensorFlow 모두 CUDA 위에서 최고 성능을 낸다.

---

## 7. GPU 아키텍처의 진화

### NVIDIA 아키텍처 계보

| 코드명 | 연도 | 핵심 변화 |
|---|---|---|
| Tesla | 2006 | 통합 셰이더 아키텍처, CUDA 1.0 |
| Fermi | 2010 | L1/L2 캐시 도입, ECC 지원 |
| Kepler | 2012 | 전력 효율 대폭 개선 |
| Maxwell | 2014 | 타일 기반 셰이딩 |
| Pascal | 2016 | **FP16 연산 도입**, NVLink, HBM2 |
| Volta | 2017 | **Tensor Core 도입** ← AI 시대 개막 |
| Turing | 2018 | RT Core (레이 트레이싱 하드웨어) |
| Ampere | 2020 | 3세대 Tensor Core, A100 |
| Hopper | 2022 | Transformer Engine, H100 |
| Blackwell | 2024 | B100/B200, NVLink 5세대 |

Volta의 Tensor Core 도입이 결정적 전환점이다.

### Tensor Core — AI 연산 전용 유닛

일반 CUDA Core는 스칼라 연산을 처리한다. Tensor Core는 **행렬 곱셈(GEMM)**을 하드웨어 수준에서 처리한다.

```
일반 CUDA Core:
  한 클럭에 1개의 FP32 곱셈-덧셈 연산

Tensor Core (4세대, Hopper):
  한 클럭에 4×8×16 = 512개의 FP16 연산을 동시 처리
```

딥러닝의 핵심 연산이 바로 행렬 곱셈이다. 가중치 행렬 × 입력 행렬 = 출력. Tensor Core는 이 연산을 위해 만들어진 유닛이다.

H100의 FP16 Tensor Core 성능: **1,979 TFLOPS** (FP32 CUDA Core만 쓰면 67 TFLOPS)

---

## 8. AI 시대의 GPU

### 왜 GPU가 딥러닝에 맞는가

딥러닝의 연산을 분해하면 대부분 이것이다.

```
레이어 연산:
출력(m×k) = 가중치(m×n) × 입력(n×k) + 편향(m)
```

이 행렬 곱셈은 수백만 개의 독립적인 곱셈-덧셈 연산의 집합이다. 서로 의존성이 없어 동시에 처리할 수 있다. GPU의 수천 개 코어가 이것을 동시에 처리하기에 최적이다.

CPU로 같은 연산을 하면:
- 코어 수가 적어 동시 처리 수가 한정
- 큰 캐시와 복잡한 분기 처리 회로가 면적을 차지해 비효율적

### 학습 vs 추론

| | 학습(Training) | 추론(Inference) |
|---|---|---|
| 연산 | 순전파 + 역전파 | 순전파만 |
| 메모리 | 파라미터 + 그래디언트 + 활성화값 | 파라미터만 |
| 배치 크기 | 크게 | 작게 (실시간) |
| GPU 요구 | 대용량 VRAM, 최고 성능 | 상대적으로 낮음 |
| 대표 GPU | H100, A100 | L40S, RTX 4090, 전용 추론 칩 |

### 현재 AI GPU 시장

**NVIDIA H100 (Hopper)**
- Tensor Core: 4세대
- VRAM: 80GB HBM3
- 메모리 대역폭: 3.35 TB/s
- FP16 성능: 1,979 TFLOPS
- NVLink 대역폭: 900 GB/s (8-GPU 노드)
- 가격: 약 3~4만 달러

**NVIDIA H200**
- H100 대비 HBM3e로 업그레이드
- VRAM: 141GB
- 메모리 대역폭: 4.8 TB/s

**NVIDIA Blackwell (B100/B200, 2024)**
- 5세대 Tensor Core
- FP4/FP6 지원 (더 낮은 정밀도로 더 빠른 추론)
- GB200 NVL72: 72개 GPU를 하나의 슈퍼컴퓨터처럼 연결

### NVLink와 NVSwitch — GPU 간 통신

H100 한 장으로는 대형 모델(수백B 파라미터)을 다룰 수 없다. 여러 GPU를 묶어야 한다. 이때 PCIe보다 훨씬 빠른 GPU 전용 인터커넥트가 **NVLink**다.

```
PCIe 4.0 x16: 32 GB/s 양방향
NVLink 4.0:   900 GB/s 양방향 (8-GPU DGX H100 기준)
```

**NVSwitch**는 NVLink로 연결된 GPU들을 All-to-All로 통신하게 하는 스위치 칩이다. DGX H100(8-GPU)에서 어떤 GPU든 다른 GPU에 NVLink 속도로 직접 접근한다.

---

## 9. NVIDIA 경쟁자들

NVIDIA가 AI GPU 시장을 90% 가까이 장악하고 있지만, 도전자들이 있다.

### AMD CDNA / MI 시리즈

AMD는 소비자 GPU(RDNA)와 데이터센터 GPU(CDNA)를 분리했다.

| 칩 | 메모리 | 대역폭 | 특징 |
|---|---|---|---|
| MI250X | 128GB HBM2e | 3.2 TB/s | Frontier 슈퍼컴퓨터 기반 |
| MI300X | 192GB HBM3 | 5.3 TB/s | 메모리 용량 H100 대비 2.4배 |
| MI325X | 256GB HBM3e | 6 TB/s | 2024 |

MI300X의 192GB VRAM은 단일 GPU로 70B 파라미터 모델(FP16 기준 140GB)을 올릴 수 있어 대형 모델 추론에 유리하다.

AMD의 약점은 CUDA 생태계다. ROCm(AMD의 CUDA 대응 플랫폼)이 성숙하고 있지만, 라이브러리 지원과 최적화 수준이 CUDA보다 뒤처진다.

### Google TPU (Tensor Processing Unit)

Google이 자체 개발한 AI 전용 가속기. GPU가 아니라 처음부터 행렬 연산만을 위해 설계됐다.

- **TPU v1 (2016)**: 추론 전용. AlphaGo에 사용
- **TPU v4 (2023)**: 학습도 지원. Google Cloud에서 4096개 Pod 구성
- **Trillium (TPU v6, 2024)**: 전작 대비 4.7배 성능

TPU는 Google 서비스 내부 + Google Cloud에서만 쓸 수 있다. 온프레미스 구매 불가.

### AWS Trainium / Inferentia

- **Inferentia**: 추론 전용 칩. 저비용 추론 서비스
- **Trainium**: 학습용 칩. NVIDIA H100과 경쟁

AWS가 자체 칩을 만드는 이유는 단순하다 — NVIDIA에 대한 의존도를 줄이고, 클라우드 서비스 마진을 높이기 위해서다.

### Intel Gaudi 3

Intel이 Habana Labs 인수(2019) 후 개발한 AI 가속기. 이더넷 기반 인터커넥트(RDMA)를 쓴다는 점이 특이하다. NVLink 같은 전용 인터커넥트 없이 스케일아웃이 가능하다는 장점이 있지만, 성능은 H100에 미치지 못한다.

---

## 10. 모바일 GPU

모바일 AP에 통합된 GPU는 소비 전력과 발열이 최우선이다.

| 제조사 | GPU | 사용 AP | 특징 |
|---|---|---|---|
| Apple | Apple GPU | M 시리즈, A 시리즈 | 자체 설계, UMA 통합 메모리 |
| Qualcomm | Adreno | Snapdragon | 자체 설계, UMA |
| ARM | Mali | Exynos, MediaTek | 라이선스 코어 |
| Imagination | PowerVR | 구형 Apple A시리즈 | A11 이전 Apple |

Apple GPU의 강점은 **UMA(통합 메모리)**다. CPU와 GPU가 같은 메모리 풀을 공유하므로 CPU에서 GPU로 데이터를 복사하는 비용이 없다. M4 Max의 GPU 메모리 대역폭(400+ GB/s)은 일부 소비자 데스크탑 GPU를 능가한다.

---

## 11. 소프트웨어 생태계

하드웨어만큼 중요한 것이 소프트웨어 스택이다.

```
AI 프레임워크 (PyTorch, TensorFlow, JAX)
         ↓
딥러닝 라이브러리 (cuDNN, cuBLAS, NCCL)
         ↓
CUDA / ROCm / Metal / Vulkan Compute
         ↓
GPU 하드웨어
```

**NVIDIA의 해자(Moat)**는 CUDA 생태계다. 2007년부터 쌓아온 라이브러리, 최적화 코드, 개발자 지식이 경쟁자가 하드웨어로만 따라올 수 없는 장벽을 만들었다. AMD가 MI300X로 H100보다 우수한 메모리 스펙을 제시해도 소프트웨어 호환성 문제로 도입이 망설여지는 이유다.

---

## 12. 현재와 미래

### 양자화(Quantization)와 추론 최적화

모델 파라미터를 FP32(4바이트)에서 FP16(2바이트), INT8(1바이트), INT4(0.5바이트)로 줄이면 같은 VRAM에 더 큰 모델을 올릴 수 있다. NVIDIA Blackwell은 FP4를 하드웨어로 지원한다.

```
llama.cpp의 양자화 레벨:
Q8_0:  약 원본 크기의 50%
Q4_K_M: 약 원본 크기의 25%  ← 성능 대비 타협점
Q2_K:  약 원본 크기의 12.5% (품질 저하 큼)
```

### GPU 클러스터링

단일 GPU의 한계를 넘어 수천 개를 연결하는 방향이 주류다.

- **NVLink / NVSwitch**: NVIDIA 전용, 최고 대역폭
- **InfiniBand**: 전통적 HPC 인터커넥트
- **RoCE (RDMA over Converged Ethernet)**: 이더넷 기반 저비용

Meta의 Grand Teton(AI 슈퍼클러스터), Microsoft Azure의 NDm H100, Google의 TPU Pod — 전부 이 방향의 구현이다.

### 엣지 AI

클라우드가 아닌 기기에서 AI를 실행하는 방향도 커지고 있다. Apple Neural Engine(ANE), Qualcomm Hexagon NPU, Google Edge TPU가 이 역할을 한다. GPU와 NPU의 경계가 흐려지고 있다.

---

## 정리

```
1990s  : 2D 가속 → 픽셀을 빠르게 그리기
1995~  : 3D 고정 파이프라인 → Quake, 둠
2001~  : 프로그래머블 셰이더 → 개발자가 GPU를 프로그래밍
2003~  : GPGPU 발견 → 그래픽 API로 과학 계산
2007   : CUDA → GPU 범용 컴퓨팅의 문이 열림
2012   : AlexNet → 딥러닝 + GPU의 폭발적 조합 증명
2017   : Tensor Core (Volta) → GPU가 AI 전용 하드웨어로 진화
2020~  : A100, H100 → AI 인프라의 핵심 부품
2024~  : Blackwell, TPU v6, MI300X → AI 가속기 경쟁 전면전
```

GPU가 픽셀을 그리던 칩에서 AI 산업의 심장이 된 것은 우연이 아니다. **병렬 처리 구조**가 딥러닝의 핵심인 행렬 연산과 완벽하게 맞아떨어졌고, NVIDIA는 CUDA로 그 가능성을 10년 앞서 생태계로 구축했다. 하드웨어 스펙 경쟁이 본격화됐지만, 소프트웨어 생태계라는 해자가 당장의 판도를 바꾸기 어렵게 만들고 있다.
