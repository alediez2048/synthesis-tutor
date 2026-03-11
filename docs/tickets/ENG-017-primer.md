# ENG-017 Primer: Reducer Additions

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Date:** Mar 10, 2026
**Previous work:** ENG-004 (Reducer/Types) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-017 adds two new actions to the lesson reducer: `TUTOR_RESPONSE` and `SET_LOADING`. These are the minimal state changes needed for the `useTutorChat` hook (ENG-014) to stream Claude's responses into the UI. This is a small, additive ticket — existing types, actions, and tests must continue to work unchanged.

### Why Does This Exist?

The existing reducer (ENG-004) handles student input and lesson flow, but has no concept of:
1. **Tutor streaming responses** — Sam's messages need to appear character-by-character as they stream in
2. **Loading state** — the UI needs to show a loading indicator while waiting for Claude's response

These two additions complete the reducer's support for the LLM integration layer.

### Current State

| Component | Status |
|-----------|--------|
| `src/state/types.ts` | **Complete** (ENG-004) — LessonState, LessonAction defined |
| `src/state/reducer.ts` | **Complete** (ENG-004) — handles existing actions |
| `src/state/reducer.test.ts` | **Complete** (ENG-004) — tests pass |
| `TUTOR_RESPONSE` action | **Does not exist** — add here |
| `SET_LOADING` action | **Does not exist** — add here |
| `isLoading` state field | **Does not exist** — add here |

---

## What Was Already Done

- ENG-004: LessonState type with chatHistory, phase, workspace, score, etc.
- ENG-004: LessonAction union type with STUDENT_RESPONSE, SPLIT_BLOCK, COMBINE_BLOCKS, etc.
- ENG-004: lessonReducer function handling all existing actions
- ENG-004: getInitialLessonState() returning initial state
- ENG-004: reducer.test.ts with passing tests for all existing actions

---

## ENG-017 Contract

### New Action: `TUTOR_RESPONSE`

```typescript
{
  type: 'TUTOR_RESPONSE';
  content: string;
  isStreaming: boolean;
}
```

**Reducer behavior:**

