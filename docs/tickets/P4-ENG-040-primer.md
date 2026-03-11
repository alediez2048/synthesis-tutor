# ENG-040 Primer: LangSmith Observability Integration

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 4: Integration + Voice + Observability (Day 4)
**Date:** Mar 11, 2026
**Previous work:** ENG-011 (edge function), ENG-012 (tools), ENG-013 (system prompt), ENG-014 (useTutorChat). See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-040 adds **LangSmith tracing** to the `/api/chat` edge function so that every Claude API call, tool execution, and response is observable in the LangSmith dashboard. This provides:

- Token usage tracking (input/output tokens per request)
- Latency monitoring (total time, time-to-first-byte)
- Tool call visibility (which tools Claude called, inputs/outputs)
- Lesson phase metadata (what phase the student was in)
- Error tracking

### Why Does This Exist?

Without observability, we're flying blind. We can't tell if:
- Claude is using too many tokens (cost)
- Responses are slow (latency)
- Claude is calling tools correctly (correctness)
- The system prompt is causing unexpected behavior (debugging)

LangSmith gives us a dashboard to inspect every conversation turn in detail.

### Current State

| Component | Status |
|-----------|--------|
| `api/chat.ts` | **Complete** (ENG-011/012/013) — Uses `@anthropic-ai/sdk` directly, tool use loop, SSE streaming |
| `@anthropic-ai/sdk` | **Installed** — Anthropic SDK used for Claude API calls |
| `langsmith` package | **Not installed** — needs `npm install langsmith` |
| LangSmith account | **Required** — needs API key from smith.langchain.com |

---

## What Was Already Done

The edge function (`api/chat.ts`) currently:
1. Creates an Anthropic client (line 86)
2. Calls `anthropic.messages.create()` in a loop (line 113)
3. Executes tools server-side via `executeToolCall` (lines 127-133)
4. Streams results as SSE events
5. Has `export const config = { runtime: 'edge' }` (line 12-14)

All tracing wraps around this existing flow — the core logic doesn't change.

---

## ENG-040 Contract

### Approach: LangSmith `traceable` Wrapper

Use the `langsmith` package's `traceable` function to wrap the Claude API calls. This is the lightest integration — no need to swap to LangChain.

**IMPORTANT: Edge Runtime Compatibility**

The edge function uses `runtime: 'edge'`. The `langsmith` SDK uses `fetch` internally and should work in edge runtime, but verify. If it doesn't, fall back to **Option B** below.

### Option A: `langsmith` SDK (preferred)

```bash
npm install langsmith
```

```typescript
// api/chat.ts additions

import { Client } from 'langsmith';
import { traceable } from 'langsmith/traceable';

// Initialize client (reads LANGSMITH_API_KEY from env)
const langsmith = new Client();
```

Wrap the Claude API call:

```typescript
const createMessage = traceable(
  async (params: {
    model: string;
    max_tokens: number;
    system: string;
    messages: unknown[];
    tools: unknown[];
  }) => {
    const startTime = Date.now();
    const response = await anthropic.messages.create(params);
    const latency = Date.now() - startTime;
    return { response, latency };
  },
  {
    name: 'claude-messages-create',
    run_type: 'llm',
    metadata: {
      model: 'claude-sonnet-4-20250514',
    },
  }
);
```

Wrap tool execution:

```typescript
const traceToolCall = traceable(
  (name: string, input: Record<string, unknown>, lessonState: LessonState) => {
    return executeToolCall(name, input, lessonState);
  },
  {
    name: 'tool-execution',
    run_type: 'tool',
  }
);
```

Add metadata for lesson context:

```typescript
// At the start of the handler, add trace metadata
const traceMetadata = {
  phase: lessonState.phase,
  stepIndex: lessonState.stepIndex,
  blockCount: lessonState.blocks.length,
  conceptsDiscovered: lessonState.conceptsDiscovered,
};
```

### Option B: Manual Logging (fallback if edge runtime blocks langsmith)

If `langsmith` doesn't work in edge runtime, use a lightweight manual approach:

```typescript
interface TraceLog {
  requestId: string;
  timestamp: string;
  phase: string;
  claudeCall: {
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    stopReason: string;
    toolCalls: Array<{ name: string; latencyMs: number }>;
  };
}

// After each Claude call:
const traceLog: TraceLog = {
  requestId: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  phase: lessonState.phase,
  claudeCall: {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs: Date.now() - startTime,
    stopReason: response.stop_reason,
    toolCalls: [],
  },
};

// Log to console (visible in Vercel logs)
console.log('[trace]', JSON.stringify(traceLog));
```

Then post-process Vercel logs into LangSmith via a separate pipeline, or use Vercel's built-in log drains.

### Integration Points in `api/chat.ts`

The changes are minimal — wrap existing calls, don't restructure:

