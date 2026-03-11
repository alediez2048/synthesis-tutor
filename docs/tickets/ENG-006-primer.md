# ENG-006 Primer: FractionWorkspace Component

**For:** New Cursor Agent session  
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Date:** Mar 10, 2026  
**Previous work:** ENG-001 through ENG-005 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-006 builds the **FractionWorkspace** layout: a reference bar (1 whole) at the top, an **active blocks area** where students work, and a **comparison zone** for placing blocks side-by-side. The workspace is a presentational layout that receives `blocks` from state and renders them via `FractionBlock`; it owns no state. Action bar (Split, Combine, Check) is ENG-007+; this ticket is layout and block placement only.

### Why Does This Exist?

The PRD (Section 6.1) and DEVLOG require:

1. **Reference bar** — One whole always visible so students see the scale (1/2 = half the bar, 1/4 = quarter, etc.).
2. **Active blocks area** — Where blocks with `position: 'workspace'` live; students split/combine here.
3. **Comparison zone** — Where blocks with `position: 'comparison'` are shown side-by-side for equivalence comparison (ENG-026/027 add animations later).
4. **Single source of truth** — Blocks come from `LessonState.blocks`; workspace only receives props and renders. Pre-seeding is done by the reducer / initial state; workspace just displays what it is given.

### Current State

| Component | Status |
|-----------|--------|
| `src/components/Workspace/FractionBlock.tsx` | **Complete** (ENG-005) — accepts block, referenceWidth, onSelect |
| `src/components/Workspace/Workspace.tsx` | **Does not exist** — create here |
| `src/components/Workspace/ComparisonZone.tsx` | **Does not exist** — create here |
| `src/state/types.ts` | **Complete** (ENG-004) — FractionBlock has `position: 'workspace' \| 'comparison'` |

---

## What Was Already Done

- ENG-005: FractionBlock component; takes `referenceWidth` and `onSelect`; renders one block.
- ENG-004: LessonState.blocks, getInitialLessonState(); reducer sets block.position.
- PRD 6.1: Layout diagram — reference bar, comparison zone, workspace area; 40% chat / 60% workspace in landscape (chat is ENG-010; this ticket can focus on the 60% workspace column or a full-width workspace for standalone demo).
- iPad-first: touch-action, 60×60pt blocks; workspace is the manipulative area.

---

## ENG-006 Contract

### Props (Workspace)

The main workspace component should accept at least:

- **blocks:** `FractionBlock[]` — the list of blocks from `LessonState.blocks`. Workspace does not fetch or own this; parent passes it.
- **referenceWidth?: number** — width in px (or equivalent) that represents “1 whole” for the reference bar and for sizing FractionBlocks. Can be derived from a container ref or passed as a prop; default acceptable for standalone (e.g. 300).
- **onSelectBlock?: (blockId: string) => void** — called when a block is tapped; parent will dispatch `SELECT_BLOCK`. Optional for this ticket if you only need layout; required once wired in ENG-009.

### Layout Structure

