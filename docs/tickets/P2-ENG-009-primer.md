# ENG-009 Primer: Wire Blocks to Reducer

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 2: Visual Manipulative (Day 2)
**Date:** Mar 11, 2026
**Previous work:** See `docs/DEVLOG.md`. ENG-008 (Combine + drag) is complete. **ENG-007 (Split + ActionBar) has not been implemented** — `ActionBar.tsx` does not exist in the codebase, and App has no split UI. This primer does not add ActionBar or SPLIT_BLOCK wiring; that remains ENG-007.

---

## Prerequisites

- **ENG-009 does not implement the ActionBar or split.** The PRD’s Phase 2 Day 2 deliverable is a “standalone page where you can split and combine fraction blocks visually with smooth animations.” Combine is done (ENG-007). **Split is not** — it requires ENG-007 (ActionBar + picker + SPLIT_BLOCK). Phase 2 Day 2 is only fully met when both ENG-007 and ENG-009 are complete. This ticket wires the remaining block interactions (compare zone drop, derived state, DESELECT_ALL, isDragging audit).

---

## What Is This Ticket?

Ensure all block interactions that exist in the app flow through the lesson reducer and that visual state is derived from engine state. After ENG-008, **select**, **drag**, and **combine** are already wired. This ticket closes the remaining gaps:

1. **Comparison zone drop** — Dragging a block onto the comparison zone (the “Drop blocks here to compare” area) does not yet update state. When the user drops a block there, the app must dispatch so that block’s `position` becomes `'comparison'` and it renders in the ComparisonZone.
2. **Derived state** — `selectedBlockId` (and any UI that depends on “which block is selected”) must be derived from `state.blocks` (e.g. the block with `isSelected: true`), not from separate local state that could get out of sync.
3. **DESELECT_ALL** — **Required.** When the user taps or clicks the workspace background (not on a block), dispatch `DESELECT_ALL` so selection clears. Without this, the only way to deselect is to tap another block; when the ActionBar exists (ENG-007), the Split button would stay active with no way to dismiss it.
4. **isDragging guard** — Confirm that during drag only one block is draggable and that reducer `isDragging` and App `draggingBlockId` stay in sync with DRAG_START / DRAG_END.

**Scope boundary with ENG-007:** ENG-007 is the ticket that adds the ActionBar (Split button + picker) and wires `onSplitRequest` → SPLIT_BLOCK. As of now, ENG-007 has not been implemented (no ActionBar in the codebase). ENG-009 does **not** create the ActionBar; it wires **comparison zone drop**, **derived selectedBlockId**, and **DESELECT_ALL** (required).

---

## Current State

| Component | Status |
|-----------|--------|
| `src/state/reducer.ts` | **Complete** — Handles COMPARE_BLOCKS (sets `position: 'comparison'` for given block IDs), SELECT_BLOCK, DESELECT_ALL, DRAG_START, DRAG_END, COMBINE_BLOCKS |
| `src/App.tsx` | **Partial** — Wires SELECT_BLOCK, DRAG_START, DRAG_END, COMBINE_BLOCKS via handleSelectBlock, handleDragStart, handleCombineAttempt. Does **not** yet handle drop on comparison zone; does not dispatch DESELECT_ALL |
| `src/components/Workspace/Workspace.tsx` | **Partial** — handleDragEnd calls onCombineAttempt with a **block** as target (findDropTarget). No detection of drop over the ComparisonZone container |
| `src/components/Workspace/ComparisonZone.tsx` | **Complete** (ENG-006) — Renders blocks with `position === 'comparison'`; no drop handling |

---

## Contract

### Comparison zone as drop target

