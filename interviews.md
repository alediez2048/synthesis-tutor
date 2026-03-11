Synthesis Tutor — Architectural Deep-Dive Interview
Project: Clone Synthesis Tutor (1-Week Challenge)
Audience: Engineering team building a conversational, AI-powered fractions tutor for ages 8–12
Date: 2026-03-10

Question 1: How should we design the LangGraph state machine to manage lesson phases while keeping the 1-week scope realistic?
The spec calls for a multi-phase lesson flow (Introduction → Exploration → Guided Practice → Assessment) but also emphasizes that this is a scripted dialogue, not a full LLM conversational agent. That tension is actually an advantage: it means the state machine can be deterministic and thin while still looking agentic to the student.
Recommended architecture — a Finite State Machine (FSM) over a full LangGraph cyclic graph:
The state object should carry a small, flat payload:
LessonState {
  phase: "intro" | "explore" | "guided" | "assess"
  step_index: number           // position within the current phase's script
  manipulative_state: FractionBoxState   // current visual workspace snapshot
  student_response_history: Response[]   // last N responses for branching logic
  score: { correct: number, total: number }
  hint_count: number           // per-problem hint counter
}
Each phase is a node in the graph. Transitions fire on discrete events: STUDENT_RESPONDED, TOOL_ACTION_COMPLETE, TIMER_EXPIRED, HINT_REQUESTED. The edges between nodes are simple conditional functions — not LLM calls — that inspect LessonState and route accordingly. For example, the edge from Guided Practice to Assessment fires when step_index >= guidedPracticeScript.length.
Why not full LangGraph with LLM-in-the-loop? Two reasons: (a) latency — an 8-year-old will not wait 2–3 seconds for a GPT round-trip between every interaction, and (b) the spec explicitly says the dialogue is scripted. Save LLM calls for a single, optional "rephrase" capability where the tutor can re-explain a concept if the student gets stuck twice on the same problem. That one call is isolated and can fail gracefully (fall back to the scripted hint).
Implementation shortcut for the 1-week sprint: Use a simple reducer pattern in React (or Zustand) as the state machine on the client side. LangGraph is conceptually useful for the architecture diagram and for a future version, but for a working demo in 7 days, a useReducer with typed actions will get you to demo day faster than standing up a Python LangGraph backend.

Question 2: How do we architect the deterministic fraction manipulation tools so that zero mathematical hallucinations reach the student?
This is the single most safety-critical architectural decision. The principle is: the LLM never performs arithmetic. Every mathematical operation flows through a deterministic computation layer that is unit-tested to exhaustion.
The Fraction Engine — a pure-function library:
FractionEngine {
  // Core type
  Fraction { numerator: int, denominator: int }

  // Deterministic operations (all return Fraction or boolean)
  simplify(f: Fraction) → Fraction
  areEquivalent(a: Fraction, b: Fraction) → boolean
  add(a: Fraction, b: Fraction) → Fraction
  toCommonDenominator(a: Fraction, b: Fraction) → [Fraction, Fraction]
  split(f: Fraction, parts: int) → Fraction[]
  combine(fractions: Fraction[]) → Fraction

  // Validation
  isValidFraction(f: Fraction) → boolean
  isValidStudentAnswer(input: string) → Fraction | ValidationError
}
This library runs entirely on the client (TypeScript) with no network calls. Every function is pure — same inputs always produce same outputs. The test suite should cover edge cases: zero denominators, improper fractions, negative values (excluded for this age group but guarded against), and very large numbers.
The Math Verification Layer sits between the student's input and the tutor's response. When a student submits an answer, the flow is:

parseStudentInput(raw_string) → sanitize and extract a Fraction
FractionEngine.areEquivalent(studentAnswer, correctAnswer) → boolean
The boolean (not an LLM judgment) determines which scripted branch to follow

The LLM is never asked "is 2/4 equal to 1/2?" — that question is answered by integer multiplication: 2 * 2 === 4 * 1. This is the firewall against hallucination.
For the visual manipulative: The fraction blocks are rendered from the FractionEngine's output. When a student "splits" a 1/2 block into two pieces, the engine computes split({1, 2}, 2) → [{1, 4}, {1, 4}] and the renderer draws it. The visuals are always a projection of the deterministic state, never the source of truth.

Question 3: What is the right front-end architecture for an iPad-first, touch-optimized experience within a 1-week timeline?
The spec mandates iPad browser support. This rules out hover-dependent interactions and demands touch-first design. Here's the stack recommendation:
Framework: Next.js (or plain Vite + React) as a static SPA. No SSR needed — this is a self-contained lesson. Vite is faster to scaffold in a sprint.
Layout — split-pane, not full-screen chat:
┌─────────────────────────────────────┐
│          TUTOR HEADER BAR           │
│  (progress dots: ● ● ○ ○)          │
├──────────────────┬──────────────────┤
│                  │                  │
│   CHAT PANEL     │  MANIPULATIVE   │
│   (scrollable)   │  WORKSPACE      │
│                  │  (fraction box)  │
│                  │                  │
│  [input field]   │                  │
├──────────────────┴──────────────────┤
│        ACTION BAR (touch)           │
│  [ Split ] [ Combine ] [ Check ]   │
└─────────────────────────────────────┘
On iPad in landscape, the split pane sits side-by-side (~40/60). In portrait or on smaller screens, the manipulative stacks above the chat with a toggle tab. Use CSS @media (orientation: portrait) to handle this.
Touch interaction library: Use @use-gesture/react for drag-and-drop of fraction blocks. It handles touch events, inertia, and cancellation gracefully. Avoid raw onTouchStart/End — they're a rabbit hole of edge cases (multi-touch conflicts, scroll-vs-drag disambiguation).
Critical iPad considerations:

Set <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"> to prevent pinch-zoom from breaking the manipulative.
Use touch-action: none on the manipulative canvas to prevent browser scroll/zoom gestures from hijacking drag operations.
Test with Safari on iPadOS specifically — it has unique quirks with position: fixed, 100vh calculations, and keyboard appearance pushing content up.
All tap targets must be minimum 44×44 points (Apple HIG). Fraction blocks should be even larger — 60×60pt minimum for small hands.

Animation: Use Framer Motion for block splitting/combining animations. A block splitting into two with a brief "pop" animation is what makes this feel like Synthesis rather than a worksheet. Budget 2–3 hours for these micro-interactions — they disproportionately impact the demo.

Question 4: How should the scripted dialogue system work to feel adaptive without requiring an LLM on every turn?
The key insight is that "adaptive" in a scripted system means branching, not generating. Think of it as a dialogue tree (like a choose-your-own-adventure book), not a chatbot.
Script structure — a JSON-driven dialogue graph:
json{
  "phase": "guided_practice",
  "steps": [
    {
      "id": "gp_01",
      "tutor_says": "Can you show me a fraction that's the same as 1/2 using the blocks?",
      "expect": {
        "type": "equivalence_check",
        "target": { "numerator": 1, "denominator": 2 },
        "tool_action": "combine_or_split"
      },
      "on_correct": {
        "tutor_says": "That's it! You just showed that {student_answer} is the same as 1/2!",
        "next": "gp_02"
      },
      "on_incorrect": {
        "tutor_says": "Hmm, not quite. Try splitting the 1/2 block into smaller pieces. What happens if you split it into 2 equal parts?",
        "hint_action": "highlight_split_button",
        "next": "gp_01_retry"
      },
      "on_second_incorrect": {
        "tutor_says": "Let me help! Watch this...",
        "auto_action": "demo_split_half_into_quarters",
        "next": "gp_01_explain"
      }
    }
  ]
}
Template interpolation handles the "adaptive" feel. The {student_answer} token gets replaced with the actual fraction the student created. This makes responses feel personalized without generation. Other useful tokens: {student_name}, {attempt_count}, {current_blocks}.
Branching depth: For a 1-week sprint, limit branching to 3 levels per problem: correct → advance, first incorrect → hint + retry, second incorrect → demonstrate + explain. This covers the pedagogically important cases without script explosion.
Warm, encouraging tone guidelines for the script:

Always acknowledge effort before correcting: "Great try! Let's look at this together..."
Use the student's action as a teaching moment: "You made 3/6 — and guess what, that IS equal to 1/2!"
Never say "wrong" — use "not quite" or "almost" or "let's try another way"
Celebrate with enthusiasm calibrated to the achievement: "You got it!" for routine answers, "WOW, you're a fraction master!" for the final assessment


Question 5: How should the RAG-based pedagogical engine work, and is it even necessary for the 1-week prototype?
Short answer for the 1-week sprint: No. Skip RAG entirely.
Here's the reasoning: RAG (Retrieval-Augmented Generation) is valuable when the system needs to pull from a large corpus of pedagogical strategies, adapt to diverse student misconceptions, or generate novel explanations. For a single lesson on fraction equivalence with scripted dialogue, the "retrieval" corpus is small enough to hardcode directly into the script branches.
What to do instead — a Pedagogical Strategy Map hardcoded into the state machine:
MisconceptionHandlers {
  "added_numerators_and_denominators": {
    // Student thinks 1/2 + 1/2 = 2/4
    detection: (input, expected) => input.num === expected.num * 2
                                    && input.den === expected.den * 2,
    response: "I see what you did — you added the tops and bottoms separately.
               But fractions work differently! Let's use the blocks to see why..."
    remediation_action: "show_side_by_side_comparison"
  },
  "confused_numerator_denominator": {
    // Student writes 2/1 instead of 1/2
    detection: (input, expected) => input.num === expected.den
                                    && input.den === expected.num,
    response: "Oops! Looks like the top and bottom got switched.
               Remember, the bottom number tells us how many equal pieces,
               and the top tells us how many we're looking at."
    remediation_action: "highlight_numerator_denominator_labels"
  }
}
This covers the 4–5 most common fraction misconceptions for this age group without any vector database, embedding model, or retrieval pipeline.
When RAG becomes necessary (post-prototype): If you expand to multiple lessons, adaptive difficulty, or open-ended student questions ("but why can't I just add the bottoms?"), then RAG over a curated corpus of pedagogical content (Common Core standards, research on fraction misconceptions from Siegler et al., scripted explanations from master teachers) becomes valuable. At that point, use a small embedding model (e.g., text-embedding-3-small) with a Pinecone or Chroma index over ~200 pedagogical chunks.

Question 6: How should we design the fraction block visual manipulative for maximum pedagogical impact?
The manipulative is the heart of what makes Synthesis different from a quiz app. It must make abstract fraction relationships tangible.
Visual design — rectangular area model (not pie charts):
Rectangles are pedagogically superior to pie charts for fractions because: (a) they tile and subdivide cleanly, (b) students can visually compare sizes by aligning edges, and (c) they map directly to the number line model students will encounter later.
Core visual elements:
FractionBlock {
  fraction: Fraction          // e.g., {1, 4}
  color: string               // consistent color per denominator family
  width: number               // proportional to fraction value
  subdivisions: number        // visible grid lines showing the denominator
  is_draggable: boolean
  is_selected: boolean
}

FractionWorkspace {
  reference_bar: FractionBlock    // always-visible "1 whole" bar at the top
  active_blocks: FractionBlock[]  // student's working blocks
  comparison_zone: FractionBlock[] // area for placing blocks to compare
}
Color coding by denominator family: Halves are blue, thirds are green, fourths are purple, sixths are orange. This creates an implicit visual language where students start recognizing relationships ("two purple blocks is the same size as one blue block").
Key interactions and their implementations:

Split: Student taps a block and hits "Split." An animation shows the block subdividing with a visual "crack" — the block briefly separates, grid lines appear, and two smaller blocks emerge. The engine computes split(1/2, 2) → [1/4, 1/4].
Combine: Student drags two blocks together. If they share a denominator, they merge with a satisfying "snap" animation. The engine computes combine([1/4, 1/4]) → 2/4, and then optionally simplify(2/4) → 1/2 with a visual indication.
Compare: Student drags a block onto the comparison zone next to the reference bar. Visual alignment makes equivalence (or non-equivalence) immediately obvious — a 2/4 block is exactly the same width as a 1/2 block.

Implementation with HTML Canvas vs. DOM elements:
Use DOM elements (divs) with CSS transitions, not Canvas. Reasons: (a) DOM elements get touch events for free, (b) accessibility is built in (aria-labels), (c) CSS transitions handle the animations without a render loop, and (d) debugging is vastly easier in DevTools. Canvas only becomes necessary at scale with hundreds of objects — fraction blocks will number in the single digits.

Question 7: How should the assessment phase work to be both pedagogically valid and cheat-resistant?
The spec calls for a "check for understanding" to conclude the lesson. For an 8–12 age group, this must feel like a culminating game, not a test.
Assessment design — 3 problems, scaffolded difficulty:
Assessment Problems (Fraction Equivalence):

Problem 1 (Recognition):
  "Which of these fractions is the same as 1/2?"
  Options: [2/4, 1/3, 3/4, 2/3] — presented as visual blocks
  Interaction: Tap to select

Problem 2 (Construction):
  "Use the blocks to build a fraction equal to 2/3"
  Interaction: Split and combine blocks in the workspace
  Validation: FractionEngine.areEquivalent(studentResult, {2, 3})

