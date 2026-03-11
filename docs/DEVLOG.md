# Fraction Quest — Development Log

**Project:** Fraction Quest (formerly Synthesis Tutor) — Interactive AI-Powered Fractions Tutor for Ages 8–12
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
| ENG-044 | Eval runner (automated quality checks) | ⬜ Pending | 1.5h |
| ENG-043 | Eval dataset (50+ test cases) | ⬜ Pending | 2h |
| ENG-032 | PWA configuration | ⬜ Pending | 0.5h |
| ENG-031 | Accessibility: ARIA + keyboard | ⬜ Pending | 1.5h |
| ENG-030 | Responsive layout: portrait mode | ⬜ Pending | 1h |
| ENG-029 | Edge case handlers | ⬜ Pending | 2h |
| ENG-028 | Celebration confetti | ⬜ Pending | 2h |
| ENG-027 | Incorrect placement animation | ⬜ Pending | 0.5h |
| ENG-026 | Equivalence reveal animation | ⬜ Pending | 1h |
| ENG-045 | Fraction Quest theme pass | ⬜ Pending | 5-9h |

### Phase 5: Assessment + Core Polish (Day 5 — Friday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-025 | Checkpoint + recovery system | ⬜ Pending | 1.5h |
| ENG-042 | Voice output (TTS via SpeechSynthesis) | ⬜ Pending | 1.5h |
| ENG-041 | Voice input (STT via Web Speech API) | ⬜ Pending | 2h |
| ENG-024 | Sound Manager | ⬜ Pending | 1h |
| ENG-023 | Progress dots | ⬜ Pending | 0.5h |
| ENG-022 | Completion screen | ⬜ Pending | 1.5h |
| ENG-021 | Assessment UI | ⬜ Pending | 2.5h |
| ENG-020 | Assessment problem pools (JSON) | ⬜ Pending | 1h |

### Phase 4: Integration + Voice + Observability (Day 4 — Thursday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-019 | Misconception detector tests | ⬜ Pending | 0.5h |
| ENG-018 | MisconceptionDetector (Claude tool) | ⬜ Pending | 1.5h |
| ENG-016 | Exploration Observer (simplified) | ⬜ Pending | 1.5h |
| ENG-015 | Chat ↔ Workspace integration | ⬜ Pending | 2h |
| ENG-040 | LangSmith observability integration | ⬜ Pending | 2h |
| ENG-039 | Wire ChatPanel to LLM | ⬜ Pending | 2h |
| ENG-017 | Reducer additions (TUTOR_RESPONSE, SET_LOADING) | ⬜ Pending | 1h |
| ENG-014 | useTutorChat hook (SSE streaming) | ⬜ Pending | 3h |

### Phase 3: Chat + LLM Integration (Day 3 — Wednesday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-013 | System prompt engineering (Sam persona) | ✅ Complete | 2h |
| ENG-012 | Claude tool definitions (FractionEngine → tools) | ✅ Complete | 2h |
| ENG-011 | Vercel edge function + Claude API proxy | ✅ Complete | 3h |
| ENG-010 | Chat panel UI | ⬜ Pending | 2h |

### Phase 2: Visual Manipulative (Day 2 — Tuesday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-009 | Wire blocks to reducer | ✅ Complete | 1h |
| ENG-008 | Combine interaction + animation | ✅ Complete | 2h |
| ENG-007 | Split interaction + animation | ✅ Complete | 2h |
| ENG-006 | FractionWorkspace component | ✅ Complete | 2h |
| ENG-005 | FractionBlock component | ✅ Complete | 3h |

### Phase 1: Foundation (Day 1 — Monday)

| Ticket | Description | Status | Est. |
|--------|-------------|--------|------|
| ENG-004 | LessonState types + reducer skeleton | ✅ Complete | 2h |
| ENG-003 | Engine property-based tests | ✅ Complete | 2h |
| ENG-002 | Fraction type + engine core | ✅ Complete | 3h |
| ENG-001 | Project scaffold | ✅ Complete | 1h |

**Total estimated hours: ~69h across 7 days**

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

### ENG-007: Split Interaction + Animation ✅

#### Plain-English Summary
Split interaction: tap block to select → tap Split in ActionBar → picker [2][3][4] → pre-dispatch check (denominator × parts ≤ 12) → SPLIT_BLOCK dispatched → new blocks animate in (400ms ease-out scaleX). Rejection shows Sam message; 500ms debounce on Split.

