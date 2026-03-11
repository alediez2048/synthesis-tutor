# ENG-004 Primer: LessonState Types + Reducer Skeleton

**For:** New Cursor Agent session  
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Date:** Mar 10, 2026  
**Previous work:** ENG-001 (scaffold), ENG-002 (Fraction Engine), ENG-003 (property-based tests) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-004 defines the **shared TypeScript contract** in `src/state/types.ts` and implements the **lesson state reducer** in `src/state/reducer.ts`. This is the single source of truth between the Fraction Engine and the UI. All phase transitions and block operations flow through the reducer. After this ticket, `types.ts` is frozen — changes require explicit justification and coordination.

### Why Does This Exist?

The PRD and architecture require:

1. **LessonState** — one place that holds phase, blocks, score, chat messages, and UI guards (e.g. `isDragging`). All UI is derived from this state; no component owns duplicate state.
2. **LessonAction** — every user or system event is a typed action. The reducer is the only place that mutates lesson state.
3. **Phase machine** — intro → explore → guided → assess → complete. Phase transitions are verifiable in tests and in a console demo.
4. **Engine integration** — the reducer calls `FractionEngine` (split, combine, isValidFraction) to validate and compute new state. Invalid operations (e.g. denominator > 12 after split) are rejected; the UI will show a Sam message instead of applying bad state.

### Current State

| Component | Status |
|-----------|--------|
| `src/state/` | **Exists** — scaffold from ENG-001 (e.g. `.gitkeep`) |
| `src/state/types.ts` | **Does not exist** — create with all shared interfaces |
| `src/state/reducer.ts` | **Does not exist** — implement reducer |
| `src/engine/FractionEngine.ts` | **Complete** (ENG-002) — reducer will import split, combine, isValidFraction |
| Fraction type | **Defined in engine** — re-export from `types.ts` or import from engine (see Contract) |

---

## What Was Already Done

- ENG-001: Project scaffold with `src/state/` directory
- ENG-002: FractionEngine with `Fraction` and all 7 functions; engine does not enforce denominator cap (reducer does)
- ENG-003: Property-based tests; engine is fully tested
- PRD Section 4.3: Data models (Fraction, FractionBlock, LessonState, LessonAction) and Phase
- DEVLOG ENG-004 section: acceptance criteria and file list

---

## ENG-004 Contract

### Types in `src/state/types.ts`

- **Fraction** — Either re-export from `../engine/FractionEngine` or define locally. Recommendation: re-export so a single source of truth lives in the engine; `types.ts` re-exports for app-wide use.
- **Phase** — `'intro' | 'explore' | 'guided' | 'assess' | 'complete'`
- **FractionBlock** — Per PRD 4.3:
  - `id: string`
  - `fraction: Fraction`
  - `color: string` (by denominator family)
  - `position: 'workspace' | 'comparison'`
  - `isSelected: boolean`
- **ChatMessage** — At minimum: `id: string`, `sender: 'tutor' | 'student'`, `content: string`. Add `timestamp?: number` if needed for ordering.
- **LessonState** — Per PRD 4.3 and DEVLOG:
  - `phase: Phase`
  - `stepIndex: number`
  - `blocks: FractionBlock[]`
  - `score: { correct: number; total: number }`
  - `hintCount: number`
  - `chatMessages: ChatMessage[]`
  - `assessmentPool: AssessmentProblem[]` (can be empty array for now; used in assess phase later)
  - `conceptsDiscovered: string[]` (use array, not `Set` — must serialize to JSON for ENG-025 checkpoint layer)
  - `isDragging: boolean` (single-touch guard)
  - `nextBlockId: number` (monotonic counter for deterministic block ID generation — see below)
- **AssessmentProblem** — Minimal for now: e.g. `{ id: string; target: Fraction }` or similar so `LessonState.assessmentPool` is typed. Full structure can expand in ENG-020.
- **LessonAction** — Union of all action variants (see below). **All** must be handled in the reducer (no fall-through that leaves state unchanged unless that is intentional).

### LessonAction Variants (all required in reducer)

| Action | Payload | Purpose |
|--------|--------|---------|
| `SPLIT_BLOCK` | `blockId: string; parts: number` | Split one block into N equal pieces via engine; reject if result denominator > 12 |
| `COMBINE_BLOCKS` | `blockIds: [string, string]` | Combine two same-denominator blocks; reject if different denominators or invalid |
| `COMPARE_BLOCKS` | `blockIds: [string, string]` | Move two blocks to comparison zone (or mark for comparison) |
| `STUDENT_RESPONSE` | `value: string` | Student submitted raw answer string (e.g. `"2/4"`); reducer calls `parseStudentInput` internally to convert to `Fraction \| null` |
| `ADVANCE_SCRIPT` | — | Advance script step (e.g. after tutor message read) |
| `REQUEST_HINT` | — | Student asked for hint; increment hintCount, script may branch |
| `RESET_WORKSPACE` | — | Clear or reset blocks (e.g. exploration nudge "start fresh") |
| `PHASE_TRANSITION` | `to: Phase` | Transition to next phase; valid order: intro → explore → guided → assess → complete |
| `SELECT_BLOCK` | `blockId: string` | Set one block as selected; deselect others |
| `DESELECT_ALL` | — | Clear selection |
| `DRAG_START` | `blockId: string` | Set isDragging true (single-touch guard) |
| `DRAG_END` | — | Set isDragging false |

