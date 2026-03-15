# ENG-056 Primer: Final Scoring & Completion Screen

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046 through ENG-055 deliver complete practice + assessment flow.

---

## What Is This Ticket?

Finalize the completion screen to show combined scores from practice (4 problems) and assessment (3 problems), with appropriate messaging and next steps.

---

## Contract

### Score breakdown:
- Practice: X/4 (from guided phase)
- Assessment: Y/3 (from assess phase)
- Total: (X+Y)/7
- Display both breakdowns and total

### Pass/fail logic:
- Pass threshold: 67% overall (5/7 or better)
- Pass: "Next Lesson" button → marks lesson complete, returns to lesson map
- Fail: "Try Again" button → restarts from explore
- Optional: "Practice More" → loops back to guided midpoint

### Completion screen updates:
- Show practice score and assessment score separately
- Sam's message adapts: perfect score, passed, almost, needs practice
- Concepts discovered section (existing)
- Confetti on pass (existing)

### Files to modify:
- `src/components/Assessment/CompletionScreen.tsx` — Score display, messaging, button logic
- `src/App.tsx` — Pass correct score data, handle button actions
- `src/state/reducer.ts` — Ensure score accumulates correctly across phases

---

## Deliverables Checklist

- [ ] Combined score displayed: practice + assessment
- [ ] Sam's message reflects performance level
- [ ] Pass (67%+): "Next Lesson" button, lesson marked complete
- [ ] Fail: "Try Again" button
- [ ] Confetti on pass
- [ ] Score persists in progressStore

---

## Definition of Done

Full flow: Tutorial → Explore → Practice (4) → Assessment (3) → Completion screen with combined 7-problem score. Pass/fail determines next steps. Lesson completion persisted.
