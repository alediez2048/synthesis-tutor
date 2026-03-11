# LLM-004 Primer: useTutorChat Hook

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Date:** Mar 10, 2026
**Previous work:** LLM-001 (Edge Function), ENG-004 (Reducer/Types) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

LLM-004 creates the **`useTutorChat` React hook** in `src/brain/useTutorChat.ts`. This hook is the frontend's interface to the Claude-powered tutor. It sends student messages to the `/api/chat` edge function, parses the SSE stream, dispatches actions to the lesson reducer, and manages conversation history. This is the glue between the React UI and the AI backend.

### Why Does This Exist?

The UI components need a clean, simple API to interact with Sam:
1. Student types a message → `sendMessage("2/4")`
2. The hook handles everything: dispatching actions, calling the API, parsing the stream, updating state
3. Components only need `sendMessage` and `isLoading` — all complexity is encapsulated in the hook

### Current State

| Component | Status |
|-----------|--------|
| `src/brain/` directory | **Exists** — currently empty |
| `src/brain/useTutorChat.ts` | **Does not exist** — create here |
| `api/chat.ts` | **Complete** (LLM-001) — SSE streaming endpoint |
| `src/state/types.ts` | **Complete** (ENG-004) — LessonState, LessonAction |
| `src/state/reducer.ts` | **Complete** (ENG-004) — handles STUDENT_RESPONSE |
| LLM-005 additions | **Required** — TUTOR_RESPONSE, SET_LOADING actions must exist in reducer |

---

## What Was Already Done

- LLM-001: Edge function at `/api/chat` that streams SSE events (text_delta, tool_use, tool_result, done)
- ENG-004: LessonState with chatHistory, LessonAction with STUDENT_RESPONSE, reducer with full lesson logic
- LLM-005: (dependency) Adds TUTOR_RESPONSE and SET_LOADING actions to the reducer

---

## LLM-004 Contract

### Hook Signature

```typescript
export function useTutorChat(
  state: LessonState,
  dispatch: React.Dispatch<LessonAction>
): {
  sendMessage: (text: string) => void;
  isLoading: boolean;
}
```

### `sendMessage` Flow

When `sendMessage(text)` is called:

1. **Dispatch `STUDENT_RESPONSE`** — synchronously adds the student's message to chat history
   ```typescript
   dispatch({ type: 'STUDENT_RESPONSE', input: text });
   ```

2. **Dispatch `SET_LOADING` true** — shows loading indicator in UI
   ```typescript
   dispatch({ type: 'SET_LOADING', loading: true });
   ```

3. **POST to `/api/chat`** — send conversation history + current lesson state
   ```typescript
   const response = await fetch('/api/chat', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       messages: buildMessageHistory(state.chatHistory, text),
       lessonState: state,
     }),
   });
   ```

4. **Parse SSE stream** — read the response body as a stream and process events

5. **Handle each event type:**

   | Event | Action |
   |-------|--------|
   | `text_delta` | Dispatch `TUTOR_RESPONSE` with `isStreaming: true`, append content to current message |
   | `tool_use` | If tool triggers a workspace change (split, combine), dispatch the corresponding workspace action |
   | `tool_result` | Log for debugging; no dispatch needed |
   | `done` | Dispatch `TUTOR_RESPONSE` with `isStreaming: false`; dispatch `SET_LOADING` false |

6. **On error** — Sam says a friendly error message
   ```typescript
   dispatch({
     type: 'TUTOR_RESPONSE',
     content: "Hmm, something went wrong. Let me try again.",
     isStreaming: false,
   });
   dispatch({ type: 'SET_LOADING', loading: false });
   ```

### SSE Parsing

