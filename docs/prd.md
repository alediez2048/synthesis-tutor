Product Requirements Document: Synthesis Tutor
Version: 1.0
Date: 2026-03-10
Author: Alex / Senior AI EdTech Architect
Technical Contact: Patrick Skinner (patrick.skinner@superbuilders.school)
Status: Draft — Pending Engineering Review
Timeline: 7-Day Sprint (1-Week Challenge)

1. Executive Summary
**Fraction Quest** is a web-based, iPad-first interactive math lesson that teaches fraction equivalence to children aged 8–12. Themed as a fantasy adventure, it combines a conversational AI tutor ("Sam the Wizard Owl") with a digital manipulative workspace where students split, combine, and compare enchanted crystal shards. See `docs/theme.md` for the full Fraction Quest design system. The prototype delivers a single, self-contained lesson covering Common Core Standards 3.NF.A.3a, 3.NF.A.3b, and 4.NF.A.1.
The system uses a deterministic Fraction Engine for all mathematical operations and an LLM-powered conversational AI tutor (Claude) with FractionEngine tool use for deterministic math verification. The architecture uses a Vercel Edge Function backend for Claude API proxying with SSE streaming and is COPPA-compliant through zero PII collection and Anthropic's zero-retention API policy.
Deliverables (end of Day 7):

One working prototype of a fraction equivalence lesson, runnable in iPad Safari
A 1–2 minute demo video showcasing conversational flow and the interactive manipulative
A README with setup instructions and technical approach
Deployed to Vercel (cloud) with PWA offline support


2. Goals and Non-Goals
Goals:

Demonstrate the Synthesis learning model: exploration-driven discovery using digital manipulatives, not drill-and-kill quizzing
Teach fraction equivalence through visual, tactile interaction on iPad
Deliver a truly conversational AI tutor powered by Claude, with voice input/output and real-time observability
Achieve zero mathematical errors through a deterministic verification layer
Create a polished demo that tells the story "curious → struggling → confident"
Voice mode: speech-to-text input and text-to-speech output for natural interaction
Full observability via LangSmith: tracing, token usage, latency, tool call monitoring

Non-Goals (explicitly out of scope for this sprint):

Multiple LLM providers (Claude only for this sprint)
Multiple lessons or a lesson library
Student accounts, login, or cross-session persistence
Teacher dashboard or classroom management
RAG-based pedagogical engine
"Smashing" interaction (fraction addition — different concept, different lesson)
Full accessibility audit (Tier 1 ARIA + keyboard fallback included; Switch Control deferred)


3. Standards Alignment
StandardDescriptionTaught InAssessed In3.NF.A.3aUnderstand two fractions as equivalent if same sizeExploration phaseA-1 (Recognition)3.NF.A.3bRecognize and generate simple equivalent fractions using visual modelsGP-1, GP-2A-2 (Construction)4.NF.A.1Explain why a/b = (n×a)/(n×b) using visual modelsGP-3, GP-4A-3 (Generalization)
Grade Range: 3–5
Prerequisite Knowledge: Basic fraction notation (numerator/denominator), understanding of "whole"

4. System Architecture
4.1 Architecture Overview
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (iPad Safari)                       │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐ │
│  │ Chat Panel    │    │ Manipulative │    │ Sound Manager  │ │
│  │ + Voice I/O   │    │ Workspace    │    │ (Web Audio API)│ │
│  │ (React)       │    │ (React + DOM)│    │                │ │
│  └──────┬───────┘    └──────┬───────┘    └────────┬───────┘ │
│         │                   │                      │         │
│  ┌──────▼───────────────────▼──────────────────────▼───────┐ │
│  │              State Reducer (useReducer)                   │ │
│  │              Single Source of Truth                       │ │
│  │              LessonState → All UI Derived                │ │
│  └──────┬──────────────────┬───────────────────────────────┘ │
│         │                  │                                  │
│  ┌──────▼───────┐  ┌──────▼───────────────┐                 │
│  │ useTutorChat │  │ Voice Hooks           │                 │
│  │ (SSE Client) │  │ (STT + TTS)          │                 │
│  └──────┬───────┘  └─────────────────────┘                  │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────────┐│
│  │ Checkpoint Layer (sessionStorage)                         ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
              │ SSE streaming
              ▼
