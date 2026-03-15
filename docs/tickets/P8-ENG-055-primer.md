# ENG-055 Primer: Verify A3 Generalization Task

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-054 verifies A2.

---

## What Is This Ticket?

Verify the A3 Generalization assessment component works. Student finds 2+ different ways to make a target fraction, demonstrating deep understanding.

---

## Contract

### What A3 does:
- Shows: "Find 2 different fractions that equal 1/2" (or 1/3)
- Student uses workspace to build equivalent fractions
- Each valid equivalent fraction is recorded
- Must find at least 2 different representations
- E.g. for 1/2: could build 2/4, 3/6, 4/8

### Files to verify:
- `src/components/Assessment/GeneralizationTask.tsx` — UI component
- `src/content/lessons/fractions-101/assessment-pools.ts` — A3 problem sets
- Validation logic for detecting unique equivalent fractions

### Check:
- Target clearly displayed with count needed ("Find 2 ways")
- Each valid submission is tracked and shown
- Duplicate submissions rejected
- After requiredCount met: success, score +1
- Advances to completion after A3

---

## Deliverables Checklist

- [ ] A3 renders with target and required count
- [ ] Valid equivalent fractions accepted and tracked
- [ ] Duplicates rejected with feedback
- [ ] Meeting required count: celebration, score +1
- [ ] After A3: transitions to completion screen

---

## Definition of Done

A3 Generalization works: student finds 2+ equivalent fractions → celebration → transitions to completion with final combined score.
