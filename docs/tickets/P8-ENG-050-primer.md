# ENG-050 Primer: Sam Coaching During Practice

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046 through ENG-049 deliver working practice flow.

---

## What Is This Ticket?

Add contextual Sam hints during practice. Currently Sam only says "Not quite — try again!" on failure. Students need problem-specific guidance.

---

## Contract

### Hint system per problem type:
- **GP-1 (split)**: "Tap the crystal, then press Split Crystal!"
- **GP-2 (build-equivalent)**: "Try splitting the 1/3 into smaller pieces. Can you make pieces that add up to 1/3 but look different?"
- **GP-3 (compare)**: "Drag both crystals to the Spell Altar to compare them!"
- **GP-4 (simplify)**: "Can you combine pieces to make a simpler fraction? Try fusing two pieces together!"

### When hints fire:
- 1st failed attempt: generic encouragement + hint
- 2nd failed attempt: more specific hint + demo (if available)
- 3rd attempt (maxAttempts): auto-advance with "Let's move on"

### Files to modify:
- `src/content/lessons/fractions-101/guided-problems.ts` — Add `hint` field to each problem config
- `src/content/guided-practice-config.ts` — Add `hint` to `GuidedProblemConfig` interface
- `src/observers/useGuidedPracticeObserver.ts` — Use hint in failure feedback

---

## Deliverables Checklist

- [ ] Each problem has a specific hint message
- [ ] Hint shown on first failure instead of generic "Not quite"
- [ ] More specific hint on second failure
- [ ] Auto-advance on third failure with encouraging message
- [ ] Sam messages feel natural and age-appropriate

---

## Definition of Done

Failing a problem shows progressively more helpful hints from Sam. No generic "Not quite" without context. Student always knows what to try next.