#### Acceptance Criteria
- [x] Tap block to select it (visual selection ring)
- [x] Split button in action bar (emphasized when block is selected)
- [x] Split picker shows options: [2] [3] [4] — no free-text input
- [x] Engine/reducer compute split and update state
- [x] Split animation: new blocks grow in (400ms, ease-out, scaleX)
- [x] Total width preserved (layout invariant)
- [x] Labels on new blocks (state-driven via FractionBlock)
- [x] 500ms debounce on Split button
- [x] Denominator > 12: pre-check; Sam message, no dispatch

#### Files Created / Modified
- `src/components/Workspace/ActionBar.tsx` (created)
- `src/App.tsx` — selectedBlockId, handleSplitRequest, splitRejectionMessage, splitBlockIds, ActionBar
- `src/components/Workspace/Workspace.tsx` — splitBlockIds prop, animateIn for split blocks
- `src/components/Workspace/FractionBlock.tsx` — animation 400ms ease-out (split spec)
- `docs/DEVLOG.md` — ENG-007 entry

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

### ENG-009: Wire Blocks to Reducer ✅

#### Plain-English Summary
Connect all visual interactions to the state reducer. Visual state is always derived from engine state.

#### Acceptance Criteria
- [x] All block interactions dispatch `LessonAction` to reducer
- [x] Visual rendering is a pure function of `LessonState.blocks`
- [x] `isDragging` guard prevents multi-touch conflicts
- [x] 500ms debounce on Split action
- [x] Impossible states rejected (denominator > 12, invalid combine)
- [x] No visual state exists outside the reducer

#### Files Modified
- `src/components/Workspace/Workspace.tsx`
- `src/state/reducer.ts` (if needed)

#### Dependencies
- ENG-005 through ENG-008 (all workspace components exist)

---

## Phase 3: Chat + LLM Integration (Day 3 — Wednesday)

**Objective:** Sam talks to the student through Claude with FractionEngine tools.
**Day 3 Deliverable:** Claude responds conversationally via /api/chat. Chat panel shows streaming responses. iPad checkpoint: test on actual iPad today.

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

### ENG-011: Vercel Edge Function + Claude API Proxy ⬜

#### Plain-English Summary
Create a Vercel Edge Function at `/api/chat` that proxies requests to the Claude API with SSE streaming. FractionEngine runs server-side as tool execution. API key stored in Vercel env vars.

#### Acceptance Criteria
- [ ] `/api/chat.ts` edge function accepts POST with messages + lessonState
- [ ] Streams Claude responses back via SSE (text_delta, tool_use, done events)
- [ ] Tool calls executed server-side using FractionEngine
- [ ] ANTHROPIC_API_KEY in Vercel env vars (never client-side)
- [ ] `vercel.json` routes `/api/*` to edge functions
- [ ] Testable via curl

#### Files to Create
- `api/chat.ts`
- `vercel.json`

#### Dependencies
- ENG-001 (project scaffold), ENG-002 (FractionEngine for tool execution)

---

### ENG-012: Claude Tool Definitions ✅

#### Plain-English Summary
Defined 9 tools in Anthropic schema format and executeToolCall dispatcher. api/chat.ts passes tools to Claude, runs tool-use loop (create → tool_use → execute → tool_result → create), and emits tool_use/tool_result SSE events.

#### Acceptance Criteria
- [x] 9 tools: check_equivalence, simplify_fraction, split_fraction, combine_fractions, find_common_denominator, validate_fraction, parse_student_input, check_answer, get_workspace_state
- [x] executeToolCall maps tool_use to FractionEngine; check_answer = parse + areEquivalent; misconception stub
- [x] get_workspace_state from lessonState argument
- [x] api/chat.ts: tools passed to API; tool loop; tool_use/tool_result SSE

#### Files Created / Modified
- `api/tools.ts` (created), `api/chat.ts` (tools + loop), `docs/DEVLOG.md`

---

### ENG-013: System Prompt Engineering ✅

#### Plain-English Summary
Created `api/system-prompt.ts` with `buildSystemPrompt(lessonState)`; seven sections (identity, voice, pedagogy, math firewall, phase context, phase guidance, tool usage). Wired into `api/chat.ts`; stub replaced with `buildSystemPrompt(lessonState)`.

#### Acceptance Criteria
- [x] Sam's identity (Wizard Owl), voice (15 words/sentence, 3 sentences, contractions, no negative words), pedagogy, math firewall (all 9 tools), phase context + phase guidance (intro/explore/guided/assess/complete), tool usage
- [x] api/chat.ts uses buildSystemPrompt(lessonState)
- [x] api/system-prompt.ts created

---

## Phase 4: Integration + Voice + Observability (Day 4 — Thursday)

