# ENG-005 Primer: FractionBlock Component

**For:** New Cursor Agent session  
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Date:** Mar 10, 2026  
**Previous work:** ENG-001 through ENG-004 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-005 builds the **FractionBlock** component: the visual representation of a fraction as a colored rectangle with subdivision grid lines, sized proportionally to its value. It is a presentational component that receives a `FractionBlock` from state and renders it. Tap-to-select is part of this ticket; drag-and-drop is added in ENG-008.

### Why Does This Exist?

The manipulative is the core of the lesson. Students see and touch fraction blocks to build intuition. FractionBlock must:

1. **Map math to visuals** — width = fraction value relative to a reference whole (1/2 = 50%, 1/4 = 25%).
2. **Show structure** — grid lines by denominator so “fourths” are visibly divided into 4.
3. **Stay consistent** — color by denominator family (PRD 6.2) so halves are always blue, thirds green, etc.
4. **Meet iPad HIG** — minimum 60×60pt touch target (`.cursor/rules/ipad-first.mdc`).
5. **Support selection** — selected state (blue glow) for Split and later Combine; no hover-only behavior.

### Current State

| Component | Status |
|-----------|--------|
| `src/components/` | **Exists** — scaffold from ENG-001 (e.g. `Workspace/` dir or `.gitkeep`) |
| `src/components/Workspace/FractionBlock.tsx` | **Does not exist** — create here |
| `src/state/types.ts` | **Complete** (ENG-004) — `FractionBlock` interface (id, fraction, color, position, isSelected) |
| `src/state/reducer.ts` | **Complete** (ENG-004) — `getColorForDenominator()` for denominator-family colors |

---

## What Was Already Done

- ENG-004: `FractionBlock` type in `types.ts`; reducer uses `getColorForDenominator` (can re-use or duplicate in component for consistency).
- PRD Section 6.2: Color coding by denominator, block sizing (width proportional to value), 60×60pt minimum.
- DEVLOG ENG-005: acceptance criteria and single file to create.
- iPad-first rule: 60×60pt for blocks, no hover-only interactions.

---

## ENG-005 Contract

### Props

The component should accept at least:

- **block:** `FractionBlock` (from `src/state/types.ts`) — id, fraction, color, position, isSelected.
- **referenceWidth?: number** (or **widthPercent?: number**) — so the block can be sized relative to the reference bar. If the reference bar is “1 whole”, then block width = `(block.fraction.numerator / block.fraction.denominator) * referenceWidth` (or equivalent percentage). If not provided, a sensible default (e.g. 100% of container or a fixed width) is acceptable for a standalone demo; ENG-006 will pass reference width from the workspace.
- **onSelect?: () => void** — called when the block is tapped. Parent (workspace) will dispatch `SELECT_BLOCK`. Optional for this ticket if you render in isolation first; required once wired in ENG-006/ENG-009.

### Visual Requirements

| Requirement | Detail |
|-------------|--------|
| **Element** | DOM element (div or similar), not Canvas. |
| **Width** | Proportional to fraction value. 1/2 = 50% of reference bar width, 1/4 = 25%, etc. Formula: `(numerator / denominator) * referenceWidth` (in same units as reference). |
| **Grid lines** | Show denominator subdivisions (e.g. 4 vertical lines for fourths so 4 equal columns). Use CSS (borders, background-image, or sub-elements). |
| **Color** | Use `block.color` from state (reducer already sets denominator family). PRD hex values: 2=#4A90D9, 3=#27AE60, 4=#8E44AD, 6=#E67E22, 8=#16A085, 12=#E84393; whole=#9E9E9E. |
| **Min size** | Minimum 60×60pt (or px) touch target. |
| **Label** | Show fraction value as text (e.g. `"1/4"`, `"2/3"`). |
| **Selected state** | When `block.isSelected === true`, show a clear visual indicator (e.g. blue glow ring, outline, or box-shadow). |
| **aria-label** | Spoken fraction description (e.g. `"One fourth"`, `"Two thirds"`) for screen readers. |

### Behavior

- **Tap:** On tap/click, call `onSelect` if provided. No drag in this ticket.
- **No internal state:** Component is controlled; selection comes from `block.isSelected`. Do not store “selected” in component state.

### Files

- **Create:** `src/components/Workspace/FractionBlock.tsx`
- **Do not create:** Tests are optional for this ticket per DEVLOG; if you add a test file, use Vitest + React Testing Library and keep it minimal (e.g. renders with block, shows label, applies selected style).
- **Do not modify:** `src/state/types.ts`, reducer, or engine.

