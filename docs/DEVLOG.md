# Synthesis Tutor — Development Log

**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Sprint:** Mar 10–16, 2026 (7-Day Challenge)  
**Developer:** JAD  
**AI Assistant:** Claude (Cursor Agent)

---

## How to Use This DEVLOG

- Entries are listed **newest first** (most recent ticket at top)
- Each entry records: what was built, files changed, acceptance criteria, and any decisions made
- Read this BEFORE starting any new ticket to understand what's already done
- Update this file as the LAST step of every ticket

---

## Ticket Index

### Phase 7: Demo + Delivery (Day 7 — Sunday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-038 | Final deploy + verification | ⬜ Pending | 0.5h |
| ENG-037 | README | ⬜ Pending | 1h |
| ENG-036 | Demo video recording | ⬜ Pending | 1.5h |
| ENG-035 | Final bug sweep | ⬜ Pending | 1.5h |
| ENG-034 | E2E test: struggle path | ⬜ Pending | 1h |
| ENG-033 | E2E test: happy path | ⬜ Pending | 1h |

### Phase 6: Polish + Edge Cases (Day 6 — Saturday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-032 | PWA configuration | ⬜ Pending | 0.5h |
| ENG-031 | Accessibility: ARIA + keyboard | ⬜ Pending | 1.5h |
| ENG-030 | Responsive layout: portrait mode | ⬜ Pending | 1h |
| ENG-029 | Edge case handlers | ⬜ Pending | 2h |
| ENG-028 | Celebration confetti | ⬜ Pending | 2h |
| ENG-027 | Incorrect placement animation | ⬜ Pending | 0.5h |
| ENG-026 | Equivalence reveal animation | ⬜ Pending | 1h |

### Phase 5: Assessment + Core Polish (Day 5 — Friday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-025 | Checkpoint + recovery system | ⬜ Pending | 1.5h |
| ENG-024 | Sound Manager | ⬜ Pending | 1h |
| ENG-023 | Progress dots | ⬜ Pending | 0.5h |
| ENG-022 | Completion screen | ⬜ Pending | 1.5h |
| ENG-021 | Assessment UI | ⬜ Pending | 2.5h |
| ENG-020 | Assessment problem pools (JSON) | ⬜ Pending | 1h |

### Phase 4: Integration + Guided Practice (Day 4 — Thursday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-019 | Misconception detector tests | ⬜ Pending | 0.5h |
| ENG-018 | Math Verification Layer | ⬜ Pending | 1.5h |
| ENG-017 | Guided practice scripts (JSON) | ⬜ Pending | 2h |
| ENG-016 | Exploration phase + Observer | ⬜ Pending | 2h |
| ENG-015 | Chat ↔ Workspace integration | ⬜ Pending | 2h |

### Phase 3: Chat Interface + Script Engine (Day 3 — Wednesday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-014 | Script graph traversal test | ⬜ Pending | 0.5h |
| ENG-013 | ScriptedTutorBrain implementation | ⬜ Pending | 1.5h |
| ENG-012 | Introduction phase script (JSON) | ⬜ Pending | 1.5h |
| ENG-011 | Script engine | ⬜ Pending | 3h |
| ENG-010 | Chat panel UI | ⬜ Pending | 2h |

### Phase 2: Visual Manipulative (Day 2 — Tuesday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-009 | Wire blocks to reducer | ⬜ Pending | 1h |
| ENG-008 | Combine interaction + animation | ⬜ Pending | 2h |
| ENG-007 | Split interaction + animation | ⬜ Pending | 2h |
| ENG-006 | FractionWorkspace component | ⬜ Pending | 2h |
| ENG-005 | FractionBlock component | ⬜ Pending | 3h |

### Phase 1: Foundation (Day 1 — Monday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-004 | LessonState types + reducer skeleton | ⬜ Pending | 2h |
| ENG-003 | Engine property-based tests | ⬜ Pending | 2h |
| ENG-002 | Fraction type + engine core | ✅ Complete | 3h |
| ENG-001 | Project scaffold | ✅ Complete | 1h |

**Total estimated hours: ~56h across 7 days**

---

## Phase 1: Foundation (Day 1 — Monday)

**Objective:** Rock-solid math engine and application scaffold.  
**Day 1 Deliverable:** Engine passes all tests. Reducer handles phase transitions in console demo.

---

### ENG-001: Project Scaffold ⬜

#### Plain-English Summary
Scaffold a Vite + React + TypeScript project that builds cleanly, deploys to Vercel, and loads on iPad Safari.