Problem 3 (Generalization):
  "Can you find TWO different fractions that are both equal to 1/4?"
  Interaction: Build two separate fractions
  Validation: Both must pass equivalence check AND be different from each other
Verification flow — the Math Verification Layer in action:
Every answer passes through the deterministic engine. The sequence is:

Student submits (tap, drag, or button press)
captureWorkspaceState() → extracts the mathematical meaning from the visual state
FractionEngine.areEquivalent(captured, target) → boolean
Boolean drives the scripted response (not an LLM judgment call)
Result is logged to LessonState.score

Completion criteria: The student must get at least 2 out of 3 correct to "complete" the lesson. On failure, the system loops back to a guided practice problem targeting the specific misconception, then re-presents the failed assessment problem. This isn't punitive — the tutor says "Let's practice one more together, and then you can try again!"
Cheat resistance (proportional to the stakes): Since this is a low-stakes learning environment, heavy anti-cheat is unnecessary and pedagogically counterproductive. The one measure worth implementing: randomize the specific fractions used in assessment problems from a pool. So Problem 1 might ask about 1/2 or 1/3 or 2/5 equivalences, chosen at session start. This prevents the "just memorize the answers" shortcut when students show each other the app.

Question 8: What is the data model and persistence strategy for tracking student progress and enabling teacher dashboards later?
For the 1-week prototype, persistence is minimal — but designing the data model correctly now avoids a painful rewrite later.
Session-scoped data model (prototype):
SessionRecord {
  session_id: uuid
  started_at: timestamp
  device_info: { userAgent, screenSize, isTouch }

  events: SessionEvent[]
  // Every meaningful action is an event:
  // { type: "tutor_message", phase: "intro", step: "i_01", timestamp }
  // { type: "student_response", value: "2/4", is_correct: true, latency_ms: 3200 }
  // { type: "tool_action", action: "split", input: "1/2", result: ["1/4", "1/4"] }
  // { type: "hint_requested", problem: "gp_03", hint_level: 2 }
  // { type: "phase_transition", from: "explore", to: "guided" }

  outcome: {
    completed: boolean
    score: { correct: number, total: number }
    total_time_seconds: number
    misconceptions_detected: string[]
  }
}
For the prototype: Store SessionRecord in memory (React state) and optionally dump it to localStorage on lesson completion. This is enough to show the assessment results screen and to support the demo video.
For production (post-prototype): Ship events to a lightweight backend (Supabase, Firebase, or a simple Express + Postgres setup). The event-sourced design means you can reconstruct any student's entire lesson journey, which is gold for both teacher dashboards and pedagogical research.
Teacher dashboard queries this enables:

"How many students completed the lesson?" → COUNT WHERE outcome.completed = true
"What's the most common misconception?" → Aggregate misconceptions_detected
"Where do students spend the most time?" → Compute duration between phase_transition events
"Which problem has the lowest first-attempt success rate?" → Filter student_response events by problem ID

Privacy consideration: For K-12, never store personally identifiable information in the session record. The session_id is anonymous. If a teacher needs to link sessions to students, that mapping lives in the school's LMS, not in your database.

Question 9: How do we handle the edge cases where the deterministic engine and the visual manipulative could fall out of sync?
This is a subtle but critical failure mode. If the visual blocks show one thing and the engine computes another, the student receives contradictory information — which is worse than a wrong answer because it erodes trust in the tool.
The root cause of desync: It typically happens when animation state and data state update at different times. For example, a student rapidly taps "Split" twice. The first split animates (takes 300ms), and the second split fires against the pre-animation state instead of the post-first-split state.
Architectural solution — single source of truth with derived rendering:
                    ┌──────────────┐
   User Action ───→ │ State Reducer │ ───→ New FractionEngineState
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Render from │ ───→ Visual Blocks (derived)
                    │  Engine State│
                    └──────────────┘
The visual layer is a pure function of the engine state. It never has its own state. When a block is "dragged" during an animation, the drag gesture creates a visual preview (using CSS transforms), but the actual state change only commits when the gesture completes and the reducer processes it.
Specific guards:

Action queueing: While an animation is playing, user actions are queued (not dropped) and processed sequentially after the animation completes. A small "processing" indicator (a subtle bounce on the block) tells the student their action was received.
State reconciliation on every render: Each render cycle, the visual component calls FractionEngine.validate(currentState) to verify internal consistency (e.g., all blocks in the workspace sum to a valid total). If validation fails, force a re-render from engine state and log the desync event.
Snapshot diffing in development: In dev mode, after every state transition, serialize both the engine state and the DOM state (extracted fraction values from data attributes), diff them, and assert equality. This catches desync bugs during development before they reach students.

The "impossible state" guard: The reducer should reject state transitions that the engine deems invalid. For example, splitting a block into 0 parts, combining blocks that aren't in the workspace, or creating a fraction with denominator > 12 (the upper limit for this lesson). These rejected actions trigger a gentle tutor message: "That doesn't quite work — try something else!"

Question 10: What is the realistic day-by-day implementation plan to ship a working demo in 7 days?
This is where architecture meets reality. The 1-week constraint demands ruthless prioritization and a "demo-backwards" mindset — start from what the demo needs to show and work backward.
Day 1 (Monday) — Foundation & Fraction Engine:

Scaffold the project: npm create vite@latest synthesis-tutor -- --template react-ts
Implement FractionEngine as a standalone TypeScript module with full unit tests (jest or vitest). This is the safety-critical path — it must be rock-solid before anything else.
Define the LessonState type and the reducer skeleton with all phase transitions.
Deliverable: Engine passes all tests. Reducer handles phase transitions in a terminal/console demo.

Day 2 (Tuesday) — Visual Manipulative:

Build the FractionBlock component: colored rectangles with subdivision grid lines, sized proportionally.
Build the FractionWorkspace component: reference bar + draggable blocks.
Implement Split and Combine with animations (Framer Motion).
Wire blocks to engine state via the reducer.
Deliverable: A standalone page where you can split and combine fraction blocks visually. No chat yet.

Day 3 (Wednesday) — Chat Interface & Script Engine:

Build the chat panel: scrollable message list, typed input field, and button-based response options.
Implement the script engine: load a JSON dialogue script, advance on events, interpolate templates.
Write the Introduction phase script (~8–10 tutor messages introducing fractions and the workspace).
Deliverable: The intro phase plays through in the chat panel. Manipulative is visible but not yet connected to chat.

Day 4 (Thursday) — Integration & Guided Practice:

Connect the chat and manipulative: tutor instructions trigger workspace highlights; workspace actions trigger chat responses.
Write the Exploration phase script (student freely explores blocks with gentle prompts).
Write the Guided Practice script with branching (correct/incorrect/hint paths).
Implement the Math Verification Layer (parse student input → engine check → branch selection).
Deliverable: A student can play through Intro → Exploration → Guided Practice with working feedback.

Day 5 (Friday) — Assessment & Polish:

Build the 3-problem assessment sequence.
Implement the completion screen (score display, encouraging summary).
Add the progress indicator (phase dots in the header).
iPad-specific fixes: viewport meta, touch-action, tap target sizing, Safari quirks.
Deliverable: Full lesson flow works end-to-end on iPad Safari.

Day 6 (Saturday) — Polish & Edge Cases:

Add micro-animations: block pop on split, snap on combine, confetti on completion.
Handle edge cases: rapid tapping, browser back button, screen rotation mid-lesson.
Write the misconception handlers for the 3–4 most common errors.
Responsive layout adjustments for iPad portrait vs. landscape.
Deliverable: The experience feels polished, not just functional.

Day 7 (Sunday) — Demo & Documentation:

Record the 1–2 minute demo video (screen recording on iPad).
Write the README: setup instructions, technical approach, known limitations.
Final bug sweep: run through the entire lesson 3 times, noting and fixing issues.
Deploy to a static host (Vercel, Netlify) for easy sharing.
Deliverable: Working prototype deployed, demo video recorded, README complete.

Key risks and mitigations:
RiskMitigationiPad Safari breaks layoutTest on actual iPad by Day 3, not Day 5Drag-and-drop is fiddly on touchHave a fallback "tap to select, tap to place" interactionScript writing takes too longStart with 3 problems in guided practice, not 8Animation polish eats the scheduleSet a 4-hour time-box on Day 6; ship without confetti if neededScope creep (LLM integration, multiple lessons)The reducer architecture supports it later; resist it this week

Summary: Architectural Principles for Synthesis Tutor

Determinism over generation. The LLM is a future enhancement, not the core. The Fraction Engine is the core.
Visual as projection, never source. The manipulative renders from engine state. It never owns state.
Branching over generating. Scripted dialogue with template interpolation feels adaptive. Actual LLM generation is a latency and safety liability for the prototype.
Touch-first, always. Every interaction must work with a finger on glass. Mouse is the secondary input.
Event-source everything. Even in the prototype, logging every action as a typed event pays dividends immediately (debugging) and later (analytics).
Ship the demo, then iterate. The 7-day plan is aggressive but achievable if you protect the critical path: Engine → Manipulative → Chat → Integration → Assessment.


Synthesis Tutor — Architectural Deep-Dive Interview, Round 2
Project: Clone Synthesis Tutor (1-Week Challenge)
Focus: Implementation depth — accessibility, testing, upgrade paths, pedagogical theory, compliance, performance, and classroom deployment
Date: 2026-03-10
This round builds on Round 1's foundational architecture (state machine, Fraction Engine, scripted dialogue, iPad-first UI) and drills into the second-order concerns that separate a working prototype from a shippable product.

Question 11: How do we design the accessibility layer so that the visual manipulative is usable by students with visual impairments, motor difficulties, or cognitive differences?
Accessibility in an educational app isn't just a compliance checkbox — it's a pedagogical requirement. If a student can't perceive or manipulate the fraction blocks, the entire learning model breaks down for them. The challenge is that the core interaction (visual-spatial manipulation of blocks) is inherently visual, so we need to build a parallel non-visual interaction path, not just bolt on ARIA labels.
Tier 1 — Screen reader support (VoiceOver on iPad):
Every fraction block must be an accessible element with a rich description, not just a label. A block representing 2/4 should announce as "Two-fourths block. Equal to one-half. Width: half of the whole bar." The workspace itself needs a live region that narrates state changes:
// After a split action, the live region announces:
"You split one-half into two pieces. You now have two one-fourth blocks."