### Reducer Behavior

- **Pure function:** `(state: LessonState, action: LessonAction) => LessonState`. No side effects inside reducer (checkpoint/serialization is a separate layer, ENG-025).
- **Impossible states:** Reject actions that would violate invariants. Examples:
  - **Split** that would produce any fraction with denominator > 12 → return state unchanged (or a dedicated "rejection" pattern if you add it; otherwise same state + caller can show message).
  - **Combine** with blockIds that don’t exist or have different denominators → return state unchanged.
  - Invalid phase transition (e.g. intro → complete) → return state unchanged or only allow valid next phases.
- **Phase transitions:** Implement valid sequence: intro → explore → guided → assess → complete. Transitions are driven by PHASE_TRANSITION action; logic can be extended later by TutorBrain/script.
- **Initial state:** Provide `getInitialLessonState(): LessonState` (or equivalent) with phase `'intro'`, empty blocks or one 1/2 block per PRD intro, stepIndex 0, score { correct: 0, total: 0 }, hintCount 0, empty chatMessages, empty assessmentPool, conceptsDiscovered `[]`, isDragging false, nextBlockId `1` (or however many initial blocks exist + 1).

### Block ID Generation

The reducer is a pure function — no `Math.random()`, `crypto.randomUUID()`, or `Date.now()`. Use a monotonic counter stored in state:

- `LessonState.nextBlockId: number` starts at `1` (or after initial blocks).
- When creating new blocks (SPLIT_BLOCK, COMBINE_BLOCKS, RESET_WORKSPACE), assign IDs like `block-${state.nextBlockId}`, `block-${state.nextBlockId + 1}`, etc.
- Increment `nextBlockId` by the number of blocks created.
- This keeps the reducer deterministic and testable — same state + same action always produces the same result.

### STUDENT_RESPONSE and parsing

The reducer receives the raw student string (e.g. `"2/4"`). It calls `parseStudentInput(value)` from the engine to get a `Fraction | null`. If `null`, the response is invalid — store the message in `chatMessages` but do not update score. If valid, the script/brain layer (ENG-011+) will use `areEquivalent` to check correctness. For this ticket, the reducer can store the parsed result and the raw message; scoring logic can be minimal (placeholder for script integration).

### SPLIT_BLOCK and denominator cap

- Call `FractionEngine.split(fraction, parts)`. If any resulting fraction has `denominator > 12`, **do not** apply the split; return previous state. The engine returns correct math; the reducer enforces the lesson cap (12).

### COMBINE_BLOCKS

- Find blocks by id; if not found or different denominators, return state unchanged.
- Call `FractionEngine.combine([f1, f2])`. If result is invalid per `isValidFraction`, return state unchanged. Otherwise replace the two blocks with one new block (new id, combined fraction, same denominator family color), in workspace.

### Tests in `src/state/reducer.test.ts`

- **Phase transitions:** Dispatch PHASE_TRANSITION for each allowed transition; assert phase and any side effects (e.g. blocks reset if needed).
- **Initial state:** Assert getInitialLessonState() shape and default phase.
- **SPLIT_BLOCK:** Valid split updates blocks; split that would exceed denominator 12 leaves state unchanged.
- **COMBINE_BLOCKS:** Same-denominator combine updates blocks; different-denominator or invalid ids leave state unchanged.
- **SELECT_BLOCK / DESELECT_ALL:** Selection state updated correctly.
- **DRAG_START / DRAG_END:** isDragging toggled.
- **Other actions:** At least one test per action variant so all are exercised (can be minimal: e.g. REQUEST_HINT increments hintCount, ADVANCE_SCRIPT increments stepIndex, etc.).

---

## Deliverables Checklist

### A. Types (`src/state/types.ts`)

- [ ] `Fraction` (re-export or define)
- [ ] `Phase` type
- [ ] `FractionBlock` interface
- [ ] `ChatMessage` interface
- [ ] `LessonState` interface (all fields including `nextBlockId`)
- [ ] `AssessmentProblem` interface (minimal)
- [ ] `LessonAction` union (all variants)

### B. Reducer (`src/state/reducer.ts`)

- [ ] Default export: reducer function `(state, action) => state`
- [ ] `getInitialLessonState()` (or equivalent) exported
- [ ] All 12+ action variants handled
- [ ] Phase transitions: intro → explore → guided → assess → complete
- [ ] Reject split when result denominator > 12
- [ ] Reject combine when blocks missing or denominators differ