#### Acceptance Criteria
- [ ] `npm create vite@latest` with React + TypeScript template
- [ ] Project builds with `npm run build` — zero errors
- [ ] Dev server runs with `npm run dev`
- [ ] Loads on iPad Safari without layout issues
- [ ] Vercel deployment connected and auto-building from GitHub
- [ ] `.gitignore` includes `node_modules/`, `dist/`, `.env`, `.DS_Store`
- [ ] ESLint + Prettier configured
- [ ] Vitest configured and a smoke test passes

#### Files to Create
- `package.json`, `tsconfig.json`, `vite.config.ts`
- `src/index.tsx`, `src/App.tsx`
- `public/manifest.json`
- `.gitignore`, `.eslintrc.cjs`

#### Dependencies
None — this is the first ticket.

---

### ENG-002: Fraction Type + Engine Core ⬜

#### Plain-English Summary
Implement the `FractionEngine` as a standalone TypeScript module with all core operations as pure functions. This is the safety-critical math layer — it must be rock-solid.

#### Acceptance Criteria
- [ ] `Fraction` interface defined: `{ numerator: number; denominator: number }`
- [ ] `simplify(f)` reduces to lowest terms via GCD
- [ ] `areEquivalent(a, b)` uses cross-multiplication (never floats)
- [ ] `split(f, parts)` divides into N equal pieces
- [ ] `combine(fractions)` sums same-denominator fractions
- [ ] `toCommonDenominator(a, b)` finds LCD representation
- [ ] `isValidFraction(f)` guards: positive integers, denominator 1–12
- [ ] `parseStudentInput(raw)` parses "2/4", "2 / 4", etc.
- [ ] All functions are pure — no side effects, no state, no network
- [ ] All functions have full TypeScript type annotations

#### Files to Create
- `src/engine/FractionEngine.ts`

#### Dependencies
- ENG-001 (project scaffold exists)

---

### ENG-003: Engine Property-Based Tests ⬜

#### Plain-English Summary
Write property-based tests using `fast-check` that verify mathematical invariants across 10,000+ random iterations. These catch bugs that hand-written unit tests miss.

#### Acceptance Criteria
- [ ] `fast-check` installed as dev dependency
- [ ] **Reflexivity:** `areEquivalent(f, f) === true` for all valid fractions
- [ ] **Symmetry:** `areEquivalent(a, b) === areEquivalent(b, a)` for all pairs
- [ ] **Split-combine roundtrip:** `areEquivalent(combine(split(f, n)), f)` for all valid f, n
- [ ] **Simplify preserves value:** `areEquivalent(f, simplify(f))` and `simplify(f).denominator <= f.denominator`
- [ ] 10,000 iterations, all green
- [ ] Edge case unit tests: denominator 0, denominator > 12, negative numbers, non-integer inputs
- [ ] All tests pass with `npm test`

#### Files to Create
- `src/engine/FractionEngine.test.ts`

#### Dependencies
- ENG-002 (engine functions exist to test)

---

### ENG-004: LessonState Types + Reducer Skeleton ⬜

#### Plain-English Summary
Define all shared TypeScript interfaces in `types.ts` and implement the lesson state reducer. This file is the contract between engine and UI — it must be frozen after this ticket.

#### Acceptance Criteria
- [ ] `Fraction`, `FractionBlock`, `LessonState`, `LessonAction`, `ChatMessage` interfaces defined
- [ ] `Phase` type: `'intro' | 'explore' | 'guided' | 'assess' | 'complete'`
- [ ] Reducer handles ALL `LessonAction` variants (SPLIT_BLOCK, COMBINE_BLOCKS, COMPARE_BLOCKS, STUDENT_RESPONSE, ADVANCE_SCRIPT, REQUEST_HINT, RESET_WORKSPACE, PHASE_TRANSITION, SELECT_BLOCK, DESELECT_ALL, DRAG_START, DRAG_END)
- [ ] Phase transitions work correctly (intro → explore → guided → assess → complete)
- [ ] Reducer rejects impossible states (denominator > 12, invalid fractions)
- [ ] Phase transitions verifiable via console/test

#### Files to Create
- `src/state/types.ts`
- `src/state/reducer.ts`
- `src/state/reducer.test.ts`

#### Dependencies
- ENG-002 (Fraction type and engine functions used by reducer)

#### Critical Note
`types.ts` is the shared contract. After this ticket, changes require explicit justification and coordination.

---

## Phase 2: Visual Manipulative (Day 2 — Tuesday)

**Objective:** Fraction blocks that look and feel tangible.  
**Day 2 Deliverable:** Standalone page where you can split and combine fraction blocks visually with smooth animations.

---

### ENG-005: FractionBlock Component ⬜

#### Plain-English Summary
Build the visual representation of a fraction as a colored rectangle with subdivision grid lines, sized proportionally to its value.

