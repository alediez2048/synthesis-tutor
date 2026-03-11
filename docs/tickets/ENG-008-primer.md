# ENG-008 Primer: Combine Interaction + Animation

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Date:** Mar 10, 2026
**Previous work:** ENG-001 through ENG-007 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-008 implements the **combine interaction**: drag one fraction block onto another same-denominator block to merge them into a single block. Uses `@use-gesture/react` for drag-and-drop (must be installed). The reducer (ENG-004) already handles `COMBINE_BLOCKS` and rejects mismatched denominators. This ticket adds drag behavior to FractionBlock, drop-target detection in Workspace, the combine animation (350ms, ease-in-out, transform only), and a rejection flow for different-denominator attempts. The `isDragging` state guard (DRAG_START / DRAG_END) prevents multi-touch conflicts.

**Key behaviors:**
- **Same denominator:** Dispatch `COMBINE_BLOCKS` → reducer merges → combine animation (glide → snap, 350ms ease-in-out) → new block appears with combined fraction.
- **Different denominator:** Do **not** dispatch. Show Sam message: "Those are different sizes — try blocks that are the same size!" Dragged block snaps back to original position.
- **Pre-dispatch check:** Compare `draggedBlock.fraction.denominator === targetBlock.fraction.denominator` before dispatching. This avoids unnecessary reducer calls and allows immediate feedback.
- **Post-combine selection:** Reducer creates the new block with `isSelected: false`. Selection clears after combine.
- **Single-touch guard:** Dispatch `DRAG_START` when gesture begins, `DRAG_END` when gesture ends. If `state.isDragging` is already true, ignore new drag attempts.

### Why Does This Exist?

Combining is the inverse of splitting and essential for building fraction equivalence intuition. In the exploration phase (PRD 7.2), students split 1/2 into fourths and then combine fourths back — discovering that 2/4 = 1/2. The drag interaction makes the "putting pieces together" metaphor tangible. The animation (snap together, seam dissolves) reinforces that fractions add when denominators match.

### Current State

| Component | Status |
|-----------|--------|
| `src/components/Workspace/FractionBlock.tsx` | **Complete** (ENG-005) — tap calls onSelect; selection ring when isSelected |
| `src/components/Workspace/Workspace.tsx` | **Complete** (ENG-006) — renders blocks by position; `touch-action: none` set |
| `src/components/Workspace/ActionBar.tsx` | **Complete** (ENG-007) — Split button + picker |
| `src/state/reducer.ts` | **Complete** (ENG-004) — COMBINE_BLOCKS handled; rejects mismatched denominators and invalid fractions |
| `src/engine/FractionEngine.ts` | **Complete** (ENG-002) — combine(fractions) sums same-denominator fractions |
| `@use-gesture/react` | **Not installed** — must `npm install @use-gesture/react` |

---

## What Was Already Done

- ENG-004: Reducer handles `COMBINE_BLOCKS` — finds blocks by id, rejects if different denominators, calls `combine([f1, f2])`, validates result with `isValidFraction`, creates new block with `isSelected: false`, removes the two originals.
- ENG-004: Reducer handles `DRAG_START` (sets `isDragging: true`) and `DRAG_END` (sets `isDragging: false`).
- ENG-005: FractionBlock renders with `onSelect` prop; no drag behavior yet.
- ENG-006: Workspace has `touch-action: none` for gesture handling.
- ENG-007: App uses `useReducer(lessonReducer, getInitialLessonState())` for select + split wiring.
- PRD 10: "Combine different denominators → Sam: 'Those are different sizes — try blocks that are the same size!'"
- PRD Appendix B: Combine animation 350ms, ease-in-out, transform (glide → snap → dissolve seam).
- iPad-first rule: `@use-gesture/react` for drag-and-drop; single-touch model; `will-change: transform` on dragged blocks only.

---

## ENG-008 Contract

### Installation

```bash
npm install @use-gesture/react
```

### Drag Behavior on FractionBlock

- **Add drag gesture** to FractionBlock using `useDrag` from `@use-gesture/react`.
- **New props (suggested):**
  - `onDragStart?: () => void` — parent dispatches `DRAG_START`.
  - `onDragEnd?: (targetBlockId: string | null) => void` — parent dispatches `DRAG_END` and, if a valid target was found, attempts the combine.
  - `isDragging?: boolean` — from `state.isDragging`; when true and this block is not the one being dragged, ignore new drag attempts.
  - `dragDisabled?: boolean` — optional; parent can disable drag during animations.
