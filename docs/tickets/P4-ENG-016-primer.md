# ENG-016 Primer: Exploration Observer (Simplified)

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 4: Integration + Voice + Observability (Day 4)
**Date:** Mar 11, 2026
**Previous work:** ENG-015 (chat ↔ workspace integration), ENG-014 (useTutorChat), ENG-009 (blocks wired to reducer). See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-016 creates the **ExplorationObserver** — a module that watches the student's workspace actions during the `explore` phase and:

1. **Tracks 3 discovery goals**: splitting, combining, and equivalence discovery
2. **Fires nudge messages** through Sam when the student is stuck, repetitive, or overwhelmed
3. **Triggers phase transition** to Guided Practice when all goals are met or 3 minutes elapse

### Why Does This Exist?

The explore phase is free-form — the student can split, combine, and compare blocks at will. Without the observer, there's no guidance or progression. The observer is the invisible hand that nudges the student toward key discoveries and knows when it's time to move on.

### Current State (after ENG-015)

| Component | Status |
|-----------|--------|
| `src/brain/useTutorChat.ts` | **Complete** (ENG-014) — `sendMessage` to talk to Sam |
| ENG-015 integration | **Complete** — workspace actions auto-notify Sam; Sam's fraction references highlight blocks |
| `src/state/types.ts` | **Complete** — LessonState with `phase`, `conceptsDiscovered: string[]`, `blocks`, `chatMessages` |
| `src/state/reducer.ts` | **Complete** — handles SPLIT_BLOCK, COMBINE_BLOCKS, COMPARE_BLOCKS, PHASE_TRANSITION |
| `src/observers/` directory | **Does not exist** — create it |
| `src/content/` directory | **Does not exist** — create it |

---

## What Was Already Done

- ENG-015: Workspace actions auto-send context to Sam (e.g., `[I split 1/2 into 2 pieces]`)
- ENG-014: `useTutorChat` hook — `sendMessage(text)` sends to Claude and streams response
- ENG-009: Workspace actions dispatch to reducer, blocks update
- Reducer already has `conceptsDiscovered: string[]` in LessonState and `PHASE_TRANSITION` action
- System prompt already has explore phase guidance telling Sam to encourage free exploration

---

## ENG-016 Contract

### The 3 Discovery Goals

| Goal ID | Goal | Detection | Sam's Response (via system prompt) |
|---------|------|-----------|-----------------------------------|
| `splitting` | Splitting produces smaller equal pieces | Student dispatches `SPLIT_BLOCK` successfully | Sam reacts via ENG-015 bridge: "Look at that — each piece got smaller!" |
| `combining` | Combining produces larger pieces | Student dispatches `COMBINE_BLOCKS` successfully | Sam reacts: "Nice! You snapped those pieces back together!" |
| `equivalence` | Different fractions can be same size | Two blocks with different denominators but equivalent value are both in comparison zone | Sam reacts: "Wait — did you see that?! They're the SAME SIZE!" |

#### How Goals Are Tracked

Add a new action to the reducer:

```typescript
| { type: 'DISCOVER_CONCEPT'; concept: string }
```

The observer dispatches `DISCOVER_CONCEPT` when it detects a goal is met. The reducer adds the concept to `conceptsDiscovered` (if not already present):

```typescript
case 'DISCOVER_CONCEPT': {
  if (state.conceptsDiscovered.includes(action.concept)) return state;
  return {
    ...state,
    conceptsDiscovered: [...state.conceptsDiscovered, action.concept],
  };
}
```

### Nudge Rules

| Trigger | Condition | Sam's Nudge |
|---------|-----------|-------------|
| Inactivity | 15s since last action AND fewer than 3 total actions | "Try tapping a crystal and then pressing Split! See what happens." |
| Repetition | 5 consecutive splits with no combines | "You're great at splitting! Now try dragging two small crystals together to combine them." |
| Overwhelm | All workspace blocks have denominator > 8 | "Wow, those pieces are tiny! Let's start fresh with some bigger crystals." + dispatch `RESET_WORKSPACE` |
| Timeout | 3 minutes elapsed, not all goals discovered | Sam demonstrates undiscovered concepts, then transition to Guided Practice |
| Complete | All 3 goals discovered | "You've already figured out the big idea! Let me give you some challenges." + transition to Guided Practice |

