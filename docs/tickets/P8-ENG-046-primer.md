# ENG-046 Primer: Re-enable Practice Phase Transition

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** See `docs/DEVLOG.md`. Practice was fully built (observer, validation, goal card) but disabled due to UX bugs. Bugs were fixed in session (Phase A/B/C overhaul). Now re-enabling.

---

## What Is This Ticket?

Restore the explore → guided practice transition so the practice phase runs again. The guided practice system is fully implemented but currently bypassed — `SKIP_TO_GUIDED` and `ADVANCE_ROUND` both skip to `complete` instead of `guided`.

---

## Contract

### Files to modify:
- `src/state/reducer.ts` — Revert `SKIP_TO_GUIDED` to transition to `guided` phase (restore block setup via `guidedSetup` helper). Revert `ADVANCE_ROUND` exhaustion case to transition to `guided`.
- `src/App.tsx` — Re-enable `practiceEligible` (currently hardcoded `false`). Keep the Sam dialog prompt.
- `src/state/reducer.test.ts` — Update 2 tests to expect `guided` phase again.
- `src/components/shared/ProgressDots.tsx` — Re-add `guided` phase label as "Practice".

### What NOT to change:
- Observer logic (`useGuidedPracticeObserver.ts`) — already correct
- Goal card (`GuidedGoalCard.tsx`) — already correct
- Problem configs — already correct

---

## Deliverables Checklist

- [ ] `SKIP_TO_GUIDED` transitions to `guided` with blocks from `guidedSetup(lessonId, 0, nextBlockId)`
- [ ] `ADVANCE_ROUND` (when rounds exhausted) transitions to `guided` same way
- [ ] `practiceEligible` logic restored in App.tsx
- [ ] ProgressDots shows "Practice" label again
- [ ] Tests updated and passing (118/118)
- [ ] TypeScript build clean

---

## Definition of Done

User completes exploration → sees Sam dialog "Ready to practice?" → clicks "Let's practice!" → enters guided phase with correct blocks for Problem 1 (a single 1/2 block). Goal card shows "Problem 1 of 4" with prompt text. No stale explore blocks visible.
