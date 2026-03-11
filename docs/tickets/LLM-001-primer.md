# LLM-001 Primer: Vercel Edge Function + Claude API Proxy

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Date:** Mar 10, 2026
**Previous work:** ENG-001 through ENG-004 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

LLM-001 creates the **server-side API layer** that connects the frontend to Claude. It implements a single Vercel Edge Function at `api/chat.ts` that accepts student messages and lesson state, streams Claude's response back via Server-Sent Events (SSE), and executes tool calls server-side against the FractionEngine. This is the backbone of the entire LLM integration — every student interaction flows through this endpoint.

### Why Does This Exist?

The tutor needs a streaming connection to Claude that:
1. Keeps the `ANTHROPIC_API_KEY` server-side (never exposed to the browser)
2. Streams responses so students see text appearing in real-time (not waiting for full completion)
3. Executes tool calls server-side so Claude can verify math via FractionEngine without the browser needing to do round-trips
4. Uses Edge Runtime (NOT Node.js serverless) for <50ms cold starts — critical for a responsive tutoring experience

### Current State

| Component | Status |
|-----------|--------|
| `api/` directory | **Does not exist** — create it at project root |
| `vercel.json` | **Does not exist** — create it at project root |
| `@anthropic-ai/sdk` | **Not installed** — add as dependency |
| `src/engine/FractionEngine.ts` | **Complete** (ENG-002) — import server-side for tool execution |
| `src/state/types.ts` | **Complete** (ENG-004) — `LessonState` type defined |
| ENG-001–ENG-004 | **Complete** — scaffold, engine, tests, reducer all in place |

---

## What Was Already Done

- ENG-001: Project scaffold with Vite, React, TypeScript, Vitest
- ENG-002: FractionEngine with all pure math functions (simplify, areEquivalent, split, combine, toCommonDenominator, isValidFraction, parseStudentInput)
- ENG-003: Property-based tests for FractionEngine
- ENG-004: LessonState types, LessonAction union, reducer, and initial state

---

## LLM-001 Contract

### Edge Function: `api/chat.ts`

This file is a **Vercel Edge Function** (NOT a Node.js serverless function). It must use the Edge Runtime for sub-50ms cold starts.

```typescript
export const config = {
  runtime: 'edge',
};
```

### Request Format

Accept `POST` requests with the following JSON body:

```typescript
interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  lessonState: LessonState;
}
```

- `messages`: the conversation history for Claude's context window
- `lessonState`: current lesson state, used to build the system prompt and passed to tool calls

### Response Format: Server-Sent Events (SSE)

Response headers:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

Stream events in the following format:

```
event: text_delta
data: {"content": "Great job! Let's try..."}

event: tool_use
data: {"name": "check_equivalence", "input": {"a": {"numerator": 1, "denominator": 2}, "b": {"numerator": 2, "denominator": 4}}}

event: tool_result
data: {"result": true}

event: done
data: {}
```

Event types:
| Event | Data Shape | Description |
|-------|-----------|-------------|
| `text_delta` | `{ content: string }` | Incremental text from Claude — append to current message |
| `tool_use` | `{ name: string, input: object }` | Claude is calling a tool — execute server-side |
| `tool_result` | `{ result: any }` | Result of tool execution — sent back to Claude in the same streaming session |
| `done` | `{}` | Stream complete — client should finalize the message |

### Tool Execution Flow (Server-Side)

When Claude emits a `tool_use` event:
1. Import FractionEngine functions
2. Execute the requested tool with the provided input (use the `executeToolCall` function from `api/tools.ts` — implemented in LLM-002)
3. Send the tool result back to Claude within the same streaming session (as a `tool_result` message in the Anthropic API format)
4. Emit a `tool_result` SSE event to the client for transparency
5. Continue streaming Claude's response after it processes the tool result

