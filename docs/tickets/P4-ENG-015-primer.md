# ENG-015 Primer: Chat <-> Workspace Integration

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 4: Integration + Voice + Observability (Day 4)
**Date:** Mar 11, 2026
**Previous work:** ENG-014 (useTutorChat), ENG-039 (ChatPanel wired to LLM), ENG-009 (blocks wired to reducer), ENG-010 (ChatPanel). See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-015 creates **bidirectional integration** between the chat panel and the fraction workspace:

1. **Workspace → Chat**: When the student performs workspace actions (split, combine, compare), automatically notify Sam so he can react and guide the student.
2. **Chat → Workspace**: When Sam's response references specific fractions, highlight the matching blocks on the workspace with a pulse animation.

### Why Does This Exist?

Without this, Sam and the workspace are disconnected experiences. The student manipulates blocks but Sam doesn't know what happened. Sam talks about fractions but the student has to mentally match them to blocks. This ticket closes the loop.

### Current State (after ENG-014 + ENG-039)

| Component | Status |
|-----------|--------|
| `src/brain/useTutorChat.ts` | **Complete** (ENG-014) — `sendMessage`, SSE parsing, TUTOR_RESPONSE dispatch |
| `src/App.tsx` | **Complete** (ENG-039) — ChatPanel wired to `useTutorChat`, Sam responds to typed messages |
| `src/state/types.ts` | **Complete** — LessonState with `chatMessages`, `isLoading`, `isStreaming`; LessonAction with `TUTOR_RESPONSE`, `SET_LOADING` |
| `src/state/reducer.ts` | **Complete** — handles SPLIT_BLOCK, COMBINE_BLOCKS, COMPARE_BLOCKS, STUDENT_RESPONSE, TUTOR_RESPONSE |
| `src/components/Workspace/FractionBlock.tsx` | **Complete** (ENG-005) — renders fraction blocks, supports drag, `animateIn` prop |
| `src/components/Workspace/Workspace.tsx` | **Complete** (ENG-006) — renders workspace with blocks, comparison zone |

---

## What Was Already Done

- ENG-014: `useTutorChat` hook — `sendMessage(text)` posts to `/api/chat`, parses SSE, dispatches TUTOR_RESPONSE
- ENG-039: App.tsx uses `useTutorChat` so ChatPanel talks to Sam
- ENG-009: Workspace actions (split, combine, compare) dispatch to reducer and update blocks
- The workspace and chat currently work independently — student can manipulate blocks OR chat with Sam, but the two don't communicate

---

## ENG-015 Contract

### Part A: Workspace → Chat (Auto-narrate workspace actions)

When the student performs a workspace action, auto-send a context message to Sam describing what happened. This lets Sam react to the student's exploration.

#### Implementation

Add a new function `sendWorkspaceAction` to `useTutorChat` (or create a thin wrapper in App.tsx). After dispatching a workspace action to the reducer, also send a descriptive message to Sam:

```typescript
// In App.tsx — after successful workspace actions:

// Split
const handleSplitRequest = (parts: number) => {
  // ... existing split logic ...
  dispatch({ type: 'SPLIT_BLOCK', blockId: selectedBlockId, parts });
  // NEW: notify Sam
  sendMessage(`[I split the ${block.fraction.numerator}/${block.fraction.denominator} crystal into ${parts} pieces]`);
};

// Combine
const handleCombineAttempt = (draggedId: string, targetId: string | null) => {
  // ... existing combine logic ...
  if (dragged.fraction.denominator === target.fraction.denominator) {
    dispatch({ type: 'COMBINE_BLOCKS', blockIds: [draggedId, targetId] });
    // NEW: notify Sam
    sendMessage(`[I combined ${dragged.fraction.numerator}/${dragged.fraction.denominator} and ${target.fraction.numerator}/${target.fraction.denominator}]`);
  }
};

// Compare (drop on comparison zone)
const handleDropOnComparisonZone = (draggedId: string) => {
  // ... existing logic ...
  dispatch({ type: 'COMPARE_BLOCKS', blockIds: [draggedId, draggedId] });
  // NEW: notify Sam
  const block = state.blocks.find(b => b.id === draggedId);
  if (block) {
    sendMessage(`[I placed ${block.fraction.numerator}/${block.fraction.denominator} on the spell altar]`);
  }
};
```

#### Message Format Convention

Workspace action messages use **square brackets** `[...]` to distinguish them from typed student messages. This helps Sam understand these are actions, not typed text. Add a note to the system prompt (in `api/system-prompt.ts`) or handle in `buildMessageHistory`:

```
Messages in [square brackets] are workspace actions the student performed, not typed text.
React to them naturally: "Nice split!" or "I see you combined those crystals!"
```

#### Alternative: Silent Context (preferred approach)

Instead of showing workspace actions as visible chat messages, send them as **system context** alongside the next API call. This avoids cluttering the chat with auto-generated messages.

Add a `pendingContext` accumulator:

```typescript
// In useTutorChat or App.tsx
const pendingContextRef = useRef<string[]>([]);

function addWorkspaceContext(description: string) {
  pendingContextRef.current.push(description);
}

// When sending the next message (or auto-sending after workspace action):
function sendMessage(text: string) {
  const context = pendingContextRef.current.join('; ');
  pendingContextRef.current = [];
  const fullMessage = context
    ? `[Workspace: ${context}] ${text}`
    : text;
  // ... POST to /api/chat with fullMessage ...
}
```

**Recommended approach**: Use auto-send. After a workspace action, wait 500ms (debounce), then auto-send the context to Sam. Sam will respond with guidance based on what the student did. This creates the feeling of Sam watching and reacting.

```typescript
const autoSendTimerRef = useRef<ReturnType<typeof setTimeout>>();

function notifySam(description: string) {
  pendingContextRef.current.push(description);
  clearTimeout(autoSendTimerRef.current);
  autoSendTimerRef.current = setTimeout(() => {
    const context = pendingContextRef.current.join('. ');
    pendingContextRef.current = [];
    sendMessage(`[${context}]`);
  }, 500);
}
```

### Part B: Chat → Workspace (Highlight referenced blocks)

When Sam's response mentions specific fractions, highlight matching blocks on the workspace.

#### Implementation

**Step 1**: Add `highlightedBlockIds` state to App.tsx (local state, not in reducer — this is transient UI state):

```typescript
const [highlightedBlockIds, setHighlightedBlockIds] = useState<string[]>([]);
```

**Step 2**: Parse tutor messages for fraction references. Create a utility function:

```typescript
// src/brain/parseFractionReferences.ts

export function parseFractionReferences(text: string): Array<{ numerator: number; denominator: number }> {
  const pattern = /(\d+)\s*\/\s*(\d+)/g;
  const fractions: Array<{ numerator: number; denominator: number }> = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const numerator = parseInt(match[1], 10);
    const denominator = parseInt(match[2], 10);
    if (numerator > 0 && denominator > 0 && denominator <= 12) {
      fractions.push({ numerator, denominator });
    }
  }
  return fractions;
}
```

**Step 3**: When a TUTOR_RESPONSE with `isStreaming: false` arrives, find matching blocks:

```typescript
// In App.tsx — useEffect watching chatMessages
useEffect(() => {
  const lastMsg = state.chatMessages[state.chatMessages.length - 1];
  if (!lastMsg || lastMsg.sender !== 'tutor') return;

  const refs = parseFractionReferences(lastMsg.content);
  if (refs.length === 0) return;

  const matchingIds = state.blocks
    .filter(b => refs.some(r =>
      r.numerator === b.fraction.numerator && r.denominator === b.fraction.denominator
    ))
    .map(b => b.id);

  if (matchingIds.length > 0) {
    setHighlightedBlockIds(matchingIds);
    setTimeout(() => setHighlightedBlockIds([]), 1500);
  }
}, [state.chatMessages, state.isStreaming]);
```

**Step 4**: Pass `highlightedBlockIds` to Workspace and FractionBlock. Add a highlight prop:

```typescript
// Workspace.tsx — add prop
highlightedBlockIds?: string[];

// Pass to FractionBlock
<FractionBlockComponent
  ...
  isHighlighted={highlightedBlockIds?.includes(block.id) ?? false}
/>
```

**Step 5**: FractionBlock renders a pulse animation when `isHighlighted`:

```typescript
// FractionBlock.tsx — add prop
isHighlighted?: boolean;

// In the component, when isHighlighted changes to true:
useEffect(() => {
  if (!isHighlighted || !rootRef.current) return;
  rootRef.current.animate(
    [
      { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
      { boxShadow: '0 0 0 12px rgba(255, 215, 0, 0)' },
    ],
    { duration: 600, iterations: 2, easing: 'ease-out' }
  );
}, [isHighlighted]);
```

---

## Deliverables Checklist

### A. Workspace → Chat

- [ ] Workspace actions (split, combine, compare) auto-notify Sam
- [ ] 500ms debounce groups rapid actions into one message
- [ ] Workspace action messages use `[brackets]` convention
- [ ] Sam responds naturally to workspace actions
- [ ] Auto-sent messages don't appear as student chat bubbles (or appear with distinct styling)