1. **Reference bar (top)**  
   - Always visible.  
   - Represents “1 whole”: same width as the workspace content area (or the given reference width).  
   - Visual: full-width bar (e.g. gray #9E9E9E per PRD for whole), labeled “1” or “1/1”.  
   - Height: enough for a clear bar (e.g. 24–32px). No blocks here; it’s the scale reference.

2. **Comparison zone (middle)**  
   - Region for blocks with `position === 'comparison'`.  
   - Render blocks where `block.position === 'comparison'` in a row/flex layout.  
   - Can be a dedicated component `ComparisonZone.tsx` that receives `blocks: FractionBlock[]` (filtered to comparison) and `referenceWidth`, `onSelectBlock`, and renders `FractionBlock` for each.  
   - If empty, show placeholder text or empty state (e.g. “Drop blocks here to compare”).

3. **Active blocks area / workspace (bottom)**  
   - Region for blocks with `position === 'workspace'`.  
   - Render blocks where `block.position === 'workspace'`.  
   - Same sizing and interaction as comparison: use FractionBlock with `referenceWidth` and `onSelectBlock(block.id)`.

### Block placement

- Split `blocks` by `block.position`:  
  - `workspaceBlocks = blocks.filter(b => b.position === 'workspace')`  
  - `comparisonBlocks = blocks.filter(b => b.position === 'comparison')`  
- Pass the appropriate list (and referenceWidth, onSelectBlock) to the comparison zone and to the active-block area.  
- **Pre-seeded:** Parent passes `getInitialLessonState().blocks` (or current state.blocks); workspace does not seed. “Pre-seeded based on lesson phase” means the reducer/App provides the right blocks for the phase; workspace only displays them.

### Files

- **Create:** `src/components/Workspace/Workspace.tsx` — top-level layout: reference bar, then ComparisonZone, then active blocks area.  
- **Create:** `src/components/Workspace/ComparisonZone.tsx` — receives comparison blocks (and referenceWidth, onSelectBlock), renders FractionBlocks in a row; optional empty state.  
- **Do not modify:** FractionBlock.tsx, state types, or reducer.  
- **Do not add:** Action bar (Split/Combine/Check) — ENG-007 and later.

### Accessibility and layout

- Reference bar and both zones should be in a logical order for screen readers (reference first, then comparison, then workspace).  
- Workspace area: consider `touch-action: none` on the manipulative region (ipad-first.mdc) so scroll and drag can be disambiguated later (ENG-008).  
- Use semantic structure (e.g. sections/regions) and aria-labels where helpful (e.g. “Reference bar”, “Comparison zone”, “Workspace”).

---

## Deliverables Checklist

### A. Workspace.tsx

- [ ] Component accepts `blocks: FractionBlock[]`, optional `referenceWidth`, optional `onSelectBlock`
- [ ] Renders reference bar at top (1 whole, full width of content, labeled 1/1 or 1)
- [ ] Renders comparison zone (middle) with blocks where `position === 'comparison'`
- [ ] Renders active blocks area (bottom) with blocks where `position === 'workspace'`
- [ ] Uses FractionBlock for every block; passes `referenceWidth` and `onSelect` (wiring `onSelectBlock(block.id)`)

### B. ComparisonZone.tsx

- [ ] Accepts props needed to render comparison blocks (e.g. `blocks: FractionBlock[]`, `referenceWidth`, `onSelectBlock`)
- [ ] Renders FractionBlock for each; shows empty state when no blocks

### C. Integration

- [ ] Workspace can be rendered with `blocks={getInitialLessonState().blocks}` (and optional referenceWidth) for manual verification
- [ ] No internal state for blocks — all from props
- [ ] TypeScript builds and lint passes

### D. Repo Housekeeping

- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] Update `docs/DEVLOG.md` with ENG-006 entry when complete
- [ ] Feature branch: `feature/eng-006-fraction-workspace`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-006-fraction-workspace
# ... implement Workspace.tsx, ComparisonZone.tsx ...
git add src/components/Workspace/Workspace.tsx src/components/Workspace/ComparisonZone.tsx docs/DEVLOG.md
git commit -m "feat: add FractionWorkspace layout and ComparisonZone (ENG-006)"
git push -u origin feature/eng-006-fraction-workspace
```

Use Conventional Commits: `feat:` for new feature.

---

## Technical Specification

### Reference bar

- Width: same as the content area used for blocks (e.g. a fixed `referenceWidth` or 100% of workspace content width).
- One whole = that width. FractionBlocks already use `referenceWidth` for their width; keep the same value so 1/2 block is half the bar.
- Label: “1” or “1/1” (PRD shows “REFERENCE: [████████ 1/1]”). Color #9E9E9E for whole.

### Reference width

- If workspace is inside a container with known width, pass that as `referenceWidth` or measure via ref and pass to children. For a standalone demo, a default (e.g. 300px) is fine. ENG-009 may wire container width from layout.

### ComparisonZone empty state

- When `blocks.length === 0`, show a short message or dashed border so the zone is visible (e.g. “Drop blocks here to compare” or “Comparison zone”). Keeps layout stable and clarifies purpose.

### Order of sections

- Top → bottom: Reference bar → Comparison zone → Active blocks area. Matches PRD diagram and reading order.

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `src/components/Workspace/Workspace.tsx` | Layout: reference bar, ComparisonZone, active blocks area |
| `src/components/Workspace/ComparisonZone.tsx` | Renders blocks with position 'comparison'; empty state |

### Files to Modify

| File | Action |
|------|--------|
| `docs/DEVLOG.md` | Add ENG-006 entry when complete |

### Files You Should NOT Modify

- `src/components/Workspace/FractionBlock.tsx` — use as-is
- `src/state/types.ts`, reducer — no changes
- No ActionBar or chat in this ticket

### Files to READ for Context

| File | Why |
|------|-----|
| `src/state/types.ts` | FractionBlock, position: 'workspace' \| 'comparison' |
| `src/components/Workspace/FractionBlock.tsx` | Props: block, referenceWidth, onSelect |
| `docs/prd.md` Section 6.1 | Layout diagram, reference bar, zones |
| `.cursor/rules/ipad-first.mdc` | touch-action on workspace, 60×60pt |

### Cursor Rules to Follow

- `ipad-first.mdc` — touch targets; consider `touch-action: none` on manipulative area
- `architecture.mdc` — workspace receives data via props; no direct reducer/state ownership

---

## Definition of Done for ENG-006

- [ ] Workspace.tsx renders reference bar (1 whole), comparison zone, and active blocks area
- [ ] Blocks rendered from props; workspace and comparison blocks split by `block.position`
- [ ] ComparisonZone.tsx renders comparison blocks and empty state
- [ ] FractionBlock used for all blocks with shared referenceWidth and onSelectBlock
- [ ] No internal state for blocks; pre-seeding is parent’s responsibility
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated with ENG-006 entry
- [ ] Feature branch pushed

---

## After ENG-006

- **ENG-007** (Split interaction) — Action bar with Split button; tap block (already in workspace) → select → Split picker; workspace layout is in place.
- **ENG-008** (Combine) — Drag-and-drop; workspace/ComparisonZone may host drop targets.
- **ENG-009** (Wire blocks to reducer) — App or layout passes state.blocks and dispatch to workspace; onSelectBlock dispatches SELECT_BLOCK.