Use `fetch` with `ReadableStream` to parse SSE events (not the `EventSource` API, which doesn't support POST):

```typescript
const reader = response.body!.getReader();
const decoder = new TextDecoder();
let buffer = '';
let accumulatedContent = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('event: ')) {
      currentEvent = line.slice(7).trim();
    } else if (line.startsWith('data: ') && currentEvent) {
      const data = JSON.parse(line.slice(6));
      handleEvent(currentEvent, data);
      currentEvent = null;
    }
  }
}
```

### Message History Management

Build the messages array for Claude from `state.chatHistory`:

```typescript
function buildMessageHistory(
  chatHistory: ChatMessage[],
  newMessage: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages = chatHistory.map(msg => ({
    role: msg.sender === 'student' ? 'user' as const : 'assistant' as const,
    content: msg.text,
  }));
  messages.push({ role: 'user', content: newMessage });
  return messages;
}
```

Keep conversation history manageable:
- If history exceeds ~20 messages, include only the most recent 20 to stay within Claude's context window budget (system prompt + tools + history must fit)
- Always include the most recent student message

### Streaming Text Accumulation

When `text_delta` events arrive, accumulate the text and dispatch updates:

```typescript
case 'text_delta':
  accumulatedContent += data.content;
  dispatch({
    type: 'TUTOR_RESPONSE',
    content: accumulatedContent,
    isStreaming: true,
  });
  break;
```

This means the reducer will update the last tutor message in-place as text streams in. On `done`, dispatch the final message with `isStreaming: false`.

### Tool-Triggered Workspace Actions

Some tools, when called by Claude, should trigger workspace changes in the UI:

```typescript
case 'tool_use':
  if (data.name === 'split_fraction') {
    // Dispatch workspace action to split the block visually
    // The specific action depends on the workspace action types from ENG-004
  } else if (data.name === 'combine_fractions') {
    // Dispatch workspace action to combine blocks visually
  }
  // Other tools (check_answer, etc.) don't trigger workspace changes
  break;
```

Note: the exact workspace action types depend on what ENG-004 defined. Check `src/state/types.ts` for the available action types.

### Preventing Concurrent Requests

Don't send a new message while one is still streaming:

```typescript
const [isLoading, setIsLoadingLocal] = useState(false);

const sendMessage = useCallback((text: string) => {
  if (isLoading) return; // Ignore if already streaming
  // ... proceed with sending
}, [isLoading, state]);
```

The `isLoading` return value comes from `state.isLoading` (set by the reducer via SET_LOADING). The local guard prevents double-sends.

---

## Deliverables Checklist

### A. Hook Implementation

- [ ] `useTutorChat` hook exported from `src/brain/useTutorChat.ts`
- [ ] Accepts `(state: LessonState, dispatch: React.Dispatch<LessonAction>)`
- [ ] Returns `{ sendMessage, isLoading }`

### B. Message Flow

- [ ] `sendMessage` dispatches `STUDENT_RESPONSE` synchronously
- [ ] `sendMessage` dispatches `SET_LOADING` true
- [ ] POST to `/api/chat` with messages + lessonState
- [ ] SSE stream parsed correctly using ReadableStream
- [ ] `text_delta` dispatches `TUTOR_RESPONSE` with `isStreaming: true`
- [ ] `done` dispatches `TUTOR_RESPONSE` with `isStreaming: false` and `SET_LOADING` false

### C. Tool Handling

- [ ] `tool_use` events for split/combine dispatch corresponding workspace actions
- [ ] Other tool events logged but don't trigger dispatches

### D. Error Handling

- [ ] Network errors caught and dispatched as a friendly Sam message
- [ ] Loading state cleared on error
- [ ] Concurrent requests prevented (ignore sendMessage while loading)

### E. Message History

- [ ] Conversation history built from `state.chatHistory`
- [ ] History capped at ~20 messages to manage context window
- [ ] New student message always included

### F. Repo Housekeeping

- [ ] Update `docs/DEVLOG.md` with LLM-004 entry when complete
- [ ] Feature branch: `feature/llm-004-use-tutor-chat`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/llm-004-use-tutor-chat
# ... implement ...
git add src/brain/useTutorChat.ts
git commit -m "feat: implement useTutorChat hook for Claude streaming (LLM-004)"
git push -u origin feature/llm-004-use-tutor-chat
```

Use Conventional Commits: `feat:`.

---

## Technical Specification

### Full Hook Skeleton

```typescript
// src/brain/useTutorChat.ts

import { useCallback, useRef } from 'react';
import type { LessonState, LessonAction } from '../state/types';

const MAX_HISTORY_MESSAGES = 20;

function buildMessageHistory(
  chatHistory: Array<{ sender: string; text: string }>,
  newMessage: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages = chatHistory
    .slice(-MAX_HISTORY_MESSAGES)
    .map(msg => ({
      role: (msg.sender === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.text,
    }));
  messages.push({ role: 'user', content: newMessage });
  return messages;
}

export function useTutorChat(
  state: LessonState,
  dispatch: React.Dispatch<LessonAction>
): { sendMessage: (text: string) => void; isLoading: boolean } {
  const isStreamingRef = useRef(false);

  const sendMessage = useCallback(async (text: string) => {
    if (isStreamingRef.current || state.isLoading) return;
    isStreamingRef.current = true;

    // 1. Dispatch student message
    dispatch({ type: 'STUDENT_RESPONSE', input: text });

    // 2. Set loading
    dispatch({ type: 'SET_LOADING', loading: true });

    try {
      // 3. POST to edge function
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildMessageHistory(state.chatHistory, text),
          lessonState: state,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      // 4. Parse SSE stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent: string | null = null;
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ') && currentEvent) {
            const data = JSON.parse(line.slice(6));

            switch (currentEvent) {
              case 'text_delta':
                accumulatedContent += data.content;
                dispatch({
                  type: 'TUTOR_RESPONSE',
                  content: accumulatedContent,
                  isStreaming: true,
                });
                break;

              case 'tool_use':
                // Handle workspace-affecting tools
                break;

              case 'done':
                dispatch({
                  type: 'TUTOR_RESPONSE',
                  content: accumulatedContent,
                  isStreaming: false,
                });
                dispatch({ type: 'SET_LOADING', loading: false });
                break;
            }
            currentEvent = null;
          }
        }
      }
    } catch (error) {
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: "Hmm, something went wrong. Let me try again.",
        isStreaming: false,
      });
      dispatch({ type: 'SET_LOADING', loading: false });
    } finally {
      isStreamingRef.current = false;
    }
  }, [state, dispatch]);

  return {
    sendMessage,
    isLoading: state.isLoading,
  };
}
```

### Dependency on LLM-005

This hook dispatches `TUTOR_RESPONSE` and `SET_LOADING` actions, which are added to the reducer by LLM-005. If implementing LLM-004 before LLM-005, you can:
1. Implement LLM-005 first (it's a ~1 hour ticket)
2. Or stub the action types and implement the hook, knowing the reducer will handle them after LLM-005

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `src/brain/useTutorChat.ts` | React hook for Claude streaming integration |

### Files to Modify

| File | Action |
|------|--------|
| `docs/DEVLOG.md` | Add LLM-004 entry when complete |

### Files You Should NOT Modify

- `api/*` — edge function and tools are separate tickets; do not modify
- `src/engine/*` — no engine changes
- `src/state/types.ts` — types are modified by LLM-005, not this ticket
- `src/state/reducer.ts` — reducer is modified by LLM-005, not this ticket
- `src/components/*` — UI integration happens in a later ticket

### Files to READ for Context

| File | Why |
|------|-----|
| `src/state/types.ts` | `LessonState`, `LessonAction`, `ChatMessage` shapes — essential for building message history and dispatching |
| `src/state/reducer.ts` | How STUDENT_RESPONSE is handled; understand existing action flow |
| `api/chat.ts` | SSE event format — must match parsing logic in this hook |
| `docs/prd.md` Section 5 | LLM integration architecture |

---

## Definition of Done for LLM-004

- [ ] `src/brain/useTutorChat.ts` exists and exports `useTutorChat`
- [ ] Hook accepts `(state, dispatch)` and returns `{ sendMessage, isLoading }`
- [ ] `sendMessage` dispatches STUDENT_RESPONSE, SET_LOADING, POSTs to /api/chat
- [ ] SSE stream parsed correctly — text_delta, tool_use, done handled
- [ ] Streaming text accumulated and dispatched as TUTOR_RESPONSE with isStreaming flag
- [ ] Errors produce a friendly Sam message, not a crash
- [ ] Concurrent requests prevented
- [ ] Message history capped at ~20 messages
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## After LLM-004

- **UI integration** — a component (likely ChatPanel or similar) will use `useTutorChat` to connect the text input to Sam.
- **LLM-005** (Reducer Additions) — must be complete for this hook's dispatches to work. Can be implemented in parallel or before this ticket.
- **Testing** — end-to-end testing with `vercel dev` to verify the full flow: student types → hook sends → edge function streams → hook dispatches → UI updates.