---

## Deliverables Checklist

### A. Component

- [ ] `FractionBlock.tsx` created under `src/components/Workspace/`
- [ ] Accepts `block: FractionBlock` and optional `referenceWidth` (or width %) and `onSelect`
- [ ] Colored rectangle (DOM, not Canvas), width proportional to fraction value
- [ ] Grid lines for denominator subdivisions
- [ ] Uses `block.color`; minimum 60×60pt
- [ ] Label showing fraction (e.g. `"1/4"`)
- [ ] Selected state: visual indicator (blue glow ring or equivalent)
- [ ] `aria-label` with spoken fraction (e.g. "One fourth")

### B. Integration

- [ ] Component can be rendered with a single `FractionBlock` (e.g. from `getInitialLessonState().blocks[0]`) for manual verification
- [ ] No dependency on reducer or dispatch inside the component — only props

### C. Repo Housekeeping

- [ ] TypeScript builds (`npx tsc -b`)
- [ ] Lint passes (`npm run lint`)
- [ ] Update `docs/DEVLOG.md` with ENG-005 entry when complete
- [ ] Feature branch: `feature/eng-005-fraction-block`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-005-fraction-block
# ... implement FractionBlock.tsx ...
git add src/components/Workspace/FractionBlock.tsx docs/DEVLOG.md
git commit -m "feat: add FractionBlock component (ENG-005)"
git push -u origin feature/eng-005-fraction-block
```

Use Conventional Commits: `feat:` for new feature.

---

## Technical Specification

### Fraction label

Display as `"${block.fraction.numerator}/${block.fraction.denominator}"` (e.g. `"1/4"`). No simplification required in the label; state may hold unsimplified fractions.

### aria-label

Use a readable phrase: e.g. "One fourth", "Two thirds", "One half". You can use a small helper (e.g. map numerator/denominator to words for 1–12) or keep it simple: "Fraction 1 over 4" if preferred. Consistency with Sam’s voice is not required for the label.

### Width calculation

- Parent (workspace, ENG-006) will provide a “reference bar” width (e.g. 400px or 100% of a container). One whole = that width.
- Block width = `(numerator / denominator) * referenceWidth` (same unit).
- For a standalone story or test, pass e.g. `referenceWidth={200}` so 1/2 = 100px, 1/4 = 50px.

### Grid lines

- Denominator N → N equal vertical segments (e.g. 4 fourths → 3 vertical dividers or 4 columns). Use CSS (e.g. `background-image` with linear-gradient, or inner divs with flex/grid). Avoid Canvas.

### Selected style

- Blue glow: e.g. `box-shadow: 0 0 0 3px #4A90D9` or `outline: 3px solid #4A90D9` when `block.isSelected`. Ensure 60×60pt minimum is still satisfied including the ring.

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `src/components/Workspace/FractionBlock.tsx` | Implement FractionBlock component |

### Files to Modify

| File | Action |
|------|--------|
| `docs/DEVLOG.md` | Add ENG-005 entry when complete |

### Files You Should NOT Modify

- `src/state/types.ts` — FractionBlock type is fixed
- `src/state/reducer.ts` — no changes
- Engine or other components

### Files to READ for Context

| File | Why |
|------|-----|
| `src/state/types.ts` | FractionBlock interface |
| `docs/prd.md` Section 6.2 | Color table, block sizing, 60×60pt |
| `.cursor/rules/ipad-first.mdc` | Touch targets, no hover-only |

### Cursor Rules to Follow

- `ipad-first.mdc` — 60×60pt minimum, no hover-only interactions
- `architecture.mdc` — component receives data via props; no direct reducer/state ownership

---

## Definition of Done for ENG-005

- [ ] FractionBlock component renders a colored rectangle with grid lines and label
- [ ] Width proportional to fraction value (given reference width)
- [ ] Color from `block.color`; minimum 60×60pt touch target
- [ ] Selected state shows blue glow (or equivalent)
- [ ] `aria-label` with spoken fraction description
- [ ] Optional `onSelect` called on tap
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated with ENG-005 entry
- [ ] Feature branch pushed

---

## After ENG-005

- **ENG-006** (FractionWorkspace) — uses FractionBlock to render `LessonState.blocks`; reference bar and layout live there.
- **ENG-007** (Split interaction) — tap block → select (FractionBlock already supports selection UI); action bar and split picker added.
- **ENG-008** (Combine) — drag added to FractionBlock; this ticket is presentational + tap only.