1. **Before the loop** (line 112): Record `startTime`, create trace/span
2. **Inside `anthropic.messages.create`** (line 113): Wrap with traceable or record timing
3. **Inside `executeToolCall`** (lines 127, 143): Wrap with traceable or record timing
4. **After the loop** (line 155): Flush trace (async, non-blocking)

### Non-Blocking Flush

**Critical**: Tracing must never slow down the response. Use `waitUntil` if available in edge runtime, or fire-and-forget:

```typescript
// Vercel edge functions support ctx.waitUntil for background work
// If not available, use a non-blocking flush:
void langsmith.flush().catch(() => {});
```

### Environment Variables

Add to Vercel dashboard (Settings → Environment Variables):

| Variable | Value | Where |
|----------|-------|-------|
| `LANGSMITH_API_KEY` | From smith.langchain.com → Settings → API Keys | Vercel env vars |
| `LANGSMITH_PROJECT` | `fraction-quest` (or any name) | Vercel env vars |
| `LANGSMITH_TRACING_V2` | `true` | Vercel env vars |

Also add to `.env.local` for local dev:

```
LANGSMITH_API_KEY=ls__...
LANGSMITH_PROJECT=fraction-quest
LANGSMITH_TRACING_V2=true
```

**Do NOT commit API keys.** `.env.local` is already in `.gitignore`.

---

## Deliverables Checklist

### A. Package Installation

- [ ] `langsmith` package installed (`npm install langsmith`)
- [ ] No breaking changes to existing packages

### B. Tracing Integration

- [ ] Claude API calls traced (input messages, output, token counts, latency)
- [ ] Tool executions traced as child spans (tool name, input, output, latency)
- [ ] Lesson phase metadata attached to each trace
- [ ] Stop reason recorded (end_turn vs tool_use)
- [ ] Error cases traced (API errors, tool errors)

### C. Non-Blocking

- [ ] Tracing never blocks SSE response
- [ ] Flush is async / fire-and-forget
- [ ] If LangSmith is unreachable, request still succeeds (graceful degradation)

### D. Environment

- [ ] `LANGSMITH_API_KEY` documented as required env var
- [ ] `LANGSMITH_PROJECT` set to `fraction-quest`
- [ ] Works with `vercel dev` locally

### E. Repo Housekeeping

- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] Update `docs/DEVLOG.md` with ENG-040 entry
- [ ] Feature branch: `feature/eng-040-langsmith-observability`

---

## Files to Modify

| File | Change |
|------|--------|
| `api/chat.ts` | Add LangSmith tracing around Claude calls and tool executions |
| `package.json` | Add `langsmith` dependency |
| `docs/DEVLOG.md` | Add ENG-040 entry |

## Files You Should NOT Modify

- `api/tools.ts` — tool definitions unchanged
- `api/system-prompt.ts` — system prompt unchanged
- `src/*` — no frontend changes
- `.env.local` — developer adds their own key manually

## Files to READ for Context

| File | Why |
|------|-----|
| `api/chat.ts` | The edge function you're wrapping — understand the Claude call loop and SSE streaming |
| `api/tools.ts` | `executeToolCall` — you're wrapping this with tracing |

---

## Technical Notes

### Edge Runtime Consideration

`api/chat.ts` has `export const config = { runtime: 'edge' }`. The `langsmith` SDK should work since it uses `fetch` internally, but if it requires Node.js APIs (like `fs` or `net`), it will fail. Test immediately after installation:

```bash
vercel dev
# Send a test message
# Check Vercel terminal for import errors
```

If edge runtime doesn't work with `langsmith`, either:
1. Switch to `runtime: 'nodejs'` (Vercel serverless instead of edge — slightly higher latency but full Node.js)
2. Use Option B (manual console logging)

### Token Counting

The Anthropic SDK response includes `response.usage.input_tokens` and `response.usage.output_tokens`. Log these — they're the primary cost metric.

### Multi-Turn Tool Loops

Our edge function loops when `stop_reason === 'tool_use'`. Each iteration is a separate Claude API call. Trace each iteration as a child span so we can see the full conversation turn with all tool calls.

---

## Definition of Done for ENG-040

- [ ] Every Claude API call in `/api/chat` is traced in LangSmith
- [ ] Tool executions are traced as child spans
- [ ] Token usage (input + output) recorded per call
- [ ] Latency recorded per call
- [ ] Lesson phase metadata on each trace
- [ ] Tracing is non-blocking (never slows the response)
- [ ] Graceful degradation if LangSmith is unreachable
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## Prerequisites for the Developer

Before implementing, you need:
1. A LangSmith account at smith.langchain.com
2. An API key from LangSmith Settings → API Keys
3. Add `LANGSMITH_API_KEY` to your `.env.local` and Vercel dashboard

---

## After ENG-040

Phase 4 is complete. Move to **Phase 5: Assessment + Core Polish** starting with ENG-020 (Assessment problem pools).
