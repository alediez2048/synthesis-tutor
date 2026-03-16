# ENG-058a Primer: Strip Fantasy Theme — Vocabulary Sweep (Part 1)

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 9: EdTech Research-Informed Redesign
**Date:** Mar 16, 2026
**Research:** Hinten et al., 2025 — fantastical content creates extraneous cognitive load. Cognitive coherence supports learning.
**Previous work:** See `docs/DEVLOG.md`. Fantasy theme is embedded in system prompt, content files, and UI copy.
**Depends on:** None. Can ship independently. ENG-058b (visual simplification) can follow.

---

## What Is This Ticket?

Replace all fantasy vocabulary with neutral, real-world terms. **No visual changes** — same look and feel. Sam becomes a friendly guide, not a wizard. "Crystals" become "blocks", "spell altar" becomes "comparison area", etc. This is a text-only sweep across system prompt, content files, and UI components.

### Why Split from ENG-058?

ENG-058 was split into two tickets:
- **ENG-058a (this ticket):** Vocabulary only — low risk, no design changes, fast to ship.
- **ENG-058b:** Visual simplification — background, block styling, Sparkles, assets. Requires design decisions.

### Vocabulary Mapping (Replace → With)

| Fantasy | Cognitively Coherent |
|---------|----------------------|
| crystals / crystal shards | blocks / pieces |
| spell table | workspace |
| spell altar / Spell Altar | comparison area |
| break spell / Split Crystal | Split |
| fuse crystals / fusing | Combine |
| same magical power | same size / equivalent |
| Sam the Wizard Owl / Sam the Math Wizard | Sam (friendly guide) |
| young wizard / apprentice wizard | (omit) |
| Fraction Quest | Fractions or Fraction Practice |

---

## Contract

### 1. System Prompt — `api/system-prompt.ts`

**IDENTITY section:** Replace entirely.
- Remove: "Sam the Wizard Owl", "enchanted crystal shards", "spell table", "spell altar", "apprentice wizards"
- Add: "Sam, a friendly guide for kids ages 8-12. You help students discover how fractions work through hands-on exploration with fraction blocks."
- Themed vocabulary: blocks, workspace, comparison area. Use real-world examples: "Like splitting a pizza into equal slices" or "Imagine a chocolate bar divided into pieces."
- Example: "You split that block into two pieces — each one is one-fourth!"

**describeBlocks():** "No crystals on the spell table" → "No blocks on the workspace". "Spell table" / "Spell altar" → "Workspace" / "Comparison area".

**buildPhaseContext():** "Crystals:" → "Blocks:". Update phase guidance strings.

**getPhaseGuidance():** Replace all "crystal", "spell", "wizard" references. "true fraction wizard" → "you've got equivalent fractions down!". "sapphire crystal" → "blue block".

**SPLIT_LIMIT_GUIDANCE:** "Those crystal pieces" → "Those pieces". "different crystal" → "different block".

### 2. Content Files

**`src/content/tutorial-steps.ts`:**
- Step 0: "Welcome, young wizard! ... magic of fractions ... break whole crystals" → "Hi! Let's learn about fractions — how to split a whole into equal pieces, like cutting a pizza!"
- Step 1: "crystal shards" → "pieces". "whole crystal" → "whole".
- Step 2: "whole crystal" → "one whole block".
- Step 4+: "Split!" (not "Split Crystal"). "altar" → "comparison area". "Spell Altar" → "comparison area". "crystals" → "blocks". "magical power" → "same size".
- `spotlightTarget: "initial-crystal"` → `"initial-block"` (update FractionBlock data attribute to match)

**`src/content/lessons/fractions-101/guided-problems.ts`:**
- "See that crystal?" → "See that block?"
- "Cast a break spell" → "Tap it and press Split"
- "Split Crystal" → "Split"
- "same magical power" → "same size"
- "Spell Altar" → "comparison area"
- "Cast a break spell on the 1/3 crystal" → "Split the 1/3 block"

**`src/content/lessons/adding/guided-problems.ts`:**
- "crystals" → "blocks"
- "Spell Altar" → "comparison area"
- "magical power" → "add together"