┌─────────────────────────────────────────────────────────────┐
│              VERCEL EDGE FUNCTION (/api/chat)                 │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐│
│  │ Claude API    │  │ Fraction     │  │ LangSmith Tracing   ││
│  │ (Sonnet)      │  │ Engine       │  │ (observability)    ││
│  │ + Tool Use    │  │ (server-side)│  │                    ││
│  └──────────────┘  └──────────────┘  └────────────────────┘│
└─────────────────────────────────────────────────────────────┘
Key principle: The client handles UI, state management, and voice I/O. The Vercel Edge Function handles Claude API calls, FractionEngine tool execution, and LangSmith tracing. Math correctness always comes from the deterministic FractionEngine — Claude generates pedagogy, never math. COPPA compliance via zero PII collection and Anthropic's zero-retention API policy.
4.2 Technology Stack
LayerTechnologyRationaleFrameworkVite + React + TypeScriptFast scaffold, excellent tree-shaking, typed interfacesState ManagementReact useReducerLightweight FSM, no external dependencyTouch/Gesture@use-gesture/reactBattle-tested touch handling, inertia, scroll-vs-dragAnimationCSS Transitions + Web Animations APIZero library overhead, composited properties onlyAudioWeb Audio API (synthesized)No asset loading, dynamic pitch, zero file sizeLLMClaude Sonnet (via @anthropic-ai/sdk)Conversational tutor with tool useBackendVercel Edge FunctionsAPI proxy, tool execution, streamingObservabilityLangSmithLLM tracing, token/cost tracking, evalsVoice (STT)Web Speech API (webkitSpeechRecognition)Free, local, iPad-nativeVoice (TTS)SpeechSynthesis APIFree, instant, offline-capableDeploymentVercel + vite-plugin-pwaAuto-deploy from Git, offline support, standalone modeTestingVitest + fast-checkProperty-based testing for engine, standard unit testsE2E TestingCypress (2 critical paths only)Happy path + struggle path
Performance Budgets:
MetricTargetInitial load (LCP)< 2 secondsTime to interactive< 3 secondsJS bundle (gzipped)< 150 KBAnimation framerate60 fpsTouch response latency< 100msMemory (heap)< 80 MBTotal asset size< 500 KB
4.3 Core Data Models
Fraction (primitive type):
typescriptinterface Fraction {
  numerator: number;   // positive integer
  denominator: number; // positive integer, 1–12
}
FractionBlock (visual element):
typescriptinterface FractionBlock {
  id: string;
  fraction: Fraction;
  color: string;           // by denominator family
  position: 'workspace' | 'comparison';
  isSelected: boolean;
}
LessonState (single source of truth):
typescriptinterface LessonState {
  phase: 'intro' | 'explore' | 'guided' | 'assess' | 'complete';
  stepIndex: number;
  blocks: FractionBlock[];
  score: { correct: number; total: number };
  hintCount: number;
  chatMessages: ChatMessage[];
  assessmentPool: AssessmentProblem[];  // randomized at session start
  conceptsDiscovered: Set<string>;      // tracked during exploration
  isDragging: boolean;                  // single-touch guard
}
LessonAction (all possible state transitions):
typescripttype LessonAction =
  | { type: 'SPLIT_BLOCK'; blockId: string; parts: number }
  | { type: 'COMBINE_BLOCKS'; blockIds: [string, string] }
  | { type: 'COMPARE_BLOCKS'; blockIds: [string, string] }
  | { type: 'STUDENT_RESPONSE'; value: Fraction | string }
  | { type: 'ADVANCE_SCRIPT' }
  | { type: 'REQUEST_HINT' }
  | { type: 'RESET_WORKSPACE' }
  | { type: 'PHASE_TRANSITION'; to: Phase }
  | { type: 'SELECT_BLOCK'; blockId: string }
  | { type: 'DESELECT_ALL' }
  | { type: 'DRAG_START'; blockId: string }
  | { type: 'DRAG_END' };
SessionRecord (event log):
typescriptinterface SessionRecord {
  sessionId: string;
  startedAt: number;
  events: SessionEvent[];
  outcome: {
    completed: boolean;
    score: { correct: number; total: number };
    totalTimeSeconds: number;
    misconceptionsDetected: string[];
  };
}
4.4 Fraction Engine API
All functions are pure, synchronous, and deterministic. The engine runs on the client with no network calls.
FunctionSignatureDescriptionsimplify(f: Fraction) → FractionReduce to lowest terms via GCDareEquivalent(a: Fraction, b: Fraction) → booleanCross-multiply check: a.n × b.d === b.n × a.dsplit(f: Fraction, parts: number) → Fraction[]Divide into N equal piecescombine(fractions: Fraction[]) → FractionSum fractions with same denominatortoCommonDenominator(a, b) → [Fraction, Fraction]Express with shared denominator (LCD)isValidFraction(f: Fraction) → booleanGuard: positive integers, den ≤ 12parseStudentInput(raw: string) → Fraction | nullParse "2/4", "2 / 4", etc.validate(state: WorkspaceState) → booleanInternal consistency check
Math Verification Layer flow:
Student Input → parseStudentInput() → FractionEngine.areEquivalent(input, target) → boolean → Script Branch
The LLM never evaluates mathematical correctness. The boolean from the engine is the sole authority.
4.5 TutorBrain (LLM-Powered)
```typescript
// The TutorBrain is now Claude with FractionEngine tools
// No ScriptedTutorBrain — Claude handles all conversation

// Claude tools (mapped from FractionEngine):
// - check_equivalence → areEquivalent(a, b)
// - simplify_fraction → simplify(f)
// - split_fraction → split(f, parts)
// - combine_fractions → combine(fractions)
// - find_common_denominator → toCommonDenominator(a, b)
// - validate_fraction → isValidFraction(f)
// - parse_student_input → parseStudentInput(raw)
// - check_answer → parse + areEquivalent + misconception detection
// - get_workspace_state → reads current LessonState

// Critical invariant unchanged: mathematical correctness
// ALWAYS comes from FractionEngine tools, NEVER from Claude's
// text generation. This is the zero-hallucination firewall.
```

