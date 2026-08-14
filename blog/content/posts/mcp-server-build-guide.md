---
title: "MCP 서버 실전 제작 가이드 — SDK 고르기부터 디버깅까지"
date: 2026-08-08T17:00:00+09:00
draft: false
tags: ["MCP", "ModelContextProtocol", "Python", "TypeScript", "개발가이드"]
categories: ["AI"]
---

[MCP가 왜 만들어졌고 어떻게 표준이 됐는지](/blog/posts/mcp-model-context-protocol/)는 이미 다뤘다. 이번엔 개념 설명을 걷어내고, 실제로 MCP 서버 하나를 만들어 클로드에 붙이고 디버깅까지 해보는 실전 가이드다.

---

## 1. SDK 고르기

MCP 서버를 직접 짜려면 프로토콜의 JSON-RPC 메시지를 손으로 구현할 필요가 없다. 공식 SDK가 이 부분을 다 감싸준다.

**Python**: `pip install mcp`로 설치하는 공식 SDK(`modelcontextprotocol/python-sdk`) 안에 `mcp.server.fastmcp.FastMCP`라는 데코레이터 기반 고수준 API가 들어 있다. 이건 원래 제레미아 로윈(Jeremiah Lowin)이 2024년 말 독립적으로 만든 FastMCP 프로젝트의 1.0 버전을 앤스로픽이 그대로 가져다 공식 SDK에 편입한 것이다. 다만 독립 FastMCP 프로젝트는 그 뒤로도 별도로 계속 발전해(현재 PrefectHQ 산하, 2026.2.18 안정 버전 3.0 출시) 인증·프록시·OpenAPI 자동생성 같은 고급 기능까지 갖춘 상태고, 공식 SDK 쪽은 2026.6.30 v2.0 베타에서 번들 클래스 이름을 `FastMCP`에서 `MCPServer`로 바꾸며 두 프로젝트를 구분하려 하고 있다. 학습·간단한 서버는 공식 SDK 번들 클래스로 충분하고, 프로덕션급 고급 기능이 필요하면 독립 `fastmcp` 패키지를 쓴다.

**TypeScript**: `@modelcontextprotocol/sdk` 패키지의 `McpServer` 클래스를 쓴다. Node.js 생태계에서 그대로 npm으로 배포하기 좋다는 게 강점이다.

둘 다 문서화 수준·예제 수는 비슷하니, 서버가 감쌀 대상(기존 파이썬 스크립트냐, Node 기반 API 클라이언트냐)에 따라 고르면 된다.

---

## 2. 최소 서버 — Tool 하나만 있는 버전

### Python (공식 SDK)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-first-server")

@mcp.tool()
def greet(name: str) -> str:
    """이름을 받아 인사말을 돌려준다."""
    return f"안녕하세요, {name}님!"

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

`@mcp.tool()` 데코레이터가 함수 시그니처(타입 힌트)를 JSON 스키마로, 독스트링을 도구 설명으로 자동 변환한다. 클라이언트(클로드)는 이 스키마와 설명만 보고 언제 이 도구를 호출할지 판단한다 — 설명을 부실하게 쓰면 모델이 도구를 엉뚱하게 쓰거나 아예 안 쓴다.

### TypeScript

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-first-server", version: "1.0.0" });

server.registerTool(
  "greet",
  {
    description: "이름을 받아 인사말을 돌려준다.",
    inputSchema: { name: z.string() },
  },
  async ({ name }) => ({
    content: [{ type: "text", text: `안녕하세요, ${name}님!` }],
  })
);

await server.connect(new StdioServerTransport());
```

Zod 스키마로 입력 검증까지 한 번에 끝난다. 파이썬 쪽 타입 힌트, TS 쪽 Zod 스키마 — 둘 다 결국 클라이언트에게 넘길 JSON 스키마를 만드는 수단이라는 점은 같다.

---

## 3. 세 가지 원시 타입 실전

[기존 글](/blog/posts/mcp-model-context-protocol/)에서 정리했듯 MCP는 Tool·Resource·Prompt 세 원시 타입을 정의한다. 실제 코드에서 각각 어떻게 다른지 보자.

```python
# Tool — 모델이 "실행"하는 함수. 부작용이 있을 수 있음.
@mcp.tool()
def create_ticket(title: str, priority: str) -> str:
    ...

# Resource — 모델이 "읽는" 데이터. 실행이 아니라 조회.
@mcp.resource("config://settings")
def get_settings() -> str:
    return open("settings.json").read()

# Prompt — 재사용 가능한 프롬프트 템플릿. 사용자가 슬래시 커맨드처럼 호출.
@mcp.prompt()
def code_review_prompt(diff: str) -> str:
    return f"다음 diff를 리뷰해줘:\n{diff}"