**`src/content/lessons/fractions-101/exploration-rounds.ts`** and **`src/content/exploration-rounds.ts`:**
- "Split any crystal" → "Split any block"
- "You cast your first spell!" → "You made smaller pieces!"
- "Fusion Spell" → "Combine"
- "Each spell makes" → "Each split makes"

### 3. Lesson System Prompts

**`api/system-prompts/lesson-1-equivalence.ts`:**
- "crystal" → "block"
- "crystals fused" → "blocks combined"
- "same magical power" → "same size"
- "spell altar" → "comparison area"
- "break spell" / "fusion spell" → "split" / "combine"

**`api/system-prompts/lesson-2-addition.ts`:**
- "fuse" → "combine" or "add together"

### 4. UI Components (Text Only)

**`src/components/Assessment/CompletionScreen.tsx`:**
- `getScoreMessage`: "You're a true fraction wizard!" → "You've got equivalent fractions down!" or "You proved that the same amount can be written in lots of different ways."
- `CONCEPT_LABELS`: "Combining fuses pieces together" → "Combining puts pieces together"

**`src/App.tsx`:**
- `getCompletionMessage`: "fraction master" → competence-first message
- notifySam messages: "spell altar" → "comparison area". "crystal" → "block".
- Hardcoded strings: "crystals" → "blocks". "young wizard" → (remove). "spell altar" → "comparison area".
- "Add new crystal" / "Start fresh with one crystal" → "Add block" / "Start fresh with one block"

**`src/components/Workspace/ComparisonZone.tsx`:**
- Empty state: "Drag crystals here to compare them" → "Drag blocks here to compare them"

**`src/components/Workspace/ActionBar.tsx`:**
- "Split Crystal" → "Split"
- aria-label / tooltip: "Tap a crystal" → "Tap a block"

**`src/components/Workspace/Workspace.tsx`:**
- Comment "Crystal Workspace" → "Fraction workspace"
- Empty state: "Tap a crystal" → "Tap a block"

**`src/components/shared/StartScreen.tsx`:**
- "Sam the Math Wizard" → "Sam"
- "Tap a crystal" → "Tap a block"
- "Drag crystals to the altar" → "Drag blocks to the comparison area"
- alt text: "Fraction Quest with Sam the Math Wizard" → "Fractions with Sam"

**`src/components/shared/ViewToggle.tsx`:**
- "Spell Table" → "Workspace"
- aria-label: "Spell Table" → "Workspace"

**`src/components/shared/ErrorBoundary.tsx`:**
- "spell table" → "workspace"

**`src/components/LessonSelect/LessonMap.tsx`:**
- `user.firstName ?? 'Wizard'` → `user.firstName ?? 'there'` or similar

**`src/components/Workspace/FractionBlock.tsx`:**
- `data-tutorial-target: 'initial-crystal'` → `'initial-block'`

### 5. Observers

**`src/observers/useIntroObserver.ts`:**
- "whole crystal" → "whole block"

**`src/observers/useTutorialDemoObserver.ts`:**
- "whole crystal" → "whole block"
- "altar" in comments → "comparison area"
- ALTAR_DEMO_DELAY_MS → COMPARISON_DEMO_DELAY_MS (optional rename)

### 6. Branding (Text)

**`index.html`:**
- `<title>Fraction Quest</title>` → `<title>Fractions</title>` or `<title>Fraction Practice</title>`