**Objective:** Chat and manipulative work together. Voice mode and observability added.
**Day 4 Deliverable:** Full intro-to-guided-practice flow with LLM. Voice mode functional on iPad. All LLM calls traced in LangSmith.

---

### ENG-015: Chat ↔ Workspace Integration ⬜

#### Acceptance Criteria
- [ ] Tutor messages trigger workspace highlights (CSS pulse on referenced blocks/buttons)
- [ ] Workspace actions (split, combine, compare) trigger script advancement
- [ ] Bidirectional: chat drives workspace AND workspace drives chat

#### Dependencies
- ENG-009 (blocks wired to reducer), ENG-010 (chat panel), ENG-013 (TutorBrain)

---

### ENG-016: Exploration Observer (simplified) ⬜

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

### ENG-014: useTutorChat Hook ⬜

#### Plain-English Summary
React hook that manages communication with `/api/chat`. Handles SSE streaming, typing indicators, and dispatches responses to the reducer.

#### Acceptance Criteria
- [ ] Sends messages + lessonState to `/api/chat` via POST
- [ ] Parses SSE stream (text_delta, tool_use, done)
- [ ] Dispatches TUTOR_RESPONSE with streaming text
- [ ] Dispatches SET_LOADING for typing indicator
- [ ] Tool-triggered workspace changes dispatch SPLIT_BLOCK, COMBINE_BLOCKS etc.

#### Files to Create
- `src/brain/useTutorChat.ts`

#### Dependencies
- ENG-011 (edge function), ENG-017 (new reducer actions)

---

### ENG-017: Reducer Additions ⬜

#### Plain-English Summary
Add TUTOR_RESPONSE and SET_LOADING actions to the reducer and types for async LLM integration.

#### Acceptance Criteria
- [ ] `TUTOR_RESPONSE` action: appends tutor message, supports `isStreaming` flag
- [ ] `SET_LOADING` action: toggles loading state for typing indicator
- [ ] `isLoading: boolean` added to LessonState
- [ ] Types updated in `src/state/types.ts`
- [ ] Existing tests still pass

#### Files to Modify
- `src/state/types.ts`
- `src/state/reducer.ts`
- `src/state/reducer.test.ts`

#### Dependencies
- ENG-004 (existing types and reducer)

---

### ENG-039: Wire ChatPanel to LLM ⬜

#### Plain-English Summary
Connect the ChatPanel UI to the useTutorChat hook. Show streaming responses with typing indicator.

#### Acceptance Criteria
- [ ] Student messages sent via useTutorChat hook
- [ ] Sam's responses stream in real-time (character by character)
- [ ] Typing indicator ("Sam is thinking...") while waiting
- [ ] Auto-scroll to latest message during streaming

#### Files to Modify
- `src/components/ChatPanel/ChatPanel.tsx`

#### Dependencies
- ENG-010 (ChatPanel UI), ENG-014 (useTutorChat hook)

---

### ENG-040: LangSmith Observability ⬜

#### Plain-English Summary
Integrate LangSmith tracing into the edge function. Trace all Claude calls, tool executions, token usage, and latency.

#### Acceptance Criteria
- [ ] LangSmith SDK (`langsmith`) initialized in edge function
- [ ] Each `/api/chat` request creates a trace with lesson phase metadata
- [ ] Claude API call logged as a run (input, output, tokens)
- [ ] Each tool call logged as a child run within the trace
- [ ] Latency (total + TTFB) recorded
- [ ] LANGSMITH_API_KEY and LANGSMITH_PROJECT in Vercel env vars
- [ ] Async flush — never blocks response

#### Files to Modify
- `api/chat.ts`

#### Dependencies
- ENG-011 (edge function exists)

---

### ENG-018: MisconceptionDetector (Claude tool) ⬜

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

### ENG-041: Voice Input (STT) ⬜

#### Plain-English Summary
Add speech-to-text via Web Speech API. Microphone button next to text input.

#### Acceptance Criteria
- [ ] `useVoiceInput` hook using `webkitSpeechRecognition`
- [ ] Microphone toggle button in ChatPanel input area
- [ ] Transcript feeds into same STUDENT_RESPONSE path as typed text
- [ ] Visual indicator when listening (pulsing mic icon)
- [ ] Graceful fallback if permission denied or API unavailable

#### Files to Create
- `src/brain/useVoiceInput.ts`

#### Dependencies
- ENG-010 (ChatPanel UI)

---

### ENG-042: Voice Output (TTS) ⬜

#### Plain-English Summary
Add text-to-speech via browser SpeechSynthesis API. Sam reads responses aloud.