// After a combine action:
"You combined two one-fourth blocks into two-fourths. That's the same as one-half!"
Implement this with aria-live="polite" on a hidden div that updates whenever the workspace state changes. The narration should mirror the tutor's voice — warm, descriptive, and mathematically precise.
Workspace navigation for VoiceOver: The blocks should be arranged in a rotor-navigable list. Swipe-right moves to the next block, swipe-left goes back. Each block has custom actions (accessible via VoiceOver's "Actions" rotor): "Split this block," "Combine with next block," "Move to comparison zone." This replaces drag-and-drop for non-sighted users.
<div
  role="listitem"
  aria-label="One-half block"
  aria-description="Blue block, width equals half of the whole"
  tabIndex={0}
  aria-roledescription="fraction block"
>
  {/* Custom actions registered via aria-actions or a keyboard handler */}
</div>
Tier 2 — Motor accessibility (Switch Control, keyboard-only):
Some students use Switch Control, head-tracking, or keyboard-only navigation. The drag-and-drop interaction must have a complete keyboard equivalent:

Tab to a block, press Enter to "pick up"
Arrow keys to move it between workspace zones (active area, comparison zone)
Enter again to "drop"
Spacebar as a shortcut for "Split selected block"

The focus ring must be highly visible — a 3px solid ring in a contrasting color, not the browser default which is nearly invisible on iPad.
Tier 3 — Cognitive accessibility:
For students with dyscalculia or processing differences, reduce cognitive load through these design decisions:

Never show more than 4 blocks at once in the workspace. Add a "block tray" that holds extras off-screen with a count badge.
Use consistent, saturated colors (not pastels) with high contrast ratios (minimum 4.5:1 against the background).
Pair every numerical label with its visual block representation — never show "1/4" as text alone without the corresponding block visible.
Allow the tutor's pacing to be student-controlled: no auto-advancing messages, always require a tap/click to proceed. This is already implied by the scripted dialogue design from Round 1, but enforce it as a hard rule.

Prototype scope: For the 1-week sprint, implement Tier 1 (ARIA labels and live region narration) and the keyboard alternative for Tier 2. These are low-effort, high-impact. Tier 3 principles should guide design decisions from the start (they're mostly about restraint, not additional features). Full Switch Control testing can wait for post-prototype.

Question 12: What is the testing strategy that gives us maximum confidence in mathematical correctness within the 1-week timeline?
The testing strategy has to be asymmetric: exhaustive for the math layer, pragmatic for everything else. A wrong animation is embarrassing; a wrong answer is a pedagogical crisis.
Layer 1 — Fraction Engine: property-based testing (highest priority)
Unit tests with specific cases are necessary but insufficient. The equivalence relation, for example, has properties that must hold universally, not just for the handful of fractions we thought to test. Use a property-based testing library (fast-check for TypeScript) to generate thousands of random fraction pairs and verify invariants:
typescriptimport fc from 'fast-check';

// Property: equivalence is reflexive
fc.assert(
  fc.property(
    fc.integer({ min: 1, max: 100 }),
    fc.integer({ min: 1, max: 100 }),
    (num, den) => {
      const f = { numerator: num, denominator: den };
      return FractionEngine.areEquivalent(f, f) === true;
    }
  )
);

// Property: equivalence is symmetric
fc.assert(
  fc.property(
    arbitraryFraction(), arbitraryFraction(),
    (a, b) => {
      return FractionEngine.areEquivalent(a, b)
             === FractionEngine.areEquivalent(b, a);
    }
  )
);

// Property: split then combine is identity
fc.assert(
  fc.property(
    arbitraryFraction(),
    fc.integer({ min: 2, max: 6 }),
    (f, parts) => {
      const pieces = FractionEngine.split(f, parts);
      const recombined = FractionEngine.combine(pieces);
      return FractionEngine.areEquivalent(recombined, f);
    }
  )
);

// Property: simplify produces the same value
fc.assert(
  fc.property(
    arbitraryFraction(),
    (f) => {
      const simplified = FractionEngine.simplify(f);
      return FractionEngine.areEquivalent(f, simplified)
             && simplified.denominator <= f.denominator;
    }
  )
);
These four properties alone — reflexivity, symmetry, split-combine roundtrip, and simplify-preserves-value — catch an enormous class of bugs. Run them with 10,000 iterations; they execute in under a second.
Layer 2 — Misconception detection: truth-table tests
Each misconception handler is a predicate function. Test every handler against a truth table of inputs to verify it fires when it should and stays silent when it shouldn't:
typescriptdescribe('MisconceptionDetector', () => {
  const cases = [
    // [studentInput, expectedAnswer, shouldDetect, misconceptionType]
    [{ n: 2, d: 4 }, { n: 1, d: 2 }, false, null],              // correct
    [{ n: 2, d: 4 }, { n: 1, d: 3 }, true, 'wrong_equivalence'], // wrong
    [{ n: 2, d: 1 }, { n: 1, d: 2 }, true, 'flipped_fraction'],  // swapped
    [{ n: 3, d: 6 }, { n: 1, d: 2 }, false, null],              // correct (equiv)
  ];

  test.each(cases)('input %o vs expected %o', (input, expected, shouldDetect, type) => {
    const result = detectMisconception(input, expected);
    expect(result.detected).toBe(shouldDetect);
    if (shouldDetect) expect(result.type).toBe(type);
  });
});
Layer 3 — Script integrity: graph traversal test
The dialogue script is a directed graph. Write a single test that traverses every path in the script and verifies three things: (a) no dead-end nodes (every non-terminal node has at least one outgoing edge), (b) every terminal node is in the assessment-complete phase, and (c) no orphaned nodes (every node is reachable from the start node). This is a simple depth-first search over the JSON script.
Layer 4 — Integration: Cypress end-to-end (lowest priority for the sprint)
Write exactly 2 Cypress tests for the prototype:

Happy path: Click through the entire lesson, always giving correct answers, verify the completion screen appears with 3/3 score.
Struggle path: Give incorrect answers twice on every guided practice problem, verify hints appear, verify the tutor demonstrates, verify assessment still becomes available.

These two tests cover the critical paths. Skip testing every permutation — the property-based tests on the engine and the script traversal test handle the combinatorial explosion.
Time budget: Day 1 engine tests (2 hours), Day 3 script traversal test (30 minutes), Day 5 two Cypress tests (1.5 hours). Total: ~4 hours of testing across the week, delivering disproportionate confidence.

Question 13: What is the upgrade path from the scripted prototype to a full LLM-powered adaptive tutor, and what architectural decisions now make or break that transition?
This is the most strategically important question. The 1-week prototype is scripted, but the reason it exists is to prove the model before investing in the real thing. If the architecture doesn't leave a clean seam for LLM integration, the prototype becomes a dead-end.
The LLM integration seam: the TutorBrain interface
Define an abstract interface that the current scripted system implements and a future LLM system will also implement:
typescriptinterface TutorBrain {
  // Given the current lesson state, produce the next tutor action
  getNextAction(state: LessonState): Promise<TutorAction>;

  // Evaluate a student response and return pedagogical feedback
  evaluateResponse(
    studentInput: StudentInput,
    currentStep: ScriptStep,
    state: LessonState
  ): Promise<EvaluationResult>;
}

type TutorAction =
  | { type: 'message', text: string, emotion: 'encouraging' | 'excited' | 'gentle' }
  | { type: 'workspace_action', action: WorkspaceCommand }
  | { type: 'prompt_student', inputType: 'text' | 'manipulative' | 'multiple_choice' }
  | { type: 'phase_transition', to: Phase };

type EvaluationResult = {
  isCorrect: boolean;                    // ALWAYS from FractionEngine, never LLM
  feedback: string;                       // scripted now, LLM-generated later
  misconception: string | null;           // detected misconception type
  suggestedNextStep: string;              // script node ID now, LLM-chosen later
};
The critical invariant: EvaluationResult.isCorrect is always computed by the deterministic FractionEngine, regardless of whether the rest of the evaluation is scripted or LLM-generated. The LLM is allowed to generate the feedback text and choose the next pedagogical move, but it is never allowed to judge mathematical correctness.
Current implementation (ScriptedTutorBrain):
typescriptclass ScriptedTutorBrain implements TutorBrain {
  async getNextAction(state: LessonState): Promise<TutorAction> {
    const step = this.script[state.phase][state.step_index];
    return { type: 'message', text: interpolate(step.tutor_says, state) };
  }

  async evaluateResponse(input, step, state): Promise<EvaluationResult> {
    const isCorrect = FractionEngine.areEquivalent(input.value, step.expect.target);
    const branch = isCorrect ? step.on_correct : step.on_incorrect;
    return {
      isCorrect,
      feedback: interpolate(branch.tutor_says, state),
      misconception: isCorrect ? null : detectMisconception(input, step),
      suggestedNextStep: branch.next
    };
  }
}
Future implementation (LLMTutorBrain):
typescriptclass LLMTutorBrain implements TutorBrain {
  async evaluateResponse(input, step, state): Promise<EvaluationResult> {
    // Math correctness: STILL deterministic. Non-negotiable.
    const isCorrect = FractionEngine.areEquivalent(input.value, step.expect.target);

    // Pedagogical feedback: NOW generated by LLM
    const feedback = await this.llm.generate({
      systemPrompt: PEDAGOGICAL_SYSTEM_PROMPT,
      context: {
        studentLevel: state.inferredLevel,
        attemptHistory: state.student_response_history,
        isCorrect,
        misconception: detectMisconception(input, step),
        studentAge: state.studentProfile.age,
      },
      instruction: "Generate encouraging feedback for this student response."
    });

    // Verification gate: LLM output must not contradict the engine
    const verified = this.verifyFeedback(feedback, isCorrect);

    return {
      isCorrect,
      feedback: verified,
      misconception: detectMisconception(input, step),
      suggestedNextStep: await this.llm.choosePedagogicalMove(state)
    };
  }

  private verifyFeedback(feedback: string, isCorrect: boolean): string {
    // If the engine says correct, the feedback must not say "not quite" or "try again"
    // If the engine says incorrect, the feedback must not say "correct" or "great job"
    const contradicts = this.contradictionDetector.check(feedback, isCorrect);
    if (contradicts) {
      return this.getFallbackScriptedResponse(isCorrect);
    }
    return feedback;
  }
}
The key architectural decisions that enable this transition:

Depend on the interface, not the implementation. The lesson flow components import TutorBrain, never ScriptedTutorBrain. Swapping implementations is a one-line change in the dependency injection setup.
Never let the LLM's output bypass the engine. The verifyFeedback function is the second firewall. Even if the LLM says "Great job!" when the answer is wrong (a hallucination), the system catches it and substitutes a scripted fallback.
Make the async signature mandatory now. Even though the scripted brain is synchronous, the interface returns Promise<T>. This means callers already handle async, so adding real LLM latency later doesn't require refactoring the calling code.
Log everything through the event system. When the LLM version ships, you'll want to A/B test scripted vs. generated feedback. The event-sourced session log (from Round 1, Q8) makes this trivial: add a feedback_source: 'scripted' | 'llm' field to evaluation events and compare outcomes.


Question 14: How should we design the audio and sound layer to reinforce learning without becoming annoying or exclusionary?
Sound is the most underestimated dimension of educational software. Synthesis (the original product) uses sound brilliantly — it makes the manipulatives feel physical. For a fractions lesson, audio provides a second modality that reinforces the visual and mathematical concepts.
Sound design principles for ages 8–12:

Functional sounds, not decorative. Every sound must carry information. A "snap" when blocks combine tells the student "these fit together" before the visual even settles. A hollow "thunk" when blocks don't combine tells them "these don't match" faster than reading text.
Pitch mapping to fraction size. Higher pitch for smaller fractions, lower for larger ones. When a student splits 1/2 into 1/4 + 1/4, the pitch rises slightly. This creates an auditory model of fraction magnitude that operates below conscious awareness but builds intuition.
Never use sound as the sole carrier of critical information. Every sound must have a visual equivalent (for deaf/hard-of-hearing students and for muted devices).

Implementation — the Sound Manager:
typescriptclass SoundManager {
  private context: AudioContext;
  private enabled: boolean = true;

  // Synthesized sounds (no loading, no external files)
  playSnap(fractionSize: number) {
    // Short, warm click. Pitch varies: 440Hz for 1/1, 880Hz for 1/4
    const freq = 440 * (1 / fractionSize);
    this.playTone(freq, 0.08, 'triangle');
  }

  playSplit() {
    // Quick descending two-note: "pop-pop"
    this.playTone(600, 0.05, 'sine');
    setTimeout(() => this.playTone(500, 0.05, 'sine'), 60);
  }

  playCorrect() {
    // Rising major third: C5 → E5
    this.playTone(523, 0.12, 'sine');
    setTimeout(() => this.playTone(659, 0.15, 'sine'), 120);
  }

  playIncorrect() {
    // Gentle low tone, not a "buzzer"
    this.playTone(220, 0.2, 'triangle');
  }

  playCelebration() {
    // Quick ascending arpeggio: C-E-G-C
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1, 'sine'), i * 80);
    });
  }

  private playTone(freq: number, duration: number, type: OscillatorType) {
    if (!this.enabled) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    osc.connect(gain).connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }
}
Why Web Audio API synthesized tones instead of audio files:

Zero loading time, zero failed network requests, zero CORS issues.
File size: 0 bytes (the sounds are generated from code). For a 1-week sprint, no asset pipeline needed.
Dynamic pitch based on fraction value would require dozens of pre-recorded files; synthesis handles it parametrically.
Consistent across devices — audio file playback has notorious latency issues on mobile Safari, while Web Audio API oscillators are near-instantaneous.

iPad-specific gotcha: Safari requires a user gesture to unlock AudioContext. The first screen of the lesson should have a "Start Lesson" button that calls audioContext.resume() on tap. Never auto-play sound.
Mute toggle: Always visible in the header bar. Respect prefers-reduced-motion media query by also muting sounds when the user has enabled reduced motion at the OS level (these preferences are often correlated).
Prototype scope: Implement 5 sounds (snap, split, correct, incorrect, celebration) using synthesized tones. Total implementation time: ~1 hour. The payoff in demo quality is enormous — evaluators will notice the polish immediately.