- **If `isStreaming: true`:** Update the last message in `chatHistory` in-place (if it's a tutor message that is currently streaming). If there is no current streaming tutor message, add a new tutor message to `chatHistory`.
  ```typescript
  // If last message is a streaming tutor message, update it:
  const lastMsg = state.chatHistory[state.chatHistory.length - 1];
  if (lastMsg && lastMsg.sender === 'tutor' && lastMsg.isStreaming) {
    // Replace last message with updated content
    return {
      ...state,
      chatHistory: [
        ...state.chatHistory.slice(0, -1),
        { sender: 'tutor', text: action.content, isStreaming: true },
      ],
    };
  } else {
    // Add new streaming tutor message
    return {
      ...state,
      chatHistory: [
        ...state.chatHistory,
        { sender: 'tutor', text: action.content, isStreaming: true },
      ],
    };
  }
  ```

- **If `isStreaming: false`:** Finalize the message — set `isStreaming: false` on the last tutor message, or add a new finalized message.
  ```typescript
  const lastMsg = state.chatHistory[state.chatHistory.length - 1];
  if (lastMsg && lastMsg.sender === 'tutor' && lastMsg.isStreaming) {
    return {
      ...state,
      chatHistory: [
        ...state.chatHistory.slice(0, -1),
        { sender: 'tutor', text: action.content, isStreaming: false },
      ],
    };
  } else {
    return {
      ...state,
      chatHistory: [
        ...state.chatHistory,
        { sender: 'tutor', text: action.content, isStreaming: false },
      ],
    };
  }
  ```

### New Action: `SET_LOADING`

```typescript
{
  type: 'SET_LOADING';
  loading: boolean;
}
```

**Reducer behavior:**

```typescript
return {
  ...state,
  isLoading: action.loading,
};
```

### Type Changes in `src/state/types.ts`

1. Add `isLoading: boolean` to `LessonState` interface
2. Add `isStreaming?: boolean` to the chat message type (if it exists as an interface) — this field distinguishes streaming-in-progress messages from finalized messages
3. Add both new action types to the `LessonAction` union:

```typescript
// Add to LessonAction union:
| { type: 'TUTOR_RESPONSE'; content: string; isStreaming: boolean }
| { type: 'SET_LOADING'; loading: boolean }
```

### Initial State Change

In `getInitialLessonState()`, add:

```typescript
isLoading: false,
```

### Test Requirements

Add tests in `src/state/reducer.test.ts`:

```typescript
describe('TUTOR_RESPONSE', () => {
  it('adds a new streaming tutor message', () => {
    const state = getInitialLessonState();
    const result = lessonReducer(state, {
      type: 'TUTOR_RESPONSE',
      content: 'Hello',
      isStreaming: true,
    });
    expect(result.chatHistory).toHaveLength(1);
    expect(result.chatHistory[0]).toEqual({
      sender: 'tutor',
      text: 'Hello',
      isStreaming: true,
    });
  });

  it('updates existing streaming message in-place', () => {
    const state = {
      ...getInitialLessonState(),
      chatHistory: [{ sender: 'tutor', text: 'Hel', isStreaming: true }],
    };
    const result = lessonReducer(state, {
      type: 'TUTOR_RESPONSE',
      content: 'Hello there',
      isStreaming: true,
    });
    expect(result.chatHistory).toHaveLength(1);
    expect(result.chatHistory[0].text).toBe('Hello there');
  });

  it('finalizes streaming message', () => {
    const state = {
      ...getInitialLessonState(),
      chatHistory: [{ sender: 'tutor', text: 'Hello there!', isStreaming: true }],
    };
    const result = lessonReducer(state, {
      type: 'TUTOR_RESPONSE',
      content: 'Hello there!',
      isStreaming: false,
    });
    expect(result.chatHistory).toHaveLength(1);
    expect(result.chatHistory[0].isStreaming).toBe(false);
  });
});

describe('SET_LOADING', () => {
  it('sets isLoading to true', () => {
    const state = getInitialLessonState();
    const result = lessonReducer(state, { type: 'SET_LOADING', loading: true });
    expect(result.isLoading).toBe(true);
  });

  it('sets isLoading to false', () => {
    const state = { ...getInitialLessonState(), isLoading: true };
    const result = lessonReducer(state, { type: 'SET_LOADING', loading: false });
    expect(result.isLoading).toBe(false);
  });
});
```

### Hard Constraints

- **Additive only:** Do not modify the behavior of any existing action (STUDENT_RESPONSE, SPLIT_BLOCK, etc.)
- **Existing tests must pass:** Run all existing tests after changes — zero regressions allowed
- **No breaking changes to LessonState:** `isLoading` has a default of `false`; existing code that doesn't reference it is unaffected
- **No breaking changes to LessonAction:** New union members are additive; existing action dispatches still type-check

---

## Deliverables Checklist

### A. Type Changes

- [ ] `isLoading: boolean` added to `LessonState` interface
- [ ] `isStreaming?: boolean` added to chat message type
- [ ] `TUTOR_RESPONSE` action added to `LessonAction` union
- [ ] `SET_LOADING` action added to `LessonAction` union

### B. Reducer Changes

- [ ] `TUTOR_RESPONSE` case added — handles streaming and finalized messages
- [ ] `SET_LOADING` case added — sets `isLoading` flag
- [ ] `getInitialLessonState()` includes `isLoading: false`

### C. Tests

- [ ] TUTOR_RESPONSE: adds new streaming message
- [ ] TUTOR_RESPONSE: updates existing streaming message in-place
- [ ] TUTOR_RESPONSE: finalizes streaming message
- [ ] SET_LOADING: sets true
- [ ] SET_LOADING: sets false
- [ ] All existing tests still pass (zero regressions)

### D. Repo Housekeeping

- [ ] Update `docs/DEVLOG.md` with ENG-017 entry when complete
- [ ] Feature branch: `feature/eng-017-reducer-additions`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-017-reducer-additions
# ... implement ...
git add src/state/types.ts src/state/reducer.ts src/state/reducer.test.ts
git commit -m "feat: add TUTOR_RESPONSE and SET_LOADING actions to reducer (ENG-017)"
git push -u origin feature/eng-017-reducer-additions
```

Use Conventional Commits: `feat:`.

---

## Technical Specification

### Minimal Changes Summary

This ticket touches exactly 3 files:

1. **`src/state/types.ts`** — add `isLoading` to LessonState, add `isStreaming` to chat message type, add 2 actions to LessonAction union
2. **`src/state/reducer.ts`** — add 2 cases to the switch statement, add `isLoading: false` to initial state
3. **`src/state/reducer.test.ts`** — add ~5 new test cases

Total estimated effort: ~1 hour.

### Chat Message Type

Check the existing chat message type in `src/state/types.ts`. It likely looks something like:

```typescript
interface ChatMessage {
  sender: 'student' | 'tutor';
  text: string;
}
```

Add `isStreaming` as an optional boolean:

```typescript
interface ChatMessage {
  sender: 'student' | 'tutor';
  text: string;
  isStreaming?: boolean;
}
```

Using `?` (optional) means existing code that creates ChatMessage objects without `isStreaming` still compiles.

---

## Important Context

### Files to Create

None — this ticket only modifies existing files.

### Files to Modify

| File | Action |
|------|--------|
| `src/state/types.ts` | Add `isLoading` to LessonState, `isStreaming` to ChatMessage, 2 new actions to LessonAction |
| `src/state/reducer.ts` | Add TUTOR_RESPONSE and SET_LOADING cases, add isLoading to initial state |
| `src/state/reducer.test.ts` | Add ~5 new tests for the new actions |
| `docs/DEVLOG.md` | Add ENG-017 entry when complete |

### Files You Should NOT Modify

- `src/engine/*` — no engine changes
- `api/*` — no API changes
- `src/components/*` — no UI changes
- `src/brain/*` — the hook (ENG-014) is a separate ticket

### Files to READ for Context

| File | Why |
|------|-----|
| `src/state/types.ts` | Current LessonState and LessonAction shapes — you're extending these |
| `src/state/reducer.ts` | Current reducer — you're adding cases to the switch |
| `src/state/reducer.test.ts` | Current test patterns — follow the same style for new tests |

---

## Definition of Done for ENG-017

- [ ] `isLoading: boolean` added to LessonState
- [ ] `isStreaming?: boolean` added to ChatMessage type
- [ ] `TUTOR_RESPONSE` and `SET_LOADING` added to LessonAction union
- [ ] Reducer handles both new actions correctly
- [ ] `getInitialLessonState()` returns `isLoading: false`
- [ ] 5+ new tests added and passing
- [ ] All existing tests still pass — zero regressions
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## After ENG-017

- **ENG-014** (useTutorChat Hook) — depends on these reducer additions to dispatch TUTOR_RESPONSE and SET_LOADING.
- **UI work** — components will read `state.isLoading` to show/hide loading indicators, and render streaming messages with a typing cursor.