5. Tutor Persona: "Sam the Wizard Owl"
Identity: Friendly, curious wizard owl guide. Not teacher, not parent, not peer. Wise mentor energy — think Hedwig meets Dumbledore, but approachable. Visual: round owl body, big eyes behind round glasses, crooked purple hat with gold stars, small expressive wings. SVG avatar with 5 expression states (neutral, thinking, happy, encouraging, celebrating). See `docs/theme.md` Section 5 for full character spec.
Themed vocabulary: Sam uses fantasy terms alongside proper math terms. "Crystal" for fraction block, "spell altar" for comparison zone, "spell table" for workspace. Math terms are never replaced — always paired. Example: "You split that crystal into two pieces — each one is one-fourth!"
Voice Constraints (mandatory for all scripted lines):
RuleGuidelineSentence lengthMaximum 15 wordsMessage lengthMaximum 3 sentencesToneContractions always ("let's", "that's"). Never formal.ErrorsNever use "wrong", "incorrect", "mistake", "error", "fail"Substitutes"not quite", "almost", "a little different", "let's try another way"Praise calibrationMatch enthusiasm to difficulty. "You got it!" not "OMG AMAZING!!!"Discovery emphasisCelebrate what the student found, not that they followed instructionsGrammar moodImperative or simple present. Never conditional ("if you were to...")VocabularyPair formal terms with plain English on first use. Use formal terms freely after.

6. UI Layout and Design
6.1 Screen Layout (iPad Landscape)
┌──────────────────────────────────────────────────────┐
│  [●] [●] [○] [○]  Fraction Quest          [🔇 Mute] │
├─────────────────────┬────────────────────────────────┤
│                     │  ┌──────────────────────────┐  │
│  Sam: "See that     │  │ REFERENCE: [████████ 1/1]│  │
│  blue block? Tap    │  └──────────────────────────┘  │
│  it!"               │                                │
│                     │  ┌──COMPARISON ZONE──────────┐  │
│  Sam: "Now press    │  │  (drop blocks here)       │  │
│  Split!"            │  └──────────────────────────┘  │
│                     │                                │
│                     │  ┌──WORKSPACE────────────────┐  │
│  [Student input]    │  │  [████ 1/2]               │  │
│  [Check Answer]     │  │                           │  │
│                     │  └──────────────────────────┘  │
├─────────────────────┴────────────────────────────────┤
│  [ Split ▼ ]    [ Combine ]    [ ✓ Check ]           │
└──────────────────────────────────────────────────────┘
      40%                        60%
