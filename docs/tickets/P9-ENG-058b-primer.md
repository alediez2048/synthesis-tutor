# ENG-058b Primer: Strip Fantasy Theme — Visual Simplification (Part 2)

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 9: EdTech Research-Informed Redesign
**Date:** Mar 16, 2026
**Research:** Hinten et al., 2025 — Aesthetic Paradox: decorative visuals can harm learning. Every element should clarify, not distract.
**Previous work:** ENG-058a (vocabulary sweep) should be complete first. This ticket changes look and feel only.
**Depends on:** ENG-058a recommended but not strictly required. Can be done in parallel if vocabulary is already updated elsewhere.

---

## What Is This Ticket?

Simplify the visual design to reduce extraneous cognitive load. Remove decorative elements (Sparkles, crystal gradients). Replace dark fantasy background with a calmer palette. Replace or remove fantasy assets (crystal icon). **No text changes** — vocabulary is handled in ENG-058a.

### Why Split from ENG-058?

ENG-058 was split into two tickets:
- **ENG-058a:** Vocabulary only — text sweep, no design changes.
- **ENG-058b (this ticket):** Visual simplification — requires design decisions, asset changes, and visual QA.

---

## Contract

### 1. Background — `src/theme.ts`

**Current:** Dark purple gradient (`#1a0a2e` → `#2d1b69`).

**Change:** Replace with lighter, calmer palette. Options:
- Light neutral: `#f0f4f8` → `#e2e8f0`
- Soft blue-gray: `#f8fafc` → `#f1f5f9`
- Keep dark but soften: lighter purple/gray if light mode is rejected

Update `bg` and `bgGradient`. Ensure contrast for text (COLORS.text, COLORS.textMuted) remains accessible. Update `panel` and `panelBorder` if needed for new background.

**Optional:** Rename `crystal` / `crystalGlow` to `accent` / `accentLight` (semantic cleanup). These are used for highlights, borders — keep the hex values.

### 2. Fraction Blocks — `src/components/Workspace/FractionBlock.tsx`

**Current:** Block uses `linear-gradient(135deg, denomColor.bg, denomColor.bgcc)` and glow box-shadows.

**Change:**
- Background: Use flat solid color — `background: denomColor.bg`
- Box-shadow: Reduce or remove decorative glow. Keep subtle border for selected state (2px gold ring). Keep drop shadow for depth if it aids clarity.
- **Keep:** Color by denominator, grid lines, labels — all clarifying.

### 3. Sparkles — Remove Decorative Particles

**`src/components/shared/StartScreen.tsx`:**
- Remove `<Sparkles />` from the StartScreen layout.
- Import can be removed.

**`src/components/shared/Sparkles.tsx`:**
- Option A: Delete the file (if unused elsewhere).
- Option B: Leave file but unused (in case of future theme toggle).

Verify no other components import Sparkles.

### 4. Crystal Icon — `public/assets/crystal-icon.png`

**`src/components/LandingPage/LandingPage.tsx`:**
- Current: Uses `crystal-icon.png` for decorative/branding.
- **Option A:** Replace with neutral icon — fraction blocks, pizza slice, or simple geometric shape. Add new asset to `public/` and update `src`.
- **Option B:** Remove the icon — use text, emoji, or no image.
- **Option C:** Use existing generic icon if one exists in the project.

Document which option was chosen in DEVLOG.

### 5. Confetti — `src/components/shared/Confetti.tsx`

**Change:** Cosmetic only.
- Rename `CRYSTAL_PALETTE` → `CELEBRATION_PALETTE`
- Comment "crystal-colored" → "colorful"
- No behavior change. Colors stay the same (blocks remain color-coded).

### 6. Global CSS — `src/global.css`

**Check:** Is `@keyframes shimmer` used for fantasy effect?
- If yes: Remove or simplify.
- If no / used elsewhere for clarity: Leave as is.

### 7. Cascading Updates

Components that use `COLORS.bgGradient`, `COLORS.bg`, `COLORS.panel` will automatically pick up theme changes. Verify:
- `src/App.tsx` — main layout background
- `src/components/shared/StartScreen.tsx`
- `src/components/LessonSelect/LessonMap.tsx`
- Any other components with `background: COLORS.bgGradient`

Ensure text contrast (WCAG) on new background. May need to adjust `COLORS.text`, `COLORS.textMuted` if switching to light background.

---

## Asset Inventory

| Asset | Location | Action |
|-------|----------|--------|
| `crystal-icon.png` | `public/assets/` | Replace with neutral icon or remove |
| Sparkles component | `src/components/shared/Sparkles.tsx` | Remove usage; optionally delete file |
| Background | `src/theme.ts` | CSS change only — no new asset |
| Block styling | `FractionBlock.tsx` | CSS change only |

---

## Deliverables Checklist

- [ ] `src/theme.ts`: Lighter background palette; `bg`, `bgGradient` updated; optional token renames
- [ ] `src/components/Workspace/FractionBlock.tsx`: Flat block background; reduced decorative glow
- [ ] `src/components/shared/StartScreen.tsx`: Sparkles removed
- [ ] `src/components/shared/Sparkles.tsx`: Deleted or left unused
- [ ] `src/components/LandingPage/LandingPage.tsx`: Crystal icon replaced or removed
- [ ] `src/components/shared/Confetti.tsx`: CRYSTAL_PALETTE → CELEBRATION_PALETTE; comment update
- [ ] `src/global.css`: shimmer removed/simplified if fantasy-related
- [ ] All components using theme colors render correctly on new background
- [ ] Text contrast verified (accessibility)
- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] All existing tests pass
- [ ] DEVLOG updated with ENG-058b entry

---

## Definition of Done

- [ ] Background is calmer (lighter or less visually intense)
- [ ] Fraction blocks use flat colors; gradients removed
- [ ] Sparkles removed from StartScreen
- [ ] Crystal icon replaced or removed
- [ ] Confetti palette renamed (cosmetic)
- [ ] No vocabulary changes — ENG-058a handles text
- [ ] No functional regressions
- [ ] Visual QA: full lesson flow looks correct

---

## Files

### Modify

| File | Changes |
|------|---------|
| `src/theme.ts` | bg, bgGradient (lighter); optional crystal→accent renames |
| `src/components/Workspace/FractionBlock.tsx` | Flat background; reduced box-shadow |
| `src/components/shared/StartScreen.tsx` | Remove Sparkles |
| `src/components/shared/Confetti.tsx` | CRYSTAL_PALETTE rename, comment |
| `src/components/LandingPage/LandingPage.tsx` | Icon replacement/removal |
| `src/global.css` | shimmer (if fantasy-related) |
| `docs/DEVLOG.md` | ENG-058b entry |

### Delete (Optional)

| File | Condition |
|------|-----------|
| `src/components/shared/Sparkles.tsx` | If no other usages |

### Add (If Replacing Icon)

| File | Purpose |
|------|---------|
| `public/assets/fraction-icon.svg` (or similar) | Neutral icon for LandingPage |

---

## Dependencies

- ENG-058a: Recommended first (vocabulary). Not strictly required — this ticket is visual-only.

## Estimated Effort

2–3 hours (design decisions + implementation + visual QA)