Question 15: How do we handle COPPA compliance and student data privacy for a K-12 product?
This is a non-negotiable legal concern. COPPA (Children's Online Privacy Protection Act) applies to any product directed at children under 13. Our target is 8–12, so COPPA is in full effect. Getting this wrong isn't a bug — it's a lawsuit.
What COPPA requires (simplified for this context):

No personal information collection without verifiable parental consent. "Personal information" includes names, email addresses, screen names, persistent identifiers (cookies, device IDs), geolocation, photos/audio/video, and anything that can be combined to identify a child.
Data minimization. Only collect what is strictly necessary for the service to function.
Parental access. Parents must be able to review and delete their child's data.

Architecture implications for the prototype:
The simplest path to COPPA compliance is to collect nothing:
Privacy Architecture (Prototype):

                    ┌─────────────────────────┐
   Student uses ──→ │  Browser (client-only)   │ ──→ No data leaves device
   the app          │  localStorage only       │
                    └─────────────────────────┘

   - No accounts, no login, no cookies
   - No analytics (no Google Analytics, no Mixpanel, no Segment)
   - No LLM API calls (scripted dialogue is local)
   - Session data lives in memory / localStorage only
   - When tab closes, session data is gone (or persists only locally)
This is the "zero collection" approach. It's fully COPPA-compliant because there's no data to regulate. The tradeoff: no teacher dashboard, no usage analytics, no cross-session persistence. For a 1-week prototype, this is the right tradeoff.
Post-prototype: the school contract model:
When the product moves beyond prototype, you'll need analytics and teacher dashboards. The standard approach in EdTech is:

Sell to schools, not students. The school (the LEA — Local Education Agency) signs a data processing agreement that constitutes COPPA consent on behalf of parents, under the "school official" exception in COPPA.
No direct student accounts. Students log in via the school's SSO (Clever, ClassLink, Google Workspace for Education). You receive an opaque student ID, never a name or email.
Student Data Privacy Agreement (SDPA). Use the Student Data Privacy Consortium's national template. Most school districts require this before procurement.
Data residency. Host in the US. Some states (California via SOPIPA, Colorado, Illinois) have additional requirements.

Technical checklist for COPPA-safe architecture (post-prototype):
□ No persistent identifiers set before parental/school consent flow
□ No third-party scripts that set their own cookies (remove GTM, Hotjar, etc.)
□ Session tokens are ephemeral, not stored in cookies
□ All student data encrypted at rest (AES-256) and in transit (TLS 1.3)
□ Data retention policy: auto-delete session data after school year end
□ No data shared with LLM providers — if using an LLM, self-host or use a
  provider with a zero-data-retention agreement (Anthropic's API, Azure OpenAI
  with data processing addendum)
□ Parental access API: endpoint to export/delete all data for a given student ID
□ Annual COPPA compliance audit
The LLM-specific COPPA concern: If you upgrade to an LLM-powered tutor, student messages will be sent to an API. Those messages might contain personal information ("my name is Alex and I go to Lincoln Elementary"). You must either strip PII before sending to the LLM API, or use a provider whose terms guarantee zero retention and no training on student data. This is a hard requirement, not a nice-to-have.

Question 16: What performance budgets should we set, and how do we keep the app fast on older classroom iPads?
Classroom iPads are often 3–4 generations old, running iPadOS on hardware with 2–3 GB of RAM. The app must perform well on a 2020 iPad (8th generation, A12 chip) running Safari, because that's what schools actually have.
Performance budgets:
Metric                         Target        Rationale
─────────────────────────────  ────────────  ─────────────────────────────────
Initial load (LCP)             < 2 seconds   Kids abandon after 3s
Time to interactive (TTI)      < 3 seconds   Manipulative must respond on load
JS bundle size (gzipped)       < 150 KB      Classroom Wi-Fi is often 5 Mbps shared
                                              across 30 devices
Block split animation          60 fps        Jank during manipulation erodes trust
Touch response latency         < 100ms       Perceivable delay breaks flow state
Memory usage (heap)            < 80 MB       Prevents Safari tab crashes on older iPads
Total asset size               < 500 KB      Including any images/fonts
How to hit these budgets:
Bundle size (< 150 KB gzipped):
Vite with tree-shaking handles this well if you're disciplined about dependencies. The major risks are Framer Motion (~30 KB gzipped) and @use-gesture/react (~10 KB). Together with React (~40 KB), that's 80 KB before any app code. This leaves ~70 KB for the entire application, which is achievable for a single-lesson app.
If Framer Motion pushes you over budget, replace it with CSS animations and the Web Animations API. The element.animate() method handles the split/combine/snap transitions with zero library overhead:
typescriptblock.animate([
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(1.1)', opacity: 0.8 },
  { transform: 'scale(1)', opacity: 1 }
], { duration: 200, easing: 'ease-out' });
Animation at 60 fps:
Stick to composited CSS properties only: transform and opacity. Never animate width, height, left, top, or any property that triggers layout. The block sizing (proportional to fraction value) should be set via transform: scaleX() applied to a fixed-width element, not by changing width directly.
Use will-change: transform on fraction blocks that are currently being dragged, and remove it after the gesture ends. Leaving will-change on all blocks permanently wastes GPU memory.
Memory (< 80 MB):
The main risk is the event log growing unbounded. Cap SessionRecord.events at 500 entries (well beyond a single lesson) and use a ring buffer if more are needed. Also, if using synthesized audio, make sure to disconnect and garbage-collect oscillator nodes after each sound plays (the stop() call in the SoundManager handles this).
Testing performance on target hardware:
Use Safari's Web Inspector (connected from a Mac via cable to an iPad) to profile. The Performance tab shows frame timing; the Memory tab shows heap snapshots. Run the lesson start-to-finish while profiling and verify no frame exceeds 16.6ms and heap stays under 80 MB.
If you don't have an iPad during development, Chrome DevTools' CPU throttling (4x slowdown) and network throttling (Slow 3G) simulate the constraint reasonably well. But always validate on real hardware before the demo — Safari's JS engine has different performance characteristics than V8.

Question 17: How should we handle the "exploration" phase where the student has free rein, to ensure productive play rather than aimless clicking?
The Exploration phase is pedagogically crucial — it's where students build intuition through self-directed discovery — but it's architecturally tricky because the student has agency without a script to guide them. The risk is a student who splits blocks down to 1/64 and then sits confused, or one who does nothing and waits.
Guided exploration: freedom within guardrails
The design pattern is "sandbox with gentle nudges." The student can freely split, combine, and compare blocks, but the system observes their actions and provides contextual prompts when needed.
The Exploration Observer — a rule-based attention system:
typescriptclass ExplorationObserver {
  private actionLog: ExplorationAction[] = [];
  private timeSinceLastAction: number = 0;
  private conceptsDiscovered: Set<string> = new Set();

  onAction(action: ExplorationAction) {
    this.actionLog.push(action);
    this.timeSinceLastAction = 0;
    this.checkForDiscoveries(action);
  }

  onTick(deltaMs: number): TutorNudge | null {
    this.timeSinceLastAction += deltaMs;

    // Inactivity nudge: 15 seconds of nothing
    if (this.timeSinceLastAction > 15000 && this.actionLog.length < 3) {
      return {
        message: "Try tapping a block and then pressing Split! See what happens.",
        highlightElement: "split-button"
      };
    }

    // Repetitive action nudge: 5 splits in a row with no combines
    if (this.lastNActionsAre('split', 5)) {
      return {
        message: "You're great at splitting! Now try dragging two small blocks " +
                 "together to combine them.",
        highlightElement: "workspace-blocks"
      };
    }

    // Complexity nudge: denominator > 8 (blocks getting too small to be useful)
    if (this.smallestDenominator() > 8) {
      return {
        message: "Wow, those pieces are tiny! Let's start fresh with some bigger " +
                 "blocks. I'll set up the workspace for you.",
        action: "reset_workspace_to_halves_and_thirds"
      };
    }

    return null; // Student is exploring productively, don't interrupt
  }

  private checkForDiscoveries(action: ExplorationAction) {
    // Track aha moments:
    if (action.type === 'compare' &&
        FractionEngine.areEquivalent(action.blockA, action.blockB) &&
        action.blockA.denominator !== action.blockB.denominator) {
      this.conceptsDiscovered.add('equivalence_different_denominators');
      // Trigger celebratory response:
      return {
        message: "Whoa! You just discovered something amazing — " +
                 `${formatFraction(action.blockA)} and ${formatFraction(action.blockB)} ` +
                 "are the SAME SIZE even though they look different!",
        emotion: 'excited',
        sound: 'discovery'
      };
    }
  }
}
The three exploration goals (hidden from the student):
The observer tracks whether the student has organically discovered three key concepts. Once all three are discovered (or a maximum exploration time of ~3 minutes passes), the tutor transitions to Guided Practice:

Splitting produces smaller equal pieces — detected when the student splits a block and then compares the pieces to the original.
Combining produces larger pieces — detected when the student combines blocks of the same denominator.
Different fractions can be the same size — detected when the student places two equivalent fractions of different denominators in the comparison zone.

If the student discovers all three organically, the transition message is celebratory: "You've already figured out the big idea! Let me give you some challenges." If time runs out, the tutor gently demonstrates the undiscovered concepts before transitioning.
Workspace seeding: Don't start exploration with a blank workspace. Pre-populate it with one 1/2 block and one 1/3 block. This gives the student something to act on immediately and naturally leads to discovery (splitting the 1/2 reveals its relationship to 1/4; the 1/3 provides contrast).

Question 18: How do we architect the system for content authoring so non-engineers (curriculum designers, teachers) can create new lessons post-prototype?
The 1-week prototype has one hardcoded lesson on fraction equivalence. But if the product succeeds, the next step is a library of lessons. The bottleneck will shift from engineering to content creation. Investing in authoring tooling early (or at least in an authorable content format) pays off quickly.
The Lesson Schema — a declarative JSON format that non-engineers can edit:
json{
  "lesson_id": "fraction-equivalence-101",
  "metadata": {
    "title": "Same Size, Different Names",
    "concept": "fraction_equivalence",
    "grade_range": [3, 5],
    "estimated_duration_minutes": 15,
    "prerequisites": ["fraction_basics"],
    "common_core_standards": ["3.NF.A.3a", "3.NF.A.3b"]
  },
  "workspace_setup": {
    "initial_blocks": [
      { "fraction": "1/2", "color": "blue" },
      { "fraction": "1/3", "color": "green" }
    ],
    "available_actions": ["split", "combine", "compare"],
    "max_denominator": 12
  },
  "phases": {
    "introduction": {
      "messages": [
        {
          "tutor": "Hi there! Today we're going to discover something " +
                   "really cool about fractions.",
          "advance_on": "student_tap"
        },
        {
          "tutor": "See those blocks on the right? The blue one is 1/2 " +
                   "and the green one is 1/3.",
          "highlight": ["block_1/2", "block_1/3"],
          "advance_on": "student_tap"
        }
      ]
    },
    "exploration": {
      "duration_seconds": 180,
      "discovery_goals": ["splitting", "combining", "equivalence"],
      "nudge_rules": "default_exploration_nudges"
    },
    "guided_practice": {
      "problems": [
        {
          "prompt": "Can you make a fraction equal to {target} using the blocks?",
          "target": "1/2",
          "accept_any_equivalent": true,
          "max_attempts": 3,
          "hints": [
            "Try splitting the 1/2 block into smaller pieces.",
            "What if you split it into 2 equal parts? What fraction do you get?"
          ],
          "demo_on_fail": "split 1/2 into 2 parts to show 2/4"
        }
      ]
    },
    "assessment": {
      "passing_score": 2,
      "total_problems": 3,
      "problem_pool": [
        { "type": "recognition", "target": "1/2", "distractors": ["1/3", "3/4", "2/3"] },
        { "type": "construction", "target": "2/3" },
        { "type": "generalization", "target": "1/4", "required_answers": 2 }
      ]
    }
  }
}
Why this format works for non-engineers:

It's plain JSON — editable in any text editor or a simple web form.
The vocabulary is pedagogical, not technical: "prompt," "hints," "target," not "state transitions" or "reducer actions."
The interpolation tokens ({target}, {student_answer}) are explicitly documented.
The problem_pool supports randomization without requiring the author to write branching logic.

The Lesson Validator — an authoring-time safety net:
Build a CLI tool (or a web-based editor) that validates a lesson file before it can be deployed:
lesson-validator checks:
  ✓ All referenced fractions are valid (positive integers, denominator ≠ 0)
  ✓ All targets have at least one achievable equivalent within max_denominator
  ✓ All hint sequences terminate (no infinite retry loops)
  ✓ Assessment problem pool has at least N problems (where N = total_problems)
  ✓ All distractors in recognition problems are NOT equivalent to the target
  ✓ All referenced blocks/actions exist in workspace_setup
  ✓ Estimated duration is realistic (heuristic: 30s per message + 60s per problem)
That last check — validating that distractors aren't accidentally equivalent to the target — is exactly the kind of bug a curriculum designer would create and never catch without tooling. The FractionEngine makes this check trivial.
Post-prototype authoring roadmap:
Phase 1: JSON files edited in VS Code (current). Phase 2: A simple web form with live preview (a React app that renders the lesson as you edit the JSON). Phase 3: A full visual editor with drag-and-drop lesson builder (this is a product in itself — think "Storyline for math tutoring").

Question 19: How should we design the transition animations and micro-interactions to teach through motion, not just illustrate it?
Animation in an educational manipulative isn't decoration — it's a teaching tool. When a block splits, the way it splits communicates mathematical information. The motion should make the student's internal mental model more accurate.
Principle: animations must preserve mathematical invariants visually.
When a 1/2 block splits into two 1/4 blocks, the total area on screen must remain constant throughout the animation. If the blocks shrink before the new blocks appear, there's a visual moment where "something is missing" — and a student might internalize that splitting "makes the fraction smaller" (a common misconception). Instead, the animation should show the block developing a hairline crack, then gently separating while maintaining its total footprint.
The five core animation sequences and their pedagogical purpose:
1. Split animation (teaching: splitting preserves value)
Frame 0:   [████████████████]     ← 1/2 block, full width
Frame 1:   [████████│████████]    ← hairline crack appears in center
Frame 2:   [███████ │ ████████]   ← blocks separate by 4px
Frame 3:   [███████]  [████████]  ← blocks settle into position

Duration: 400ms, ease-out
Key: total width of Frame 3 blocks === width of Frame 0 block
Sound: "pop-pop" at Frame 1
Label: "1/4" appears on each new block at Frame 3
2. Combine animation (teaching: combining is the inverse of splitting)
Frame 0:   [████]    [████]       ← two 1/4 blocks, separated
Frame 1:   [████]  [████]         ← blocks glide toward each other
Frame 2:   [████][████]           ← blocks touch, brief glow on seam
Frame 3:   [████████████]         ← seam dissolves, one block

Duration: 350ms, ease-in-out
Key: combined block width === sum of original block widths
Sound: "snap" at Frame 2
Label: "2/4" appears at Frame 3, then optional "= 1/2" fade-in
3. Equivalence reveal (teaching: same size means same value)
When a student places two equivalent fractions in the comparison zone:
Frame 0:   [████████]          ← 1/2 block in comparison zone
           [████][████]        ← two 1/4 blocks below it
Frame 1:   Both rows flash with a golden pulse
Frame 2:   A "=" symbol animates in between them
Frame 3:   Connected by a glowing bridge visual

Duration: 600ms
Sound: "discovery" chime
Tutor: "They're the same size!"
4. Incorrect placement (teaching: these aren't equal, and here's why)
When a student compares non-equivalent fractions:
Frame 0:   [████████]          ← 1/2 block
           [████████████]      ← 2/3 block below it
Frame 1:   Both blocks gently bounce to their respective edges
Frame 2:   A "≠" symbol appears between them
Frame 3:   The overhanging portion of the larger block pulses in red

Duration: 400ms
Sound: gentle low tone
Key: highlight the DIFFERENCE, not just the inequality
5. Phase transition (teaching: you've made progress)
When moving from Exploration to Guided Practice:
Frame 0:   Current workspace state
Frame 1:   Workspace blocks float up and shrink gently (300ms)
Frame 2:   New workspace configuration fades in from below (300ms)
Frame 3:   Progress dots update with a satisfying fill animation

Duration: 800ms total
Sound: ascending two-note chime
Implementation priority for the sprint: Split and combine are must-haves (Day 2). Equivalence reveal is a should-have (Day 4). Incorrect placement and phase transition are nice-to-haves (Day 6). If pressed for time, phase transitions can be instant cuts — they happen infrequently enough that the lack of animation won't be noticed.

Question 20: What is the evaluation rubric for the prototype, and how do we objectively measure whether the educational experience actually works?
Building the prototype is necessary but not sufficient — we need to know if it teaches. This question bridges engineering and learning science.
Three evaluation dimensions, each with measurable indicators:
Dimension 1: Technical functionality (does it work?)
This is straightforward engineering QA:
Criterion                                    Pass/Fail
──────────────────────────────────────────   ─────────
App loads in < 3s on iPad Safari              □
All fraction operations produce correct
  results (verified by test suite)            □
Touch interactions work without hover
  dependency                                  □
Full lesson flow completable start-to-finish  □
No JavaScript errors in console during
  full playthrough                            □
Assessment correctly scores 3/3, 2/3, 1/3,
  and 0/3 outcomes                            □
Landscape and portrait orientations both
  functional                                  □
Dimension 2: Engagement quality (does it feel like Synthesis?)
This is qualitative but can be structured. Have 3–5 students (ages 8–12) use the prototype while an observer records:
Observation Protocol:

A. Time-on-task
   - How long does the student spend on each phase?
   - Do they finish the lesson or abandon?
   - Target: 80%+ completion rate

B. Exploration behavior
   - Does the student discover equivalence organically, or
     does the tutor have to demonstrate?
   - How many distinct actions does the student take in exploration?
   - Target: Average 8+ actions in exploration phase

C. Emotional indicators
   - Count smiles, frowns, and frustrated sighs (observational)
   - Does the student say anything aloud? ("Oh!", "Wait...", "I get it!")
   - Target: Positive or neutral affect throughout; frustration
     only at productive struggle moments

D. Manipulative usage
   - Does the student use the blocks to solve assessment problems,
     or do they guess without the blocks?
   - Target: Blocks used in 2+ of 3 assessment problems

E. Help-seeking
   - How many hints are requested?
   - Does the student ask the observer for help?
     (Indicates the tutor's explanations are insufficient)
   - Target: Observer help requests = 0
Dimension 3: Learning efficacy (does it actually teach?)
For a 1-week prototype, a full pre/post assessment study is out of scope. But a lightweight signal is achievable:
The "one question" pre/post test:
Before the lesson, show the student four fraction pairs and ask "Which of these are the same amount?" Record their answers. After the lesson, show four different pairs and ask the same question. Compare accuracy.
Pre-test pairs:  1/2 & 2/4,  1/3 & 2/3,  2/6 & 1/3,  3/4 & 1/4
Post-test pairs: 1/2 & 3/6,  1/4 & 2/4,  2/3 & 4/6,  1/3 & 1/2
If a student goes from 1/4 correct to 3/4 correct, the lesson moved the needle. With even 5 students, you get a directional signal. This isn't rigorous research, but it's enough to demonstrate to stakeholders that the prototype teaches, not just presents.
The demo video structure (derived from the evaluation):
The 1–2 minute demo video should implicitly demonstrate all three dimensions:

0:00–0:15 — App loads on iPad, show the split-pane layout (Technical)
0:15–0:40 — Student explores blocks, discovers equivalence with a visible "aha" moment (Engagement)
0:40–1:00 — Guided practice: student gets one wrong, tutor helps, student succeeds (Engagement + Efficacy)
1:00–1:20 — Assessment: student scores 3/3 using the blocks (Efficacy)
1:20–1:30 — Celebration screen, confetti, score display (Engagement)

This narrative arc — struggle, discovery, mastery — is what makes Synthesis compelling, and the demo should tell that story.

Summary: Round 2 Architectural Principles

Accessibility is pedagogy. A screen reader path isn't a compliance addon — it's a second modality that strengthens the learning model for all students.
Test the math exhaustively, test everything else pragmatically. Property-based tests on the engine. Two Cypress tests for the flows. Script graph traversal for completeness.
Build the seam for the LLM now. The TutorBrain interface costs nothing today and saves weeks later. The math verification firewall is non-negotiable in both the scripted and LLM versions.
Sound teaches. Five synthesized tones (1 hour of work) make the manipulative feel physical and reinforce mathematical concepts through a second modality.
Collect nothing, worry about nothing. Zero data collection is the simplest path to COPPA compliance for the prototype.
Budget for the oldest iPad in the classroom. 150 KB JS, 60 fps animations, 80 MB heap. Constraint breeds creativity.
Guide exploration, don't script it. The Exploration Observer watches for discoveries and nudges when needed, preserving student agency while preventing aimless clicking.
Author lessons in JSON, validate with the engine. The same FractionEngine that prevents student-facing errors also prevents content-authoring errors.
Animation is instruction. Every motion must preserve mathematical invariants visually. The split animation teaching "the total stays the same" is doing more work than the text that follows it.
Measure learning, not just engagement. A one-question pre/post test gives a directional signal that the prototype teaches, not just entertains.

Synthesis Tutor — Architectural Deep-Dive Interview, Round 3 (Final)
Project: Clone Synthesis Tutor (1-Week Challenge)
Focus: Closing the gaps — tutor persona voice, fully scripted lesson content, error recovery and resilience, Common Core alignment, deployment strategy, classroom orchestration, onboarding UX, the "smashing" interaction, edge-case student inputs, and the demo narrative
Date: 2026-03-10
This final round resolves the content-level and operational decisions that must be locked before PRD writing begins. Rounds 1–2 established the architecture and engineering strategy. Round 3 produces the actual content and operational playbook.

Question 21: What is the tutor's persona, and what specific voice and language guidelines should every scripted line follow?
The tutor's persona isn't cosmetic — it determines whether a struggling 8-year-old feels safe enough to keep trying or shuts down. Research on intelligent tutoring systems (Woolf, 2009; VanLehn, 2011) consistently shows that perceived warmth and competence in a tutor persona directly predict student persistence, especially after errors. We need to define the persona precisely enough that anyone writing dialogue lines (or eventually prompting an LLM) produces consistent output.
The persona: "Sam the Fraction Explorer"
Sam is a friendly, curious guide — not a teacher, not a parent, not a peer. Think of the energy of a museum exhibit guide who's genuinely excited about what they're showing you. Sam talks with the student, not at them.
Demographic neutrality: Sam has no stated age, gender, ethnicity, or physical appearance. In the chat interface, Sam is represented by a simple geometric avatar (a friendly circle with eyes — think a fraction block that came to life). This avoids representation pitfalls and lets every student project onto Sam.
Voice attributes (with concrete examples for script authors):
1. Warm but not syrupy.
✓ "Nice work! You found it."
✓ "That's a tricky one — let's figure it out together."
✗ "Oh my goodness, you are SO amazing and SO smart!!!"
✗ "Wonderful job, superstar! I'm SO proud of you!"
Excessive praise feels performative to kids and actually decreases intrinsic motivation (Dweck, 2006). Calibrate enthusiasm to the difficulty of what the student just did.
2. Conversational, not instructional.
✓ "What do you think happens if we split this block in half?"
✓ "Hmm, that didn't quite match. What if we try a different number of pieces?"
✗ "Now we will learn about equivalent fractions."
✗ "The definition of an equivalent fraction is..."
Sam asks questions and proposes experiments. Sam never lectures. The manipulative does the teaching; Sam facilitates discovery.
3. Precise mathematical language, introduced naturally.
✓ "The bottom number — that's called the denominator — tells us how many
    equal pieces the whole is split into."
✓ "You just made two-fourths. Some people write that as 2/4."

✗ "The denominator is the divisor of the unit fraction in the partition."
✗ "Two over four" (ambiguous — "over" isn't mathematical language)
Always pair the formal term with the plain English explanation the first time. After introduction, use the formal term freely — kids absorb vocabulary through use, not definitions.
4. Never negative, never condescending.
After an incorrect answer:
✓ "Hmm, not quite — but I can see what you were thinking. Let's try it
    with the blocks."
✓ "Close! That fraction is a little bigger than what we need. Can you
    find one that's exactly the same size?"

✗ "That's wrong."
✗ "No, remember what I said earlier?"
✗ "Are you sure? Think again." (implies the student is careless)
5. Celebrate discovery, not compliance.
When student finds equivalence on their own:
✓ "Wait — did you see that?! Those two fractions are the same size!
    You just discovered something really important."

When student correctly follows an instruction:
✓ "You got it! See how those blocks line up perfectly?"

✗ "Good job following my instructions!" (reduces student to order-follower)
Sentence-level constraints for script authors:

Maximum sentence length: 15 words. This isn't arbitrary — it matches the reading level of the target age group (Flesch-Kincaid Grade 3–5).
Maximum tutor message length: 3 sentences. If more explanation is needed, split into multiple messages with a student tap/advance between them.
Never use conditional or subjunctive mood ("If you were to split..."). Use imperative or simple present ("Split this block. What happens?").
Contractions always ("let's," "that's," "don't") — never formal ("let us," "that is," "do not"). Contractions signal casual warmth.
The word "wrong" never appears. Neither does "incorrect," "mistake," "error," or "fail." Substitute with: "not quite," "almost," "a little different," "let's try another way."


Question 22: What is the complete, scripted problem set for the guided practice and assessment phases?
This is the content that the engineering team will implement directly. Every problem needs its target, validation logic, branching script, and hint sequence fully specified. No ambiguity left for the developer to resolve.
Guided Practice — 4 problems, scaffolded difficulty:
PROBLEM GP-1: "Split to Discover"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Setup:    Workspace contains one 1/2 block (blue)
Prompt:   "See that blue block? That's one-half. Tap it and press Split.
           Let's see what happens!"
Expect:   Student splits 1/2 into 2 parts → workspace shows [1/4, 1/4]
Type:     Guided action (single correct path)

  on_action(split 1/2 into 2):
    Sam: "Look at that! You turned one-half into two pieces. Each piece
          is one-fourth. We write that as 1/4."
    Sam: "Here's the cool part — those two 1/4 pieces together are STILL
          the same amount as the 1/2 you started with."
    → highlight: comparison zone pulses gently
    Sam: "Try dragging both pieces to the comparison area next to a
          1/2 block. Do they line up?"
    on_comparison_made:
      Sam: "Perfect match! Two-fourths equals one-half. That's what
            equivalent fractions are all about."
      → advance to GP-2

  on_action(split 1/2 into 3):
    Sam: "Interesting! You split it into three pieces — those are sixths.
          That works too, but let's try splitting into just 2 pieces
          first. Tap the block and choose 2."
    → reset workspace, retry

  on_inactivity(15s):
    Sam: "Tap the blue block first, then press the Split button at
          the bottom!"
    → highlight: 1/2 block + split button


PROBLEM GP-2: "Build an Equivalent"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Setup:    Workspace contains one 1/3 block (green) + the 1/4 blocks
          from GP-1 are cleared; fresh workspace
Prompt:   "Can you make a fraction that's the same size as 1/3?
           Use the blocks to build it!"
Expect:   Any fraction equivalent to 1/3 (2/6, 3/9, 4/12)
Type:     Open construction (multiple correct answers)
Validate: FractionEngine.areEquivalent(studentResult, {1, 3})

  on_correct:
    Sam: "You made {student_answer} — and it's exactly the same size as
          1/3! Great discovery!"
    → if student_answer is 2/6:
        Sam: "Two-sixths equals one-third. See how two small pieces
              fill the same space as one bigger piece?"
    → advance to GP-3

  on_incorrect(attempt 1):
    detected_misconception = detectMisconception(studentResult, {1, 3})

    if "added_num_and_den":
      Sam: "Hmm, {student_answer} is a different size. I see you changed
            both numbers — but with fractions, we need to be more careful.
            Try splitting the 1/3 block into equal pieces instead!"
    elif "random_fraction":
      Sam: "That's {student_answer} — not quite the same size as 1/3.
            Here's a hint: start with the 1/3 block and split it.
            The new pieces will still add up to 1/3!"
    → highlight: split button

  on_incorrect(attempt 2):
    Sam: "Let me show you a trick. Watch this!"
    → auto_action: animate splitting 1/3 into 2 equal parts → 2/6
    Sam: "I split 1/3 into two equal pieces. Each piece is 1/6, and
          together they make 2/6. Same size as 1/3!"
    Sam: "Now you try — can you split it into a different number
          of pieces?"
    → reset workspace with fresh 1/3 block

  on_incorrect(attempt 3):
    Sam: "No worries! Splitting a fraction into equal pieces always gives
          you an equivalent fraction. Let's move on and practice more."
    → advance to GP-3 (don't block progress permanently)


PROBLEM GP-3: "Compare and Match"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Setup:    Workspace shows: [1/2 block] and [3/6 block] side by side
Prompt:   "Look at these two blocks. Are they the same size?
           Drag them both to the comparison area to find out!"
Expect:   Student drags both blocks to comparison zone
Type:     Comparison verification

  on_comparison(both blocks in zone):
    → play equivalence_reveal animation (golden pulse + "=" symbol)
    Sam: "They match! 1/2 and 3/6 are equivalent fractions — same
          amount, just split into different numbers of pieces."
    Sam: "The denominator changed from 2 to 6, and the numerator
          changed from 1 to 3. Both got multiplied by 3!"
    → advance to GP-4

  on_only_one_block_placed:
    Sam: "Good start! Now drag the other block up there too so
          we can compare them."

  on_inactivity(15s):
    Sam: "Drag the blocks up to the gray comparison area at the top.
          Let's see if they're the same size!"
    → highlight: comparison zone


PROBLEM GP-4: "The Challenge Round"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Setup:    Workspace contains one 2/4 block (purple)
Prompt:   "Here's a trickier one. What's the simplest way to write 2/4?
           Can you combine pieces to find out?"
Expect:   Student recognizes 2/4 = 1/2 (simplification)
Type:     Simplification via combination
Validate: FractionEngine.areEquivalent(studentResult, {1, 2})
          AND studentResult.denominator < 4

  on_correct:
    Sam: "That's it! 2/4 is really just 1/2 in disguise. When we
          combine pieces, we simplify the fraction."
    Sam: "You're ready for the final challenge! Let's see what
          you've learned."
    → advance to Assessment phase

  on_incorrect(attempt 1):
    Sam: "Not quite. Here's a clue — look at the 2/4 block. It has
          4 parts, and 2 are filled in. Can you see a bigger block
          hiding inside?"
    → visual_hint: dim 2 of the 4 subdivisions to reveal the 1/2 shape

  on_incorrect(attempt 2):
    Sam: "Let me help! Watch — if we combine these two quarter-pieces..."
    → auto_action: animate combining the two shaded quarters into one half
    Sam: "2/4 simplifies to 1/2. Simplifying means finding the
          fraction with the fewest pieces."
    → advance to Assessment phase
Assessment — 3 problems, randomized from pools:
ASSESSMENT PROBLEM A-1: Recognition (Multiple Choice)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pool (select one set at random):
  Set 1: target=1/2, options=[2/4✓, 1/3, 3/4, 2/3]
  Set 2: target=1/3, options=[2/6✓, 1/2, 2/4, 3/4]
  Set 3: target=3/4, options=[6/8✓, 2/3, 1/2, 5/6]

Prompt:   "Which fraction is the same amount as {target}?"
Display:  Four blocks as tappable cards, each labeled with the fraction
          and visually sized proportionally
Validate: FractionEngine.areEquivalent(selected, target)

  on_correct:
    Sam: "That's right!"
    → record score, advance to A-2

  on_incorrect:
    Sam: "Not quite. Look at the sizes of the blocks — which one
          is exactly the same width as {target}?"
    → allow one retry (max 2 attempts total)
    on_second_incorrect:
      → reveal correct answer with equivalence animation
      Sam: "{correct_answer} is the same as {target}."
      → record score (incorrect), advance to A-2


ASSESSMENT PROBLEM A-2: Construction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pool (select one at random):
  Option 1: target=1/2, starting_block=1/1
  Option 2: target=2/3, starting_block=1/1
  Option 3: target=1/4, starting_block=1/2

Prompt:   "Build a fraction equal to {target} using the blocks!"
Setup:    Workspace contains the starting_block only
Validate: FractionEngine.areEquivalent(workspaceResult, target)
          AND workspaceResult != target (must be a DIFFERENT
          representation, not the target itself)

  on_correct:
    Sam: "You built {student_answer} — that's the same as {target}!
          Excellent work!"
    → record score, advance to A-3

  on_incorrect(attempt 1):
    Sam: "That's {student_answer} — not quite equal to {target}.
          Try splitting or combining to get a match."
    → no further hints in assessment

  on_incorrect(attempt 2):
    Sam: "One more try!"

  on_incorrect(attempt 3):
    → show correct solution briefly
    Sam: "The answer was {example_correct_answer}. You'll get it
          next time!"
    → record score (incorrect), advance to A-3


ASSESSMENT PROBLEM A-3: Generalization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pool (select one at random):
  Option 1: target=1/2, required_count=2
  Option 2: target=1/3, required_count=2

Prompt:   "Last challenge! Can you find TWO different fractions that
           are both equal to {target}? Build them one at a time."
Setup:    Workspace with 1/1 block, "Submit first" and "Submit second"
          buttons
Validate:
  - Both FractionEngine.areEquivalent(answer1, target)
  - Both FractionEngine.areEquivalent(answer2, target)
  - answer1.denominator !== answer2.denominator (truly different)
  - Neither answer equals target exactly in lowest terms

  on_correct:
    Sam: "WOW! {answer1} and {answer2} — both equal to {target} but
          written differently. You really understand equivalent
          fractions!"
    → record score, advance to completion

  on_partial(one correct, one incorrect):
    Sam: "You got one! {correct_one} is equal to {target}. Can you
          find a different one for the second answer?"
    → allow retry on the failed answer only

  on_incorrect(3 attempts exhausted):
    → show two example answers
    Sam: "Two answers were {example1} and {example2}. Both are {target}
          split into different numbers of pieces!"
    → record score (partial credit if 1 of 2), advance to completion
Completion screen logic:
Score 3/3: "You're a fraction master! You proved that the same
            amount can be written in lots of different ways."
            → confetti animation, celebration sound

Score 2/3: "Great job! You really understand equivalent fractions.
            Want to try the one you missed again?"
            → option to retry missed problem or finish

Score 1/3: "You're getting there! Equivalent fractions are tricky,
            but you showed some real thinking today. Want to
            practice a little more?"
            → loop back to GP-3 and GP-4, then re-assess

Score 0/3: "Fractions take practice, and you did great exploring
            today! Let's try the lesson one more time — I bet
            it'll click."
            → restart from Exploration phase (not from Intro)

Question 23: How do we handle error recovery when Safari crashes, the tab reloads, or the student accidentally navigates away mid-lesson?
Classroom reality: a student bumps the home button. Another student's iPad runs out of battery. A teacher accidentally triggers a software update notification that covers the screen. Safari kills the tab because memory is low. These are not edge cases — in a classroom of 30 iPads, at least one of these happens every session.
The state checkpoint system:
The lesson state must be persistable and recoverable. On every significant state transition, serialize the full LessonState to sessionStorage (not localStorage — we don't want stale state persisting across days, and this respects our COPPA-zero-collection approach since sessionStorage dies with the tab).
typescript// Checkpoint middleware for the reducer
function checkpointMiddleware(reducer: LessonReducer): LessonReducer {
  return (state: LessonState, action: LessonAction): LessonState => {
    const newState = reducer(state, action);

    // Checkpoint on significant transitions only (not every mouse move)
    const significantActions = [
      'PHASE_TRANSITION',
      'PROBLEM_COMPLETED',
      'STUDENT_RESPONSE',
      'HINT_DELIVERED',
      'SCORE_UPDATED'
    ];

    if (significantActions.includes(action.type)) {
      try {
        sessionStorage.setItem(
          'synthesis_checkpoint',
          JSON.stringify({
            state: newState,
            timestamp: Date.now(),
            version: CHECKPOINT_VERSION
          })
        );
      } catch (e) {
        // sessionStorage full or unavailable — silent fail, non-critical
        console.warn('Checkpoint save failed:', e);
      }
    }

    return newState;
  };
}
Recovery flow on app load:
typescriptfunction initializeLesson(): LessonState {
  const checkpoint = loadCheckpoint();

  if (!checkpoint) {
    // Fresh start
    return createInitialState();
  }

  // Checkpoint exists — but is it still valid?
  const ageMinutes = (Date.now() - checkpoint.timestamp) / 60000;

  if (ageMinutes > 30) {
    // Stale checkpoint — too old to be useful. Fresh start.
    clearCheckpoint();
    return createInitialState();
  }

  if (checkpoint.version !== CHECKPOINT_VERSION) {
    // App was updated since checkpoint. Can't guarantee compatibility.
    clearCheckpoint();
    return createInitialState();
  }

  // Valid checkpoint — offer recovery
  return checkpoint.state;  // flag triggers the recovery UI
}
The recovery UX — keep it simple and child-friendly:
When a valid checkpoint is detected, don't show a modal dialog with technical language. Instead, Sam greets the student warmly:
Sam: "Hey, welcome back! Looks like we were in the middle of
      something. Want to keep going where we left off?"

      [ Keep Going ]    [ Start Over ]
Two big buttons. "Keep Going" restores from checkpoint. "Start Over" clears it and begins fresh. No explanation of what happened or why — the student doesn't need to know about tab crashes.
What state needs preserving vs. what can be reconstructed:
MUST persist (lost if not checkpointed):
  - Current phase and step_index
  - Score (correct/total)
  - Which assessment problems were selected from the pool
  - Which problems have been completed
  - Hint count per problem

CAN be reconstructed:
  - Workspace visual state (rebuild from phase + step_index)
  - Chat history (replay scripted messages up to current step)
  - Tutor emotion state (derived from score and phase)

SHOULD NOT persist:
  - Mid-drag gesture positions (start clean)
  - Animation states (let them complete or skip)
  - Sound state (re-initialize AudioContext on user gesture)
Chat history reconstruction: On recovery, don't dump the entire previous chat history back at once (it's disorienting). Instead, show just Sam's last message and a subtle "Earlier in this lesson..." collapsed section the student can expand if they want context.
The "accidental back button" guard:
typescript// Prevent accidental navigation on mobile Safari
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (state.phase !== 'complete') {
      e.preventDefault();
      e.returnValue = '';  // triggers browser's "Leave site?" dialog
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Also handle the popstate event (back button)
  const handlePopState = (e: PopStateEvent) => {
    if (state.phase !== 'complete') {
      // Push a new state to "absorb" the back navigation
      window.history.pushState(null, '', window.location.href);
    }
  };

  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('popstate', handlePopState);
  };
}, [state.phase]);
iPad-specific risk: Safari's tab management. Safari on iPad aggressively kills background tabs to free memory. If a student switches to another app and comes back, the tab may have been evicted. The sessionStorage checkpoint survives this (Safari preserves sessionStorage across tab evictions on iOS), so the recovery flow handles this case automatically.

Question 24: Which Common Core State Standards should this lesson align to, and how does alignment affect the content design?
Standards alignment isn't just a checkbox for school procurement — it tells us exactly what the student should know and be able to do after the lesson, which directly shapes what we test in assessment.
Primary standards for this lesson:
3.NF.A.3 — Explain equivalence of fractions in special cases, and
            compare fractions by reasoning about their size.

  3.NF.A.3a — Understand two fractions as equivalent (equal) if they
               are the same size, or the same point on a number line.

  3.NF.A.3b — Recognize and generate simple equivalent fractions,
               e.g., 1/2 = 2/4, 4/6 = 2/3. Explain why the fractions
               are equivalent, e.g., by using a visual fraction model.

4.NF.A.1 — Explain why a fraction a/b is equivalent to a fraction
            (n×a)/(n×b) by using visual fraction models, with attention
            to how the number and size of the parts differ even though
            the two fractions themselves are the same size. Use this
            principle to recognize and generate equivalent fractions.
How each standard maps to our lesson phases:
Standard    Where It's Taught             Where It's Assessed
─────────   ────────────────────────────  ────────────────────────────
3.NF.A.3a   Exploration phase:            A-1 (Recognition):
            Student discovers same-size    Student identifies equivalent
            blocks through comparison.     fractions by comparing block sizes.

3.NF.A.3b   GP-1, GP-2:                   A-2 (Construction):
            Student generates equivalent   Student builds an equivalent
            fractions by splitting.        fraction independently.

4.NF.A.1    GP-3, GP-4:                   A-3 (Generalization):
            Tutor explicitly names the     Student finds TWO equivalents,
            multiply-both pattern.         demonstrating the general rule.
Content implications of standards alignment:

The manipulative must be a visual fraction model (not just a quiz UI). 3.NF.A.3b explicitly requires visual models. This validates our rectangular area model approach — it's not a nice-to-have, it's standards-mandated.
Students must explain, not just identify. 3.NF.A.3a says "understand" and 4.NF.A.1 says "explain why." For the prototype, we handle this through Sam's narration after the student acts ("See how both blocks are the same width? That's because 2/4 and 1/2 are equivalent"). In a future LLM version, we could ask the student to explain in their own words.
The lesson spans two grade levels (3rd and 4th). This is intentional — it means the app is useful for 3rd graders learning the concept fresh AND 4th graders reviewing/deepening. The guided practice scaffolds from 3.NF (recognize and generate) to 4.NF (the multiplicative principle), so the difficulty progression is standards-justified.
Denominator limits. The standards use examples with denominators up to 8 in 3rd grade and up to 12 in 4th grade. Our max_denominator: 12 setting in the workspace aligns with this. Don't allow splits beyond /12 — it exceeds the standards and creates visual clutter.

What to put in the README / marketing material:
"This lesson addresses Common Core Standards 3.NF.A.3a, 3.NF.A.3b,
and 4.NF.A.1, targeting fraction equivalence through visual models
and interactive exploration. Suitable for grades 3–5."
This single sentence makes the prototype credible to educators and aligns the demo with how schools evaluate EdTech.

Question 25: What is the deployment architecture and how does the demo get from laptop to iPad?
The simplest deployment architecture wins here. No Docker, no Kubernetes, no CI/CD pipeline — this is a static web app that needs to be accessible on an iPad.
Option A (recommended): Vercel one-click deploy
Developer laptop                           Cloud                  iPad
┌───────────────┐    git push     ┌─────────────────┐    Safari   ┌──────┐
│ Vite project  │ ──────────────→ │ Vercel (auto-    │ ←────────→ │ iPad │
│ (React + TS)  │                 │  builds from     │            │      │
└───────────────┘                 │  GitHub/Git)     │            └──────┘
                                  └─────────────────┘
                                  URL: synthesis-tutor.vercel.app
Steps: npm create vite, push to GitHub, connect repo to Vercel, done. Vercel auto-builds on every push. The iPad opens https://synthesis-tutor.vercel.app in Safari. Total setup time: 10 minutes.
Option B (fallback): Local network during demo
If internet is unreliable at the demo venue (common in schools):
Developer laptop (same Wi-Fi)              iPad
┌───────────────────────┐    Wi-Fi    ┌──────┐
│ npm run dev            │ ←────────→ │ iPad │
│ --host 0.0.0.0         │            │      │
│ → http://192.168.x.x   │            └──────┘
└───────────────────────┘
Vite's --host flag exposes the dev server on the local network. The iPad navigates to the laptop's local IP. No internet required. Risk: If the laptop sleeps or the Wi-Fi drops, the demo dies. Keep the laptop plugged in and awake.
Option C (belt-and-suspenders): PWA with offline caching
Add a service worker that caches all assets. Once the iPad loads the app once, it works fully offline — even in airplane mode. For a scripted, client-only app with no API calls, this is trivial:
typescript// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}']
      },
      manifest: {
        name: 'Synthesis Tutor',
        short_name: 'Fractions',
        display: 'standalone',
        theme_color: '#4A90D9',
        background_color: '#FFFFFF'
      }
    })
  ]
});
The display: standalone setting makes the app look native when added to the iPad home screen — no Safari chrome, no URL bar. This looks polished in a demo and prevents students from accidentally navigating away.
Recommendation: Use Option A (Vercel) for development, add Option C (PWA) on Day 6, and have Option B (local network) as a backup for demo day. Total effort: ~30 minutes for all three.
Pre-demo checklist:
□ Open synthesis-tutor.vercel.app on iPad Safari
□ Add to Home Screen (gets the standalone PWA experience)
□ Load the lesson once with internet (caches via service worker)
□ Turn on airplane mode, reopen app — verify it still works
□ Test full lesson flow on iPad with screen recording running
□ Verify audio works (unmute iPad, tap "Start" to unlock AudioContext)
□ Charge iPad to 100%
□ Bring a Lightning/USB-C cable for screen mirroring to projector