iPad Portrait: Manipulative stacks above chat with toggle tab.
6.2 Visual Design System — "Fraction Quest" Theme
**Theme:** Fantasy adventure / RPG. Dark palette with glowing crystal accents. Full design system in `docs/theme.md`.
**App name:** Fraction Quest — "A Magical Math Adventure"
**Fonts:** Fredoka One (display/title), Nunito (body/UI) — both from Google Fonts. Base size 16px.
**Background:** Dark midnight gradient (`#1A1A2E` → `#16213E` → `#0F3460`).
Crystal colors by denominator (blocks are "enchanted crystals"):
DenominatorCrystal TypeHex1 (whole)Moonstone#B2BEC32 (halves)Sapphire#4A90D93 (thirds)Emerald#27AE604 (fourths)Amethyst#8E44AD5 (fifths)Citrine#F39C126 (sixths)Topaz#E67E228 (eighths)Aquamarine#16A08512 (twelfths)Rose Quartz#E84393
Block styling: Crystal gradient + shimmer overlay, 8px border-radius, gold selection ring (#FDCB6E), glowing shadows.
Block sizing: Width proportional to fraction value relative to the reference bar. 1/2 = 50% of reference bar width, 1/4 = 25%, etc.
Tap targets: Minimum 60×60 points for fraction blocks, 44×44 points for buttons (Apple HIG minimum).
Key UI mappings: Workspace → "Spell Table", Comparison Zone → "Spell Altar", Split → "Break Spell", Combine → "Fuse Crystals".
6.3 Critical iPad/Safari Requirements

<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
touch-action: none on manipulative workspace
CSS dvh units instead of vh to handle Safari's dynamic toolbar
"Start Lesson" button required on first screen to unlock AudioContext
display: standalone in PWA manifest for home-screen launch without Safari chrome


7. Lesson Flow — Complete Scripted Content
Note: The lesson flow below defines the pedagogical structure. In the LLM-powered architecture, Claude manages the conversational flow within each phase using the system prompt and FractionEngine tools. The beat-by-beat scripts below serve as the prompt engineering reference — they define what Sam should say and when, but Claude generates the actual responses adaptively.

7.1 Phase 1: Introduction (≈ 30 seconds)
Setup: Workspace pre-loaded with one 1/2 block (blue). No student action needed to begin.
BeatTimeSam SaysWorkspaceAdvance10s"Hi! I'm Sam the Wizard Owl. See that glowing sapphire crystal? →"Arrow pulses toward 1/2 crystalAuto (2s delay)22s"That's one-half of the whole crystal. Tap on it!"Crystal awaits tapStudent taps crystal3—"Now cast a split spell — press Split!"Split button pulsesStudent taps Split4—(Split picker appears: [2] [3] [4]) "How many pieces? Try 2!"Picker visibleStudent selects 25—"Whoa! You just split that crystal into two shards. Each piece is 1/4 — one quarter!"Split animation + sparklesAuto (2s)6—"Here's the magic — those two 1/4 shards together have the SAME power as the 1/2 crystal you started with."Both crystals glowAuto (2s)7—"What other spells can you discover? Try splitting and fusing crystals — see what happens!"Workspace open→ Phase 2
Inactivity handlers:

10s without tapping block → "Tap the blue block with your finger — right on the screen!" + emphatic arrow
10s without pressing Split → "See the Split button at the bottom? Give it a tap!"

7.2 Phase 2: Exploration (≈ 2–3 minutes)
Setup: Workspace seeded with one 1/2 block (blue) and one 1/3 block (green). All tools active.
Exploration Observer tracks three discovery goals:
GoalDetectionSam's ResponseSplitting produces smaller equal piecesStudent splits a block and views the pieces"Look at that — each piece got smaller, but there are more of them!"Combining produces larger piecesStudent combines same-denominator blocks"Nice! You snapped those pieces back together!"Different fractions can be the same sizeStudent places two equivalent fractions (different denominators) in comparison zone"Wait — did you see that?! {a} and {b} are the SAME SIZE even though they look different! You just discovered something really important."
Nudge rules:
TriggerSam's Nudge15s inactivity, < 3 actions"Try tapping a block and then pressing Split! See what happens." + highlight5 consecutive splits, no combines"You're great at splitting! Now try dragging two small blocks together to combine them."Smallest denominator > 8"Wow, those pieces are tiny! Let's start fresh with some bigger blocks." + reset workspace3 minutes elapsed, not all goals discoveredSam demonstrates undiscovered concepts, then transitionsAll 3 goals discovered"You've already figured out the big idea! Let me give you some challenges." → Phase 3
7.3 Phase 3: Guided Practice (4 problems)
GP-1: "Split to Discover"
FieldValueSetupOne 1/2 block (blue)Prompt"See that blue block? That's one-half. Tap it and press Split. Let's see what happens!"TypeGuided action — split 1/2 into 2 partsOn correct"Look at that! You turned one-half into two pieces. Each piece is one-fourth." → comparison prompt → "Two-fourths equals one-half. That's equivalent fractions!" → GP-2On split into 3"You split it into three — those are sixths. That works too, but let's try 2 pieces first." → retryOn inactivity"Tap the blue block first, then press Split!" + highlight
GP-2: "Build an Equivalent"
FieldValueSetupOne 1/3 block (green), fresh workspacePrompt"Can you make a fraction that's the same size as 1/3? Use the blocks to build it!"TypeOpen construction — any equivalent to 1/3 (2/6, 3/9, 4/12)ValidationFractionEngine.areEquivalent(result, {1, 3})On correct"You made {answer} — and it's exactly the same size as 1/3!" → GP-3On incorrect (1st)Misconception-specific response + "Try splitting the 1/3 block instead!"On incorrect (2nd)Auto-demonstrate: animate splitting 1/3 → 2/6 + explanationOn incorrect (3rd)"No worries! Splitting a fraction into equal pieces always gives an equivalent. Let's move on." → GP-3
GP-3: "Compare and Match"
FieldValueSetup1/2 block and 3/6 block side by sidePrompt"Look at these two blocks. Are they the same size? Drag them both to the comparison area!"TypeComparison verificationOn comparisonEquivalence reveal animation (golden pulse + "=") → "They match! 1/2 and 3/6 are equivalent!" + explain multiplicative pattern → GP-4On one block only"Good start! Now drag the other one up there too."On inactivity"Drag the blocks to the gray comparison area at the top." + highlight
GP-4: "The Challenge Round"
FieldValueSetupOne 2/4 block (purple)Prompt"Here's a trickier one. What's the simplest way to write 2/4?"TypeSimplification — recognize 2/4 = 1/2ValidationareEquivalent(result, {1, 2}) AND result.denominator < 4On correct"2/4 is really just 1/2 in disguise. When we combine pieces, we simplify!" → AssessmentOn incorrect (1st)"Look at the 2/4 block. Can you see a bigger block hiding inside?" + visual hint (dim subdivisions)On incorrect (2nd)Auto-demonstrate: animate combining two quarters into one half
7.4 Phase 4: Assessment (3 problems)
A-1: Recognition (Multiple Choice)
Problem pools (one set selected at random per session):
SetTargetOptions (✓ = correct)11/22/4 ✓, 1/3, 3/4, 2/321/32/6 ✓, 1/2, 2/4, 3/433/46/8 ✓, 2/3, 1/2, 5/6
Display as tappable visual blocks. Max 2 attempts. On 2nd incorrect → reveal correct with animation.
A-2: Construction
Problem pools:
OptionTargetStarting Block11/21/1 (whole)22/31/1 (whole)31/41/2
Student must build an equivalent (different representation, not the target itself). Max 3 attempts. No hints in assessment.
A-3: Generalization
Problem pools:
OptionTargetRequired Count11/22 different equivalents21/32 different equivalents
Both answers must be equivalent to target, have different denominators from each other, and not be the target itself in lowest terms.
7.5 Completion Screen
ScoreSam SaysAction3/3"You're a fraction master! You proved that the same amount can be written in lots of different ways."Confetti animation + celebration sound2/3"Great job! You really understand equivalent fractions. Want to try the one you missed again?"Option: retry missed OR finish1/3"You're getting there! Want to practice a little more?"Loop to GP-3 + GP-4, re-assess0/3"Fractions take practice, and you did great exploring today! Let's try again."Restart from Exploration

8. Sound Design
Five synthesized tones using Web Audio API (no audio files, zero loading time):
SoundTriggerImplementationPop-popBlock splitTwo descending tones: 600Hz → 500Hz, triangle wave, 50ms eachSnapBlock combinePitch varies by fraction size: 440Hz × (1/fractionValue), triangle, 80msCorrectRight answerRising major third: C5 (523Hz) → E5 (659Hz), sine, 120ms eachGentle lowWrong answerSingle 220Hz triangle wave, 200ms. NOT a buzzer.CelebrationLesson completeAscending arpeggio: C5-E5-G5-C6, sine, 80ms intervals
iPad requirement: AudioContext.resume() must be called on user gesture. The "Start Lesson" screen handles this.
Mute toggle: Always visible in header. Respects prefers-reduced-motion media query.

9. Error Recovery and Resilience
9.1 State Checkpointing
Serialize LessonState to sessionStorage on every significant action (PHASE_TRANSITION, PROBLEM_COMPLETED, STUDENT_RESPONSE, SCORE_UPDATED). Checkpoint includes timestamp and schema version.
9.2 Recovery Flow
On app load, check for a valid checkpoint (< 30 minutes old, matching schema version):

Valid checkpoint found: Sam says "Hey, welcome back! Want to keep going where we left off?" with [Keep Going] and [Start Over] buttons
Stale/invalid checkpoint: Clear and start fresh
No checkpoint: Normal start

9.3 Chat History Reconstruction
On recovery, show only Sam's last message + a collapsed "Earlier in this lesson..." section. Don't dump full history.
9.4 Navigation Guards

beforeunload event: trigger "Leave site?" dialog if lesson not complete
popstate handler: absorb back-button navigation with pushState

9.5 Inactivity Handling
DurationResponse60sSam: "Take your time — I'm here whenever you're ready!"180sDim screen (20% overlay) + "Tap to continue" prompt600sAuto-checkpoint, show "Welcome back!" on return

10. Edge Case Handling
ScenarioHandlerRapid Split tapping500ms debounce on Split button + max_denominator (12) enforcementSplit into 0 or 1UI presents picker [2][3][4] only — no free-text inputCombine different denominatorsSam: "Those are different sizes — try blocks that are the same size!" (smash-ready architecture underneath)Non-fraction text input ("idk", "hello")Classify as help_request or unrecognized → Sam redirects warmlyMulti-touch (5 fingers)Process first touch only; isDragging boolean guardDenominator > 12Reducer rejects: Sam: "Those pieces are as small as they can get!"Screen rotation mid-lessonCSS media queries handle relayout; state preserved

11. Accessibility (Prototype Scope)
Tier 1 — Screen Reader (Included)

Every block: role="listitem", aria-label="Two-fourths block", aria-roledescription="fraction block"
Workspace: aria-live="polite" region narrates state changes
All sounds paired with visual equivalents

Tier 2 — Keyboard Navigation (Included)

Tab to block → Enter to select → Arrow keys to move → Enter to drop
Spacebar shortcut for Split
3px high-contrast focus ring

Tier 3 — Cognitive (Design Principles Only)

Max 4 blocks visible at once (tray for extras)
No auto-advancing messages
Numerical labels always paired with visual blocks


12. Privacy and Compliance
COPPA strategy: Zero collection.
ConcernResolutionPersonal informationNone collected. No accounts, no names, no cookies.AnalyticsNone. No Google Analytics, Mixpanel, Segment.Data persistencesessionStorage only (dies with tab). No server-side storage.LLM API callsStudent messages sent to Anthropic API via Vercel Edge Function. No PII collected (no accounts, no names). Anthropic zero-retention policy — messages not stored or used for training.Third-party scriptsNone. No CDN dependencies that set cookies.Privacy noticeDisplayed on start screen: "This tutor uses AI. No personal information is collected or stored."
Post-prototype (when adding persistence): School contract model (SDPA), anonymous student IDs via school SSO (Clever/ClassLink), zero-retention LLM provider agreement, US data residency, annual compliance audit.

13. Deployment Architecture
Primary: Vercel (cloud)
git push → Vercel auto-build → https://synthesis-tutor.vercel.app → iPad Safari
Fallback: Local network
npm run dev -- --host 0.0.0.0 → http://192.168.x.x:5173 → iPad Safari
Offline: PWA (vite-plugin-pwa)

Service worker caches all assets on first load
display: standalone in manifest for native-like experience
Works in airplane mode after initial load


14. Project Phases and Sprint Plan
Phase 1: Foundation (Day 1 — Monday)
Objective: Rock-solid math engine and application scaffold.
TicketDescriptionAcceptance CriteriaEst. HoursENG-001Project scaffoldVite + React + TS project builds, deploys to Vercel, loads on iPad Safari1hENG-002Fraction type + engine coresimplify, areEquivalent, add, split, combine, toCommonDenominator, isValidFraction, parseStudentInput — all implemented as pure functions3hENG-003Engine property-based testsfast-check tests for reflexivity, symmetry, split-combine roundtrip, simplify-preserves-value. 10,000 iterations, all green.2hENG-004LessonState types + reducer skeletonAll types defined in types.ts. Reducer handles all LessonAction variants. Phase transitions work in console.2h
Day 1 Deliverable: Engine passes all tests. Reducer handles phase transitions in console demo.

Phase 2: Visual Manipulative (Day 2 — Tuesday)
Objective: Fraction blocks that look and feel tangible.
TicketDescriptionAcceptance CriteriaEst. HoursENG-005FractionBlock componentColored rectangle with subdivision grid lines, sized proportionally to fraction value. Color-coded by denominator family. 60×60pt minimum touch target.3hENG-006FractionWorkspace componentReference bar (1 whole) at top. Active blocks area. Comparison zone. Pre-seeded with initial blocks.2hENG-007Split interaction + animationTap block → select → tap Split → picker [2][3][4] → engine computes → block cracks and separates (400ms, ease-out). Total area preserved during animation. Labels appear on new blocks.2hENG-008Combine interaction + animationDrag two same-denominator blocks together → engine computes → snap animation (350ms) → seam dissolves → new label. Reject different-denominator with Sam message.2hENG-009Wire blocks to reducerAll visual state derived from engine state. isDragging guard for single-touch. Action debouncing (500ms on Split). Impossible-state rejection.1h
Day 2 Deliverable: Standalone page where you can split and combine fraction blocks visually with smooth animations.

Phase 3: Chat + LLM Integration (Day 3 — Wednesday)
Objective: Sam talks to the student through Claude with FractionEngine tools.
TicketDescriptionAcceptance CriteriaEst. HoursENG-010Chat panel UIScrollable message list. Sam avatar on tutor messages. Student input area. Auto-scroll to latest message.2hENG-011Vercel edge function + Claude API proxy + SSE streamingEdge function at /api/chat proxies to Claude API. SSE streaming works end-to-end. Error handling for rate limits and timeouts.3hENG-012Claude tool definitions (FractionEngine → tools)All FractionEngine functions exposed as Claude tools. Tool execution returns deterministic results. Tool schema validated.2hENG-013System prompt engineering (Sam persona, phase-aware)System prompt encodes Sam's voice constraints, current lesson phase, and pedagogical goals. Prompt tested against edge cases.2h
Day 3 Deliverable: Chat panel connected to Claude via edge function. Sam responds conversationally with FractionEngine tool use.
iPad checkpoint: Test on actual iPad today. Fix viewport, touch-action, and Safari layout issues immediately.

Phase 4: Integration + Voice + Observability (Day 4 — Thursday)
Objective: Full integration of chat, workspace, voice, and observability.
TicketDescriptionAcceptance CriteriaEst. HoursENG-014useTutorChat hook (SSE client, streaming, typing indicators)React hook manages SSE connection, streams Claude responses, shows typing indicator during generation.3hENG-017Reducer additions (TUTOR_RESPONSE, SET_LOADING)New action types for LLM responses and loading states. Reducer handles streaming updates.1hENG-039Wire ChatPanel to LLMChatPanel sends messages via useTutorChat. Streaming responses render in real-time. Error states handled gracefully.2hENG-040LangSmith integrationAll Claude API calls traced in LangSmith. Token usage, latency, and tool calls tracked. Dashboard accessible.2hENG-015Chat ↔ Workspace integration (modified for LLM)Tutor messages trigger workspace highlights (CSS pulse on referenced elements). Workspace actions sent as context to Claude.2hENG-016Exploration Observer (simplified)ExplorationObserver tracks 3 discovery goals. Nudge rules fire on inactivity, repetition, complexity. Discovery state passed to Claude as context.1.5hENG-018MisconceptionDetector (as Claude tool)parseStudentInput → FractionEngine.areEquivalent → boolean → misconception detection. Exposed as Claude tool for pedagogical response generation.1.5hENG-019Misconception detector testsTruth table tests: each handler fires correctly on matching inputs, stays silent on non-matching.0.5h
Day 4 Deliverable: Student plays through Intro → Exploration → Guided Practice with LLM-powered conversation, observability active.

Phase 5: Assessment + Core Polish (Day 5 — Friday)
Objective: Full lesson flow end-to-end on iPad.
TicketDescriptionAcceptance CriteriaEst. HoursENG-020Assessment problem pools (JSON)A-1, A-2, A-3 pools per Section 7.4. Randomized selection at session start.1hENG-021Assessment UIMultiple-choice cards (A-1). Construction workspace (A-2, A-3). Max-attempt logic. "Submit first / Submit second" for A-3.2.5hENG-022Completion screenScore display. Sam's response by score bracket (3/3, 2/3, 1/3, 0/3). Retry option for 2/3. Loop-back for 1/3 and 0/3.1.5hENG-023Progress dotsPhase indicator in header bar. Filled dot = completed, hollow = upcoming, pulsing = current. Fill animation on transition.0.5hENG-024Sound Manager5 synthesized sounds per Section 8. AudioContext unlock on "Start Lesson" tap. Mute toggle in header. prefers-reduced-motion respect.1hENG-025Checkpoint + recovery systemsessionStorage checkpointing per Section 9. Recovery UI with Sam's greeting. beforeunload + popstate guards.1.5hENG-041Voice input (STT)Web Speech API integration for speech-to-text. Microphone button in chat panel. Visual feedback during recording. iPad Safari compatible.2hENG-042Voice output (TTS)SpeechSynthesis API integration for text-to-speech. Sam's responses read aloud. Toggle for voice on/off. Natural pacing and pauses.1.5h
Day 5 Deliverable: Full lesson flow works end-to-end on iPad Safari with voice input/output.

Phase 6: Polish + Edge Cases (Day 6 — Saturday)
Objective: The experience feels polished, not just functional.
TicketDescriptionAcceptance CriteriaEst. HoursENG-026Equivalence reveal animationGolden pulse + "=" symbol between equivalent blocks in comparison zone (600ms).1hENG-027Incorrect placement animationBlocks bounce apart + "≠" symbol + overhanging portion pulses red (400ms).0.5hENG-028Celebration confettiConfetti particle animation on 3/3 completion. CSS-only or lightweight (< 2KB). Time-boxed: 2 hours max.2hENG-029Edge case handlersAll scenarios from Section 10: rapid tapping, gibberish input, multi-touch, inactivity timers, locked UI elements.2hENG-030Responsive layout: portrait modeManipulative stacks above chat with toggle tab in portrait. Smooth transition on rotation.1hENG-031Accessibility: ARIA + keyboardaria-labels on all blocks, aria-live workspace region, keyboard navigation (Tab/Enter/Arrow/Space), 3px focus ring.1.5hENG-032PWA configurationvite-plugin-pwa setup. Service worker caches all assets. display: standalone. Offline-capable.0.5hENG-043Eval datasetCurated dataset of student interactions covering happy path, struggle path, misconceptions, and edge cases. Ground truth responses defined.2hENG-044Eval runnerAutomated eval runner that replays dataset against Claude, scores responses against ground truth, reports pass/fail metrics.1.5hENG-045Fraction Quest theme passFull visual theme: dark background, crystal blocks, wizard owl Sam, Nunito/Fredoka fonts, themed chat panel. See docs/theme.md.5-9h
Day 6 Deliverable: Polished experience with micro-animations, edge case handling, offline support, and eval infrastructure.

Phase 7: Demo + Delivery (Day 7 — Sunday)
Objective: Ship it.
TicketDescriptionAcceptance CriteriaEst. HoursENG-033E2E test: happy pathCypress test: complete lesson with all correct answers → 3/3 completion screen.1hENG-034E2E test: struggle pathCypress test: incorrect answers → hints → demonstrations → assessment available.1hENG-035Final bug sweepRun full lesson 3 times on iPad. Note and fix issues. No console errors.1.5hENG-036Demo video recordingScreen record on iPad per Section 30's shot list: Setup → First Discovery → Exploration → Productive Struggle → Mastery → Close. 60–90 seconds.1.5hENG-037READMESetup instructions (npm install, npm run dev), technical approach overview, standards alignment, known limitations, architecture diagram.1hENG-038Final deploy + verificationVercel production deploy. Test on iPad: load from URL, add to Home Screen, verify offline, full playthrough.0.5h
Day 7 Deliverable: Working prototype deployed. Demo video recorded. README complete.

15. Codebase Structure
synthesis-tutor/
├── public/
│   └── manifest.json
├── src/
│   ├── engine/                          ← Fraction math (pure functions)
│   │   ├── FractionEngine.ts
│   │   ├── FractionEngine.test.ts
│   │   ├── MisconceptionDetector.ts
│   │   └── MisconceptionDetector.test.ts
│   ├── brain/                           ← TutorBrain (LLM-powered)
│   │   ├── TutorBrain.ts                   (interface)
│   │   ├── LLMTutorBrain.ts                (Claude implementation)
│   │   ├── useTutorChat.ts                 (React hook — SSE client)
│   │   ├── useVoiceInput.ts                (STT hook)
│   │   └── useVoiceOutput.ts               (TTS hook)
│   ├── state/                           ← State management
│   │   ├── types.ts                        (shared interfaces — THE contract)
│   │   ├── reducer.ts
│   │   ├── reducer.test.ts
│   │   └── checkpoint.ts
│   ├── components/                      ← React UI
│   │   ├── App.tsx
│   │   ├── Layout.tsx
│   │   ├── ChatPanel/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── InputField.tsx
│   │   ├── Workspace/
│   │   │   ├── Workspace.tsx
│   │   │   ├── FractionBlock.tsx
│   │   │   ├── ComparisonZone.tsx
│   │   │   └── ActionBar.tsx
│   │   ├── Assessment/
│   │   │   ├── MultipleChoice.tsx
│   │   │   ├── ConstructionTask.tsx
│   │   │   └── CompletionScreen.tsx
│   │   └── shared/
│   │       ├── ProgressDots.tsx
│   │       └── SamAvatar.tsx
│   ├── observers/                       ← Exploration observer
│   │   └── ExplorationObserver.ts
│   ├── content/                         ← Lesson content (JSON)
│   │   ├── exploration-config.json
│   │   └── assessment-pools.json
│   ├── audio/                           ← Sound synthesis
│   │   └── SoundManager.ts
│   └── index.tsx
├── cypress/                             ← E2E tests
│   ├── e2e/
│   │   ├── happy-path.cy.ts
│   │   └── struggle-path.cy.ts
├── api/
│   └── chat.ts                          ← Vercel Edge Function
├── vercel.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
Parallel work split (if 2 developers):
Developer A (Engine)Developer B (UI)src/engine/src/components/src/brain/src/audio/src/state/src/observers/src/content/cypress/
Shared: src/state/types.ts (frozen after Day 1).

16. Testing Strategy
LayerToolCoveragePriorityTimeFraction EngineVitest + fast-checkProperty-based: reflexivity, symmetry, roundtrip, simplify-preserves-value (10K iterations)P02h (Day 1)Misconception DetectorsVitestTruth table: each detector fires correctly on matching/non-matching inputsP00.5h (Day 4)Script IntegrityVitestDFS graph traversal: no dead-ends, no orphans, all terminals validP10.5h (Day 3)State ReducerVitestKey transitions: phase changes, score updates, impossible-state rejectionP11h (Day 1)E2E Happy PathCypressFull lesson, all correct → 3/3P21h (Day 7)E2E Struggle PathCypressAll incorrect → hints → demonstrations → assessmentP21h (Day 7)
Total testing time: ~6 hours across the sprint.

17. Architecture Decision: Pivot from Scripted to LLM
The original architecture used a ScriptedTutorBrain with JSON dialogue scripts and branching logic to simulate adaptive tutoring. The project has pivoted to an LLM-powered architecture for the following reasons:

1. **Conversational quality**: Claude generates naturally varied, contextually appropriate responses rather than selecting from pre-written branches. This dramatically improves the feel of the tutoring interaction.
2. **Reduced content authoring**: JSON script authoring was projected to consume significant engineering time (ENG-011, ENG-012, ENG-013, ENG-017). The LLM approach replaces all scripted content with a single system prompt.
3. **True adaptivity**: The scripted system could only respond to anticipated student behaviors. Claude can handle unexpected inputs, novel misconceptions, and freeform conversation.
4. **Voice mode**: LLM-powered conversation pairs naturally with voice input/output, enabling a more accessible and engaging experience for the target age group (8-12).

**What stays the same**: The FractionEngine remains the sole authority on mathematical correctness. Claude never evaluates math — it calls FractionEngine tools and generates pedagogy around the deterministic results. This zero-hallucination firewall is architecturally unchanged.

**New risks**: LLM latency (mitigated by SSE streaming), API costs (mitigated by Sonnet model selection), prompt injection (mitigated by system prompt hardening and tool-only math evaluation). See Risk Register below.

18. Risk Register
RiskLikelihoodImpactMitigationiPad Safari breaks layoutHighHighTest on actual iPad by Day 3, not Day 5Drag-and-drop fiddly on touchMediumHighFallback: "tap to select, tap to place" interactionScript writing takes too longMediumMediumStart with 3 GP problems, not 4; cut GP-4 if behindAnimation polish eats scheduleHighLow4-hour time-box on Day 6; ship without confetti if neededScope creep (LLM, multiple lessons)MediumHightypes.ts and TutorBrain interface support it later; resist this weekEngine/visual desyncLowCriticalSingle source of truth architecture; derived rendering; validation on every renderBundle exceeds 150KBLowMediumDrop Framer Motion → Web Animations API; audit with npx vite-bundle-visualizerStudent discovers unhandled interactionMediumMediumEdge case handlers (Section 10) + graceful Sam fallback for any unknown state

19. Success Criteria
Technical (Day 7 gate)

 App loads in < 3s on iPad Safari (2020 iPad 8th gen)
 All Fraction Engine property tests pass (10K iterations)
 Full lesson completable start-to-finish with no console errors
 Touch interactions work without hover dependency
 Assessment correctly scores all outcome brackets (3/3, 2/3, 1/3, 0/3)
 Landscape and portrait orientations both functional
 Offline-capable via PWA after initial load
 Checkpoint recovery works after simulated tab crash

Engagement (User Testing — 3–5 students if possible)

 80%+ lesson completion rate
 Average 8+ actions in exploration phase
 Blocks used in 2+ of 3 assessment problems (students use the tool, not guessing)
 Zero observer help requests (tutor's explanations are sufficient)

Learning (Directional Signal)

 Pre/post one-question test: average improvement of 1+ correct answers (out of 4 fraction-pair comparisons)


20. Demo Video Shot List
ShotTimeContentPurpose1. Setup0:00–0:08iPad on desk, app loads, split-pane appearsReal device, fast load2. First Discovery0:08–0:25Student taps block, presses Split, pop-pop animation playsMagic moment — tangible manipulative3. Exploration0:25–0:40Free exploration, equivalence reveal animation, Sam celebratesDiscovery over instruction4. Struggle0:40–0:55Wrong answer → Sam helps → retry → successBranching dialogue, pedagogical credibility5. Mastery0:55–1:15Assessment 3/3, confetti, completion screenEmotional payoff6. Close1:15–1:30Quick montage → title cardBreadth + polish
Recording: iPad built-in screen recording (shows touch indicators). Landscape. Student hands visible, no face (privacy). 720p output.

Appendix A: Lesson Script JSON Schema
json{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "lesson_id": { "type": "string" },
    "metadata": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "concept": { "type": "string" },
        "grade_range": { "type": "array", "items": { "type": "integer" } },
        "estimated_duration_minutes": { "type": "integer" },
        "common_core_standards": { "type": "array", "items": { "type": "string" } }
      }
    },
    "workspace_setup": {
      "type": "object",
      "properties": {
        "initial_blocks": { "type": "array" },
        "available_actions": { "type": "array", "items": { "type": "string" } },
        "max_denominator": { "type": "integer", "maximum": 12 }
      }
    },
    "phases": { "type": "object" }
  }
}

