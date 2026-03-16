# Fraction Quest — EdTech Research-Informed Redesign Plan

**Date:** Mar 16, 2026  
**Purpose:** Address recommendations from cognitive science / developmental psychology research on effective edtech design  
**Source:** Article on "The Three-Body Problem of EdTech" (Cognitive Load, Motivation, Learning Outcomes)  
**Status:** Planning — not yet implemented

---

## Executive Summary

The research article identifies five key areas where common edtech design choices can undermine learning:

1. **Cognitive Coherence** — Fantasy elements (talking animals, magical framing) may create extraneous load for ages 4–8
2. **Aesthetic Paradox** — Decorative visuals can harm learning; every element must clarify, not distract
3. **Motivation** — Competence ("I did it!") > extrinsic rewards; rewards should fade as intrinsic motivation builds
4. **Off-Ramp / Transfer** — Design for real-world application, not stickiness
5. **Cognitive Load** — Reduce simultaneous elements; progressive disclosure

This plan maps each recommendation to Fraction Quest's current implementation and proposes concrete tickets.

---

## Part 1: Current State Inventory

### 1.1 What's Built (from DEVLOG)

| Phase | Tickets | Status |
|-------|---------|--------|
| P1 Foundation | ENG-001–004 | ✅ Complete |
| P2 Manipulative | ENG-005–009 | ✅ Complete |
| P3 Chat + LLM | ENG-010–013 | ✅ Complete |
| P4 Integration | ENG-014–019, 039–040 | ✅ Complete |
| P5 Assessment | ENG-020–025, 041–042 | ✅ Complete |
| P6 Polish | ENG-026–032, 043–045 | Partial (ENG-028 confetti, ENG-029 edge cases done) |
| P7 Delivery | ENG-033–038 | ⬜ Pending |

### 1.2 Fantasy / Thematic Elements (Current)

| Element | Location | Description |
|---------|----------|-------------|
| Sam the Wizard Owl | `api/system-prompt.ts`, PRD §5 | Talking owl tutor; "wise mentor energy" |
| Enchanted crystal shards | PRD, theme.md, system prompt | Blocks = "crystals"; workspace = "spell table"; comparison = "spell altar" |
| Themed vocabulary | System prompt | "Break spell", "fuse crystals", "same magical power" |
| Fraction Quest branding | theme.md | "A Magical Math Adventure"; dark fantasy palette |
| Confetti colors | Confetti.tsx | "Crystal blue", "Purple", "Gold" — themed palette |
| CompletionScreen | CompletionScreen.tsx | "You're a true fraction wizard!" |

### 1.3 Decorative vs. Clarifying Elements (Audit)

| Element | Type | Pedagogical Purpose? | Article Verdict |
|---------|------|----------------------|-----------------|
| Fraction blocks (colors, grid lines) | Clarifying | Yes — encodes denominator, visual equivalence | **Keep** |
| Split/combine animations | Clarifying | Yes — shows operation, preserves width | **Keep** |
| Gold pulse on block highlight | Clarifying | Yes — draws attention to referenced fraction | **Keep** |
| Confetti on 3/3 | Decorative | No — celebration only | **Reduce or gate** |
| Sound effects (pop, snap, correct, incorrect) | Mixed | Correct/incorrect = feedback; pop/snap = optional | **Audit** |
| Sparkles component | Decorative | No | **Audit** |
| Sam avatar (geometric circle) | Neutral | Minimal — could be clarifying if tied to "who is speaking" | **Keep** |
| Progress dots | Clarifying | Yes — phase structure | **Keep** |
| Dark fantasy background | Decorative | No — aesthetic only | **Consider lighter option** |

### 1.4 Motivation / Rewards (Current)