#### Acceptance Criteria
- [ ] `useVoiceOutput` hook using `SpeechSynthesis`
- [ ] Speaker button on each Sam message (tap to hear)
- [ ] Auto-speak toggle: Sam automatically reads new messages
- [ ] Rate and pitch tuned for child-friendliness
- [ ] Respects mute toggle

#### Files to Create
- `src/brain/useVoiceOutput.ts`

#### Dependencies
- ENG-039 (ChatPanel wired to LLM)

---

## Phase 6: Polish + Edge Cases (Day 6 — Saturday)

**Objective:** The experience feels polished, not just functional.  
**Day 6 Deliverable:** Polished experience with micro-animations, edge case handling, and offline support.

---

### ENG-043: Eval Dataset ⬜

#### Plain-English Summary
Create 50+ test cases covering happy path, edge cases, and adversarial inputs for automated LLM quality evaluation.

#### Acceptance Criteria
- [ ] 50+ test cases in JSON format
- [ ] Categories: happy path, misconceptions, adversarial, multi-step
- [ ] Each case: input message, expected tool calls, output quality criteria

#### Files to Create
- `eval/dataset.json`

#### Dependencies
- ENG-011 through ENG-013 (edge function + tools + prompt)

---

### ENG-044: Eval Runner ⬜

#### Plain-English Summary
Script that runs eval dataset against /api/chat and checks math correctness, tool selection, and persona adherence.

#### Acceptance Criteria
- [ ] Runs all test cases against `/api/chat`
- [ ] Checks: correct tool called, math answer correct, response within voice constraints
- [ ] Results logged to LangSmith with eval metadata
- [ ] Summary report (pass/fail/accuracy)

#### Files to Create
- `eval/run.ts`

#### Dependencies
- ENG-043 (dataset), ENG-040 (LangSmith)

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

### ENG-003: Engine Property-Based Tests ✅

#### Plain-English Summary
Added property-based tests for the FractionEngine using fast-check. Four invariants are asserted over 10,000 random valid fractions each: reflexivity and symmetry of `areEquivalent`, split-combine roundtrip, and simplify preserves value and does not increase denominator. Existing ENG-002 unit tests (including edge cases: den 0, den > 12, negative, non-integer parse) were confirmed and left unchanged.

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-003
- **Branch:** `feature/eng-003-engine-property-tests`

#### Key Achievements
- fast-check added as dev dependency
- `arbitraryFraction`: numerator 1–100, denominator 1–12 (integers)
- Reflexivity: `areEquivalent(f, f)` for 10k runs
- Symmetry: `areEquivalent(a, b) === areEquivalent(b, a)` for 10k runs
- Split-combine roundtrip: `areEquivalent(combine(split(f, parts)), f)` for parts 2–6, 10k runs
- Simplify preserves value: `areEquivalent(f, simplify(f))` and `simplify(f).denominator <= f.denominator` for 10k runs
- All 37 tests pass (32 unit + 4 property-based + 1 smoke)

#### Files Modified
- `package.json` — devDependency `fast-check`
- `src/engine/FractionEngine.test.ts` — import fc, arbitraryFraction, new describe "FractionEngine property-based" with 4 `fc.assert` tests

#### Verification
- `npx tsc -b` — zero errors
- `npm test` — 37 tests passed (property tests complete in ~150 ms)
- `npm run lint` — zero errors
- `npm run build` — success

#### Acceptance Criteria
- [x] fast-check available as dev dependency
- [x] Reflexivity property: 10,000 runs, passing
- [x] Symmetry property: 10,000 runs, passing
- [x] Split-combine roundtrip property: 10,000 runs, passing
- [x] Simplify preserves value property: 10,000 runs, passing
- [x] Existing ENG-002 edge case unit tests confirmed present and passing
- [x] `npm test` passes (all unit + property tests)
- [x] DEVLOG updated with ENG-003 entry
- [x] Feature branch created

---

### ENG-004: LessonState Types + Reducer Skeleton ✅

#### Plain-English Summary
Defined the shared TypeScript contract in `src/state/types.ts` (Fraction re-export, Phase, FractionBlock, ChatMessage, LessonState, AssessmentProblem, LessonAction) and implemented the lesson state reducer in `src/state/reducer.ts`. Reducer is pure, handles all 12 action variants, enforces phase order (intro → explore → guided → assess → complete), rejects split when result denominator > 12, rejects invalid combine, and uses deterministic block IDs via `nextBlockId`. Initial state seeds one 1/2 block per PRD intro.

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-004
- **Branch:** `feature/eng-004-lesson-state-reducer`