- When the user **ends a drag** and the drop rect overlaps the **ComparisonZone** container (the dashed “Drop blocks here to compare” area), the app must update state so the dragged block moves to the comparison zone.
- **Reducer:** `COMPARE_BLOCKS` with `blockIds: [string, string]` sets every block whose id is in that list to `position: 'comparison'`. For a **single** block dropped on the zone, use the intentional convention: dispatch `COMPARE_BLOCKS` with `blockIds: [draggedId, draggedId]`. The reducer uses a `Set`, so one id is sufficient; that block’s position becomes `'comparison'`. (A future refactor could add a dedicated `MOVE_TO_COMPARISON { blockId }` action for clearer semantics; for this ticket, the existing action with two identical IDs is acceptable and documented.)
- **Detection:** Workspace (or a parent) must know the ComparisonZone’s bounding rect at drag end. Options: (a) pass a ref to the ComparisonZone container into Workspace and use `getBoundingClientRect()` in the drag-end handler, or (b) have Workspace expose an `onDropOnComparisonZone?(draggedId: string)` callback that the parent calls when the drop rect overlaps the zone. Parent then dispatches `COMPARE_BLOCKS` with `[draggedId, draggedId]` (and clears drag state as for combine).

### Derived state

- **selectedBlockId:** Must be derived from reducer state, e.g. `state.blocks.find(b => b.isSelected)?.id ?? null`. Do not store “selected block id” in separate React state that is updated independently of the reducer.
- **Blocks and positions:** The only source of block list and `position` is `state.blocks`. No local copy of blocks or positions.

### DESELECT_ALL (required)

- When the user taps or clicks the **workspace background** (the active-blocks area container, not a block), dispatch `DESELECT_ALL` so that no block has `isSelected: true`. Required so the user can clear selection without tapping another block; when the ActionBar exists (ENG-007), this prevents the Split button from staying active with no way to dismiss it.

### isDragging guard

- During a drag, only the dragged block should respond to drag; others should have drag disabled (already achieved in ENG-008 via `dragDisabled={isDragging && draggingBlockId !== block.id}`). Ensure DRAG_START and DRAG_END are dispatched so reducer `state.isDragging` matches the actual drag state; App’s `draggingBlockId` is UI-only for “which block is dragging” and is cleared on DRAG_END.

---

## Deliverables Checklist

### A. Comparison zone drop

- [ ] At drag end, detect whether the drop rect overlaps the ComparisonZone container (e.g. ref on the zone + `getBoundingClientRect()`).
- [ ] If overlap with zone (and not with another block as combine target): dispatch `COMPARE_BLOCKS` with `blockIds: [draggedId, draggedId]` and clear drag state (same as combine: DRAG_END, clear draggingBlockId). Do not dispatch COMBINE_BLOCKS.
- [ ] If overlap with another **block**: keep existing combine logic (same denominator → COMBINE_BLOCKS; different → rejection message).
- [ ] Block with `position: 'comparison'` renders in ComparisonZone (already true via state.blocks).

### B. Derived state

- [ ] `selectedBlockId` is derived from state (e.g. `const selectedBlockId = state.blocks.find(b => b.isSelected)?.id ?? null`) and passed to Workspace/ActionBar. No `useState` for selected block id that is updated in parallel with SELECT_BLOCK.

### C. DESELECT_ALL (required)

- [ ] Workspace (or active-blocks container) has a way to detect click/tap on the background (e.g. `onPointerDown` / `onClick` on the container that only fires when target is the container, not a block). On that event, parent dispatches `DESELECT_ALL`.

### D. isDragging guard

- [ ] Confirm only one block is draggable during drag; confirm DRAG_START/DRAG_END are dispatched and reducer `isDragging` stays in sync. No code change required if already correct.

### E. Repo housekeeping

- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] Update `docs/DEVLOG.md` with ENG-009 entry when complete
- [ ] Feature branch: `feature/eng-009-wire-blocks-to-reducer`

---

## Definition of Done