| Element | Location | Type | Article Concern |
|---------|----------|------|-----------------|
| Score display (X/3) | CompletionScreen | Extrinsic | Static; no fade |
| "Perfect score! You're a true fraction wizard!" | CompletionScreen | Mixed | Fantasy + extrinsic |
| Confetti on 3/3 | App.tsx | Extrinsic | Decorative reward |
| Celebration sound | SoundManager | Extrinsic | Brief, acceptable |
| Concepts Discovered list | CompletionScreen | Intrinsic | **Good** — celebrates competence |
| Sam's phase-specific praise | System prompt | Intrinsic | **Good** — "You found it!" |

### 1.5 Off-Ramp / Transfer (Current)

| Element | Status |
|---------|--------|
| Real-world application prompt | **None** |
| Parent/teacher guidance | **None** |
| "Try this at home" suggestions | **None** |
| Connection to lived experience | Implicit only (pizza, sharing) in Sam's examples |

### 1.6 Cognitive Load (Current)

| Element | Load Source | Notes |
|---------|-------------|-------|
| Chat panel + Workspace + ActionBar | Simultaneous | 40/60 split; chat can compete for attention |
| Goal cards (GuidedGoalCard, ExploreGoalCard) | Additional | Overlay on workspace |
| Progress dots + Mute + Voice toggles | Header | Minimal |
| Sam messages (streaming) | Variable | Can be long; 15 words/sentence constraint helps |
| Round banner | Occasional | Exploration rounds |

---

## Part 2: Recommendation → Implementation Mapping

### 2.1 Cognitive Coherence (Fantasy vs. Reality)

**Article:** Fantasy (talking animals, magical events) creates extraneous load for ages 4–8. Design for "cognitive coherence" — align with child's understanding of reality.

**Target age overlap:** Fraction Quest targets 8–12; 8-year-olds are in the sensitive range.

**Options (choose one path):**

| Option | Description | Effort | Risk |
|--------|-------------|--------|------|
| **A. Theme Toggle** | Add "Plain Mode" vs "Adventure Mode" — user or parent selects. Plain: "blocks", "workspace", "comparison zone"; Sam = "friendly guide" (no owl). | Medium | Low — preserves both |
| **B. Pedagogically-Grounded Fantasy** | Keep fantasy but tie every element to math. "Splitting the crystal shows equal parts" — crystal = fraction block, not arbitrary. Reduce "magic" language that doesn't teach. | Medium | Medium — requires prompt rewrite |
| **C. Full De-Fantasy** | Remove wizard owl, crystals, spell table. Blocks = "fraction pieces"; Sam = neutral guide (circle avatar, no species). | High | High — rebrand, theme.md rewrite |

**Recommended:** Option A (Theme Toggle) — allows A/B testing and respects family preference. Implement as `EDTECH-001`.

---

### 2.2 Aesthetic Paradox (Clarifying vs. Decorative)

**Article:** Every visual must serve pedagogy. Decorative aesthetics increase extraneous load.

**Concrete changes:**

| Ticket | Change | Files |
|--------|--------|-------|
| EDTECH-002 | **Confetti audit** — Add `prefers-reduced-motion` check (already in rules); consider making confetti opt-in via parent setting or only on first 3/3 ever. | Confetti.tsx, App.tsx |
| EDTECH-003 | **Sound audit** — Pop/snap: keep (feedback for action). Correct/incorrect: keep (feedback). Celebration: keep but brief. Add setting to reduce/disable decorative sounds. | SoundManager.ts, useSoundManager |
| EDTECH-004 | **Sparkles audit** — Sparkles used on StartScreen only (background particles). Purely decorative. Options: (a) remove, (b) gate behind Adventure theme, (c) reduce particle count. | Sparkles.tsx, StartScreen.tsx |
| EDTECH-005 | **Background option** — Consider lighter, calmer background option (reduces visual noise). Could be part of Theme Toggle. | theme.ts, global.css |

---

### 2.3 Motivation (Competence Over Rewards)

**Article:** For 8-year-olds, "I did it!" is strongest. Extrinsic rewards should fade as intrinsic motivation builds.

**Concrete changes:**

