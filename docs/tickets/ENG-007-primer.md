# ENG-007 Primer: Split Interaction + Animation

**For:** New Cursor Agent session  
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Date:** Mar 10, 2026  
**Previous work:** ENG-001 through ENG-006 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-007 implements the **split interaction**: tap a block to select it → tap **Split** in an action bar → choose number of pieces from a picker [2] [3] [4] → engine computes the split → reducer updates state (or rejects if result denominator > 12) → **split animation** plays (new blocks grow in with a 400ms ease-out animation; see Technical Specification). Total visual width is preserved (mathematical invariant). Labels appear on the new blocks when the animation completes (state already holds the new blocks). A **500ms debounce** on the Split button prevents rapid re-taps. When a split would yield denominator > 12, **do not dispatch**; show a **Sam message** instead (e.g. “Those pieces are as small as they can get!”). Rejection is determined by a **pre-dispatch check**: `selectedBlock.fraction.denominator * parts > 12`. After a successful split, **selection clears** (reducer creates new blocks with `isSelected: false`); ActionBar returns to “no block selected” state.

### Why Does This Exist?

Splitting is the first core interaction in the intro script (PRD 7.1): “Tap on it!” → “Now press Split!” → picker [2][3][4] → “You just split one-half into two quarters.” The animation makes the abstraction concrete. The reducer (ENG-004) already enforces denominator ≤ 12 and implements SPLIT_BLOCK; this ticket adds the **ActionBar** (Split button + picker), wires **selection** and **split request** to the reducer, and adds the **split animation** (new blocks grow in via scaleX, 400ms ease-out). **Scope boundary with ENG-009:** ENG-007 wires **select + split only**: App uses useReducer and passes `selectedBlockId`, `onSelectBlock` (SELECT_BLOCK), and `onSplitRequest(parts)` (SPLIT_BLOCK after pre-check). ENG-009 adds combine, drag, compare, isDragging guard, and consolidates all remaining dispatch wiring.

### Current State

| Component | Status |
|-----------|--------|
| `src/components/Workspace/FractionBlock.tsx` | **Complete** (ENG-005) — tap calls onSelect; selection ring when isSelected |
| `src/components/Workspace/Workspace.tsx` | **Complete** (ENG-006) — renders blocks; accepts onSelectBlock |
| `src/components/Workspace/ComparisonZone.tsx` | **Complete** (ENG-006) |
| `src/components/Workspace/ActionBar.tsx` | **Does not exist** — create here |
| `src/state/reducer.ts` | **Complete** (ENG-004) — SPLIT_BLOCK handled; rejects when result den > 12 |
| `src/engine/FractionEngine.ts` | **Complete** (ENG-002) — split(f, parts) |

---

## What Was Already Done

- ENG-005: FractionBlock with onSelect and selected-state ring.
- ENG-006: Workspace + ComparisonZone; blocks from props; onSelectBlock passed to blocks.
- ENG-004: lessonReducer handles SPLIT_BLOCK; returns state unchanged when split would yield denominator > 12.
- ENG-002: split(fraction, parts) returns array of fractions.
- PRD 7.1: Intro flow — tap block, press Split, picker [2][3][4], animation.
- iPad-first: 500ms debounce on Split; 44×44pt minimum for buttons (Apple HIG).
- DEVLOG animation table: Split 400ms, ease-out, total width preserved (implement as scaleX grow-in).

---

## ENG-007 Contract

### ActionBar

- **Create:** `src/components/Workspace/ActionBar.tsx`.
- **Props (suggested):**
  - **selectedBlockId: string | null** — the id of the currently selected block (from state); when null, Split can be disabled or hidden.
  - **onSplitRequest: (parts: number) => void** — called when the user chooses a number of parts (2, 3, or 4). Parent **checks before dispatching**: if `selectedBlock.fraction.denominator * parts > 12`, show Sam message and do not dispatch; otherwise dispatch SPLIT_BLOCK.
  - **rejectionMessage?: string | null** — optional; when parent detects den * parts > 12, pass a message (e.g. “Those pieces are as small as they can get!”) for ActionBar or parent to display.
  - **disabled?: boolean** — optional; e.g. true during animation or when debounce is active.