Question 26: How do we design the "smashing" interaction that the spec mentions, and what mathematical concept does it reinforce?
The spec mentions that students should be able to "combine, split, or smash" fraction blocks. "Smashing" is a Synthesis-specific term that's distinct from combining. It's pedagogically important because it addresses a different concept than combination.
The distinction:

Combine: Merge blocks with the same denominator into one block. Two 1/4 blocks combine into 2/4. This reinforces the concept that fractions with the same denominator can be added by adding numerators.
Smash: Merge blocks with different denominators by finding a common visual representation. A 1/2 block and a 1/3 block can be "smashed" together — but first, they need to be re-expressed as sixths (3/6 and 2/6), then combined into 5/6. This is a visual introduction to common denominators — arguably the most important foundational concept for fraction addition.

However — for the 1-week prototype focused on equivalence, smashing is out of scope.
Here's why: smashing teaches fraction addition, not fraction equivalence. The spec's lesson topic is equivalence. Including smashing would mean teaching common denominators, which is a 4th–5th grade concept (4.NF.B.3) and significantly more complex. It would blow the scope.
What to build instead (a smash-ready architecture):
Design the action system so smashing can be added later without refactoring:
typescripttype WorkspaceAction =
  | { type: 'split'; blockId: string; parts: number }
  | { type: 'combine'; blockIds: [string, string] }    // same denominator
  | { type: 'smash'; blockIds: [string, string] }      // different denominator — FUTURE
  | { type: 'compare'; blockIds: [string, string] }
  | { type: 'reset' };