| Ticket | Change | Files |
|--------|--------|-------|
| EDTECH-006 | **Completion message rewrite** — Emphasize competence over score. "You figured out equivalent fractions!" vs "Perfect score! You're a fraction wizard!" Lead with what they learned. | CompletionScreen.tsx, App.tsx (getCompletionMessage) |
| EDTECH-007 | **Concepts Discovered prominence** — Move "Concepts Discovered" above score on completion screen. Celebrate discovery first. | CompletionScreen.tsx |
| EDTECH-008 | **No new extrinsic systems** — Do NOT add: badges, XP, streaks, leaderboards. Document as out-of-scope. | PRD, scope-control rule |
| EDTECH-009 | **Sam's praise calibration** — Audit system prompt: ensure Sam leads with competence ("You found it!") not performance ("You got 3/3!"). | api/system-prompt.ts |

---

### 2.4 Off-Ramp / Transfer

**Article:** The most critical feature is the "off-ramp" — applying knowledge in the real world.

**Concrete changes:**

| Ticket | Change | Files |
|--------|--------|-------|
| EDTECH-010 | **Completion screen: Real-world prompt** — Add section: "Try it in the real world: Split a pizza or sandwich into equal parts at dinner. What fraction did you make?" | CompletionScreen.tsx |
| EDTECH-011 | **Parent/teacher note** — Add collapsible "For grown-ups" section on completion or start screen: "After this lesson, try: Ask your child to share a snack equally with a sibling. Have them name the fraction." | CompletionScreen.tsx or StartScreen.tsx |
| EDTECH-012 | **Sam's transfer hints** — Add to system prompt: When transitioning to complete, Sam can suggest one real-world application (pizza, sharing, measuring). | api/system-prompt.ts |

---

### 2.5 Cognitive Load Reduction

**Article:** Inverted U-curve; too many elements overload working memory.

**Concrete changes:**

| Ticket | Change | Files |
|--------|--------|-------|
| EDTECH-013 | **Progressive disclosure for goal cards** — During guided practice, show only the current goal. Collapse or simplify when not needed. | GuidedGoalCard.tsx, ExploreGoalCard.tsx |
| EDTECH-014 | **Chat message length** — Enforce 15 words/sentence, 3 sentences in system prompt (already there). Add validation or reminder in prompt. | api/system-prompt.ts |
| EDTECH-015 | **Focus mode (optional)** — Consider "focus mode" that hides chat during manipulative-heavy tasks (split, combine, compare), shows only when Sam has something to say. | App.tsx, ChatPanel — future consideration |
| EDTECH-016 | **Reduce simultaneous UI** — Audit: during A-1 (multiple choice), is chat visible? During construction, is ExploreGoalCard visible? Simplify phase-specific layout. | App.tsx |

---

## Part 3: Implementation Plan (Phased)

### Phase EDTECH-1: Low-Risk, High-Impact (Est. 4–6h)

| Ticket | Description | Est. | Dependencies |
|--------|-------------|------|-------------|
| EDTECH-006 | Completion message rewrite (competence-first) | 1h | None |
| EDTECH-007 | Concepts Discovered above score | 0.5h | None |
| EDTECH-009 | Sam's praise calibration in prompt | 1h | None |
| EDTECH-010 | Real-world prompt on completion | 1h | None |
| EDTECH-011 | Parent/teacher note (collapsible) | 1h | None |

**Deliverable:** Completion screen and Sam's framing emphasize competence and transfer. No fantasy changes yet.

---

### Phase EDTECH-2: Aesthetic Audit (Est. 3–4h)

| Ticket | Description | Est. | Dependencies |
|--------|-------------|------|-------------|
| EDTECH-002 | Confetti: prefers-reduced-motion + optional gate | 1h | None |
| EDTECH-003 | Sound audit + reduce/disable option | 1h | None |
| EDTECH-004 | Sparkles audit — remove or tie to pedagogy | 0.5h | Grep Sparkles |
| EDTECH-005 | Lighter background option (optional) | 1h | theme.ts |

**Deliverable:** Decorative elements gated or reduced. No loss of clarifying elements.

---