- **UI:**
  - **Split** button: minimum 44×44pt touch target. When `selectedBlockId` is set, show the button (and optionally pulse it per PRD). When no block selected, button can be disabled or non-pulsing.
  - **Split picker:** When user taps Split, show exactly three options: **[2] [3] [4]** (no free-text input). On tap of 2, 3, or 4, call `onSplitRequest(2)`, `onSplitRequest(3)`, or `onSplitRequest(4)` and close the picker.
  - **500ms debounce:** After a split is requested (or after Split button tap), ignore further Split actions for 500ms (ipad-first.mdc). Implement with a ref or state (e.g. lastSplitAt) and disable the button or ignore clicks for 500ms.
- **Sam message when split would exceed denominator 12:** Parent checks `selectedBlock.fraction.denominator * parts > 12` **before** dispatching. If true, do not dispatch; show Sam message (e.g. “Those pieces are as small as they can get!”) via rejectionMessage or a dedicated message area. PRD Section 10: “Denominator > 12: Reducer rejects, Sam says …”.
- **Post-split selection:** The reducer creates new blocks with `isSelected: false`. Selection therefore **clears** after a successful split; ActionBar returns to its “no block selected” state (Split button no longer pulsed/emphasized).

### Flow (parent responsibility)

- Parent (App or layout) holds state with **useReducer(lessonReducer, getInitialLessonState())** and passes:
  - `blocks`, `referenceWidth`, `onSelectBlock` to Workspace (`onSelectBlock(blockId)` dispatches SELECT_BLOCK).
  - `selectedBlockId` = the id of the block in state where `isSelected === true` (derive from state.blocks); when no block is selected, null.
  - `onSplitRequest(parts)` = **before dispatching**, check `selectedBlock.fraction.denominator * parts > 12`. If true, show Sam message and return. Otherwise dispatch `{ type: 'SPLIT_BLOCK', blockId: selectedBlockId, parts }`. After a successful split, selection clears automatically (new blocks have `isSelected: false`).
- **ENG-007 scope:** Wire **SELECT_BLOCK and SPLIT_BLOCK only** in App. ENG-009 wires combine, drag, compare, and the rest.

### Split animation (pinned approach)

- **Approach:** When the reducer returns new state (one block replaced by N blocks), **render the new blocks immediately** in their final positions and total width. Apply a **CSS @keyframes** animation to each new block so they **grow in** over **400ms, ease-out**, preserving total width.
- **Implementation:** For each new block, use `transform: scaleX(0)` initially with `transform-origin: left`, then animate to `scaleX(1)` over 400ms ease-out. The container for the blocks keeps the combined width constant (e.g. flex with fixed total width or precomputed widths), so the layout does not jump. New blocks occupy the same total width as the original block; they simply animate from zero to full width.
- **Duration:** 400ms. **Easing:** ease-out.
- **Labels:** New blocks already have labels from FractionBlock; they are visible as soon as the new state is rendered (labels are part of the block content and animate with the block).

### Files

- **Create:** `src/components/Workspace/ActionBar.tsx` — Split button, 500ms debounce, picker [2][3][4], optional rejection message.
- **Modify (if needed):** `src/components/Workspace/Workspace.tsx` or `src/App.tsx` — add ActionBar below (or beside) the workspace; pass selectedBlockId, onSplitRequest; optionally render rejection message. If animation is done in Workspace, add animation logic when blocks change from 1 to N for the same “logical” split.
- **Do not modify:** FractionBlock (except if you need a small prop for animation, e.g. an animation class), reducer, engine.

### Accessibility

- Split button: aria-label e.g. “Split selected block”.
- Picker options: aria-label “Split into 2 pieces”, “Split into 3 pieces”, “Split into 4 pieces”.
- Rejection message: ensure it’s announced (e.g. aria-live region or role alert).

---

## Deliverables Checklist

### A. ActionBar

- [ ] ActionBar.tsx created with Split button (44×44pt min) and picker [2] [3] [4]
- [ ] Props: selectedBlockId, onSplitRequest; optional rejectionMessage / splitRejected
- [ ] Split button pulses or is emphasized when a block is selected
- [ ] 500ms debounce on Split (button disabled or clicks ignored for 500ms after request)
- [ ] When split would yield den > 12 (pre-check: `denominator * parts > 12`), show Sam message and do not dispatch
- [ ] After successful split, selection clears; ActionBar shows “no block selected” state

### B. Wiring and flow