// In the reducer:
case 'combine': {
  const [a, b] = getBlocks(action.blockIds);
  if (a.fraction.denominator !== b.fraction.denominator) {
    // FUTURE: route to smash handler
    // CURRENT: show helpful message
    return {
      ...state,
      tutorMessage: "Those blocks have different sized pieces. " +
                    "Try combining blocks that are the same size! " +
                    "We'll learn how to smash different-sized blocks " +
                    "in a future lesson."
    };
  }
  return {
    ...state,
    blocks: replaceCombined(state.blocks, action.blockIds,
            FractionEngine.combine([a.fraction, b.fraction]))
  };
}
The key design decision: When a student tries to combine blocks with different denominators (which they will naturally try), don't silently fail or show an error. Have Sam acknowledge the impulse positively and redirect:
Sam: "Ooh, you tried to put 1/2 and 1/3 together — great instinct!
      Those blocks are different sizes, so they don't snap together yet.
      We'll learn that trick in the next lesson. For now, try combining
      blocks that are the same size."
This validates the student's curiosity, foreshadows future content, and redirects without frustration. It also creates a natural hook for a second lesson on fraction addition.

Question 27: What edge-case student inputs should the system handle gracefully, and how do we prevent frustration from unexpected interactions?
Children are creative, impatient, and unpredictable. The system must handle every interaction a student might attempt — even the ones no adult would try — without breaking or making the student feel stupid.
Category 1: Rapid-fire interactions
Scenario: Student taps Split 10 times in 2 seconds.