```

실무에서 가장 흔한 실수는 **Resource로 처리해야 할 걸 Tool로 만드는 것**이다. "설정 파일 읽어오기"처럼 부작용 없는 단순 조회는 Resource가 맞다 — 클라이언트가 이걸 자동으로 컨텍스트에 넣거나 사용자에게 선택하게 할 수 있어, 매번 모델이 "이 도구를 호출해야 하나?"를 판단할 필요가 없어진다.

---

## 4. 전송 방식 — stdio냐 HTTP냐

```
stdio   → 로컬 프로세스로 실행, 표준입출력으로 통신
          클로드 데스크톱/Claude Code가 서버를 자식 프로세스로 직접 띄우는 방식
          개발·개인 사용에 압도적으로 편함

HTTP    → 원격 서버로 배포, 여러 클라이언트가 네트워크로 접속
          Streamable HTTP(현재 스펙 권장 방식)로 요청/응답 + 스트리밍 지원
          여러 사용자가 공유하는 서버, SaaS형 MCP 서버라면 이쪽
```

로컬에서 개인 도구를 만드는 거라면 stdio로 시작하는 게 압도적으로 빠르다. 회사 안에서 여럿이 공유하거나 외부에 제공할 서버라면 HTTP로 가야 하는데, 이 경우 [기존 글에서 다룬 2025-06-18 스펙 개정](/blog/posts/mcp-model-context-protocol/)의 OAuth 2.1 인증 요구사항을 반드시 챙겨야 한다 — 인증 없는 원격 MCP 서버는 그 자체로 공격 표면이다.

---

## 5. 로컬에서 붙여보기

### Claude Desktop

`claude_desktop_config.json`에 서버를 등록한다.

```json
{
  "mcpServers": {
    "my-first-server": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
```

### Claude Code

CLI 한 줄로 끝난다.

```bash
claude mcp add my-first-server -- python /absolute/path/to/server.py
```

둘 다 클로드가 이 명령을 자식 프로세스로 실행하고, stdio로 JSON-RPC 메시지를 주고받는다. 경로는 반드시 절대 경로로 — 상대 경로를 쓰면 클로드가 어느 작업 디렉터리에서 프로세스를 띄우는지에 따라 조용히 실패한다.

---

## 6. 디버깅 — MCP Inspector

서버가 클라이언트 없이도 제대로 동작하는지 확인하려면 공식 시각화 디버깅 도구를 쓴다.

```bash
npx @modelcontextprotocol/inspector python /absolute/path/to/server.py
```

브라우저에서 React 기반 UI(기본 6274번 포트)가 열리고, 내부적으로 Node.js 프록시(기본 6277번 포트)가 실제 서버와 stdio/SSE/HTTP로 통신한다. 여기서 서버가 광고하는 도구 목록·스키마를 확인하고, 도구를 직접 호출해 응답을 즉시 볼 수 있다. 클로드에 연결하기 전에 이 단계를 건너뛰면, 스키마 오타 하나 때문에 "왜 모델이 도구를 안 쓰지"를 클로드 데스크톱 로그만 보고 추적해야 하는 상황이 된다.

---

## 7. 흔한 실수 체크리스트

```
□ 도구 설명(docstring/description)이 모델 입장에서 모호함
   → "언제 이 도구를 써야 하는지"를 설명에 명시적으로 적어야 함
□ 부작용 없는 조회를 Tool로 만듦 → Resource로 바꿀 것
□ 상대 경로로 config에 등록 → 절대 경로 필수
□ 원격 HTTP 서버에 인증 없음 → OAuth 2.1 없이 배포 금지
□ 도구 입력 스키마가 지나치게 자유로움(예: 아무 문자열이나 허용)
   → enum·정규식 등으로 제약해야 모델이 헛다리 짚는 호출을 줄임
□ 도구가 너무 많음 → 컨텍스트 낭비 + 모델의 도구 선택 정확도 저하
```

---

## 정리

```
SDK 선택       → Python(official mcp / 고급기능은 별도 fastmcp패키지) vs TypeScript(@modelcontextprotocol/sdk)
최소 서버      → 데코레이터/registerTool로 함수 하나를 Tool로 노출
세 원시 타입   → Tool(실행)·Resource(조회)·Prompt(템플릿) 구분이 설계의 핵심
전송 방식      → 로컬=stdio, 공유/원격=HTTP+OAuth2.1
로컬 연결      → claude_desktop_config.json 또는 `claude mcp add`
디버깅         → npx @modelcontextprotocol/inspector로 클라이언트 없이 먼저 검증
```

프로토콜 자체는 [이미 정리한 대로](/blog/posts/mcp-model-context-protocol/) 단순한 JSON-RPC 기반이다. 실전에서 막히는 지점은 프로토콜이 아니라 "이 기능을 Tool로 만들지 Resource로 만들지", "설명을 모델이 알아듣게 쓸 수 있는지" 같은 설계 판단 쪽에 있다.

Sources:
- [MCP Inspector - Model Context Protocol](https://modelcontextprotocol.io/docs/tools/inspector)
- [FastMCP vs MCP Python SDK: GA, MCPServer Rename in 2026](https://www.agenticwire.news/article/fastmcp-vs-mcp-python-sdk)
- [typescript-sdk server quickstart - GitHub](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server-quickstart.md)
- [Connect Claude Code to tools via MCP - Claude Code Docs](https://code.claude.com/docs/en/mcp)