- **During drag:** Apply CSS `transform: translate(dx, dy)` to follow the finger. Use `will-change: transform` while dragging; remove after gesture ends. The block visually moves but state is NOT updated until gesture completes (architecture rule: CSS transforms for preview only).
- **On gesture end:** Determine the nearest block under the drop point (hit-test). If a block is found and it's a different block, call `onDragEnd(targetBlockId)`. If no valid target, call `onDragEnd(null)` and snap back.
- **Visual feedback during drag:** Slight scale-up (e.g. `scale(1.05)`) and elevated shadow on the dragged block. Potential drop targets (same-denominator blocks) can show a subtle highlight.

### Drop Target Detection

- **In Workspace (or a wrapper):** After drag ends, determine which block (if any) the dragged block was dropped on.
- **Options:**
  1. **Bounding box hit-test:** On drag end, get the dragged block's final position and check overlap with other block elements using `getBoundingClientRect()`. Find the block with the most overlap.
  2. **Proximity-based:** Check if the dragged block's center is within N pixels of another block's center.
- **Recommendation:** Use bounding box overlap (option 1). Store block element refs (e.g. via a ref map in Workspace) and check intersection on drop.

### Combine Flow (parent responsibility)

1. User starts dragging block A → parent dispatches `DRAG_START`.
2. Block A follows the finger via CSS transform.
3. User releases block A near block B → parent receives `onDragEnd(blockB.id)`.
4. Parent dispatches `DRAG_END`.
5. **Pre-dispatch check:** `blockA.fraction.denominator === blockB.fraction.denominator`.
   - **Same denominator:** Dispatch `{ type: 'COMBINE_BLOCKS', blockIds: [blockA.id, blockB.id] }`. Reducer merges them. Play combine animation on the new block.
   - **Different denominator:** Do NOT dispatch `COMBINE_BLOCKS`. Show Sam rejection message. Dragged block snaps back to original position (animate back, 300ms ease-out).
6. If drag ends with no target (`onDragEnd(null)`): snap block back, dispatch `DRAG_END`.

### Combine Animation

- **Duration:** 350ms, ease-in-out (PRD Appendix B).
- **Properties:** `transform` and `opacity` only (no width/height/left/top — composited properties rule).
- **Approach:** When the reducer returns new state with the combined block:
  - The two original blocks are removed from state; one new block appears.
  - Animate the new block in with CSS `@keyframes`: e.g. `scaleX(0) → scaleX(1)` with `transform-origin: left`, or `opacity: 0 → 1` with a slight `translateY`.
  - The new block's width = sum of the two original blocks' widths (mathematical invariant: `combine([f1, f2])` numerators add, denominator stays same, so width is additive).
- **Seam dissolve:** Optional visual polish — briefly show a vertical line at the merge point that fades out over the last 100ms of the animation.

### Rejection Animation (different denominators)

- When blocks have different denominators:
  - Dragged block snaps back to original position (300ms ease-out transform).
  - Optional: both blocks briefly flash red (`opacity` pulse, 200ms).
  - Sam message appears (e.g. in a toast or message area): "Those are different sizes — try blocks that are the same size!"
  - Message should be in an `aria-live="polite"` region for screen reader announcement.

### Single-Touch Guard

- On `DRAG_START`, reducer sets `isDragging: true`.
- While `isDragging` is true, no other block should initiate a drag (check `state.isDragging` before starting gesture, or pass `dragDisabled` prop).
- On `DRAG_END`, reducer sets `isDragging: false`.
- This prevents multi-touch conflicts (iPad-first rule: process first touch only).

### Files

- **Install:** `@use-gesture/react` (`npm install @use-gesture/react`)
- **Modify:** `src/components/Workspace/FractionBlock.tsx` — add `useDrag` gesture, drag props, drag visual feedback.
- **Modify:** `src/components/Workspace/Workspace.tsx` — drop target detection, combine flow orchestration, rejection message display, combine animation.
- **Modify:** `src/App.tsx` — pass `isDragging` from state, wire `DRAG_START` / `DRAG_END` / `COMBINE_BLOCKS` dispatches.
- **Do not modify:** `src/state/reducer.ts` — already handles COMBINE_BLOCKS, DRAG_START, DRAG_END.
- **Do not modify:** `src/engine/FractionEngine.ts`.

### Accessibility