Risk: Creates 1/1024 blocks that are invisible at normal zoom.
      State machine has 10 queued transitions. Animation queue overflows.

Solution:
- Enforce max_denominator (12) at the reducer level. Any split that
  would exceed it is rejected with a message:
  Sam: "Those pieces are as small as they can get! Try combining
        some blocks instead."
- Debounce the Split button: 500ms cooldown with visual feedback
  (button grays out briefly). The cooldown matches the split animation
  duration, so the student sees the result before they can split again.
- Queue max depth: 2 actions. If 3+ are queued, drop the extras and
  show a brief "hold on!" pulse on the action bar.
Category 2: Attempting impossible operations
Scenario: Student tries to split a block into 0 parts or 1 part.

Solution:
- The split action should present a child-friendly picker, not a
  free-text input. Show buttons: [2] [3] [4] — only valid split
  counts. This eliminates the problem at the UI level rather than
  handling it in validation.
- If using a free-text field (not recommended), reject non-positive
  integers with:
  Sam: "We need at least 2 pieces to split! Pick a number like
        2, 3, or 4."
Category 3: Text input in the chat that isn't a fraction
Scenario: Student types "idk" or "hello" or "💩" or "I don't
          understand" in the chat input.

Solution:
- During phases that expect text input, parse the input and
  classify it:

  parseChatInput(raw: string): ChatInput {
    // Try fraction parse first
    const fraction = parseFraction(raw);  // handles "1/2", "1 / 2", "one half"
    if (fraction) return { type: 'fraction', value: fraction };

    // Try yes/no detection
    if (/^(yes|yeah|yep|ok|sure|y)$/i.test(raw.trim()))
      return { type: 'affirmative' };
    if (/^(no|nope|nah|n)$/i.test(raw.trim()))
      return { type: 'negative' };

    // Try help/confusion detection
    if (/^(help|hint|idk|i don'?t know|confused|what|huh|\?)$/i.test(raw.trim()))
      return { type: 'help_request' };

    // Everything else
    return { type: 'unrecognized', raw };
  }

- For 'unrecognized' inputs:
  Sam: "I'm not sure what you mean. Try typing a fraction like 2/4,
        or use the blocks to build your answer!"

- For 'help_request' inputs:
  → trigger the current problem's hint sequence, same as pressing
    a Hint button

- Never scold, never say "invalid input", never show a red error
  border. The student might be genuinely trying to communicate —
  treat every input as a good-faith attempt.
Category 4: Interacting with locked UI elements
Scenario: During assessment, the student tries to use Split when
          the problem only asks for a multiple-choice tap.

Solution:
- Don't hide the Split/Combine buttons during assessment — hiding
  controls is disorienting. Instead, keep them visible but dimmed
  (40% opacity) with a tooltip on tap:
  Sam: "For this question, just tap the answer you think is right!"
- During construction assessment problems (A-2, A-3), all tools
  are active.
Category 5: Very long inactivity
Scenario: Student walks away from the iPad for 5 minutes.

Solution:
- At 60 seconds of inactivity: Sam sends a gentle "still there?"
  message.
  Sam: "Take your time — I'm here whenever you're ready!"
- At 180 seconds: Dim the screen slightly (CSS overlay at 20%
  opacity) and show a "Tap to continue" prompt. This prevents
  screen burn-in and makes it obvious the app is paused.
- At 600 seconds (10 minutes): Auto-checkpoint and show a
  "Welcome back!" screen when the student returns, as if the
  tab had been closed.
- Never auto-advance or skip content due to inactivity. The
  student's pace is their pace.
Category 6: Multi-touch chaos
Scenario: Student uses all five fingers to drag five blocks
          simultaneously.

Solution:
- Process only the first touch that lands on a draggable block.
  Ignore subsequent touch points until the first drag gesture
  completes.
- Implementation: track a `isDragging` boolean. Set to true on
  first touchstart on a block, false on touchend. While true,
  ignore new touchstart events on other blocks.
- This is a simpler model than full multi-touch gesture recognition
  and prevents conflicting drag states.

Question 28: How should the student onboarding work in the first 30 seconds to minimize confusion and maximize "time to first meaningful interaction"?
The first 30 seconds determine whether a student engages or tunes out. An 8-year-old has zero patience for setup instructions. The onboarding must feel like the lesson has already started, not like a tutorial about how to use a tutorial.
The anti-pattern: "Welcome! Here's how to use this app..."
Long onboarding sequences with instructional overlays, tooltip tours, or "click here to continue" walkthroughs actively harm engagement. Research on game-based learning (Gee, 2003) shows that the most effective onboarding teaches through doing, not explaining.
The design: "Learn the tool by using the tool"
The Introduction phase IS the onboarding. Sam's first few messages guide the student through their first interaction with the manipulative, and that interaction is also the beginning of the lesson content. No separate tutorial step.
The first 30 seconds, scripted beat-by-beat:
Second 0 — App loads:
  Visual: Split-pane layout. Left: empty chat with Sam's avatar.
          Right: workspace with one 1/2 block (blue) already placed.
  No loading screen. No splash screen. No logos. The student sees
  content immediately.

Second 0–2 — Sam's first message auto-appears (no student action needed):
  Sam: "Hi! I'm Sam. See that blue block over there? →"
  Visual: A gentle arrow pulses from the chat toward the 1/2 block.
  The arrow is the ONLY pointing/highlighting element — don't
  overwhelm with UI chrome.

Second 2–8 — Student looks at the block:
  (No interaction required. The student is orienting.)
  After 3 seconds, Sam's second message appears:
  Sam: "That's one-half. Tap on it!"

Second 8–15 — Student taps the block:
  Visual: Block gets a selection ring (blue glow). The Split button
          in the action bar gently pulses.
  Sam: "Now press Split!"

  (If student doesn't tap within 10 seconds):
  Sam: "Tap the blue block with your finger — right on the screen!"
  → more emphatic arrow animation pointing to the block

Second 15–25 — Student taps Split:
  Visual: The split picker appears: [2] [3] [4]
  Sam: "How many pieces? Try 2!"

  (If student picks 2):
  → FIRST SPLIT ANIMATION — the block cracks and separates into
    two 1/4 blocks with the "pop-pop" sound.
  Sam: "Whoa! You just split one-half into two quarters. Each
        piece is 1/4."
  → This is the student's first "aha" moment AND they've learned
    how Split works.

Second 25–30 — Bridge to Exploration:
  Sam: "What else can you do with those blocks? Try splitting and
        combining — see what you discover!"
  → Student is now in the Exploration phase with a working
    understanding of the core interaction.
Key principles embedded in this design:

One instruction per message. Never "Tap the block and then press Split." Always "Tap the block." [Student acts.] "Now press Split."
The student acts within 10 seconds. If the first interaction takes longer than 10 seconds, the onboarding has failed. Pre-place content to eliminate setup time.
The first action teaches the first concept. Splitting 1/2 into 1/4 + 1/4 simultaneously teaches the student what Split does AND introduces the relationship between halves and quarters. Double duty.
No "skip tutorial" option. Because the tutorial IS the lesson, there's nothing to skip. A returning student will zip through these messages in 10 seconds (they already know to tap and split), and that's fine — the messages are short enough that they're not annoying on repeat.
Progressive disclosure of controls. The Combine button doesn't pulse until the student has two blocks. The Compare zone doesn't highlight until there are blocks to compare. Controls appear as they become relevant, not all at once.


Question 29: How do we structure the codebase for the 1-week sprint to maximize parallel work if there are 2 developers?
If there's a solo developer, the day-by-day plan from Round 1 (Q10) works as-is. But if the team has 2 developers, the architecture should support parallel work from Day 1 without merge conflicts.
The separation: Engine Developer + UI Developer
Developer A ("Engine Dev")         Developer B ("UI Dev")
─────────────────────────          ─────────────────────────
Day 1: FractionEngine +           Day 1: React scaffold +
       unit tests +                      layout components +
       LessonState types                 placeholder workspace

Day 2: Script engine +            Day 2: FractionBlock component +
       dialogue JSON loader +            drag/drop with gesture lib +
       template interpolation            split/combine animations

Day 3: Math Verification          Day 3: Chat panel UI +
       Layer + misconception             message bubbles +
       detectors + tests                 input field + buttons

Day 4: Integration (BOTH DEVS PAIR)
       Wire engine → UI, chat ↔ workspace,
       verification ↔ script branching

Day 5: Assessment logic +         Day 5: Assessment UI +
       scoring + completion               progress dots +
       screen logic                       completion screen

Day 6: BOTH: Polish, edge cases, iPad testing
Day 7: BOTH: Demo, README, deploy
The contract that enables this split — shared TypeScript interfaces:
On Day 1, before any implementation, both developers agree on and commit these interfaces:
typescript// types.ts — THE contract between Engine and UI

// Engine types (Dev A owns implementation)
interface Fraction { numerator: number; denominator: number; }
interface FractionBlock {
  id: string;
  fraction: Fraction;
  color: string;
  position: 'workspace' | 'comparison';
}

// State types (Dev A owns implementation, Dev B consumes)
interface LessonState {
  phase: Phase;
  stepIndex: number;
  blocks: FractionBlock[];
  score: Score;
  hintCount: number;
  chatMessages: ChatMessage[];
}

// Action types (both devs dispatch these)
type LessonAction =
  | { type: 'SPLIT_BLOCK'; blockId: string; parts: number }
  | { type: 'COMBINE_BLOCKS'; blockIds: [string, string] }
  | { type: 'COMPARE_BLOCKS'; blockIds: [string, string] }
  | { type: 'STUDENT_RESPONSE'; value: Fraction | string }
  | { type: 'ADVANCE_SCRIPT' }
  | { type: 'REQUEST_HINT' }
  | { type: 'RESET_WORKSPACE' };

// TutorBrain interface (Dev A implements, Dev B calls)
interface TutorBrain {
  getNextAction(state: LessonState): Promise<TutorAction>;
  evaluateResponse(input: StudentInput, step: ScriptStep,
                   state: LessonState): Promise<EvaluationResult>;
}
Dev B builds the UI against these interfaces using mock data and a stub TutorBrain that returns hardcoded responses. Dev A builds the real implementations. On Day 4, they swap the stubs for real implementations. If the interfaces were well-defined, integration is smooth.
File structure for clean separation:
src/
├── engine/                    ← Dev A owns
│   ├── FractionEngine.ts
│   ├── FractionEngine.test.ts
│   ├── MisconceptionDetector.ts
│   ├── MisconceptionDetector.test.ts
│   └── ScriptEngine.ts
├── brain/                     ← Dev A owns
│   ├── TutorBrain.ts          (interface)
│   ├── ScriptedTutorBrain.ts  (implementation)
│   └── ScriptedTutorBrain.test.ts
├── state/                     ← Dev A owns, Dev B consumes
│   ├── types.ts               (shared interfaces)
│   ├── reducer.ts
│   ├── reducer.test.ts
│   └── checkpoint.ts
├── components/                ← Dev B owns
│   ├── App.tsx
│   ├── Layout.tsx
│   ├── ChatPanel/
│   │   ├── ChatPanel.tsx
│   │   ├── MessageBubble.tsx
│   │   └── InputField.tsx
│   ├── Workspace/
│   │   ├── Workspace.tsx
│   │   ├── FractionBlock.tsx
│   │   ├── ComparisonZone.tsx
│   │   └── ActionBar.tsx
│   ├── Assessment/
│   │   ├── MultipleChoice.tsx
│   │   ├── ConstructionTask.tsx
│   │   └── CompletionScreen.tsx
│   └── shared/
│       ├── ProgressDots.tsx
│       └── SamAvatar.tsx
├── content/                   ← Both devs edit
│   ├── intro-script.json
│   ├── exploration-config.json
│   ├── guided-practice-script.json
│   └── assessment-pools.json
├── audio/                     ← Dev B owns
│   └── SoundManager.ts
└── index.tsx
Merge conflict prevention: Each developer stays in their own directory. The only shared file is types.ts, which should be finalized on Day 1 and frozen until Day 4 integration (changes require a quick sync conversation, not a unilateral edit).

Question 30: What is the narrative arc of the 1–2 minute demo video, and what specific moments must it capture?
The demo video is arguably the most important deliverable. It's what stakeholders, investors, or program evaluators will watch to decide if the project succeeded. A weak demo of a great prototype is worse than a strong demo of an adequate one.
Narrative structure: "Watch a student go from curious to confident"
The video should tell a story with a clear emotional arc. It's not a feature walkthrough — it's a learning journey compressed into 90 seconds.
The shot list:
SHOT 1: "The Setup" (0:00 – 0:08)
──────────────────────────────────
Visual: iPad on a desk, student's hands visible. App loads.
        Split-pane layout appears with Sam's greeting and the
        blue 1/2 block.
Purpose: Establishes this is a real app on a real device,
         not a mockup. The student is a real person (or a
         convincing stand-in).
Audio: Natural room ambience. App's subtle UI sounds.
Capture: The instant the app is interactive (demonstrates
         fast load time).


SHOT 2: "First Discovery" (0:08 – 0:25)
────────────────────────────────────────
Visual: Student follows Sam's prompt, taps the block, presses Split.
        The split animation plays — block cracks into two 1/4 pieces
        with the pop-pop sound. Student visibly reacts (ideally
        a small smile or "oh!").
Purpose: This is the "magic moment" — the app feels tangible.
         The split animation is the star.
Capture: The animation running smoothly at 60fps on the iPad.
         Sam's contextual response appearing in the chat.


SHOT 3: "Exploration Autonomy" (0:25 – 0:40)
─────────────────────────────────────────────
Visual: Student freely splits and combines. They place two blocks
        in the comparison zone. The equivalence reveal animation
        plays (golden pulse, "=" symbol). Sam celebrates.
Purpose: Demonstrates that the student is DISCOVERING, not being
         told. This is the Synthesis differentiator — exploration
         over instruction.
Capture: The comparison animation. Sam's excited response. The
         student's engagement (they're leaning in, not bored).


SHOT 4: "Productive Struggle" (0:40 – 0:55)
────────────────────────────────────────────
Visual: In guided practice, the student gives a wrong answer. Sam
        responds warmly ("Not quite — try splitting into smaller
        pieces"). The student tries again. The workspace highlights
        guide them. They get it right. Sam celebrates.
Purpose: Demonstrates the branching dialogue and hint system. Shows
         that incorrect answers lead to learning, not dead ends.
         This is the pedagogical credibility moment.
Capture: The wrong-answer flow → hint → success flow. Sam's
         encouraging tone visible in the chat.


SHOT 5: "Mastery" (0:55 – 1:15)
────────────────────────────────
Visual: Assessment phase. Student answers 3 problems with increasing
        confidence. On the final problem (generalization — find TWO
        equivalents), they build both answers using the blocks.
        Score: 3/3. Completion screen with confetti animation and
        celebration sound.
Purpose: The emotional payoff. The student went from "what does
         Split do?" to independently generating equivalent fractions
         in under a minute of video (15 minutes of actual lesson time).
Capture: The confetti. The score. If possible, the student's
         genuine reaction to completing the lesson.


SHOT 6: "The Close" (1:15 – 1:30)
──────────────────────────────────
Visual: Quick montage of 2–3 key screens — the workspace in action,
        Sam's chat, the assessment screen. Fade to title card with
        project name and team.
Purpose: Reinforces the breadth of the experience. Leaves the viewer
         wanting to try it themselves.
Recording logistics:

Use iPad's built-in screen recording (Settings → Control Center → Screen Recording). This captures touch indicators natively (white circles where the student taps), which helps viewers follow the interaction.
Record in landscape orientation to match how the app is designed.
If using a real student: get parental consent AND frame the shot to show hands only (no face). This avoids privacy/consent issues while still communicating "a real child used this."
If no student available: record the developer using it, but slow down interactions to child-pace (don't speed-click like a developer). Add a 0.5-second pause between each tap.

Editing tips:

Cut the video at natural transition points (phase changes), not mid-interaction. Each shot should end on a resolution (animation completes, message appears, score updates).
Don't add voiceover narration unless it's exceptionally well-produced. A bad voiceover is worse than none. The chat messages and visual interactions tell the story.
Add subtle background music if the app sounds are too sparse. Something calm, curious, upbeat — think "exploration" not "achievement." License-free options from YouTube Audio Library or Uppbeat work fine.
Compress to 720p for reliable playback. 4K is unnecessary and creates file-size issues for email/Slack sharing.

The one shot that makes or breaks the demo: Shot 2 (First Discovery). If the split animation is smooth, the sound is satisfying, and Sam's response feels natural, evaluators will lean forward for the rest of the video. If Shot 2 is buggy, laggy, or lifeless, nothing after it recovers the impression. Polish this interaction above all others.

Summary: What Round 3 Resolved
This round closed the content-level and operational gaps that Rounds 1–2 left open:

The tutor has a name, a persona, and sentence-level constraints. Sam is warm, precise, and never negative. Max 15 words per sentence, max 3 sentences per message. No "wrong," ever.
The full lesson script is written. 4 guided practice problems and 3 assessment problems with complete branching, hints, auto-demonstrations, and randomized pools. No ambiguity remains for the developer.
The app survives real-world chaos. Checkpoint-to-sessionStorage on every significant transition, recovery UI via Sam's warm greeting, back-button guard, and a 30-minute staleness window.
Standards alignment is explicit. 3.NF.A.3a, 3.NF.A.3b, and 4.NF.A.1 — with a clear mapping from each standard to the lesson phase that teaches it and the assessment problem that measures it.
Deployment is one command. Vercel for cloud, --host for local fallback, PWA for offline resilience. The iPad demo checklist is 8 items.
Smashing is scoped out but architecturally supported. The action type exists, the error message is written, and the reducer gracefully redirects. A second lesson on fraction addition can add it without refactoring.
Every weird student input has a handler. Rapid tapping, gibberish text, multi-touch, inactivity, locked controls, impossible operations — each has a specific, child-friendly response.
The first 30 seconds are scripted beat-by-beat. One instruction per message, first meaningful interaction within 10 seconds, progressive disclosure of controls.
Two developers can work in parallel. Engine Dev and UI Dev split cleanly along the types.ts interface contract, merging on Day 4.
The demo video has a shot list and a narrative arc. Six shots, 90 seconds, from curiosity to mastery. Shot 2 (First Discovery) is the money shot.