### Claude API Configuration

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use Claude Sonnet
const model = 'claude-sonnet-4-20250514';
```

### Error Handling

- Missing `ANTHROPIC_API_KEY`: return 500 with `{ error: "API key not configured" }`
- Invalid request body: return 400 with `{ error: "Invalid request" }`
- Anthropic API errors: return 502 with `{ error: "Upstream API error" }`
- Tool execution errors: catch, log, and send a safe error result back to Claude (do not crash the stream)

### `vercel.json`

Create at project root:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

This ensures the Vite dev server and Vercel Edge Functions coexist during local development with `vercel dev`.

---

## Deliverables Checklist

### A. Edge Function

- [ ] `api/chat.ts` created as Vercel Edge Function with `runtime: 'edge'` config
- [ ] Accepts POST with `{ messages, lessonState }` body
- [ ] Initializes Anthropic client with `process.env.ANTHROPIC_API_KEY`
- [ ] Uses model `claude-sonnet-4-20250514`
- [ ] Streams response via SSE with correct headers

### B. SSE Streaming

- [ ] `text_delta` events emitted for each text chunk
- [ ] `tool_use` events emitted when Claude calls a tool
- [ ] `tool_result` events emitted after server-side tool execution
- [ ] `done` event emitted when stream completes
- [ ] Stream properly closes on completion or error

### C. Tool Execution

- [ ] Tool calls intercepted and executed server-side
- [ ] FractionEngine imported and used for tool execution
- [ ] Tool results sent back to Claude within the same session
- [ ] Tool execution errors handled gracefully (no stream crash)

### D. Configuration

- [ ] `vercel.json` created with API rewrites
- [ ] `@anthropic-ai/sdk` added to `package.json` dependencies
- [ ] No hardcoded API keys — `process.env.ANTHROPIC_API_KEY` only

### E. Repo Housekeeping

- [ ] Update `docs/DEVLOG.md` with LLM-001 entry when complete
- [ ] Feature branch: `feature/llm-001-edge-function`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/llm-001-edge-function
# ... implement ...
git add api/chat.ts vercel.json package.json package-lock.json
git commit -m "feat: add Vercel Edge Function for Claude API proxy (LLM-001)"
git push -u origin feature/llm-001-edge-function
```

Use Conventional Commits: `feat:`, `fix:`, `chore:`.

---

## Technical Specification

### Edge Function Skeleton

```typescript
import Anthropic from '@anthropic-ai/sdk';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const { messages, lessonState } = await req.json();

  // Build system prompt (LLM-003 — stub for now)
  // Get tool definitions (LLM-002 — stub for now)
  // Create streaming response with Anthropic SDK
  // Handle tool_use events server-side
  // Emit SSE events to client
}
```

### SSE Encoding

Each SSE event follows the format:
```
event: <event_type>\ndata: <json_string>\n\n
```

Use a `TransformStream` or `ReadableStream` to construct the SSE response. The Anthropic SDK's streaming API returns an async iterable — iterate over it, transform events into SSE format, and pipe to the response.

### Anthropic SDK Streaming

```typescript
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: systemPrompt,
  messages: messages,
  tools: toolDefinitions,
});

for await (const event of stream) {
  // Transform Anthropic events into SSE events
  // Handle tool_use by executing server-side and continuing
}
```

### Tool Execution During Stream

When the Anthropic stream emits a `content_block_start` with `type: 'tool_use'`:
1. Accumulate the tool input from `content_block_delta` events
2. On `content_block_stop`, execute the tool via `executeToolCall(name, input, lessonState)`
3. Send the tool result back to Claude by continuing the conversation
4. Emit `tool_use` and `tool_result` SSE events to the client

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `api/chat.ts` | Vercel Edge Function — main API endpoint |
| `vercel.json` | Vercel configuration with API rewrites |

### Files to Modify

| File | Action |
|------|--------|
| `package.json` | Add `@anthropic-ai/sdk` dependency |
| `docs/DEVLOG.md` | Add LLM-001 entry when complete |

### Files You Should NOT Modify

- `src/engine/*` — FractionEngine is complete; import but do not modify
- `src/state/*` — types and reducer are complete; do not modify
- `src/components/*` — UI layer is not part of this ticket
- `vite.config.ts`, `tsconfig.json` — unless strictly required for Edge Function compatibility

### Files to READ for Context

| File | Why |
|------|-----|
| `docs/prd.md` Section 5 | LLM integration architecture |
| `src/engine/FractionEngine.ts` | Functions available for tool execution |
| `src/state/types.ts` | `LessonState` and `LessonAction` types |
| `.cursor/rules/architecture.mdc` | Layered architecture — API is infrastructure layer |

---

## Definition of Done for LLM-001

- [ ] `api/chat.ts` exists as a Vercel Edge Function with `runtime: 'edge'`
- [ ] Accepts POST with messages and lessonState
- [ ] Streams SSE response with `text_delta`, `tool_use`, `tool_result`, `done` events
- [ ] Uses `claude-sonnet-4-20250514` model
- [ ] API key read from `process.env.ANTHROPIC_API_KEY`
- [ ] `vercel.json` created with rewrites
- [ ] `@anthropic-ai/sdk` installed as dependency
- [ ] Deployable locally with `vercel dev`
- [ ] Testable via curl: `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hi"}],"lessonState":{}}'`
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## After LLM-001

- **LLM-002** (Claude Tool Definitions) — define the 9 tool schemas and `executeToolCall` function used by this edge function.
- **LLM-003** (System Prompt Engineering) — build the system prompt that shapes Sam's personality and behavior.
- **LLM-004** (useTutorChat Hook) — React hook that connects the frontend to this edge function via SSE.