- Dragged block: `aria-grabbed="true"` during drag (or equivalent ARIA drag-and-drop).
- Drop targets: `aria-dropeffect="move"` on potential targets.
- Rejection message: `aria-live="polite"` region so screen readers announce "Those are different sizes."
- Keyboard alternative: For accessibility, also support a **Combine button** in the ActionBar (select two blocks → tap Combine). This is a secondary interaction path; drag is primary. The Combine button should be disabled unless exactly two blocks are selected. If implementing keyboard combine, dispatch `SELECT_BLOCK` for each of two blocks (reducer currently only supports single selection — see note below).

### Note: Multi-Selection for Combine Button

The current reducer's `SELECT_BLOCK` only supports single selection (sets one block to `isSelected: true`, all others to `false`). If you add a Combine button as a keyboard/accessibility alternative, you'll need either:
- A new action `TOGGLE_SELECT_BLOCK` that allows multi-select (max 2), or
- The Combine button uses the "drag source" and "drag target" concept without relying on `isSelected`.

**Recommendation for this ticket:** Focus on drag-to-combine as the primary interaction. If time permits, add a Combine button that works with the existing single-select by using a two-tap flow (select first block, then tap Combine, then tap second block). Defer true multi-select to ENG-009 if needed.

---

## Deliverables Checklist

### A. Drag Behavior

- [ ] `@use-gesture/react` installed
- [ ] FractionBlock has `useDrag` gesture; follows finger via CSS transform
- [ ] `will-change: transform` applied during drag, removed after
- [ ] Visual feedback: slight scale-up and shadow on dragged block
- [ ] Single-touch guard: `DRAG_START` / `DRAG_END` dispatched; `isDragging` prevents concurrent drags

### B. Combine Flow

- [ ] Drop target detection (bounding box hit-test or proximity)
- [ ] Same-denominator: dispatch `COMBINE_BLOCKS`; new block appears with correct combined fraction
- [ ] Different-denominator: do NOT dispatch; show Sam rejection message; snap back
- [ ] Pre-dispatch check on denominator match

### C. Combine Animation

- [ ] 350ms, ease-in-out, transform/opacity only (composited properties)
- [ ] New block width = sum of original blocks' widths (mathematical invariant)
- [ ] Labels visible on new block after animation

### D. Rejection Animation

- [ ] Dragged block snaps back to original position
- [ ] Sam message: "Those are different sizes — try blocks that are the same size!"
- [ ] Message in `aria-live` region

### E. Repo Housekeeping

- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] Update `docs/DEVLOG.md` with ENG-008 entry when complete
- [ ] Feature branch: `feature/eng-008-combine-interaction`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-008-combine-interaction
npm install @use-gesture/react
# ... implement drag, combine, animations ...
git add package.json package-lock.json src/components/Workspace/FractionBlock.tsx src/components/Workspace/Workspace.tsx src/App.tsx docs/DEVLOG.md
git commit -m "feat: add Combine interaction with drag-and-drop and animation (ENG-008)"
git push -u origin feature/eng-008-combine-interaction
```

Use Conventional Commits: `feat:` for new feature.

---

## Technical Specification

### useDrag setup (sketch)

```typescript
import { useDrag } from '@use-gesture/react';

// Inside FractionBlock component:
const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
// OR use local state for transform:
const [offset, setOffset] = useState({ x: 0, y: 0 });

const bind = useDrag(({ active, movement: [mx, my], first, last }) => {
  if (first) onDragStart?.();
  setOffset(active ? { x: mx, y: my } : { x: 0, y: 0 });
  if (last) {
    // hit-test for drop target
    onDragEnd?.(detectedTargetId);
  }
}, { enabled: !dragDisabled });
```

Note: `@use-gesture/react` does NOT require `react-spring`. You can use the gesture data to set CSS transform directly via state or a ref. Do NOT add `react-spring` as a dependency — use plain CSS transitions or state-driven transforms.

### Hit-test for drop target (sketch)

```typescript
// In Workspace, maintain a ref map: blockId → HTMLElement
const blockRefs = useRef<Map<string, HTMLElement>>(new Map());