Appendix B: Animation Specifications
AnimationDurationEasingPropertiesMathematical InvariantSplit400msease-outtransform (crack → separate)Total width preservedCombine350msease-in-outtransform (glide → snap → dissolve seam)Combined width = sum of partsEquivalence reveal600msease-in-outopacity (golden pulse) + scale ("=" symbol)Aligned widths visually identicalIncorrect comparison400msease-outtransform (bounce apart) + opacity (red pulse)Difference highlightedPhase transition800msease-in-outopacity + transform (float up → fade in new)Progress dots updateConfetti2000mslineartransform (fall) + opacity (fade)N/A — decorative
All animations use composited properties only (transform, opacity). No width, height, left, top animations.

Appendix C: Misconception Detection Rules
MisconceptionDetection LogicSam's ResponseRemediation ActionAdded numerators and denominators (e.g., 1/2 + 1/2 = 2/4)input.n === expected.n * 2 AND input.d === expected.d * 2"I see what you did — you added the tops and bottoms. But fractions work differently! Let's use the blocks."Show side-by-side comparisonFlipped numerator/denominator (e.g., 2/1 instead of 1/2)input.n === expected.d AND input.d === expected.n"Looks like the top and bottom got switched. The bottom tells us how many pieces, the top tells us how many we have."Highlight numerator/denominator labelsWrong equivalence (random non-equivalent fraction)!areEquivalent(input, expected) AND none of above"That's {input} — not quite the same size as {target}. Try starting with the block and splitting it."Highlight split buttonCorrect but unsimplified (e.g., 4/8 when 1/2 expected)areEquivalent(input, expected) AND input.d > expected.d * 2"That's right! {input} equals {target}. Can you find an even simpler way to write it?"Optional simplification prompt