#### Key Achievements
- `types.ts`: re-export Fraction from engine; Phase, FractionBlock, ChatMessage, LessonState, AssessmentProblem, LessonAction
- `getInitialLessonState()`: phase intro, one 1/2 block, stepIndex 0, score 0/0, empty chat/assessment/concepts, isDragging false, nextBlockId 1
- Reducer: PHASE_TRANSITION (valid next only), SPLIT_BLOCK (engine split + den ≤ 12), COMBINE_BLOCKS (same den, isValidFraction), COMPARE_BLOCKS, STUDENT_RESPONSE (append message), ADVANCE_SCRIPT, REQUEST_HINT, RESET_WORKSPACE, SELECT_BLOCK, DESELECT_ALL, DRAG_START, DRAG_END
- `getColorForDenominator` for PRD denominator-family colors; deterministic block IDs
- 24 reducer tests: initial state, phase transitions, SPLIT/COMBINE success and reject, SELECT/DESELECT, DRAG, others

#### Files Created
- `src/state/types.ts` — shared interfaces and Fraction re-export
- `src/state/reducer.ts` — lessonReducer, getInitialLessonState, getColorForDenominator
- `src/state/reducer.test.ts` — 24 unit tests for reducer and phase transitions

#### Verification
- `npx tsc -b` — zero errors
- `npm test` — 61 tests passed (37 engine + 24 reducer + 1 smoke)
- `npm run lint` — zero errors

#### Acceptance Criteria
- [x] Fraction, FractionBlock, LessonState, LessonAction, ChatMessage, Phase, AssessmentProblem defined in types.ts
- [x] Reducer handles all LessonAction variants
- [x] Phase transitions work (intro → explore → guided → assess → complete) and are tested
- [x] Reducer rejects impossible states (split den > 12, invalid combine)
- [x] getInitialLessonState() returns valid initial state
- [x] npm test and npx tsc -b pass
- [x] DEVLOG updated with ENG-004 entry
- [x] Feature branch created

---

### ENG-005: FractionBlock Component ✅

#### Plain-English Summary
Implemented the FractionBlock presentational component: colored rectangle with denominator grid lines, width proportional to fraction value (via optional referenceWidth), 60×60pt minimum touch target, label (e.g. "1/4"), selected state (blue glow), and aria-label with spoken fraction. Tap invokes optional onSelect. App updated to render one block from getInitialLessonState for manual verification.

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-005
- **Branch:** `feature/eng-005-fraction-block`

#### Key Achievements
- `FractionBlock.tsx`: props block, referenceWidth (default 200), onSelect; DOM-based (no Canvas)
- Width = max(60, value × referenceWidth); grid lines via absolute-positioned dividers; uses block.color
- getSpokenFraction() for aria-label (e.g. "One fourth", "Two halves"); keyboard Enter/Space trigger onSelect
- App shows single block from initial state for manual check

#### Files Created
- `src/components/Workspace/FractionBlock.tsx` — FractionBlock component and FractionBlockProps

#### Files Modified
- `src/App.tsx` — render one FractionBlock from getInitialLessonState().blocks[0]
- `docs/DEVLOG.md` — ENG-005 entry

#### Verification
- `npx tsc -b` — zero errors
- `npm run lint` — zero errors
- `npm test` — 61 passed
- `npm run build` — success

#### Acceptance Criteria
- [x] FractionBlock.tsx under src/components/Workspace/
- [x] Props: block, optional referenceWidth, optional onSelect
- [x] Colored rectangle, width proportional to fraction value, grid lines, block.color, min 60×60pt
- [x] Label and selected-state blue glow; aria-label with spoken fraction
- [x] Manual verification via App; no reducer/dispatch inside component
- [x] Feature branch created

---

### ENG-006: FractionWorkspace Component ✅

#### Plain-English Summary
Implemented the FractionWorkspace layout: reference bar (1 whole) at top, ComparisonZone for blocks with position 'comparison', and active blocks area for position 'workspace'. Workspace and ComparisonZone receive blocks from props; no internal state. App renders Workspace with getInitialLessonState().blocks for manual verification. touch-action: none on workspace for future drag (ENG-008).

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-006
- **Branch:** `feature/eng-006-fraction-workspace`