### C. Tests (`src/state/reducer.test.ts`)

- [ ] Initial state shape and phase
- [ ] Phase transition tests
- [ ] SPLIT_BLOCK success and reject (den > 12)
- [ ] COMBINE_BLOCKS success and reject
- [ ] SELECT_BLOCK, DESELECT_ALL, DRAG_START, DRAG_END
- [ ] Coverage for remaining actions (ADVANCE_SCRIPT, REQUEST_HINT, RESET_WORKSPACE, STUDENT_RESPONSE, COMPARE_BLOCKS as needed)

### D. Repo Housekeeping

- [ ] All tests pass (`npm test`)
- [ ] TypeScript builds (`npx tsc -b`)
- [ ] Update `docs/DEVLOG.md` with ENG-004 entry when complete
- [ ] Feature branch: `feature/eng-004-lesson-state-reducer`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-004-lesson-state-reducer
# ... implement types, reducer, tests ...
git add src/state/types.ts src/state/reducer.ts src/state/reducer.test.ts docs/DEVLOG.md
git commit -m "feat: add LessonState types and reducer skeleton (ENG-004)"
git push -u origin feature/eng-004-lesson-state-reducer
```

Use Conventional Commits: `feat:` for new feature.

---

## Technical Specification

### Re-exporting Fraction

To avoid duplicating the Fraction type and keep the engine as the single source of truth:

```typescript
// src/state/types.ts
export type { Fraction } from '../engine/FractionEngine';
```

If the codebase prefers types to live only in `state/types.ts`, you can instead define a duplicate interface there and ensure the engine’s Fraction is compatible (same shape). Recommendation: re-export from engine.

### conceptsDiscovered

Use `string[]` (not `Set<string>`). `LessonState` will be serialized to sessionStorage in ENG-025, and `Set` does not survive `JSON.stringify`. Treat the array as a set in logic — use `conceptsDiscovered.includes(id)` to check membership and avoid pushing duplicates.

### Reducer signature

```typescript
export type LessonReducer = (state: LessonState, action: LessonAction) => LessonState;

export const lessonReducer: LessonReducer = (state, action) => {
  switch (action.type) {
    case 'PHASE_TRANSITION': // ...
    case 'SPLIT_BLOCK': // ...
    // ... all variants
    default:
      return state; // or exhaustiveness check
  }
};
```

### Phase order

Allowed transitions (for tests and implementation):

- intro → explore
- explore → guided
- guided → assess
- assess → complete

No other transitions required for this ticket (e.g. guided → explore can be disallowed or left for later).

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `src/state/types.ts` | All shared interfaces and re-exports |
| `src/state/reducer.ts` | Reducer + getInitialLessonState |
| `src/state/reducer.test.ts` | Unit tests for reducer and phase transitions |

### Files to Modify

| File | Action |
|------|--------|
| `docs/DEVLOG.md` | Add ENG-004 entry when complete |

### Files You Should NOT Modify

- `src/engine/FractionEngine.ts` — engine is complete; reducer only imports and calls it
- `src/engine/FractionEngine.test.ts` — no changes
- Component or app files (no UI in this ticket beyond console/test verification)

### Files to READ for Context

| File | Why |
|------|-----|
| `docs/prd.md` Section 4.3 | Data models (LessonState, LessonAction, FractionBlock) |
| `src/engine/FractionEngine.ts` | API for split, combine, isValidFraction |
| `.cursor/rules/architecture.mdc` | State as single source of truth |
| `docs/DEVLOG.md` ENG-004 section | Acceptance criteria and dependencies |

### Cursor Rules to Follow

- `architecture.mdc` — reducer as single source of truth; types.ts is the contract
- `code-patterns.mdc` — consistent naming (e.g. LessonState, LessonAction, camelCase)
- No mocking of FractionEngine in reducer tests; use real engine

---

## Definition of Done for ENG-004

- [ ] `Fraction`, `FractionBlock`, `LessonState`, `LessonAction`, `ChatMessage`, `Phase`, `AssessmentProblem` defined in `types.ts`
- [ ] Reducer handles all LessonAction variants
- [ ] Phase transitions work (intro → explore → guided → assess → complete) and are tested
- [ ] Reducer rejects impossible states (split den > 12, invalid combine)
- [ ] `getInitialLessonState()` returns valid initial state
- [ ] `npm test` and `npx tsc -b` pass
- [ ] DEVLOG updated with ENG-004 entry
- [ ] Feature branch pushed

---

## After ENG-004

- **ENG-005** (FractionBlock component) — uses `FractionBlock` from types; renders from `LessonState.blocks`.
- **ENG-006** (FractionWorkspace) — pre-seeded from state; blocks from `LessonState.blocks`.
- **ENG-009** (Wire blocks to reducer) — all block interactions dispatch LessonAction to this reducer.
- **ENG-010** (Chat panel) — uses `ChatMessage` and `LessonState.chatMessages`.