### B. Chat → Workspace

- [ ] `src/brain/parseFractionReferences.ts` — utility to extract fraction mentions from text
- [ ] Tutor messages parsed for fraction references on completion (isStreaming: false)
- [ ] Matching blocks highlighted with a gold pulse animation (600ms, 2 iterations)
- [ ] Highlights auto-clear after 1500ms
- [ ] `FractionBlock` accepts `isHighlighted` prop
- [ ] `Workspace` accepts and passes `highlightedBlockIds` prop

### C. System Prompt Update

- [ ] Add a line to `IDENTITY` or `TOOL_USAGE_GUIDANCE` in `api/system-prompt.ts`:
  `"Messages in [square brackets] describe workspace actions the student performed. React to them naturally."`

### D. Repo Housekeeping

- [ ] `npx tsc -b` passes with zero errors
- [ ] `npm run lint` passes
- [ ] Update `docs/DEVLOG.md` with ENG-015 entry
- [ ] Feature branch: `feature/eng-015-chat-workspace-integration`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/brain/parseFractionReferences.ts` | Extract fraction patterns from tutor text |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `notifySam()` calls after workspace actions; add `highlightedBlockIds` state + useEffect; pass to Workspace |
| `src/components/Workspace/Workspace.tsx` | Add `highlightedBlockIds` prop; pass `isHighlighted` to each FractionBlock |
| `src/components/Workspace/FractionBlock.tsx` | Add `isHighlighted` prop; render pulse animation via Web Animations API |
| `api/system-prompt.ts` | Add bracket-message guidance to system prompt |
| `src/brain/useTutorChat.ts` | Add `pendingContextRef` + `notifySam()` method OR expose it for App.tsx to compose |
| `docs/DEVLOG.md` | Add ENG-015 entry |

## Files You Should NOT Modify

- `api/chat.ts` — edge function is complete
- `api/tools.ts` — tool definitions are complete
- `src/engine/*` — no engine changes
- `src/state/reducer.ts` — no new action types needed (workspace actions already exist)

## Files to READ for Context

| File | Why |
|------|-----|
| `src/App.tsx` | Current wiring — how workspace actions dispatch, how ChatPanel is connected |
| `src/brain/useTutorChat.ts` | Hook API — `sendMessage`, `isLoading` return shape |
| `src/components/Workspace/FractionBlock.tsx` | Existing animation pattern (`animateIn`, Web Animations API) |
| `src/components/Workspace/Workspace.tsx` | Props interface, block rendering loop |
| `src/state/types.ts` | LessonState, FractionBlock, ChatMessage shapes |
| `api/system-prompt.ts` | Where to add bracket-message guidance |

---

## Technical Notes

### Debounce Timing

500ms debounce balances responsiveness with grouping. If a student splits then immediately splits again, Sam gets one message: `[Student split 1/2 into 2 pieces. Student split 1/4 into 2 pieces.]` instead of two rapid-fire calls.

### Avoiding Feedback Loops

When Sam responds to a workspace action, his response might contain fractions that trigger highlights. That's fine — it's a one-way reaction. But **do not** let highlights trigger another message to Sam. The flow is always:

```
Student action → notifySam() → Sam responds → highlights (terminal, no further dispatch)
```

### Animation Conflicts

FractionBlock already uses Web Animations API for `animateIn` (split/combine). The highlight pulse uses `boxShadow` which doesn't conflict with the `transform`/`opacity` used by `animateIn`. Both can run concurrently.

### Don't Block on Streaming

`notifySam()` should check `isStreamingRef` / `isLoading` before sending. If Sam is already responding, queue the context in `pendingContextRef` and send it with the next interaction.

---

## Definition of Done for ENG-015

- [ ] Splitting a block auto-sends context to Sam; Sam responds acknowledging the action
- [ ] Combining blocks auto-sends context to Sam
- [ ] Dropping on comparison zone auto-sends context to Sam
- [ ] 500ms debounce prevents rapid-fire API calls
- [ ] Sam's fraction references (e.g., "look at the 1/2") trigger a gold pulse on matching workspace blocks
- [ ] Highlights auto-clear after 1.5 seconds
- [ ] No feedback loops (highlights don't trigger new messages)
- [ ] System prompt updated with bracket-message convention
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## Dependencies

- **ENG-014** (useTutorChat) — must be complete
- **ENG-039** (Wire ChatPanel to LLM) — must be complete (App.tsx uses useTutorChat)
- Both are listed as complete before this ticket begins

## After ENG-015

- **ENG-016** (Exploration Observer) depends on this — uses the workspace→chat bridge to detect discovery goals and trigger nudges/transitions.