- [ ] App uses useReducer; passes selectedBlockId (from state.blocks), onSelectBlock (SELECT_BLOCK), onSplitRequest (SPLIT_BLOCK after pre-check)
- [ ] onSplitRequest: if `selectedBlock.fraction.denominator * parts > 12`, show message and return; else dispatch SPLIT_BLOCK
- [ ] ENG-007 wires select + split only; ENG-009 adds combine, drag, compare

### C. Split animation

- [ ] New blocks render immediately; each animates scaleX(0) → scaleX(1), transform-origin: left, 400ms ease-out
- [ ] Total width of new blocks equals original block width (no layout jump)
- [ ] Labels visible on new blocks (state-driven via FractionBlock)

### D. Repo housekeeping

- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] Update `docs/DEVLOG.md` with ENG-007 entry when complete
- [ ] Feature branch: `feature/eng-007-split-interaction`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-007-split-interaction
# ... implement ActionBar, animation, wiring ...
git add src/components/Workspace/ActionBar.tsx src/App.tsx docs/DEVLOG.md
# add any modified Workspace/layout files
git commit -m "feat: add Split interaction, ActionBar, and split animation (ENG-007)"
git push -u origin feature/eng-007-split-interaction
```

---

## Technical Specification

### Rejection check (denominator > 12) — pre-dispatch

- **Do not** rely on post-dispatch diffing (useReducer does not give you previous state in the callback). Instead, **before** calling dispatch(SPLIT_BLOCK), check: `selectedBlock.fraction.denominator * parts > 12`. If true, show the Sam message (e.g. “Those pieces are as small as they can get!”) and do not dispatch. This is the same check the reducer uses and is a one-liner.

### Animation implementation (pinned)

- When state updates from one block to N blocks (split result), render the N new blocks in a row with their **final widths** (so total width is preserved). Apply a CSS animation to each block: start with `transform: scaleX(0); transform-origin: left;` and animate to `transform: scaleX(1)` over **400ms ease-out** (e.g. `@keyframes splitIn { from { transform: scaleX(0); } to { transform: scaleX(1); } }` with `animation: splitIn 400ms ease-out`). The blocks “grow in” from the left; combined width stays constant so there is no jump.

### Picker UX

- Clicking Split opens the picker (dropdown or inline [2] [3] [4]). Clicking 2, 3, or 4 calls onSplitRequest(2), onSplitRequest(3), or onSplitRequest(4) and closes the picker. No free-text; picker only.

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `src/components/Workspace/ActionBar.tsx` | Split button, picker [2][3][4], debounce, rejection message |

### Files to Modify (likely)

| File | Action |
|------|--------|
| `src/App.tsx` (or layout) | useReducer, pass blocks + selectedBlockId + onSelectBlock + onSplitRequest to Workspace and ActionBar; handle rejection message |
| `src/components/Workspace/Workspace.tsx` | Optional: animation wrapper when block splits |
| `docs/DEVLOG.md` | ENG-007 entry when complete |

### Files You Should NOT Modify

- `src/state/reducer.ts` — already handles SPLIT_BLOCK and rejection
- `src/engine/FractionEngine.ts` — no changes
- FractionBlock unless needed for animation class

### Files to READ

| File | Why |
|------|-----|
| `src/state/reducer.ts` | SPLIT_BLOCK, rejection when result den > 12 |
| `src/engine/FractionEngine.ts` | split(f, parts) signature |
| `docs/prd.md` Section 7.1, 10 | Intro flow; denominator > 12 message |
| `.cursor/rules/ipad-first.mdc` | 500ms debounce, 44×44pt buttons |

---

## Definition of Done for ENG-007

- [ ] ActionBar with Split button (pulses when block selected) and picker [2] [3] [4]
- [ ] 500ms debounce on Split button
- [ ] Pre-dispatch check: if `denominator * parts > 12`, show Sam message and do not dispatch
- [ ] After successful split, selection clears (new blocks have isSelected: false); ActionBar reflects no selection
- [ ] Split animation: new blocks animate scaleX(0) → scaleX(1), 400ms ease-out, transform-origin left; total width preserved
- [ ] Labels on new blocks (state-driven via FractionBlock)
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated with ENG-007 entry
- [ ] Feature branch pushed

---

## After ENG-007

- **ENG-008** (Combine) — Drag two blocks together; combine animation; different-denominator rejection message.
- **ENG-009** (Wire blocks to reducer) — Add combine, drag, compare dispatch wiring; isDragging guard; impossible-state rejection and messaging. ENG-007 covers select + split only.