**`src/components/LandingPage/LandingPage.tsx`:**
- "Fraction Quest" in headings → "Fractions" or "Fraction Practice"
- "Sam the Math Wizard" → "Sam"
- (Do NOT change crystal-icon.png here — that's ENG-058b)

---

## Deliverables Checklist

- [ ] `api/system-prompt.ts`: IDENTITY, describeBlocks, buildPhaseContext, getPhaseGuidance, SPLIT_LIMIT_GUIDANCE — all fantasy terms replaced
- [ ] `src/content/tutorial-steps.ts`: All steps use blocks, workspace, comparison area; no wizard/crystal/spell
- [ ] `src/content/lessons/fractions-101/guided-problems.ts`: Neutral vocabulary
- [ ] `src/content/lessons/adding/guided-problems.ts`: Neutral vocabulary
- [ ] `src/content/lessons/fractions-101/exploration-rounds.ts` and `exploration-rounds.ts`: Neutral vocabulary
- [ ] `api/system-prompts/lesson-1-equivalence.ts` and `lesson-2-addition.ts`: Neutral vocabulary
- [ ] `src/components/Assessment/CompletionScreen.tsx`: No "fraction wizard"
- [ ] `src/App.tsx`: getCompletionMessage, notifySam, hardcoded strings — all neutral
- [ ] `src/components/Workspace/ComparisonZone.tsx`: "blocks" not "crystals"
- [ ] `src/components/Workspace/ActionBar.tsx`: "Split" not "Split Crystal"
- [ ] `src/components/Workspace/Workspace.tsx`: "blocks" not "crystals"
- [ ] `src/components/shared/StartScreen.tsx`: "Sam" not "Sam the Math Wizard"; blocks not crystals
- [ ] `src/components/shared/ViewToggle.tsx`: "Workspace" not "Spell Table"
- [ ] `src/components/shared/ErrorBoundary.tsx`: "workspace" not "spell table"
- [ ] `src/components/Workspace/FractionBlock.tsx`: data-tutorial-target `initial-block`
- [ ] `src/observers/useIntroObserver.ts`, `useTutorialDemoObserver.ts`: Neutral vocabulary
- [ ] `index.html`: Title updated
- [ ] `src/components/LandingPage/LandingPage.tsx`: Neutral branding (text only)
- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] All existing tests pass
- [ ] DEVLOG updated with ENG-058a entry

---

## Definition of Done

- [ ] No user-facing text contains "crystal", "spell", "wizard", "owl", "magic", "altar" (except in comments or internal variable names where harmless)
- [ ] Sam is framed as a friendly guide; no fantastical persona
- [ ] Full lesson flow (tutorial → explore → guided → assess → complete) uses coherent vocabulary throughout
- [ ] No visual changes — app looks identical before and after
- [ ] No functional regressions

---

## Files

### Modify

| File | Changes |
|------|---------|
| `api/system-prompt.ts` | IDENTITY, describeBlocks, buildPhaseContext, getPhaseGuidance, SPLIT_LIMIT_GUIDANCE |
| `src/content/tutorial-steps.ts` | All samText, spotlightTarget |
| `src/content/lessons/fractions-101/guided-problems.ts` | prompts, hints |
| `src/content/lessons/adding/guided-problems.ts` | hints |
| `src/content/lessons/fractions-101/exploration-rounds.ts` | goal, celebration, name |
| `src/content/exploration-rounds.ts` | goal, celebration, name |
| `api/system-prompts/lesson-1-equivalence.ts` | crystal, spell altar, magical power, fuse |
| `api/system-prompts/lesson-2-addition.ts` | fuse |
| `src/components/Assessment/CompletionScreen.tsx` | getScoreMessage, CONCEPT_LABELS |
| `src/App.tsx` | getCompletionMessage, notifySam strings, hardcoded messages |
| `src/components/Workspace/ComparisonZone.tsx` | empty state text |
| `src/components/Workspace/ActionBar.tsx` | button label, aria-labels |
| `src/components/Workspace/Workspace.tsx` | comments, empty state |
| `src/components/Workspace/FractionBlock.tsx` | data-tutorial-target only |
| `src/components/shared/StartScreen.tsx` | Sam intro, bullet points, alt text |
| `src/components/shared/ViewToggle.tsx` | tab labels |
| `src/components/shared/ErrorBoundary.tsx` | error message |
| `src/components/LessonSelect/LessonMap.tsx` | fallback "Wizard" |
| `src/observers/useIntroObserver.ts` | intro message |
| `src/observers/useTutorialDemoObserver.ts` | comments, variable names |
| `src/components/LandingPage/LandingPage.tsx` | headings, Sam text (not assets) |
| `index.html` | title |
| `docs/DEVLOG.md` | ENG-058a entry |

### Do Not Modify (Reserved for ENG-058b)

- `src/theme.ts` — Background, gradients
- `src/components/shared/Sparkles.tsx` — Removal
- `src/components/shared/Confetti.tsx` — CRYSTAL_PALETTE rename
- `public/` assets (crystal-icon.png)
- `src/global.css` — shimmer keyframes

---

## Estimated Effort

2–3 hours (vocabulary sweep + testing)