### Observer Architecture

The observer is a **React hook** (not a class), since it needs access to `state`, `dispatch`, and `sendMessage`. It runs only during the `explore` phase.

```typescript
// src/observers/useExplorationObserver.ts

import { useEffect, useRef } from 'react';
import type { LessonState, LessonAction } from '../state/types';

interface ExplorationObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  sendMessage: (text: string) => void;
  isLoading: boolean;
}

export function useExplorationObserver({
  state,
  dispatch,
  sendMessage,
  isLoading,
}: ExplorationObserverOptions): void {
  // Only active during explore phase
  // Tracks action counts, timers, and discovery goals
  // Fires nudges via sendMessage
  // Dispatches DISCOVER_CONCEPT and PHASE_TRANSITION
}
```

### Observer Internal State (useRef, not in reducer)

The observer tracks transient counters that don't belong in LessonState:

```typescript
const statsRef = useRef({
  actionCount: 0,           // total workspace actions
  consecutiveSplits: 0,     // resets on any non-split action
  lastActionTime: Date.now(),
  phaseStartTime: Date.now(),
});
```

### Detection Logic

**Splitting goal**: After any successful `SPLIT_BLOCK`, check if `conceptsDiscovered` doesn't include `'splitting'` yet. If so, dispatch `DISCOVER_CONCEPT`.

**Combining goal**: After any successful `COMBINE_BLOCKS`, check if `conceptsDiscovered` doesn't include `'combining'` yet.

**Equivalence goal**: After a block is moved to comparison zone, check if there are 2+ blocks in comparison with different denominators but equivalent values. Use `areEquivalent` from `FractionEngine`:

```typescript
import { areEquivalent } from '../engine/FractionEngine';

const comparisonBlocks = state.blocks.filter(b => b.position === 'comparison');
if (comparisonBlocks.length >= 2) {
  for (let i = 0; i < comparisonBlocks.length; i++) {
    for (let j = i + 1; j < comparisonBlocks.length; j++) {
      const a = comparisonBlocks[i].fraction;
      const b = comparisonBlocks[j].fraction;
      if (a.denominator !== b.denominator && areEquivalent(a, b)) {
        // Equivalence discovered!
        dispatch({ type: 'DISCOVER_CONCEPT', concept: 'equivalence' });
      }
    }
  }
}
```

### Timer Implementation

Use `useEffect` with `setInterval` for periodic checks:

```typescript
useEffect(() => {
  if (state.phase !== 'explore') return;

  const interval = setInterval(() => {
    const now = Date.now();
    const stats = statsRef.current;
    const elapsed = now - stats.lastActionTime;
    const phaseElapsed = now - stats.phaseStartTime;

    // Inactivity nudge: 15s, < 3 actions
    if (elapsed > 15_000 && stats.actionCount < 3 && !isLoading) {
      sendMessage('[Student has been inactive for 15 seconds]');
      stats.lastActionTime = now; // reset to avoid repeated nudges
    }

    // 3-minute timeout
    if (phaseElapsed > 180_000 && !allGoalsDiscovered) {
      sendMessage('[3 minutes have passed in exploration. Please demonstrate any undiscovered concepts and transition to guided practice.]');
      // After Sam responds, dispatch phase transition
      dispatch({ type: 'PHASE_TRANSITION', to: 'guided' });
    }
  }, 5000); // check every 5 seconds

  return () => clearInterval(interval);
}, [state.phase, isLoading]);
```

### Workspace Action Tracking

Use `useEffect` watching `state.blocks` to detect when actions happen:

```typescript
const prevBlocksRef = useRef(state.blocks);

useEffect(() => {
  if (state.phase !== 'explore') return;

  const prev = prevBlocksRef.current;
  const curr = state.blocks;
  prevBlocksRef.current = curr;

  if (prev === curr) return; // no change

  const stats = statsRef.current;
  stats.lastActionTime = Date.now();
  stats.actionCount++;

  // Detect split: more blocks than before
  if (curr.length > prev.length) {
    stats.consecutiveSplits++;
    if (!state.conceptsDiscovered.includes('splitting')) {
      dispatch({ type: 'DISCOVER_CONCEPT', concept: 'splitting' });
    }
    // Repetition nudge: 5 consecutive splits
    if (stats.consecutiveSplits >= 5 && !isLoading) {
      sendMessage('[Student has done 5 consecutive splits without combining]');
      stats.consecutiveSplits = 0;
    }
  }

  // Detect combine: fewer blocks than before
  if (curr.length < prev.length) {
    stats.consecutiveSplits = 0;
    if (!state.conceptsDiscovered.includes('combining')) {
      dispatch({ type: 'DISCOVER_CONCEPT', concept: 'combining' });
    }
  }

  // Detect overwhelm: all blocks have denominator > 8
  const workspaceBlocks = curr.filter(b => b.position === 'workspace');
  if (workspaceBlocks.length > 0 && workspaceBlocks.every(b => b.fraction.denominator > 8)) {
    if (!isLoading) {
      sendMessage('[All blocks have very small pieces (denominator > 8). Student may be overwhelmed.]');
      dispatch({ type: 'RESET_WORKSPACE' });
    }
  }

  // Equivalence detection (comparison zone)
  // ... (see detection logic above)
}, [state.blocks, state.phase]);
```

### Phase Transition

When all 3 goals are discovered:

```typescript
useEffect(() => {
  if (state.phase !== 'explore') return;
  if (state.conceptsDiscovered.length >= 3 &&
      state.conceptsDiscovered.includes('splitting') &&
      state.conceptsDiscovered.includes('combining') &&
      state.conceptsDiscovered.includes('equivalence')) {
    sendMessage('[Student has discovered all 3 concepts! Transition to guided practice.]');
    // Small delay to let Sam's celebration message come through
    setTimeout(() => {
      dispatch({ type: 'PHASE_TRANSITION', to: 'guided' });
    }, 3000);
  }
}, [state.conceptsDiscovered, state.phase]);
```

### Nudge Messages as Context

Nudge messages use the `[bracket]` convention from ENG-015. They are sent as context to Sam, who generates the actual child-friendly response. The observer does NOT hardcode Sam's words — it describes the situation, and Sam responds in character.

Examples of what the observer sends vs what Sam says:

| Observer sends | Sam responds (generated by Claude) |
|---------------|-----------------------------------|
| `[Student has been inactive for 15 seconds]` | "Try tapping a crystal and pressing Split!" |
| `[Student has done 5 consecutive splits without combining]` | "You're great at splitting! Now try dragging two crystals together." |
| `[All blocks have very small pieces]` | "Those pieces are tiny! Let's start fresh." |
| `[Student has discovered all 3 concepts!]` | "You've figured out the big idea! Let me give you some challenges." |

---

## Exploration Config

Create `src/content/exploration-config.json` with tunable parameters:

```json
{
  "goals": ["splitting", "combining", "equivalence"],
  "nudges": {
    "inactivityDelayMs": 15000,
    "inactivityMinActions": 3,
    "consecutiveSplitsThreshold": 5,
    "overwhelmMinDenominator": 8,
    "phaseTimeoutMs": 180000
  },
  "transitionDelayMs": 3000,
  "checkIntervalMs": 5000
}
```

Import and use these values instead of hardcoding numbers in the hook.

---

## Deliverables Checklist

### A. Reducer Addition

- [ ] `DISCOVER_CONCEPT` action added to `LessonAction` in `src/state/types.ts`
- [ ] Reducer handles `DISCOVER_CONCEPT` — adds to `conceptsDiscovered` if not present
- [ ] Exhaustive switch still compiles

### B. Observer Hook

- [ ] `src/observers/useExplorationObserver.ts` created and exported
- [ ] Hook accepts `{ state, dispatch, sendMessage, isLoading }`
- [ ] Only active during `explore` phase
- [ ] Tracks `actionCount`, `consecutiveSplits`, `lastActionTime`, `phaseStartTime` in refs

### C. Discovery Goal Detection

- [ ] Splitting detected when blocks increase after SPLIT_BLOCK
- [ ] Combining detected when blocks decrease after COMBINE_BLOCKS
- [ ] Equivalence detected when comparison zone has equivalent fractions with different denominators
- [ ] Each goal dispatches `DISCOVER_CONCEPT` only once

### D. Nudge Rules

- [ ] 15s inactivity + < 3 actions → sends context to Sam
- [ ] 5 consecutive splits → sends context to Sam, resets counter
- [ ] All denominators > 8 → sends context to Sam + dispatches RESET_WORKSPACE
- [ ] 3-minute timeout → sends context to Sam + dispatches PHASE_TRANSITION to guided
- [ ] All 3 goals → sends context to Sam + dispatches PHASE_TRANSITION to guided (after delay)