#### Acceptance Criteria
- [ ] Colored rectangle rendered as a DOM element (not Canvas)
- [ ] Width proportional to fraction value relative to reference bar (1/2 = 50%, 1/4 = 25%)
- [ ] Grid lines show denominator subdivisions
- [ ] Color-coded by denominator family (halves=blue #4A90D9, thirds=green #27AE60, fourths=purple #8E44AD, sixths=orange #E67E22, eighths=teal #16A085, twelfths=pink #E84393)
- [ ] Minimum 60×60pt touch target
- [ ] Label showing fraction value (e.g., "1/4")
- [ ] Selected state with visual indicator (blue glow ring)
- [ ] `aria-label` with spoken fraction description

#### Files to Create
- `src/components/Workspace/FractionBlock.tsx`

#### Dependencies
- ENG-004 (FractionBlock interface from types.ts)

---

### ENG-006: FractionWorkspace Component ⬜

#### Plain-English Summary
Build the workspace layout: reference bar at top, active blocks area, and comparison zone.

#### Acceptance Criteria
- [ ] Reference bar (1 whole) always visible at top
- [ ] Active blocks area where students work
- [ ] Comparison zone for placing blocks side-by-side
- [ ] Pre-seeded with initial blocks based on lesson phase
- [ ] Blocks render from `LessonState.blocks` — workspace owns no state

#### Files to Create
- `src/components/Workspace/Workspace.tsx`
- `src/components/Workspace/ComparisonZone.tsx`

#### Dependencies
- ENG-005 (FractionBlock component exists)

---

### ENG-007: Split Interaction + Animation ⬜

#### Plain-English Summary
Implement the split interaction: tap block → select → tap Split → picker [2][3][4] → engine computes → block cracks and separates with animation.

#### Acceptance Criteria
- [ ] Tap block to select it (visual selection ring)
- [ ] Split button in action bar (pulses when block is selected)
- [ ] Split picker shows options: [2] [3] [4] — no free-text input
- [ ] Engine computes `split()` and reducer updates state
- [ ] Split animation: block cracks → separates (400ms, ease-out)
- [ ] Total area preserved during animation (mathematical invariant)
- [ ] Labels appear on new blocks after animation completes
- [ ] 500ms debounce on Split button
- [ ] Denominator > 12 rejected with Sam message

#### Files to Create
- `src/components/Workspace/ActionBar.tsx`

#### Dependencies
- ENG-005, ENG-006 (block + workspace exist), ENG-002 (engine split function)

---

### ENG-008: Combine Interaction + Animation ⬜

#### Plain-English Summary
Drag two same-denominator blocks together to combine them. Different-denominator blocks are rejected with a friendly message.

#### Acceptance Criteria
- [ ] Drag block onto another using `@use-gesture/react`
- [ ] Same-denominator: engine computes `combine()`, snap animation (350ms, ease-in-out), seam dissolves, new label
- [ ] Different-denominator: blocks bounce apart, Sam says "Those are different sizes — try blocks that are the same size!"
- [ ] Combined block width = sum of original block widths
- [ ] Single-touch guard: `isDragging` boolean, first touch only

#### Files Modified
- `src/components/Workspace/FractionBlock.tsx` (add drag behavior)
- `src/components/Workspace/Workspace.tsx` (handle drop targets)

#### Dependencies
- ENG-005, ENG-006, ENG-007 (blocks, workspace, action bar exist)

---

### ENG-009: Wire Blocks to Reducer ⬜

#### Plain-English Summary
Connect all visual interactions to the state reducer. Visual state is always derived from engine state.

#### Acceptance Criteria
- [ ] All block interactions dispatch `LessonAction` to reducer
- [ ] Visual rendering is a pure function of `LessonState.blocks`
- [ ] `isDragging` guard prevents multi-touch conflicts
- [ ] 500ms debounce on Split action
- [ ] Impossible states rejected (denominator > 12, invalid combine)
- [ ] No visual state exists outside the reducer

#### Files Modified
- `src/components/Workspace/Workspace.tsx`
- `src/state/reducer.ts` (if needed)

#### Dependencies
- ENG-005 through ENG-008 (all workspace components exist)

---

## Phase 3: Chat Interface + Script Engine (Day 3 — Wednesday)

**Objective:** Sam talks to the student through a scripted dialogue system.  
**Day 3 Deliverable:** Intro phase plays through in chat panel. Manipulative visible but not yet connected.  
**iPad checkpoint:** Test on actual iPad today. Fix viewport, touch-action, and Safari layout issues immediately.

---

### ENG-010: Chat Panel UI ⬜

#### Plain-English Summary
Build the scrollable chat interface with Sam's avatar, message bubbles, and student input area.

#### Acceptance Criteria
- [ ] Scrollable message list
- [ ] Sam avatar (geometric circle with eyes) on tutor messages
- [ ] Student messages right-aligned, Sam messages left-aligned
- [ ] Student input area (text field + send button)
- [ ] Auto-scroll to latest message on new message
- [ ] 40/60 split layout with workspace (chat on left, workspace on right)

#### Files to Create
- `src/components/ChatPanel/ChatPanel.tsx`
- `src/components/ChatPanel/MessageBubble.tsx`
- `src/components/ChatPanel/InputField.tsx`
- `src/components/shared/SamAvatar.tsx`

#### Dependencies
- ENG-004 (ChatMessage type from types.ts)

---

### ENG-011: Script Engine ⬜

#### Plain-English Summary
Build the engine that loads JSON dialogue scripts, advances on events, interpolates templates, and supports branching.

#### Acceptance Criteria
- [ ] Loads JSON dialogue scripts at runtime
- [ ] Advances script on events (STUDENT_RESPONDED, TOOL_ACTION_COMPLETE, TIMER_EXPIRED)
- [ ] Template interpolation: `{student_answer}`, `{target}`, `{attempt_count}` replaced with actual values
- [ ] Branching: `on_correct`, `on_incorrect`, `on_second_incorrect` paths
- [ ] Inactivity handlers trigger after configurable delay
- [ ] Highlight actions: can reference UI elements by ID for CSS pulse

#### Files to Create
- `src/brain/ScriptEngine.ts`

#### Dependencies
- ENG-004 (LessonState and LessonAction types)

---

### ENG-012: Introduction Phase Script (JSON) ⬜

#### Plain-English Summary
Write the JSON script for the 7-beat introduction sequence per PRD Section 7.1.

#### Acceptance Criteria
- [ ] 7 scripted beats: Sam greeting → block highlight → tap prompt → split prompt → split picker → split result → bridge to exploration
- [ ] All messages conform to Sam's voice constraints (max 15 words/sentence, max 3 sentences)
- [ ] Inactivity handlers at 10s (no block tap, no split tap)
- [ ] Template tokens used where appropriate
- [ ] Auto-advance delays (2s) on non-interactive beats

#### Files to Create
- `src/content/intro-script.json`

#### Dependencies
- ENG-011 (script engine can load and process JSON)

---

### ENG-013: ScriptedTutorBrain Implementation ⬜

#### Plain-English Summary
Implement the `TutorBrain` interface with a scripted implementation that reads from JSON scripts and delegates math to the engine.

#### Acceptance Criteria
- [ ] `TutorBrain` interface defined with `getNextAction()` and `evaluateResponse()`
- [ ] `ScriptedTutorBrain` implements the interface
- [ ] `getNextAction` reads from current script position
- [ ] `evaluateResponse` uses `FractionEngine.areEquivalent()` for correctness — NEVER text matching
- [ ] `EvaluationResult.isCorrect` is always from the engine (non-negotiable)
- [ ] Async signatures (`Promise<T>`) even though scripted brain is synchronous

#### Files to Create
- `src/brain/TutorBrain.ts` (interface)
- `src/brain/ScriptedTutorBrain.ts` (implementation)
- `src/brain/ScriptedTutorBrain.test.ts`

#### Dependencies
- ENG-002 (FractionEngine), ENG-011 (ScriptEngine)

---

### ENG-014: Script Graph Traversal Test ⬜

#### Plain-English Summary
Write a DFS test that traverses all script JSON files and verifies structural integrity.

#### Acceptance Criteria
- [ ] DFS traversal of every path in every script file
- [ ] No dead-end nodes (every non-terminal has at least one outgoing edge)
- [ ] Every terminal node is in the assessment-complete phase
- [ ] No orphaned nodes (every node reachable from start)
- [ ] Test passes with `npm test`

#### Files to Create
- `src/brain/scriptIntegrity.test.ts`

#### Dependencies
- ENG-012 (intro script exists to traverse)

---

## Phase 4: Integration + Guided Practice (Day 4 — Thursday)

**Objective:** Chat and manipulative work together. Full guided practice with branching.  
**Day 4 Deliverable:** Student plays through Intro → Exploration → Guided Practice with working feedback.

---

### ENG-015: Chat ↔ Workspace Integration ⬜

#### Acceptance Criteria
- [ ] Tutor messages trigger workspace highlights (CSS pulse on referenced blocks/buttons)
- [ ] Workspace actions (split, combine, compare) trigger script advancement
- [ ] Bidirectional: chat drives workspace AND workspace drives chat

#### Dependencies
- ENG-009 (blocks wired to reducer), ENG-010 (chat panel), ENG-013 (TutorBrain)

---

### ENG-016: Exploration Phase + Observer ⬜

#### Acceptance Criteria
- [ ] `ExplorationObserver` tracks 3 discovery goals: splitting → smaller pieces, combining → larger pieces, equivalence discovery
- [ ] 15s inactivity nudge: "Try tapping a block and then pressing Split!"
- [ ] 5 consecutive splits nudge: "You're great at splitting! Now try combining."
- [ ] Denominator > 8 nudge: "Those pieces are tiny! Let's start fresh."
- [ ] 3-minute timeout → demonstrate undiscovered concepts → transition to Guided Practice
- [ ] All 3 goals discovered → "You've already figured out the big idea!" → transition

#### Files to Create
- `src/observers/ExplorationObserver.ts`
- `src/content/exploration-config.json`

#### Dependencies
- ENG-015 (chat ↔ workspace integration working)

---

### ENG-017: Guided Practice Scripts (JSON) ⬜

#### Acceptance Criteria
- [ ] GP-1 "Split to Discover": split 1/2 → 2 parts, comparison prompt
- [ ] GP-2 "Build an Equivalent": any equivalent to 1/3, misconception-specific responses
- [ ] GP-3 "Compare and Match": drag 1/2 and 3/6 to comparison zone
- [ ] GP-4 "The Challenge Round": simplify 2/4 → 1/2
- [ ] All branching paths: on_correct, on_incorrect (attempt 1), on_incorrect (attempt 2), on_incorrect (attempt 3)
- [ ] Auto-demonstration on final incorrect attempt
- [ ] All messages conform to Sam's voice constraints

#### Files to Create
- `src/content/guided-practice-script.json`

#### Dependencies
- ENG-011 (script engine), ENG-012 (intro script pattern to follow)

---

### ENG-018: Math Verification Layer ⬜

#### Acceptance Criteria
- [ ] `parseStudentInput → FractionEngine.areEquivalent → boolean → branch selection` flow works
- [ ] Misconception detection: `added_num_and_den`, `flipped_fraction`, `random_fraction`, `wrong_equivalence`
- [ ] Each misconception triggers a specific Sam response and remediation action
- [ ] The boolean from the engine is the SOLE AUTHORITY — never text matching

#### Files to Create
- `src/engine/MisconceptionDetector.ts`

#### Dependencies
- ENG-002 (FractionEngine), ENG-013 (TutorBrain evaluateResponse)

---

### ENG-019: Misconception Detector Tests ⬜

#### Acceptance Criteria
- [ ] Truth table: correct answer → no detection
- [ ] `added_num_and_den`: input 2/4 when expected 1/2 (added tops and bottoms) → detected
- [ ] `flipped_fraction`: input 2/1 when expected 1/2 → detected
- [ ] `random_fraction`: non-equivalent, doesn't match specific patterns → generic detection
- [ ] Each handler fires correctly on matching inputs, stays silent on non-matching

#### Files to Create
- `src/engine/MisconceptionDetector.test.ts`

#### Dependencies
- ENG-018 (MisconceptionDetector exists)

---

## Phase 5: Assessment + Core Polish (Day 5 — Friday)

**Objective:** Full lesson flow end-to-end on iPad.  
**Day 5 Deliverable:** Full lesson flow works end-to-end on iPad Safari.

---

### ENG-020: Assessment Problem Pools (JSON) ⬜

#### Acceptance Criteria
- [ ] A-1 Recognition: 3 problem sets (target 1/2, 1/3, 3/4) with 4 options each, one correct
- [ ] A-2 Construction: 3 options (target 1/2 from 1/1, target 2/3 from 1/1, target 1/4 from 1/2)
- [ ] A-3 Generalization: 2 options (target 1/2 find 2 equivalents, target 1/3 find 2 equivalents)
- [ ] One set selected at random per session from each pool
- [ ] Distractors are NOT equivalent to target (validated by engine)

#### Files to Create
- `src/content/assessment-pools.json`

#### Dependencies
- ENG-017 (guided practice scripts complete — assessment follows)

---

### ENG-021: Assessment UI ⬜

#### Acceptance Criteria
- [ ] A-1: Multiple-choice visual block cards, tappable, max 2 attempts
- [ ] A-2: Construction workspace with submit button, max 3 attempts
- [ ] A-3: "Submit first" / "Submit second" flow, both must be equivalent with different denominators
- [ ] On final incorrect: reveal correct answer with animation
- [ ] Score tracked in `LessonState.score`

#### Files to Create
- `src/components/Assessment/MultipleChoice.tsx`
- `src/components/Assessment/ConstructionTask.tsx`

#### Dependencies
- ENG-020 (assessment pools exist)

---

### ENG-022: Completion Screen ⬜

#### Acceptance Criteria
- [ ] Score display (X/3)
- [ ] Sam's response varies by score bracket (3/3, 2/3, 1/3, 0/3) per PRD Section 7.5
- [ ] 3/3: confetti + celebration
- [ ] 2/3: retry missed option
- [ ] 1/3: loop back to GP-3 + GP-4, re-assess
- [ ] 0/3: restart from Exploration

#### Files to Create
- `src/components/Assessment/CompletionScreen.tsx`

#### Dependencies
- ENG-021 (assessment UI records scores)

---

### ENG-023: Progress Dots ⬜

#### Acceptance Criteria
- [ ] Phase indicator in header bar
- [ ] Filled dot = completed, hollow = upcoming, pulsing = current
- [ ] Fill animation on phase transition
- [ ] 4 dots: Intro, Explore, Practice, Assess

#### Files to Create
- `src/components/shared/ProgressDots.tsx`

#### Dependencies
- ENG-004 (Phase type from types.ts)

---

### ENG-024: Sound Manager ⬜

#### Acceptance Criteria
- [ ] 5 synthesized sounds via Web Audio API (zero audio files):
  - Pop-pop (split): 600Hz → 500Hz triangle, 50ms each
  - Snap (combine): 440Hz × (1/fractionValue), triangle, 80ms
  - Correct: C5 → E5 rising major third, sine, 120ms each
  - Gentle low (incorrect): 220Hz triangle, 200ms — NOT a buzzer
  - Celebration: C5-E5-G5-C6 ascending arpeggio, sine, 80ms intervals
- [ ] `AudioContext.resume()` called on "Start Lesson" button tap
- [ ] Mute toggle in header, always visible
- [ ] Respects `prefers-reduced-motion` media query

#### Files to Create
- `src/audio/SoundManager.ts`

#### Dependencies
- ENG-001 (app scaffold exists)

---

### ENG-025: Checkpoint + Recovery System ⬜

#### Acceptance Criteria
- [ ] Serialize `LessonState` to `sessionStorage` on PHASE_TRANSITION, PROBLEM_COMPLETED, STUDENT_RESPONSE, SCORE_UPDATED
- [ ] Checkpoint includes timestamp and schema version
- [ ] On load: valid checkpoint (< 30 min old, matching schema) → recovery UI
- [ ] Recovery UI: Sam says "Hey, welcome back!" with [Keep Going] and [Start Over]
- [ ] Stale/invalid checkpoint → clear and start fresh
- [ ] `beforeunload` event triggers "Leave site?" if lesson not complete
- [ ] `popstate` handler absorbs back-button navigation

#### Files to Create
- `src/state/checkpoint.ts`

#### Dependencies
- ENG-004 (LessonState and reducer)

---

## Phase 6: Polish + Edge Cases (Day 6 — Saturday)

**Objective:** The experience feels polished, not just functional.  
**Day 6 Deliverable:** Polished experience with micro-animations, edge case handling, and offline support.

---

### ENG-026: Equivalence Reveal Animation ⬜

#### Acceptance Criteria
- [ ] Golden pulse + "=" symbol between equivalent blocks in comparison zone
- [ ] Duration: 600ms, ease-in-out
- [ ] Triggers when two equivalent fractions of different denominators are compared

---

### ENG-027: Incorrect Placement Animation ⬜

#### Acceptance Criteria
- [ ] Blocks bounce apart + "≠" symbol
- [ ] Overhanging portion of larger block pulses red
- [ ] Duration: 400ms, ease-out
- [ ] Gentle low sound plays

---

### ENG-028: Celebration Confetti ⬜

#### Acceptance Criteria
- [ ] Confetti particle animation on 3/3 completion
- [ ] CSS-only or lightweight (< 2KB added)
- [ ] Time-boxed: 2 hours max — ship without if behind schedule
- [ ] Celebration sound plays simultaneously

---

### ENG-029: Edge Case Handlers ⬜

#### Acceptance Criteria
- [ ] Rapid split tapping: 500ms debounce + max_denominator (12) enforcement
- [ ] Split into 0 or 1: UI only presents picker [2][3][4], no free-text
- [ ] Non-fraction text input ("idk", "hello"): classify → help_request or unrecognized → Sam redirects warmly
- [ ] Multi-touch: process first touch only, isDragging boolean guard
- [ ] Denominator > 12: reducer rejects, Sam says "Those pieces are as small as they can get!"
- [ ] Inactivity: 60s → "Take your time", 180s → dim screen + "Tap to continue", 600s → auto-checkpoint
- [ ] Locked UI elements during assessment: dimmed but visible, tap shows redirect message

---

### ENG-030: Responsive Layout — Portrait Mode ⬜

#### Acceptance Criteria
- [ ] iPad portrait: manipulative stacks above chat with toggle tab
- [ ] Smooth transition on screen rotation (CSS media queries)
- [ ] State preserved across rotation

---

### ENG-031: Accessibility — ARIA + Keyboard ⬜

#### Acceptance Criteria
- [ ] Every block: `role="listitem"`, `aria-label="Two-fourths block"`, `aria-roledescription="fraction block"`
- [ ] Workspace: `aria-live="polite"` region narrates state changes
- [ ] All sounds paired with visual equivalents
- [ ] Keyboard: Tab → block, Enter → select, Arrow keys → move, Enter → drop, Spacebar → Split
- [ ] 3px high-contrast focus ring

---

### ENG-032: PWA Configuration ⬜

#### Acceptance Criteria
- [ ] `vite-plugin-pwa` configured
- [ ] Service worker caches all assets
- [ ] `display: standalone` in manifest
- [ ] Offline-capable after initial load
- [ ] Standalone launch from iPad Home Screen (no Safari chrome)

---

## Phase 7: Demo + Delivery (Day 7 — Sunday)

**Objective:** Ship it.  
**Day 7 Deliverable:** Working prototype deployed. Demo video recorded. README complete.

---

### ENG-033: E2E Test — Happy Path ⬜

#### Acceptance Criteria
- [ ] Cypress test: complete entire lesson with all correct answers
- [ ] Reaches 3/3 completion screen
- [ ] No console errors during run

---

### ENG-034: E2E Test — Struggle Path ⬜

#### Acceptance Criteria
- [ ] Cypress test: give incorrect answers repeatedly
- [ ] Hints appear on first incorrect
- [ ] Auto-demonstrations appear on repeated incorrect
- [ ] Assessment still becomes available
- [ ] No console errors during run

---

### ENG-035: Final Bug Sweep ⬜

#### Acceptance Criteria
- [ ] Run full lesson 3 times on iPad Safari
- [ ] Note and fix any issues
- [ ] Zero console errors
- [ ] All animations smooth (60fps)
- [ ] Touch interactions responsive (< 100ms)

---

### ENG-036: Demo Video Recording ⬜

#### Acceptance Criteria
- [ ] Screen recorded on iPad (built-in recording, shows touch indicators)
- [ ] Landscape orientation
- [ ] 60–90 seconds
- [ ] Shot list per PRD Section 19:
  1. Setup (0:00–0:08): App loads, split-pane appears
  2. First Discovery (0:08–0:25): Tap block, split animation, pop-pop sound
  3. Exploration (0:25–0:40): Free play, equivalence reveal, Sam celebrates
  4. Struggle (0:40–0:55): Wrong answer → hint → retry → success
  5. Mastery (0:55–1:15): Assessment 3/3, confetti, completion screen
  6. Close (1:15–1:30): Montage → title card

---

### ENG-037: README ⬜

#### Acceptance Criteria
- [ ] Setup instructions (`npm install`, `npm run dev`)
- [ ] Technical approach overview
- [ ] Standards alignment (3.NF.A.3a/b, 4.NF.A.1)
- [ ] Known limitations
- [ ] Architecture diagram
- [x] *(Already created in initial commit — update as needed)*

---

### ENG-038: Final Deploy + Verification ⬜

#### Acceptance Criteria
- [ ] Vercel production deploy from `main` branch
- [ ] Test on iPad: load from URL
- [ ] Add to Home Screen → verify standalone PWA
- [ ] Enable airplane mode → verify offline functionality
- [ ] Full playthrough with no issues

---

## Completed Tickets

### ENG-001: Project Scaffold ✅

#### Plain-English Summary
Scaffolded the Vite + React + TypeScript project in the existing repo directory. Configured TypeScript strict mode, Vitest for testing, ESLint for linting, iPad Safari meta tags, PWA manifest stub, and the full `src/` directory skeleton per PRD Section 15.

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-001
- **Branch:** `feature/eng-001-project-scaffold`

#### Key Achievements
- Vite 7.3.1 + React 19.2 + TypeScript 5.9 (strict mode)
- Production build: 60.68 KB gzipped (well under 150 KB budget)
- Vitest configured with jsdom environment — smoke test passing
- ESLint with React + TypeScript plugins — zero errors
- iPad Safari: viewport meta (no pinch-zoom), apple-mobile-web-app-capable, manifest link
- PWA manifest stub at `public/manifest.json`
- All 10 `src/` subdirectories created per PRD Section 15: engine, brain, state, components (ChatPanel, Workspace, Assessment, shared), observers, content, audio

#### Files Created
- `package.json` — project config with dev/build/lint/test/preview scripts
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — strict TS config
- `vite.config.ts` — Vite with React plugin, `host: true` for iPad testing
- `vitest.config.ts` — Vitest with jsdom environment
- `eslint.config.js` — ESLint with React + TS plugins
- `index.html` — iPad Safari meta tags + manifest link
- `public/manifest.json` — PWA manifest stub
- `src/main.tsx` — React entry point
- `src/App.tsx` — minimal app shell
- `src/smoke.test.ts` — Vitest smoke test
- `.gitignore` — node_modules, dist, .env, .DS_Store
- `src/{engine,brain,state,components/*,observers,content,audio}/.gitkeep`

#### Verification
- `npx tsc -b` — zero type errors
- `npm test` — 1/1 passed
- `npm run lint` — zero errors
- `npm run build` — success (60.68 KB gzip)

#### Acceptance Criteria
- [x] Vite + React + TS project builds cleanly
- [x] Dev server runs and app loads in browser
- [x] TypeScript strict mode ON
- [x] Vitest configured, smoke test passes
- [x] ESLint configured, lint passes
- [x] iPad Safari meta tags in index.html
- [x] public/manifest.json PWA stub exists
- [x] All src/ subdirectories created per PRD Section 15
- [x] .gitignore covers standard exclusions
- [x] DEVLOG updated with ENG-001 entry

---

### ENG-002: Fraction Type + Engine Core ✅

#### Plain-English Summary
Implemented the FractionEngine as a standalone TypeScript module with the `Fraction` type and seven pure functions: `simplify`, `areEquivalent`, `split`, `combine`, `toCommonDenominator`, `isValidFraction`, and `parseStudentInput`. All functions are pure, synchronous, and fully typed. Added unit tests covering invariants and edge cases. Precondition violations (split parts < 2, simplify/toCommonDenominator with den 0) throw; combine no longer floors numerators.

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-002
- **Branch:** `feature/eng-002-fraction-engine`

#### Key Achievements
- `Fraction` interface exported; all operations use cross-multiplication for equivalence (no floats)
- `simplify` via GCD; `split`/`combine` roundtrip preserves equivalence
- `combine` throws on empty array or mismatched denominators (programming errors)
- `split` throws when parts < 2; `simplify`/`toCommonDenominator` throw on invalid denominator
- `parseStudentInput` returns `Fraction | null`; rejects den 0, den > 12, non-positive
- `isValidFraction` enforces positive integers, 1 ≤ denominator ≤ 12
- Private `gcd` and `lcm` helpers; 32 unit tests in `FractionEngine.test.ts` — all passing

#### Files Created
- `src/engine/FractionEngine.ts` — Fraction type + 7 exported functions + gcd/lcm helpers
- `src/engine/FractionEngine.test.ts` — unit tests for all functions and invariants

#### Verification
- `npx tsc -b` — zero errors
- `npm test` — 33 tests passed (smoke + 32 engine tests)
- `npm run lint` — zero errors
- `npm run build` — success

#### Acceptance Criteria
- [x] Fraction interface defined and exported
- [x] simplify, areEquivalent, split, combine, toCommonDenominator, isValidFraction, parseStudentInput implemented and exported
- [x] All functions pure, synchronous, fully typed
- [x] Cross-multiply used for equivalence; no floating-point comparison
- [x] Denominator 1–12 enforced in isValidFraction and parseStudentInput
- [x] Unit tests pass; implementation ready for ENG-003 property-based tests
- [x] DEVLOG updated with ENG-002 entry

---

## Architecture Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Mar 10 | Client-only, no backend | COPPA compliance via zero collection; eliminates latency; simplifies deployment |
| Mar 10 | `useReducer` over LangGraph for state machine | 7-day sprint; client-side FSM is faster to build and deploy than Python LangGraph backend |
| Mar 10 | Scripted dialogue over LLM | No latency for 8-year-olds; LLM upgrade seam built via TutorBrain interface |
| Mar 10 | Web Animations API over Framer Motion | Bundle budget (Framer Motion ~30KB gzipped); composited properties only |
| Mar 10 | DOM elements over Canvas for blocks | Free touch events, built-in accessibility, CSS transitions, easier debugging |
| Mar 10 | Rectangles over pie charts | Pedagogically superior: clean subdivision, edge alignment, maps to number line |
| Mar 10 | Web Audio synthesis over audio files | Zero file size, dynamic pitch, zero CORS, consistent latency on mobile Safari |
| Mar 10 | sessionStorage over localStorage | Dies with tab (COPPA); Safari preserves across tab evictions on iOS |
