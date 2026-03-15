# ENG-048 Primer: Score Tracking + Completion Screen

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046 re-enables practice, ENG-047 verifies problems work.

---

## What Is This Ticket?

Track correct/incorrect answers across practice problems and display a final score on the completion screen. Practice transitions directly to completion (skipping the assessment phase for now).

---

## Contract

### Score tracking:
- Increment `score.total` each time a problem advances (whether solved or skipped via max attempts)
- Increment `score.correct` when `GUIDED_SOLVED` fires
- Store in existing `state.score` field

### Phase transition:
- After GP-4 completes: transition from `guided` → `complete` (skip `assess`)
- Modify `useGuidedPracticeObserver`: when last problem solved, dispatch `PHASE_TRANSITION` to `complete` instead of `assess`
- Update `PHASE_TRANSITION` validation to allow `guided` → `complete`

### Completion screen:
- Show score: "You got X of 4 correct!"
- Pass threshold: 75% (3/4) → shows "Next Lesson" and marks lesson complete
- Below threshold: shows "Try Again" (dispatches `RESTART_LESSON`)
- Remove "Practice More" button (loops to guided, which is where we came from)

### Files to modify:
- `src/state/reducer.ts` — Increment score on GUIDED_SOLVED and ADVANCE_GUIDED_PROBLEM. Allow guided → complete transition.
- `src/observers/useGuidedPracticeObserver.ts` — Change last-problem transition from `assess` to `complete`.
- `src/components/Assessment/CompletionScreen.tsx` — Update messaging for practice-only flow.

---

## Deliverables Checklist

- [ ] Score increments correctly: total on each problem, correct on solve
- [ ] Practice ends → completion screen shows with correct score
- [ ] 3/4 or 4/4 → "Next Lesson" button, lesson marked complete
- [ ] 0-2/4 → "Try Again" button
- [ ] No "Practice More" or "Retry Missed" buttons (those are assessment-specific)
- [ ] Tests pass

---

## Definition of Done

Complete all 4 practice problems (mix of correct and incorrect) → see final score → appropriate action button. Score accurately reflects performance.
