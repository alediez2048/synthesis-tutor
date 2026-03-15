# ENG-047 Primer: Verify Practice Problems 1-4

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046 re-enables practice phase. This ticket verifies all 4 problems work.

---

## What Is This Ticket?

Walk through all 4 guided practice problems and confirm each validates correctly. Fix any validation bugs found. Ensure goal card, success feedback, and problem transitions all work.

---

## Contract

### Problems to verify:
1. **GP-1 (split)**: Setup: 1/2. Goal: split it. Validation: more blocks than setup, recombine to 1/2.
2. **GP-2 (build-equivalent)**: Setup: 1/3. Goal: build equivalent (e.g. 2/6). Validation: combined workspace equivalent to 1/3 with different representation.
3. **GP-3 (compare)**: Setup: 1/2, 3/6. Goal: drag both to altar. Validation: 2+ blocks in comparison zone, equivalent.
4. **GP-4 (simplify)**: Setup: 2/4. Goal: simplify. Validation: combined workspace equivalent to 2/4 with smaller denominator.

### For each problem verify:
- Correct blocks appear on workspace (from setup config)
- Goal card shows correct prompt text
- Performing the correct action triggers "Correct!" celebration (1.5s green card)
- Problem advances to next after celebration
- Wrong actions show "Not quite — try again!" (not on first block selection)

### Files that may need fixes:
- `src/observers/useGuidedPracticeObserver.ts` — validation logic
- `src/content/lessons/fractions-101/guided-problems.ts` — problem prompts/setup
- `src/content/guided-demo-scripts.ts` — demo scripts for re-modeling

---

## Deliverables Checklist

- [ ] GP-1 solvable: split 1/2 → Correct!
- [ ] GP-2 solvable: build equivalent to 1/3 → Correct!
- [ ] GP-3 solvable: compare 1/2 and 3/6 → Correct!
- [ ] GP-4 solvable: simplify 2/4 → Correct!
- [ ] Goal card shows correct prompt for each
- [ ] Green "Correct!" state shows for 1.5s between problems
- [ ] No dead ends or stuck states

---

## Definition of Done

All 4 problems solvable with clear goal display and success feedback. Manual walkthrough confirms the full sequence GP-1 → GP-2 → GP-3 → GP-4 with no bugs.
