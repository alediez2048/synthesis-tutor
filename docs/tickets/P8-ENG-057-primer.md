# ENG-057 Primer: End-to-End Integration Test

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046 through ENG-056 deliver complete practice + assessment + scoring.

---

## What Is This Ticket?

Full end-to-end walkthrough of the entire lesson flow. Verify every phase transition, score accumulation, and edge case. Document any remaining bugs.

---

## Contract

### Full flow to test:
1. Landing → Lesson Map → Select "What Are Fractions?"
2. Start Screen → Begin
3. Tutorial (steps 0-11): all demos, split, combine, altar match/mismatch
4. Explore (rounds 1-5): split, combine, different split, comparison, free play
5. Sam dialog: "Ready to practice?" → "Let's practice!"
6. Practice (GP 1-4): split, build-equivalent, compare, simplify
7. Assessment (A1-A3): multiple choice, construction, generalization
8. Completion: score displayed, pass/fail, next lesson or retry
9. Return to Lesson Map: lesson marked complete, Lesson 2 unlocked

### Edge cases to test:
- Refresh mid-practice → checkpoint restore
- Fail all practice problems → score reflects 0/4
- Fail all assessment problems → score reflects 0/3
- Perfect score → confetti + "Next Lesson"
- Click "Try Again" → restarts from explore

### Files:
- No code changes expected — this is a test-only ticket
- Document any bugs found as follow-up tickets

---

## Deliverables Checklist

- [ ] Full flow completed without crashes
- [ ] All phase transitions smooth
- [ ] Scores accurate at each stage
- [ ] Checkpoint restore works
- [ ] All edge cases tested
- [ ] Bug list documented (if any)

---

## Definition of Done

One complete playthrough of the entire lesson with no bugs. All phases, scores, and transitions verified. Any remaining issues documented as follow-up tickets.
