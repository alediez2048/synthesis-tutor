# ENG-049 Primer: Practice Polish & Edge Cases

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046/047/048 deliver working practice + scoring.

---

## What Is This Ticket?

Handle failure paths, hints, and edge cases in the practice module. Ensure no dead ends and Sam provides helpful feedback throughout.

---

## Contract

### Failure handling:
- After 2 failed attempts on GP-2 or GP-4: demo re-model plays (existing system)
- After demo: problem resets, student retries
- After 3 total failures (maxAttempts): auto-advance to next problem, mark as incorrect
- Sam's messages on failure: encouraging, not punitive

### Sam integration:
- Sam acknowledges correct: "Great job!" / "You got it!"
- Sam acknowledges incorrect: "Not quite — try again!" (existing)
- Sam acknowledges skip (max attempts): "Let's move on — you'll get it next time!"

### Edge cases:
- User splits when they should combine (or vice versa) — no crash
- User drags all blocks to altar during a split problem — doesn't falsely validate
- User presses "Start fresh" or "New crystal" during practice — doesn't break state
- CFU questions: decide whether to keep or remove (they interrupt flow)

### Files to modify:
- `src/observers/useGuidedPracticeObserver.ts` — Max attempts enforcement, Sam messages
- `src/App.tsx` — Disable "New crystal"/"Start fresh" during guided phase if needed

---

## Deliverables Checklist

- [ ] Demo re-model fires after 2 failures on GP-2 and GP-4
- [ ] Max attempts (3) auto-advances to next problem
- [ ] Sam provides appropriate feedback for correct/incorrect/skip
- [ ] No dead ends in any failure path
- [ ] Workspace utility buttons handled during practice
- [ ] CFU questions kept or removed (documented decision)

---

## Definition of Done

Practice flow handles all paths gracefully: success on first try, success after retry, failure with demo, failure with max attempts skip. No stuck states. Sam's feedback is contextually appropriate.