### E. Config

- [ ] `src/content/exploration-config.json` with tunable thresholds
- [ ] Observer imports and uses config values

### F. Integration

- [ ] Hook called in `App.tsx` (or wherever `useTutorChat` is used)
- [ ] Only runs during explore phase — no effect in other phases
- [ ] Nudge messages don't fire while Sam is already responding (`isLoading` guard)

### G. Repo Housekeeping

- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] Update `docs/DEVLOG.md` with ENG-016 entry
- [ ] Feature branch: `feature/eng-016-exploration-observer`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/observers/useExplorationObserver.ts` | Hook that tracks goals and fires nudges |
| `src/content/exploration-config.json` | Tunable thresholds for nudge rules |

## Files to Modify

| File | Change |
|------|--------|
| `src/state/types.ts` | Add `DISCOVER_CONCEPT` to LessonAction union |
| `src/state/reducer.ts` | Add `DISCOVER_CONCEPT` case |
| `src/App.tsx` | Call `useExplorationObserver` with state, dispatch, sendMessage, isLoading |
| `docs/DEVLOG.md` | Add ENG-016 entry |

## Files You Should NOT Modify

- `api/*` — backend is complete
- `src/engine/*` — import `areEquivalent` but don't modify engine
- `src/brain/useTutorChat.ts` — use `sendMessage` but don't modify hook
- `src/components/*` — no UI changes needed

## Files to READ for Context

| File | Why |
|------|-----|
| `src/state/types.ts` | LessonState shape — `phase`, `conceptsDiscovered`, `blocks`, `isLoading` |
| `src/state/reducer.ts` | Existing action handling pattern, exhaustive switch |
| `src/brain/useTutorChat.ts` | `sendMessage` API |
| `src/App.tsx` | Where to call the hook, how state/dispatch/sendMessage are available |
| `src/engine/FractionEngine.ts` | `areEquivalent` for equivalence detection |
| `api/system-prompt.ts` | Explore phase guidance — Sam already knows how to respond to exploration context |

---

## Technical Notes

### Why a Hook, Not a Class

The DEVLOG suggests `ExplorationObserver.ts` as a class. However, it needs React refs (for timers), access to `dispatch`, and access to `sendMessage`. A hook is the natural React pattern. Name it `useExplorationObserver` for convention.

### Avoiding Double-Nudges

Each nudge resets `lastActionTime` to prevent the same nudge from firing repeatedly. The `isLoading` guard prevents nudges while Sam is already responding.

### Equivalence Detection Edge Case

The student might place the same block twice (drag to comparison zone). `COMPARE_BLOCKS` currently uses `[draggedId, draggedId]` for single-block drops. The equivalence check requires two blocks with **different** denominators, so a single block dropped twice won't falsely trigger it.

### Phase Transition Safety

The reducer's `isValidPhaseTransition` already enforces `explore → guided` as the only valid transition from explore. The observer dispatches `PHASE_TRANSITION` to `guided` — the reducer validates it.

---

## Definition of Done for ENG-016

- [ ] Observer tracks splitting, combining, and equivalence discovery goals
- [ ] 15s inactivity nudge fires (with < 3 actions guard)
- [ ] 5 consecutive splits nudge fires
- [ ] Denominator > 8 overwhelm nudge fires + workspace reset
- [ ] 3-minute timeout transitions to guided practice
- [ ] All 3 goals discovered transitions to guided practice
- [ ] Nudge messages use `[bracket]` convention (Sam generates actual response)
- [ ] Config values in `exploration-config.json`, not hardcoded
- [ ] `DISCOVER_CONCEPT` action added and handled in reducer
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## Dependencies

- **ENG-015** (chat ↔ workspace integration) — observer sends nudges via the same `sendMessage` + bracket convention

## After ENG-016

- **ENG-017**: Reducer additions (note: `TUTOR_RESPONSE` and `SET_LOADING` already added by ENG-014; `DISCOVER_CONCEPT` added by this ticket. ENG-017 may now be redundant — check if any remaining actions are needed)
- **Guided Practice flow**: The observer transitions to guided phase; guided practice scripting is a separate concern