- [ ] Dragging a block into the ComparisonZone and releasing dispatches `COMPARE_BLOCKS` so that block’s position becomes `'comparison'` and it appears in the comparison zone.
- [ ] Combine-on-block behavior unchanged: drop on another block still triggers combine (same denominator) or rejection message (different denominator).
- [ ] `selectedBlockId` is derived from `state.blocks` (no duplicate local state for selection).
- [ ] Tapping workspace background dispatches `DESELECT_ALL`.
- [ ] isDragging guard and DRAG_START/DRAG_END wiring verified.
- [ ] `npx tsc -b` and `npm run lint` pass.
- [ ] DEVLOG updated with ENG-009 entry.
- [ ] Feature branch pushed.

---

## Technical notes

### Distinguishing “drop on zone” vs “drop on block”

- **Option A:** In Workspace’s drag-end handler, first compute overlap with the ComparisonZone ref. If the drop rect overlaps the zone **and** does not overlap any other block (or overlap with a block is below a small threshold), treat as “drop on zone” and call a new callback e.g. `onDropOnComparisonZone(draggedId)`. Otherwise call existing `onCombineAttempt(draggedId, targetId)`.
- **Option B:** Parent receives drop rect (or a flag “dropped on zone”). Parent holds a ref to the zone and in the handler checks zone rect vs drop rect; if inside zone, dispatch COMPARE_BLOCKS; else call existing combine logic with targetId.

### COMPARE_BLOCKS for one block

- The reducer’s `COMPARE_BLOCKS` handler uses `const set = new Set([idA, idB]);` and sets `position: 'comparison'` for every block whose id is in the set. Passing `blockIds: [draggedId, draggedId]` is an **intentional convention** for “move this one block to comparison” (the Set deduplicates to a single id). Semantically the action is “these blocks are in the comparison zone”; one id is valid. A later refactor could introduce a dedicated `MOVE_TO_COMPARISON { blockId }` action; for this ticket, using the existing action with two identical IDs is documented and acceptable.

---

## Files to read

| File | Why |
|------|-----|
| `src/state/reducer.ts` | COMPARE_BLOCKS (lines ~134–141), SELECT_BLOCK, DESELECT_ALL, DRAG_START, DRAG_END |
| `src/state/types.ts` | LessonAction, FractionBlock.position |
| `src/App.tsx` | Current handleCombineAttempt, handleDragStart, handleSelectBlock |
| `src/components/Workspace/Workspace.tsx` | handleDragEnd, findDropTarget, where to add zone ref or callback |

## Files to modify (likely)

| File | Action |
|------|--------|
| `src/components/Workspace/Workspace.tsx` | Add ref for ComparisonZone container; in handleDragEnd, detect drop on zone and call parent callback (e.g. onDropOnComparisonZone) or pass drop info so parent can dispatch COMPARE_BLOCKS |
| `src/App.tsx` | Handle “drop on comparison zone”: dispatch COMPARE_BLOCKS [draggedId, draggedId], DRAG_END, clear draggingBlockId. Derive selectedBlockId from state. Wire DESELECT_ALL on workspace background. |
| `docs/DEVLOG.md` | Add ENG-009 entry when complete |

---

## Branch & merge workflow

```bash
git switch main && git pull
git switch -c feature/eng-009-wire-blocks-to-reducer
# ... implement comparison zone drop, derived selectedBlockId, DESELECT_ALL ...
git add src/App.tsx src/components/Workspace/Workspace.tsx docs/DEVLOG.md
git commit -m "feat: wire comparison zone drop and derived state to reducer (ENG-009)"
git push -u origin feature/eng-009-wire-blocks-to-reducer
```

---

## After ENG-009

ENG-009 wires compare zone drop, derived state, and DESELECT_ALL. **Phase 2 Day 2 is only fully complete when ENG-007 is also done** (ActionBar + split). With both ENG-007 and ENG-009: select, split, combine, drag, and compare are all wired to the reducer. Next: Phase 3 (Chat + LLM) — ENG-010 (Chat panel UI), ENG-011 (Vercel edge + Claude proxy), etc.