function findDropTarget(draggedId: string, draggedRect: DOMRect): string | null {
  for (const [id, el] of blockRefs.current) {
    if (id === draggedId) continue;
    const rect = el.getBoundingClientRect();
    // Check overlap
    const overlapX = Math.max(0, Math.min(draggedRect.right, rect.right) - Math.max(draggedRect.left, rect.left));
    const overlapY = Math.max(0, Math.min(draggedRect.bottom, rect.bottom) - Math.max(draggedRect.top, rect.top));
    if (overlapX > 0 && overlapY > 0) return id;
  }
  return null;
}
```

### Denominator pre-check

```typescript
function handleCombineAttempt(draggedId: string, targetId: string) {
  const dragged = state.blocks.find(b => b.id === draggedId);
  const target = state.blocks.find(b => b.id === targetId);
  if (!dragged || !target) return;

  dispatch({ type: 'DRAG_END' });

  if (dragged.fraction.denominator === target.fraction.denominator) {
    dispatch({ type: 'COMBINE_BLOCKS', blockIds: [draggedId, targetId] });
    // trigger combine animation
  } else {
    setRejectionMessage("Those are different sizes — try blocks that are the same size!");
    // snap-back animation plays automatically (transform resets to 0,0)
  }
}
```

### Animation CSS (sketch)

```css
@keyframes combineIn {
  from {
    transform: scaleX(0);
    opacity: 0.5;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.combine-enter {
  animation: combineIn 350ms ease-in-out forwards;
  transform-origin: left;
}
```

Or use inline styles with Web Animations API:
```typescript
el.animate(
  [
    { transform: 'scaleX(0)', opacity: 0.5 },
    { transform: 'scaleX(1)', opacity: 1 },
  ],
  { duration: 350, easing: 'ease-in-out', fill: 'forwards' }
);
```

---

## Important Context

### Files to Modify

| File | Action |
|------|--------|
| `package.json` | Add `@use-gesture/react` dependency |
| `src/components/Workspace/FractionBlock.tsx` | Add `useDrag` gesture, drag props, drag visual feedback |
| `src/components/Workspace/Workspace.tsx` | Drop target detection, combine flow, rejection message, animation |
| `src/App.tsx` | Wire `DRAG_START`, `DRAG_END`, `COMBINE_BLOCKS` dispatches; pass `isDragging` |
| `docs/DEVLOG.md` | Add ENG-008 entry when complete |

### Files You Should NOT Modify

- `src/state/reducer.ts` — already handles COMBINE_BLOCKS, DRAG_START, DRAG_END
- `src/engine/FractionEngine.ts` — no changes
- `src/state/types.ts` — no changes

### Files to READ for Context

| File | Why |
|------|-----|
| `src/state/reducer.ts` lines 107-131 | COMBINE_BLOCKS handler: finds blocks, checks denominators, calls combine(), validates result, creates new block |
| `src/state/reducer.ts` lines 189-193 | DRAG_START / DRAG_END: toggles isDragging boolean |
| `src/components/Workspace/FractionBlock.tsx` | Current component structure; add drag here |
| `src/components/Workspace/Workspace.tsx` | Current layout; add drop detection here |
| `src/App.tsx` | Current useReducer wiring from ENG-007 |
| `.cursor/rules/ipad-first.mdc` | `@use-gesture/react` required; single-touch model; animation rules |
| `.cursor/rules/architecture.mdc` | CSS transforms for preview only; commit state on gesture completion |
| `docs/prd.md` Section 10 | Edge case: "Combine different denominators" message |
| `docs/prd.md` Appendix B | Combine animation: 350ms, ease-in-out |

### Cursor Rules to Follow

- `ipad-first.mdc` — `@use-gesture/react` for drag; single-touch model; 60×60pt blocks; `will-change: transform` during drag only; composited properties only
- `architecture.mdc` — CSS transforms for preview during drag; commit state change only on gesture completion; visual components are pure projections of LessonState

---

## Definition of Done for ENG-008

- [ ] `@use-gesture/react` installed and used for drag gesture
- [ ] Drag a block onto a same-denominator block → combine animation (350ms, ease-in-out) → new combined block
- [ ] Drag a block onto a different-denominator block → snap back + Sam rejection message
- [ ] Single-touch guard via `isDragging` state
- [ ] `will-change: transform` applied during drag, removed after
- [ ] Combined block width = sum of original widths (mathematical invariant)
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated with ENG-008 entry
- [ ] Feature branch pushed

---

## After ENG-008

- **ENG-009** (Wire blocks to reducer) — Consolidate all interactions (select, split, combine, drag, compare) into a single dispatch wiring. isDragging guard for all gestures. Ensure no visual state exists outside the reducer.
