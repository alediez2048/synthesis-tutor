# ENG-053 Primer: Verify A1 Recognition (Multiple Choice)

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-052 re-enables assessment phase.

---

## What Is This Ticket?

Verify the A1 Recognition (Multiple Choice) assessment component works correctly end-to-end. Student sees a target fraction and picks the equivalent one from 4 options.

---

## Contract

### What A1 does:
- Shows: "Which fraction is the same size as 1/2?" (or 1/3, 3/4)
- 4 answer buttons with fraction options
- One correct answer, three distractors
- Correct: green highlight, score increments, advance
- Incorrect: red highlight, up to 2 attempts, then advance

### Files to verify:
- `src/components/Assessment/MultipleChoice.tsx` — UI component
- `src/content/lessons/fractions-101/assessment-pools.ts` — A1 problem sets
- `src/App.tsx` — onAnswer and onAdvance callbacks
- `src/state/reducer.ts` — ASSESSMENT_ANSWER, ADVANCE_ASSESSMENT actions

### Check:
- Options render as tappable buttons (min 44px touch target)
- Correct option triggers success sound + visual feedback
- Wrong option triggers error sound + shake/highlight
- Score updates correctly
- Advances to A2 after completion

---

## Deliverables Checklist

- [ ] A1 problem renders with target and 4 options
- [ ] Selecting correct answer: green, correct sound, score +1
- [ ] Selecting wrong answer: red, error sound, retry allowed
- [ ] After max attempts or correct: advances to A2
- [ ] Score tracked correctly

---

## Definition of Done

A1 Multiple Choice works: tap correct answer → celebration → advances. Tap wrong → feedback → retry or advance.
