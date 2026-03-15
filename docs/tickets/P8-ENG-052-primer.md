# ENG-052 Primer: Re-enable Assessment (Challenge) Phase

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046 through ENG-051 deliver complete practice module. This begins the assessment (challenge) module.

---

## What Is This Ticket?

Re-enable the guided → assessment transition. The assessment phase (A1 Recognition, A2 Construction, A3 Generalization) is fully built with UI components but currently bypassed. This ticket restores the transition and verifies the assessment orchestrator works.

---

## Contract

### Current state:
- `AssessmentPhase.tsx` — orchestrator that renders MultipleChoice, ConstructionTask, or GeneralizationTask
- `MultipleChoice.tsx` — A1: pick equivalent fraction from 4 options
- `ConstructionTask.tsx` — A2: build a target fraction from a starting block
- `GeneralizationTask.tsx` — A3: find 2+ ways to make a target fraction
- `assessment-pools.ts` — Random selection of 1 problem per type (3 total)
- Assessment state: `assessmentPool`, `assessmentStep`, `assessmentAttempts`, `assessmentResults`

### Changes needed:
- `src/observers/useGuidedPracticeObserver.ts` — Restore `PHASE_TRANSITION` to `assess` (currently goes to `complete`)
- `src/state/reducer.ts` — Ensure `PHASE_TRANSITION` from `guided` → `assess` is valid. Verify `INIT_ASSESSMENT` works.
- `src/App.tsx` — Verify assessment rendering is still wired up
- Update `isValidPhaseTransition` if needed (currently only allows sequential phases)

### Score handling:
- Practice score carries over into assessment
- Assessment adds its own correct/total to the running score
- Final score = practice + assessment combined

---

## Deliverables Checklist

- [ ] Practice → Assessment transition works
- [ ] Assessment pool randomly selects 3 problems (one per type)
- [ ] AssessmentPhase orchestrator renders correct component per step
- [ ] Score from practice carries into assessment
- [ ] TypeScript clean, tests pass

---

## Definition of Done

Complete practice → assessment phase begins with 3 problems. First problem (A1 Multiple Choice) renders correctly with options visible.