#### Key Achievements
- Workspace.tsx: props blocks, referenceWidth (default 300), onSelectBlock; reference bar (#9E9E9E, 1/1), ComparisonZone, active area; blocks split by position
- ComparisonZone.tsx: props blocks, referenceWidth, onSelectBlock; empty state "Drop blocks here to compare"; renders FractionBlock per block
- App uses Workspace with state.blocks; reference bar and zones in logical order (reference → comparison → workspace)

#### Files Created
- `src/components/Workspace/Workspace.tsx` — layout and block placement by position
- `src/components/Workspace/ComparisonZone.tsx` — comparison blocks + empty state

#### Files Modified
- `src/App.tsx` — render Workspace with state.blocks, referenceWidth 300
- `docs/DEVLOG.md` — ENG-006 entry

#### Verification
- `npx tsc -b` — zero errors
- `npm run lint` — zero errors
- `npm test` — 61 passed
- `npm run build` — success

#### Acceptance Criteria
- [x] Workspace.tsx: reference bar, comparison zone, active blocks area; blocks from props
- [x] ComparisonZone.tsx: comparison blocks and empty state
- [x] FractionBlock used for all blocks with shared referenceWidth and onSelectBlock
- [x] No internal state for blocks; App passes getInitialLessonState().blocks
- [x] Feature branch created

---

### ENG-008: Combine Interaction + Animation ✅

#### Plain-English Summary
Implemented drag-to-combine using `@use-gesture/react`: FractionBlock has useDrag, Workspace does bounding-box drop detection and wires combine flow. App uses useReducer and dispatches DRAG_START/DRAG_END/COMBINE_BLOCKS; pre-dispatch check for same denominator; different-denominator shows Sam rejection message and block snaps back. Combine animation (350ms ease-in-out, scaleX grow-in) on new block; single-touch guard via isDragging.

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-008
- **Branch:** `feature/eng-008-combine-interaction`

#### Key Achievements
- `@use-gesture/react` installed; FractionBlock: useDrag, onDragStart, onDragEnd(blockId, rect), onBlockRef, dragDisabled; transform + scale during drag; will-change
- Workspace: blockRefs map, findDropTarget(draggedId, rect); passes onCombineAttempt(draggedId, targetId)
- App: useReducer, handleDragStart (DRAG_START + draggingBlockId), handleCombineAttempt (pre-check denominators; COMBINE_BLOCKS or rejection message); combinedBlockId for animation
- Rejection: "Those are different sizes — try blocks that are the same size!" in aria-live alert
- Combine-in animation: Web Animations API scaleX(0)→scaleX(1), 350ms ease-in-out, transform-origin left

#### Files Modified
- `package.json` — dependency @use-gesture/react
- `src/App.tsx` — useReducer, drag/combine handlers, rejection message, combinedBlockId
- `src/components/Workspace/FractionBlock.tsx` — useDrag, drag props, animateIn (350ms)
- `src/components/Workspace/Workspace.tsx` — blockRefs, findDropTarget, drag/combine props, combinedBlockId
- `docs/DEVLOG.md` — ENG-008 entry

#### Verification
- `npx tsc -b` — zero errors
- `npm run lint` — zero errors
- `npm test` — 61 passed
- `npm run build` — success

#### Acceptance Criteria
- [x] @use-gesture/react installed and used for drag
- [x] Same-denominator: COMBINE_BLOCKS dispatched; combine animation (350ms); new block correct width
- [x] Different-denominator: no dispatch; Sam message; block snaps back (transform reset)
- [x] Single-touch guard via isDragging and dragDisabled
- [x] will-change: transform during drag
- [x] Combined block width = sum of original (reducer/engine)
- [x] Feature branch created

---

### ENG-007: Split Interaction + Animation ✅

#### Plain-English Summary
Implemented the split interaction: ActionBar with Split button (min 44×44pt) and picker [2][3][4]. Parent derives selectedBlockId from state; onSplitRequest runs pre-dispatch check (selectedBlock.fraction.denominator * parts > 12) and either shows Sam message (“Those pieces are as small as they can get!”) or dispatches SPLIT_BLOCK. New blocks animate in via scaleX(0)→scaleX(1), 400ms ease-out, transform-origin left; total width preserved. 500ms debounce on Split; selection clears after split (reducer creates new blocks with isSelected: false).

#### Metadata
- **Status:** Complete
- **Date:** Mar 10, 2026
- **Ticket:** ENG-007
- **Branch:** `feature/eng-007-split-interaction`

#### Key Achievements
- ActionBar.tsx: selectedBlockId, onSplitRequest, rejectionMessage; Split button; picker [2][3][4]; 500ms debounce (state + useEffect); aria-labels
- App: selectedBlockId from state.blocks; handleSplitRequest (pre-check den * parts > 12, set splitRejectionMessage or setSplitBlockIds + dispatch SPLIT_BLOCK); splitBlockIds cleared after 400ms
- Workspace: splitBlockIds prop; animateIn = combinedBlockId || splitBlockIds.includes(block.id)
- FractionBlock: grow-in animation 400ms ease-out (primer spec)

#### Files Modified
- `src/components/Workspace/ActionBar.tsx` — created
- `src/App.tsx` — ActionBar, selectedBlockId, handleSplitRequest, splitRejectionMessage, splitBlockIds
- `src/components/Workspace/Workspace.tsx` — splitBlockIds, animateIn for split
- `src/components/Workspace/FractionBlock.tsx` — 400ms ease-out for grow-in
- `docs/DEVLOG.md` — ENG-007 entry

#### Verification
- `npx tsc -b` — zero errors
- `npm run lint` — zero errors

#### Acceptance Criteria
- [x] ActionBar with Split button (44×44pt min) and picker [2][3][4]
- [x] 500ms debounce on Split
- [x] Pre-dispatch check: den * parts > 12 → Sam message, no dispatch
- [x] After successful split, selection clears
- [x] Split animation: scaleX 0→1, 400ms ease-out, transform-origin left; total width preserved
- [x] Labels on new blocks (FractionBlock)
- [x] Feature branch created

---

### ENG-012: Claude Tool Definitions ✅

#### Plain-English Summary
Added `api/tools.ts` with 9 tool definitions (Anthropic schema) and `executeToolCall(name, input, lessonState)` that dispatches to FractionEngine. `check_answer` parses student input and checks equivalence; misconception is optional (stub until ENG-018). `get_workspace_state` returns phase, stepIndex, blocks, score, conceptsDiscovered from lessonState. Updated `api/chat.ts` to pass `toolDefinitions` to Claude, use `messages.create()` in a loop: on `tool_use`, execute tools, append tool_result to conversation, continue until `end_turn`; emit SSE events `text_delta`, `tool_use`, `tool_result`, `done`.

#### Metadata
- **Status:** Complete
- **Date:** Mar 11, 2026
- **Ticket:** ENG-012
- **Branch:** `feature/eng-012-tool-definitions`

#### Key Achievements
- **api/tools.ts:** toolDefinitions array (9 tools), executeToolCall with try/catch; unknown tool → `{ error }`; check_answer composite; get_workspace_state from lessonState
- **api/chat.ts:** imports tools and executeToolCall; lessonState from body with default; messages.create() loop; tool_use → execute → tool_result → next round; SSE tool_use, tool_result, text_delta, done

#### Files Modified
- `api/tools.ts` — created
- `api/chat.ts` — tool loop, lessonState, toolDefinitions, stubs removed
- `docs/DEVLOG.md` — ENG-012 entry

#### Verification
- `npx tsc -b` — zero errors
- `npm run lint` — zero errors

#### Acceptance Criteria
- [x] 9 tool schemas in Anthropic format; executeToolCall for all; check_answer composite; get_workspace_state from lessonState
- [x] api/chat.ts passes tools and handles tool_use loop; emits tool_use/tool_result SSE
- [x] Errors returned as { error }; no thrown exceptions from tools
- [x] DEVLOG updated

---

### ENG-013: System Prompt Engineering ✅

#### Plain-English Summary
Added `api/system-prompt.ts` exporting `buildSystemPrompt(lessonState): string`. Seven sections: Identity (Sam the Wizard Owl, themed vocabulary), Voice Constraints (15 words/sentence, 3 sentences, contractions, no negative words), Pedagogical Approach (celebrate, scaffold, guide), Math Firewall (NEVER compute math; list all 9 tools; tool result is sole authority), Current Lesson State (phase, stepIndex, blocks, score, conceptsDiscovered), Phase-Specific Guidance (intro, explore, guided, assess, complete), When to Use Each Tool. Dynamic content uses safe defaults for missing lessonState fields. `api/chat.ts` now imports `buildSystemPrompt` and replaces the hardcoded stub with `buildSystemPrompt(lessonState)`.

#### Metadata
- **Status:** Complete
- **Date:** Mar 11, 2026
- **Ticket:** ENG-013
- **Branch:** `feature/eng-013-system-prompt`

#### Key Achievements
- **api/system-prompt.ts:** Pure, synchronous builder; IDENTITY, VOICE_CONSTRAINTS, PEDAGOGICAL_APPROACH, MATH_FIREWALL, TOOL_USAGE_GUIDANCE constants; buildPhaseContext(lessonState), getPhaseGuidance(phase); all 5 phases covered
- **api/chat.ts:** Import buildSystemPrompt; systemPrompt = buildSystemPrompt(lessonState)

#### Files Modified
- `api/system-prompt.ts` — created
- `api/chat.ts` — buildSystemPrompt import and usage
- `docs/DEVLOG.md` — ENG-013 entry

#### Verification
- `npx tsc -b` — zero errors
- `npm run lint` — zero errors

#### Acceptance Criteria
- [x] buildSystemPrompt(lessonState) exported; pure, synchronous
- [x] All 7 sections; voice constraints strict; math firewall lists 9 tools; phase guidance for intro/explore/guided/assess/complete
- [x] api/chat.ts uses buildSystemPrompt(lessonState); DEVLOG updated

---

### ENG-011: Vercel Edge Function + Claude API Proxy ✅

#### Plain-English Summary
Added the server-side API layer: Vercel Edge Function at `api/chat.ts` that accepts POST `{ messages, lessonState }`, streams Claude's response via SSE (`text_delta`, `done`), and uses a stub system prompt with no tools until ENG-012/ENG-013. API key from `ANTHROPIC_API_KEY`; 500 on missing key, 400 on invalid body.

#### Metadata
- **Status:** Complete
- **Date:** Mar 11, 2026
- **Ticket:** ENG-011
- **Branch:** `feature/eng-011-edge-function`

#### Key Achievements
- **api/chat.ts:** Edge runtime, POST only; validates messages array; Anthropic `messages.stream()` with model `claude-sonnet-4-20250514`; stub system prompt; no tools; ReadableStream that enqueues SSE events on `text` and `end`; `encodeSSE('text_delta', { content })` and `encodeSSE('done', {})`; error handler closes stream safely.
- **vercel.json:** rewrites `/api/:path*` to self for local `vercel dev`.
- **@anthropic-ai/sdk** added as dependency.
- **Error handling:** 405 Method not allowed, 500 API key not configured, 400 Invalid request (non-JSON or missing messages).

#### Files Created
- `api/chat.ts` — Edge Function, SSE streaming
- `vercel.json` — API rewrites

#### Files Modified
- `package.json` — added @anthropic-ai/sdk
- `docs/DEVLOG.md` — ENG-011 entry

#### Verification
- `npm run build` — success (client build; api/ built by Vercel on deploy)
- `npm run lint` — zero errors
- `npm test` — 61 passed

#### Acceptance Criteria
- [x] api/chat.ts exists with runtime: 'edge'
- [x] POST with { messages, lessonState }; streams text_delta and done
- [x] Stub system prompt; tools omitted (ENG-012 later)
- [x] ANTHROPIC_API_KEY env; 500 when missing
- [x] vercel.json with rewrites; @anthropic-ai/sdk installed
- [x] DEVLOG updated; feature branch created

---

## Architecture Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Mar 10 | ~~Client-only, no backend~~ → **SUPERSEDED**: Vercel Edge Function backend for Claude API proxy (see above) | COPPA compliance via zero collection; eliminates latency; simplifies deployment |
| Mar 10 | `useReducer` over LangGraph for state machine | 7-day sprint; client-side FSM is faster to build and deploy than Python LangGraph backend |
| Mar 10 | ~~Scripted dialogue over LLM~~ → **SUPERSEDED**: LLM-powered tutor with FractionEngine tools (see above) | No latency for 8-year-olds; LLM upgrade seam built via TutorBrain interface |
| Mar 10 | Web Animations API over Framer Motion | Bundle budget (Framer Motion ~30KB gzipped); composited properties only |
| Mar 10 | DOM elements over Canvas for blocks | Free touch events, built-in accessibility, CSS transitions, easier debugging |
| Mar 10 | Rectangles over pie charts | Pedagogically superior: clean subdivision, edge alignment, maps to number line |
| Mar 10 | Web Audio synthesis over audio files | Zero file size, dynamic pitch, zero CORS, consistent latency on mobile Safari |
| Mar 10 | sessionStorage over localStorage | Dies with tab (COPPA); Safari preserves across tab evictions on iOS |
| Mar 10 | LLM-powered tutor (Claude) over scripted JSON | Delivers genuinely adaptive, conversational experience; scripted feels dated in 2026; math safety preserved via tool use |
| Mar 10 | Vercel Edge Functions for API proxy | Already on Vercel; <50ms cold start; streaming-native; zero infra overhead |
| Mar 10 | Web Speech API for STT/TTS over OpenAI TTS | Free; local; works on iPad Safari; no additional API keys or latency |
| Mar 10 | LangSmith for observability | Native LangChain ecosystem; excellent tracing UI; built-in evals, datasets, and playground; great for tool call chain debugging |
| Mar 10 | Server-side tool execution | Avoids client-server round-trips for tool calls; keeps FractionEngine as single source of truth |
