# ENG-054 Primer: Verify A2 Construction Task

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-053 verifies A1.

---

## What Is This Ticket?

Verify the A2 Construction assessment component works. Student builds a target fraction by splitting a starting block using the workspace manipulatives.

---

## Contract

### What A2 does:
- Shows: "Build 1/2 from this whole crystal" (or 2/3 from whole, 1/4 from 1/2)
- Workspace has a starting block (e.g. 1/1)
- Student splits/combines to create the target fraction
- Validation: workspace contains a block equivalent to target
- Up to 3 attempts

### Files to verify:
- `src/components/Assessment/ConstructionTask.tsx` — UI component
- `src/content/lessons/fractions-101/assessment-pools.ts` — A2 problem sets
- Workspace integration during assessment (blocks, split, combine work)

### Check:
- Starting block appears correctly
- Split/combine actions work during assessment
- Target fraction clearly displayed
- Correct construction triggers success
- Wrong construction allows retry
- Advances to A3 after completion

---

## Deliverables Checklist

- [ ] A2 renders with starting block and target display
- [ ] Workspace manipulatives (split/combine) work during assessment
- [ ] Building correct fraction: celebration, score +1
- [ ] Wrong construction: feedback, retry
- [ ] After max attempts or correct: advances to A3

---

## Definition of Done

A2 Construction works: split starting block to build target → celebration → advances. Workspace is interactive during assessment.