### Phase EDTECH-3: Theme Toggle (Cognitive Coherence) (Est. 6–8h)

| Ticket | Description | Est. | Dependencies |
|--------|-------------|------|-------------|
| EDTECH-001 | Theme Toggle: Plain vs. Adventure mode | 6h | types.ts (add preference), system prompt (branch), theme.ts, UI toggle |

**Implementation outline:**
- Add `themePreference: 'plain' | 'adventure'` to LessonState or a separate settings store (sessionStorage).
- System prompt: `buildSystemPrompt(lessonState, themePreference)` — when plain: no "crystal", "spell table", "wizard owl"; use "block", "workspace", "comparison zone"; Sam = "friendly guide".
- Toggle in header or Start Screen: "Learning style: Plain / Adventure".
- theme.ts: when plain, use neutral labels in any UI strings.

**Deliverable:** Users can choose cognitively coherent (plain) or fantasy (adventure) experience.

---

### Phase EDTECH-4: Cognitive Load + Transfer (Est. 4–5h)

| Ticket | Description | Est. | Dependencies |
|--------|-------------|------|-------------|
| EDTECH-012 | Sam's transfer hints in system prompt | 1h | None |
| EDTECH-013 | Progressive disclosure for goal cards | 2h | GuidedGoalCard, ExploreGoalCard |
| EDTECH-014 | Chat message length enforcement | 0.5h | System prompt |
| EDTECH-016 | Phase-specific layout audit | 1.5h | App.tsx |

**Deliverable:** Reduced cognitive load during key tasks; Sam suggests real-world application.

---

## Part 4: Ticket Summary Table

| ID | Title | Phase | Est. | Priority |
|----|-------|-------|------|----------|
| EDTECH-001 | Theme Toggle (Plain vs. Adventure) | EDTECH-3 | 6h | P1 |
| EDTECH-002 | Confetti audit + gate | EDTECH-2 | 1h | P2 |
| EDTECH-003 | Sound audit + reduce option | EDTECH-2 | 1h | P2 |
| EDTECH-004 | Sparkles audit | EDTECH-2 | 0.5h | P2 |
| EDTECH-005 | Lighter background option | EDTECH-2 | 1h | P3 |
| EDTECH-006 | Completion message (competence-first) | EDTECH-1 | 1h | P0 |
| EDTECH-007 | Concepts Discovered prominence | EDTECH-1 | 0.5h | P0 |
| EDTECH-008 | Document: no new extrinsic rewards | EDTECH-1 | 0.5h | P1 |
| EDTECH-009 | Sam's praise calibration | EDTECH-1 | 1h | P0 |
| EDTECH-010 | Real-world prompt on completion | EDTECH-1 | 1h | P0 |
| EDTECH-011 | Parent/teacher note | EDTECH-1 | 1h | P0 |
| EDTECH-012 | Sam's transfer hints | EDTECH-4 | 1h | P1 |
| EDTECH-013 | Progressive disclosure (goal cards) | EDTECH-4 | 2h | P2 |
| EDTECH-014 | Chat message length enforcement | EDTECH-4 | 0.5h | P2 |
| EDTECH-015 | Focus mode (future) | — | — | Backlog |
| EDTECH-016 | Phase-specific layout audit | EDTECH-4 | 1.5h | P2 |

**Total estimated:** ~17.5h across 4 phases.

---

## Part 5: Integration with Existing Sprint

### Conflict with ENG-045 (Fraction Quest Theme Pass)

ENG-045 is "Full visual theme: dark background, crystal blocks, wizard owl Sam" — i.e., doubling down on fantasy. The research suggests the opposite.

**Recommendation:** 
- **Before ENG-045:** Complete EDTECH-1 (competence, transfer) and EDTECH-2 (aesthetic audit). These are compatible with any theme.
- **ENG-045 scope change:** Implement ENG-045 as "theme pass" but include EDTECH-001 (Theme Toggle) so the fantasy theme is optional. Document that "Plain Mode" is the research-aligned default for ages 8–9.

