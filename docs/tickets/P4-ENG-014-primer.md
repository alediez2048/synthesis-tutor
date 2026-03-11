# ENG-014 Primer: useTutorChat Hook

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 4: Integration + Voice + Observability (Day 4)
**Date:** Mar 11, 2026
**Previous work:** ENG-011 (Edge Function), ENG-012 (Tools), ENG-013 (System Prompt), ENG-004 (Reducer/Types) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-014 creates the **`useTutorChat` React hook** in `src/brain/useTutorChat.ts`. This hook is the frontend's interface to the Claude-powered tutor. It sends student messages to the `/api/chat` edge function, parses the SSE stream, dispatches actions to the lesson reducer, and manages conversation history. This is the glue between the React UI and the AI backend.

### Why Does This Exist?

The UI components need a clean, simple API to interact with Sam the Wizard Owl:
1. Student types a message → `sendMessage("2/4")`
2. The hook handles everything: dispatching actions, calling the API, parsing the stream, updating state
3. Components only need `sendMessage` and `isLoading` — all complexity is encapsulated in the hook

### Current State

| Component | Status |
|-----------|--------|
| `src/brain/` directory | **Exists** — contains only `.gitkeep` |
| `src/brain/useTutorChat.ts` | **Does not exist** — create here |
| `api/chat.ts` | **Complete** (ENG-011/012/013) — SSE streaming endpoint with tool use and system prompt |
| `src/state/types.ts` | **Complete** (ENG-004) — LessonState, LessonAction, ChatMessage |
| `src/state/reducer.ts` | **Complete** (ENG-004) — handles STUDENT_RESPONSE and other actions |

---

## What Was Already Done

- ENG-011: Edge function at `/api/chat` that streams SSE events (`text_delta`, `tool_use`, `tool_result`, `done`, `error`)
- ENG-012: 9 fraction tools defined and executed server-side in `api/tools.ts`
- ENG-013: System prompt in `api/system-prompt.ts` with Wizard Owl persona, math firewall, phase guidance
- ENG-004: LessonState with `chatMessages: ChatMessage[]`, LessonAction with `STUDENT_RESPONSE`, reducer with full lesson logic

---

## Reducer Actions to Add

This hook dispatches `TUTOR_RESPONSE` and `SET_LOADING` actions that **do not yet exist** in the reducer. ENG-014 must add them.

### 1. Add to `src/state/types.ts` — LessonAction union

```typescript
| { type: 'TUTOR_RESPONSE'; content: string; isStreaming: boolean }
| { type: 'SET_LOADING'; loading: boolean }
```

### 2. Add to `src/state/types.ts` — LessonState

```typescript
isLoading: boolean;    // add this field
isStreaming: boolean;   // add this field
```

### 3. Add to `src/state/reducer.ts` — new cases

```typescript
case 'SET_LOADING':
  return { ...state, isLoading: action.loading };

case 'TUTOR_RESPONSE': {
  if (action.isStreaming) {
    // Update the last tutor message in-place, or create one if none exists
    const msgs = [...state.chatMessages];
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg && lastMsg.sender === 'tutor') {
      msgs[msgs.length - 1] = { ...lastMsg, content: action.content };
    } else {
      msgs.push({
        id: `msg-tutor-${Date.now()}`,
        sender: 'tutor',
        content: action.content,
      });
    }
    return { ...state, chatMessages: msgs, isStreaming: true };
  }
  // Final message (isStreaming: false) — finalize the tutor message
  const msgs = [...state.chatMessages];
  const lastMsg = msgs[msgs.length - 1];
  if (lastMsg && lastMsg.sender === 'tutor') {
    msgs[msgs.length - 1] = { ...lastMsg, content: action.content };
  } else if (action.content) {
    msgs.push({
      id: `msg-tutor-${Date.now()}`,
      sender: 'tutor',
      content: action.content,
    });
  }
  return { ...state, chatMessages: msgs, isStreaming: false };
}
```

### 4. Update `getInitialLessonState()` in reducer.ts

Add `isLoading: false` and `isStreaming: false` to the initial state.

**IMPORTANT**: After adding these new action cases, the exhaustive `default` case (`const _exhaust: never = action`) will type-check correctly only if the new variants are in the LessonAction union.

---

## ENG-014 Contract

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

