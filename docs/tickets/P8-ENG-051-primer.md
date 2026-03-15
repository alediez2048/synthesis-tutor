# ENG-051 Primer: Practice Problem Content Review

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 8: Practice & Scoring Module
**Date:** Mar 15, 2026
**Previous work:** ENG-046 through ENG-050 deliver working practice with hints.

---

## What Is This Ticket?

Review and improve the 4 practice problem prompts, setup blocks, and difficulty progression. Ensure problems are clear, age-appropriate, and build on each other.

---

## Contract

### Review criteria:
- Are the prompts clear for an 8-year-old?
- Does the setup (starting blocks) make the goal achievable?
- Is the difficulty progression appropriate (easy → hard)?
- Are there enough problems? Should we add a 5th?
- Do the prompts use Sam's wizard vocabulary consistently?

### Current problems to review:
1. "See that blue block? That's one-half. Tap it and press Split."
2. "Can you make a fraction that's the same size as 1/3? Use the blocks to build it!"
3. "Look at these two blocks. Are they the same size? Drag them both to the comparison area!"
4. "Here's a trickier one. What's the simplest way to write 2/4?"

### Files to modify:
- `src/content/lessons/fractions-101/guided-problems.ts` — Problem prompts and setup
- `src/content/guided-demo-scripts.ts` — Update demos if problem setup changes

---

## Deliverables Checklist

- [ ] All prompts reviewed and updated for clarity
- [ ] Wizard vocabulary used consistently ("crystals", "spell altar", etc.)
- [ ] Difficulty progression feels natural
- [ ] Optional: 5th problem added if needed
- [ ] Demo scripts updated if any setup changed

---

## Definition of Done

All practice prompts are clear, age-appropriate, use wizard vocabulary, and progress from easy to challenging. A non-technical 8-year-old can understand what to do from reading the prompt.