### Order of Operations

1. **Immediate (this week):** EDTECH-1 (Phase 1) — completion screen, Sam framing, transfer prompts. No theme changes.
2. **Next:** EDTECH-2 — aesthetic audit. Low risk.
3. **Before ENG-045:** EDTECH-001 (Theme Toggle) — so ENG-045 can theme "Adventure" mode while "Plain" exists.
4. **After:** EDTECH-4 — cognitive load, progressive disclosure.

---

## Part 6: Success Metrics (Research-Aligned)

| Metric | Current | Target |
|--------|---------|--------|
| Completion message leads with competence | No | Yes |
| Real-world application suggested | No | Yes |
| Parent guidance available | No | Yes |
| Decorative elements gated | Partial (prefers-reduced-motion) | Full |
| Theme choice (plain vs. adventure) | No | Yes |
| Concepts Discovered above score | No | Yes |

**Learning outcome (from PRD):** Pre/post one-question test — average improvement of 1+ correct. The redesign should maintain or improve this by reducing extraneous load and strengthening transfer.

---

## Part 7: Files to Modify (Summary)

| File | Tickets |
|------|---------|
| `src/components/Assessment/CompletionScreen.tsx` | EDTECH-006, 007, 010, 011 |
| `api/system-prompt.ts` | EDTECH-009, 012, 014 |
| `src/App.tsx` | EDTECH-002, getCompletionMessage |
| `src/components/shared/Confetti.tsx` | EDTECH-002 |
| `src/audio/SoundManager.ts` | EDTECH-003 |
| `src/audio/useSoundManager.ts` | EDTECH-003 |
| `src/theme.ts` | EDTECH-001, 005 |
| `src/state/types.ts` | EDTECH-001 (themePreference) |
| `src/components/GuidedPractice/GuidedGoalCard.tsx` | EDTECH-013 |
| `src/components/shared/ExploreGoalCard.tsx` | EDTECH-013 |
| `docs/prd.md` | EDTECH-008 |
| `.cursor/rules/scope-control.mdc` | EDTECH-008 |

---

## Appendix A: System Prompt Changes (EDTECH-009, 012)

### EDTECH-009: Praise Calibration

Add to PEDAGOGICAL_APPROACH or new section:

```
PRAISE CALIBRATION:
- Lead with COMPETENCE, not performance. "You figured it out!" not "You got the right answer!"
- Celebrate what the student DISCOVERED or BUILT, not that they followed instructions.
- When discussing assessment: "You showed that you understand equivalent fractions" — focus on the skill, not the score.
- Avoid "Perfect score!" as the primary message. Use "You proved that the same amount can be written in lots of different ways!"
```

### EDTECH-012: Transfer Hints

Add to phase guidance for `complete`:

```
When the student completes the lesson (any score), you may suggest ONE real-world application:
- "Try splitting a pizza or sandwich into equal parts at dinner. What fraction did you make?"
- "Next time you share a snack, see if you can name the fraction!"
- "When you measure something, fractions are everywhere — look for them!"
Keep it to one sentence. Only include if the message isn't already long.
```

---

## Appendix B: Completion Message Rewrites (EDTECH-006)

| Score | Current (from App.tsx) | Proposed (competence-first) |
|-------|-------------------------|----------------------------|
| 3/3 | "You're a fraction master! You proved that the same amount can be written in lots of different ways." | "You proved that the same amount can be written in lots of different ways. That's equivalent fractions — you've got it!" |
| 2/3 | "Great job! You really understand equivalent fractions. Want to try the one you missed again?" | "You really understand equivalent fractions. Want to try the one you missed again?" |
| 1/3 | "You're getting there! Want to practice a little more?" | "You're getting there — a little more practice will help. Want to try again?" |
| 0/3 | "Fractions take practice, and you did great exploring today! Let's try again." | "You did great exploring today. Fractions take practice — let's try again." |

Note: Remove "fraction master" and "fraction wizard" (fantasy + performance). Lead with the skill or the effort.
