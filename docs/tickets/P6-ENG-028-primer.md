# ENG-028 Primer: Celebration Confetti

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 6: Polish + Edge Cases (Day 6)
**Date:** Mar 12, 2026
**Previous work:** ENG-022 (CompletionScreen), ENG-024 (SoundManager with celebration sound). See `docs/DEVLOG.md`.
**Time-box:** 2 hours max (per PRD risk register — ship without confetti if needed).

---

## What Is This Ticket?

ENG-028 adds a **confetti animation** that fires when the student scores 3/3 on the assessment (lesson completion). Crystal-colored particles fall from the top of the screen and fade out over 2 seconds. This is a **visual-only** ticket — no state, API, or logic changes.

### Why Does This Exist?

Kids ages 8-12 need celebratory feedback for achievement. The completion screen already has a celebration sound (ENG-024) and Sam's congratulatory message, but there's no visual fireworks moment. Confetti makes the 3/3 perfect score feel special and rewarding.

### How It Currently Works

1. Assessment completes → reducer transitions phase to `'complete'` via `ADVANCE_ASSESSMENT`
2. `App.tsx` useEffect detects `phase === 'complete'` and `score.correct === 3`
3. `playCelebration()` fires the ascending arpeggio sound
4. `CompletionScreen` renders with "You're a fraction master!" message
5. **No visual celebration exists yet** — this ticket adds it

---

## Contract

### 1. Create `src/components/shared/Confetti.tsx`

A self-contained confetti component that renders and auto-cleans up.

**Props:**
```typescript
export interface ConfettiProps {
  /** Number of particles to spawn. Default: 60 */
  count?: number;
  /** Total animation duration in ms. Default: 2000 */
  duration?: number;
  /** Callback when animation completes (for cleanup/unmount) */
  onComplete?: () => void;
}
```

**Behavior:**
- On mount, generate `count` particles with randomized:
  - Horizontal position: `Math.random() * 100` vw
  - Start offset: `Math.random() * -20`vh (stagger entry from above viewport)
  - Fall distance: `100vh + 20vh` (exit below viewport)
  - Horizontal drift: random `translateX` between -60px and +60px
  - Rotation: random 0–720deg
  - Size: 8–14px
  - Color: randomly picked from crystal palette (Sapphire `#4A90D9`, Emerald `#27AE60`, Amethyst `#8E44AD`, Citrine `#F39C12`, Topaz `#E67E22`, Aquamarine `#16A085`, Rose Quartz `#E84393`, Gold `#FDCB6E`)
  - Shape: mix of small squares and rectangles (aspect ratio 1:1 or 1:1.5)
  - Delay: `Math.random() * 400`ms (stagger start)
- Animation: CSS `@keyframes confetti-fall` using **only** `transform` and `opacity` (composited properties per PRD Appendix B)
  - `0%`: `translateY(startOffset) rotate(0deg)`, `opacity: 1`
  - `80%`: `opacity: 1`
  - `100%`: `translateY(100vh) translateX(drift) rotate(rotation)`, `opacity: 0`
- Duration: `2000ms`, easing: `linear`
- After all particles finish, call `onComplete` (use longest delay + duration)
- Respect `prefers-reduced-motion`: if enabled, skip animation entirely and call `onComplete` immediately
- Container: `position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden`
- `aria-hidden="true"` (purely decorative)

### 2. Modify `src/App.tsx`

**Trigger confetti alongside the existing celebration sound.**

In the existing `useEffect` that handles `phase === 'complete'`:
- When `score.correct === 3 && score.total === 3`, set a `showConfetti` state to `true`
- Render `<Confetti onComplete={() => setShowConfetti(false)} />` when `showConfetti` is true
- The component self-cleans via `onComplete`

```typescript
// Existing code already does:
if (state.score.correct === 3 && state.score.total === 3) {
  playCelebration();
}
// Add:
if (state.score.correct === 3 && state.score.total === 3) {
  playCelebration();
  setShowConfetti(true);
}
```

### 3. Modify `src/components/Assessment/CompletionScreen.tsx`

No structural changes. Just ensure the confetti renders **above** the completion screen (it's fixed + z-index 9999, so it should layer correctly). No changes needed if the confetti is rendered in App.tsx.

---

## Deliverables Checklist

- [ ] `src/components/shared/Confetti.tsx` created
- [ ] 60 particles with crystal colors fall from top, fade out over 2s
- [ ] Animation uses ONLY `transform` and `opacity` (no layout-triggering properties)
- [ ] `prefers-reduced-motion` respected (no animation if enabled)
- [ ] Confetti triggers on 3/3 perfect score alongside celebration sound
- [ ] Confetti does NOT trigger on 2/3, 1/3, or 0/3
- [ ] Component auto-cleans up after animation completes
- [ ] `aria-hidden="true"` on confetti container
- [ ] `pointer-events: none` so confetti doesn't block clicks
- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] All existing tests pass (no logic changes)
- [ ] DEVLOG updated with ENG-028 entry

---

## Definition of Done

- [ ] Scoring 3/3 shows crystal-colored confetti falling + celebration sound
- [ ] Scoring < 3/3 shows NO confetti
- [ ] Confetti disappears after 2 seconds, no DOM residue
- [ ] Animation is smooth 60fps (composited properties only)
- [ ] Reduced motion users see no animation
- [ ] No functional regressions

---

## Files

### Create

| File | Purpose |
|------|---------|
| `src/components/shared/Confetti.tsx` | Self-contained confetti particle animation |

### Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `showConfetti` state, trigger on 3/3, render `<Confetti>` |
| `docs/DEVLOG.md` | Add ENG-028 entry |

### Do Not Modify

- `src/state/reducer.ts` — No state changes
- `src/state/types.ts` — No type changes
- `src/components/Assessment/CompletionScreen.tsx` — Confetti renders in App.tsx, not here
- `src/audio/SoundManager.ts` — Celebration sound already exists
- Test files — Visual only, no test changes

---

## Existing Patterns to Follow

**CSS keyframes** (see `ProgressDots.tsx`, `MultipleChoice.tsx`, `InputField.tsx`):
- Define `@keyframes` in a `<style>` tag or inline
- Use `animation` shorthand with duration, easing, fill-mode

**Web Animations API** (see `FractionBlock.tsx`):
- Alternative approach if preferred, but CSS keyframes are simpler for many particles

**Crystal colors** from `src/state/reducer.ts`:
```typescript
const CRYSTAL_COLORS = ['#4A90D9', '#27AE60', '#8E44AD', '#F39C12', '#E67E22', '#16A085', '#E84393', '#FDCB6E'];
```

**Celebration trigger** in `App.tsx` (lines ~167-181):
```typescript
if (state.score.correct === 3 && state.score.total === 3) {
  playCelebration(); // ← add setShowConfetti(true) here
}
```