1. **Dispatch `STUDENT_RESPONSE`** — synchronously adds the student's message to chatMessages
   ```typescript
   dispatch({ type: 'STUDENT_RESPONSE', value: text });
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
       messages: buildMessageHistory(state.chatMessages, text),
       lessonState: state,
     }),
   });
   ```

4. **Parse SSE stream** — read the response body as a stream and process events

5. **Handle each event type:**

   | Event | Action |
   |-------|--------|
   | `text_delta` | Dispatch `TUTOR_RESPONSE` with `isStreaming: true`, append content to accumulated message |
   | `tool_use` | Log for debugging; no client-side dispatch (tools execute server-side in api/chat.ts) |
   | `tool_result` | Log for debugging; no dispatch needed |
   | `done` | Dispatch `TUTOR_RESPONSE` with `isStreaming: false`; dispatch `SET_LOADING` false |
   | `error` | Dispatch friendly error as TUTOR_RESPONSE; clear loading |

6. **On fetch/network error** — Sam says a friendly error message
   ```typescript
   dispatch({
     type: 'TUTOR_RESPONSE',
     content: "Hmm, my magic fizzled! Let's try that again.",
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

  let currentEvent: string | null = null;
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

Build the messages array for Claude from `state.chatMessages`:

```typescript
function buildMessageHistory(
  chatMessages: ChatMessage[],
  newMessage: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages = chatMessages
    .slice(-MAX_HISTORY_MESSAGES)
    .map(msg => ({
      role: (msg.sender === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    }));
  messages.push({ role: 'user', content: newMessage });
  return messages;
}
```

**Key field mapping**: `ChatMessage.sender` → Claude `role` (`'student'` → `'user'`, `'tutor'` → `'assistant'`). The content field is `ChatMessage.content` (NOT `.text`).

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

### Tool Events — Server-Side Only

Tool execution happens entirely server-side in `api/chat.ts`. The SSE stream sends `tool_use` and `tool_result` events for observability, but the client should **not** dispatch workspace actions from them. Reasons:
- `tool_use` events carry fraction data (`{numerator, denominator}`), not `blockId`s needed by `SPLIT_BLOCK` / `COMBINE_BLOCKS`
- The tool use loop in `api/chat.ts` already executes tools and feeds results back to Claude
- Claude's text response (which arrives as `text_delta`) is the user-facing output

Log tool events for debugging only:
```typescript
case 'tool_use':
  console.debug('[useTutorChat] tool_use:', data.name, data.input);
  break;
case 'tool_result':
  console.debug('[useTutorChat] tool_result:', data.id, data.result);
  break;
```

### Preventing Concurrent Requests

Don't send a new message while one is still streaming:

```typescript
const isStreamingRef = useRef(false);

const sendMessage = useCallback(async (text: string) => {
  if (isStreamingRef.current) return; // Ignore if already streaming
  isStreamingRef.current = true;
  // ... proceed with sending
  // In finally block: isStreamingRef.current = false;
}, [state, dispatch]);
```

The `isLoading` return value comes from `state.isLoading` (set by the reducer via SET_LOADING). The ref guard prevents double-sends even before state updates propagate.

---

## Deliverables Checklist

### A. Reducer Additions (prerequisite)

- [ ] `LessonState` has `isLoading: boolean` and `isStreaming: boolean` fields
- [ ] `LessonAction` union includes `TUTOR_RESPONSE` and `SET_LOADING` variants
- [ ] `lessonReducer` handles both new action types
- [ ] `getInitialLessonState()` includes `isLoading: false` and `isStreaming: false`
- [ ] Exhaustive switch still compiles (`npx tsc -b` passes)

### B. Hook Implementation

- [ ] `useTutorChat` hook exported from `src/brain/useTutorChat.ts`
- [ ] Accepts `(state: LessonState, dispatch: React.Dispatch<LessonAction>)`
- [ ] Returns `{ sendMessage, isLoading }`

### C. Message Flow

- [ ] `sendMessage` dispatches `STUDENT_RESPONSE` with `value:` field (not `input:`)
- [ ] `sendMessage` dispatches `SET_LOADING` true
- [ ] POST to `/api/chat` with messages + lessonState
- [ ] SSE stream parsed correctly using ReadableStream
- [ ] `text_delta` dispatches `TUTOR_RESPONSE` with `isStreaming: true`
- [ ] `done` dispatches `TUTOR_RESPONSE` with `isStreaming: false` and `SET_LOADING` false

### D. Error Handling

- [ ] Network errors caught and dispatched as a friendly Sam message
- [ ] SSE `error` events handled (dispatch error message, clear loading)
- [ ] Loading state cleared on error
- [ ] Concurrent requests prevented (ignore sendMessage while streaming)

### E. Message History

- [ ] Conversation history built from `state.chatMessages` (NOT `chatHistory`)
- [ ] Uses `ChatMessage.content` (NOT `.text`)
- [ ] Maps `sender: 'student'` → `role: 'user'`, `sender: 'tutor'` → `role: 'assistant'`
- [ ] History capped at ~20 messages
- [ ] New student message always included

### F. Repo Housekeeping

- [ ] `npx tsc -b` passes with zero errors
- [ ] `npm run lint` passes
- [ ] Update `docs/DEVLOG.md` with ENG-014 entry when complete
- [ ] Feature branch: `feature/eng-014-use-tutor-chat`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-014-use-tutor-chat
# ... implement ...
git add src/state/types.ts src/state/reducer.ts src/brain/useTutorChat.ts
git commit -m "feat: implement useTutorChat hook for Claude streaming (ENG-014)"
git push -u origin feature/eng-014-use-tutor-chat
```

Use Conventional Commits: `feat:`.

---

## Files to Create

| File | Action |
|------|--------|
| `src/brain/useTutorChat.ts` | React hook for Claude streaming integration |

## Files to Modify

| File | Change |
|------|--------|
| `src/state/types.ts` | Add `isLoading`, `isStreaming` to LessonState; add `TUTOR_RESPONSE`, `SET_LOADING` to LessonAction |
| `src/state/reducer.ts` | Add cases for `TUTOR_RESPONSE` and `SET_LOADING`; update `getInitialLessonState()` |
| `docs/DEVLOG.md` | Add ENG-014 entry when complete |

## Files You Should NOT Modify

- `api/*` — edge function, tools, and system prompt are separate completed tickets
- `src/engine/*` — no engine changes
- `src/components/*` — UI integration happens in a later ticket (ENG-039)

## Files to READ for Context

| File | Why |
|------|-----|
| `src/state/types.ts` | `LessonState`, `LessonAction`, `ChatMessage` shapes — essential for field names and types |
| `src/state/reducer.ts` | How `STUDENT_RESPONSE` is handled; exhaustive switch pattern; `getInitialLessonState()` |
| `api/chat.ts` | SSE event format — `encodeSSE(event, data)` produces `event: X\ndata: {...}\n\n` |

---

## SSE Event Reference (from api/chat.ts)

The edge function emits these SSE events via `encodeSSE(event, data)`:

| Event | Data shape | When |
|-------|-----------|------|
| `text_delta` | `{ content: string }` | Each text block from Claude's response |
| `tool_use` | `{ id: string, name: string, input: object }` | Claude calls a tool |
| `tool_result` | `{ id: string, result: object }` | Server-side tool execution result |
| `done` | `{}` | Response complete |
| `error` | `{ message: string }` | Upstream API error |

---

## Definition of Done for ENG-014

- [ ] `src/state/types.ts` updated with `isLoading`, `isStreaming`, `TUTOR_RESPONSE`, `SET_LOADING`
- [ ] `src/state/reducer.ts` handles new actions; initial state updated
- [ ] `src/brain/useTutorChat.ts` exists and exports `useTutorChat`
- [ ] Hook accepts `(state, dispatch)` and returns `{ sendMessage, isLoading }`
- [ ] `sendMessage` dispatches STUDENT_RESPONSE (with `value:`), SET_LOADING, POSTs to /api/chat
- [ ] SSE stream parsed correctly — text_delta, done, error handled; tool events logged
- [ ] Streaming text accumulated and dispatched as TUTOR_RESPONSE with isStreaming flag
- [ ] Errors produce a friendly Sam message, not a crash
- [ ] Concurrent requests prevented
- [ ] Message history built from `chatMessages` with `content` field, capped at ~20
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## After ENG-014

- **ENG-039** (Wire ChatPanel to LLM) — ChatPanel will call `useTutorChat` to connect the text input to Sam. This is the ticket that makes the chat panel actually work.
- **Testing** — end-to-end testing with `vercel dev` to verify the full flow: student types → hook sends → edge function streams → hook dispatches → UI updates.
