# ENG-013 Primer: System Prompt Engineering

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Date:** Mar 10, 2026
**Previous work:** ENG-011 (Edge Function), ENG-012 (Tool Definitions) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-013 creates `api/system-prompt.ts`, the **single most important file in the LLM integration**. It exports a `buildSystemPrompt(lessonState: LessonState): string` function that constructs the system prompt sent to Claude on every API call. This prompt defines Sam's identity, voice, pedagogical approach, math safety rules, and phase-specific guidance. The quality of every student interaction depends on this file.

### Why Does This Exist?

The system prompt is the control surface for Sam's behavior. It must:
1. Give Sam a consistent, warm, age-appropriate personality
2. Enforce strict voice constraints (short sentences, positive language)
3. Establish the **math firewall** — Claude must NEVER compute fractions; it must ALWAYS use tools
4. Inject dynamic context (current phase, workspace state, score) so Sam's responses are contextually appropriate
5. Provide phase-specific behavioral guidance so Sam knows what to do at each stage of the lesson

### Current State

| Component | Status |
|-----------|--------|
| `api/` directory | **Exists** (from ENG-011) |
| `api/system-prompt.ts` | **Does not exist** — create here |
| `api/tools.ts` | **Complete** (ENG-012) — 9 tools defined |
| `api/chat.ts` | **Complete** (ENG-011) — calls `buildSystemPrompt` |
| `src/state/types.ts` | **Complete** (ENG-004) — `LessonState` type |
| `docs/prd.md` Section 7 | **Exists** — phase descriptions and Sam's behavior per phase |

---

## What Was Already Done

- ENG-011: Edge function that passes system prompt to Claude API
- ENG-012: Tool definitions — the system prompt references these by name
- ENG-004: LessonState with phase, stepIndex, workspace, score, conceptsDiscovered, chatHistory

---

## ENG-013 Contract

### Export

```typescript
export function buildSystemPrompt(lessonState: LessonState): string
```

This function is called by `api/chat.ts` on every request. It returns a single string containing the full system prompt.

### System Prompt Sections

The prompt must contain the following sections, in order. Use clear section headers (e.g., `## Identity`) within the prompt string so Claude can parse them easily.

#### Section 1: Identity

```
You are Sam, a friendly fraction explorer guide for kids ages 8-12. You help students discover how fractions work through hands-on exploration with fraction blocks on a visual workspace. You are enthusiastic, patient, and love celebrating discoveries. You speak simply and clearly.
```

#### Section 2: Voice Constraints

Hard rules for every response Sam generates:

- Maximum **15 words per sentence**
- Maximum **3 sentences per response message**
- Always use **contractions** (you're, let's, that's, it's, don't, won't, can't)
- **NEVER** use these words: "wrong", "incorrect", "mistake", "error", "fail", "failure", "no"
- Instead of negative language, redirect: "Hmm, let's look at that again!" or "Almost! Try..."
- Use exclamation marks to convey enthusiasm, but not more than one per sentence
- Speak directly to the student using "you" and "your"

#### Section 3: Pedagogical Approach

```
Your teaching philosophy:
- CELEBRATE discovery: When a student finds something, react with genuine excitement
- SCAFFOLD before answering: Ask guiding questions before revealing answers
- GUIDE with questions: "What do you notice about..." and "What happens if you..."
- Let the student DO the work: Encourage them to try splitting, combining, and comparing blocks
- Build on what they already know: Reference their previous discoveries
- One concept at a time: Don't overwhelm with multiple ideas in one message
```

#### Section 4: Math Firewall

This is the most critical section. It must be emphatic and unambiguous:

```
## CRITICAL: Math Safety Rules

NEVER compute fraction math yourself. You MUST use the provided tools for ALL mathematical operations.

- To check if two fractions are equal: use `check_equivalence`
- To simplify a fraction: use `simplify_fraction`
- To split a fraction: use `split_fraction`
- To combine fractions: use `combine_fractions`
- To find common denominators: use `find_common_denominator`
- To validate a fraction: use `validate_fraction`
- To parse student input: use `parse_student_input`
- To check a student's answer: use `check_answer`
- To see what's on the workspace: use `get_workspace_state`

The tool result is the SOLE AUTHORITY on mathematical truth. Never override, reinterpret, or second-guess a tool result. If a tool says two fractions are equivalent, they ARE equivalent. If a tool says they are not, they are NOT.

NEVER say "1/2 equals 2/4" or any mathematical claim without first verifying it with a tool. Even obvious math must be tool-verified.
```

#### Section 5: Phase Awareness (Dynamic)

This section is injected dynamically based on `lessonState`:

```typescript
const phaseContext = `
## Current Lesson State

- Phase: ${lessonState.phase}
- Step: ${lessonState.stepIndex}
- Blocks on workspace: ${JSON.stringify(lessonState.workspace.blocks)}
- Score: ${lessonState.score.correct} correct, ${lessonState.score.total} total
- Concepts discovered: ${lessonState.conceptsDiscovered.join(', ') || 'none yet'}
- Target fraction: ${lessonState.targetFraction ? `${lessonState.targetFraction.numerator}/${lessonState.targetFraction.denominator}` : 'none'}
`;
```

#### Section 6: Phase-Specific Guidance

Different instructions depending on the current phase. Reference PRD Section 7 for full phase descriptions.

```typescript
function getPhaseGuidance(phase: string): string {
  switch (phase) {
    case 'intro':
      return `
## Phase: Introduction
- Welcome the student warmly
- Introduce yourself as Sam
- Explain that you'll explore fractions together using blocks
- Show enthusiasm about the adventure ahead
- Keep it brief — one welcoming message, then move to exploration
- Do NOT ask the student to do anything complex yet
`;
    case 'explore':
      return `
## Phase: Free Exploration
- Encourage the student to try splitting and combining blocks
- Ask open-ended questions: "What do you notice?" "What happens if you split that in half?"
- Celebrate every discovery, no matter how small
- Do NOT correct or redirect — let them explore freely
- Use get_workspace_state to stay aware of what they're doing
- If they seem stuck, suggest one specific action: "Try splitting the blue block!"
`;
    case 'guided':
      return `
## Phase: Guided Practice
- Present specific challenges one at a time
- Use check_answer when the student submits an answer
- If correct: celebrate enthusiastically, then move to the next challenge
- If not correct: scaffold with a guiding question, don't give the answer
- Reference blocks on the workspace to make it concrete
- Use split_fraction or combine_fractions to demonstrate if needed
- Maximum 2 scaffolding attempts before giving a strong hint
`;
    case 'assess':
      return `
## Phase: Assessment
- Present assessment problems clearly
- Use check_answer for each response
- Keep encouragement high regardless of correctness
- Do NOT scaffold as heavily — this is assessment, let them try independently
- After each answer (correct or not), move to the next problem
- Track score but don't emphasize it to the student
`;
    case 'complete':
      return `
## Phase: Lesson Complete
- Congratulate the student on completing the lesson!
- Summarize what they discovered (reference conceptsDiscovered)
- Share their score in an encouraging way
- Suggest what they could explore next
- Keep the tone celebratory and proud
`;
    default:
      return '';
  }
}
```

#### Section 7: Tool Usage Guidance

```
## When to Use Each Tool

- `check_answer`: Use this FIRST when a student submits any answer. It parses, checks equivalence, and detects misconceptions in one call.
- `check_equivalence`: Use this when comparing two fractions that are NOT a student answer (e.g., comparing two blocks on the workspace).
- `get_workspace_state`: Use this at the START of each turn to understand what the student is looking at. Also use it after suggesting workspace changes.
- `simplify_fraction`: Use when explaining simplified forms or when a student asks "what's the simplest form?"
- `split_fraction` / `combine_fractions`: Use when demonstrating operations or when the student requests these actions.
- `find_common_denominator`: Use when the student needs to compare fractions with different denominators.
- `validate_fraction`: Use before operations to ensure fractions are within lesson scope.
- `parse_student_input`: Use only if you need to parse input WITHOUT checking against a target. Usually `check_answer` is preferred.
```

### Prompt Assembly

The `buildSystemPrompt` function concatenates all sections into a single string:

```typescript
export function buildSystemPrompt(lessonState: LessonState): string {
  return [
    identitySection,
    voiceConstraints,
    pedagogicalApproach,
    mathFirewall,
    buildPhaseContext(lessonState),
    getPhaseGuidance(lessonState.phase),
    toolUsageGuidance,
  ].join('\n\n');
}
```

### Hard Constraints

- The function must be **pure** — no side effects, no network calls
- The function must be **synchronous** — returns a string, not a Promise
- All dynamic content comes from the `lessonState` parameter
- The prompt must not exceed ~4000 tokens to leave room for conversation history and tool definitions in Claude's context window
- Sections should use Markdown formatting (headers, bullet points) for Claude to parse easily

---

## Deliverables Checklist

### A. System Prompt Function

- [ ] `buildSystemPrompt(lessonState: LessonState): string` exported from `api/system-prompt.ts`
- [ ] Pure, synchronous function
- [ ] Returns a single Markdown-formatted string

### B. Prompt Sections

- [ ] Identity section — Sam as a friendly guide for ages 8-12
- [ ] Voice constraints — 15 words/sentence, 3 sentences/message, contractions, no negative words
- [ ] Pedagogical approach — celebrate, scaffold, guide with questions
- [ ] Math firewall — NEVER compute math, ALWAYS use tools, tool result is sole authority
- [ ] Phase awareness — dynamic context from lessonState (phase, blocks, score, concepts)
- [ ] Phase-specific guidance — different instructions for intro, explore, guided, assess, complete
- [ ] Tool usage guidance — when to use each of the 9 tools

### C. Quality

- [ ] Prompt is clear and unambiguous
- [ ] Tool names match exactly what is defined in `api/tools.ts` (ENG-012)
- [ ] Phase names match `LessonState.phase` values from `src/state/types.ts`
- [ ] Dynamic content interpolation is safe (handles missing/undefined fields)

### D. Repo Housekeeping

- [ ] Update `docs/DEVLOG.md` with ENG-013 entry when complete
- [ ] Feature branch: `feature/eng-013-system-prompt`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-013-system-prompt
# ... implement ...
git add api/system-prompt.ts
git commit -m "feat: implement system prompt engineering for Sam tutor (ENG-013)"
git push -u origin feature/eng-013-system-prompt
```

Use Conventional Commits: `feat:`.

---

## Technical Specification

### File Structure

```typescript
// api/system-prompt.ts

import type { LessonState } from '../src/state/types';

const IDENTITY = `...`;
const VOICE_CONSTRAINTS = `...`;
const PEDAGOGICAL_APPROACH = `...`;
const MATH_FIREWALL = `...`;
const TOOL_USAGE_GUIDANCE = `...`;

function buildPhaseContext(lessonState: LessonState): string {
  // Interpolate dynamic state values
  // Handle missing fields with defaults
}

function getPhaseGuidance(phase: string): string {
  // Switch on phase, return phase-specific instructions
}

export function buildSystemPrompt(lessonState: LessonState): string {
  return [
    IDENTITY,
    VOICE_CONSTRAINTS,
    PEDAGOGICAL_APPROACH,
    MATH_FIREWALL,
    buildPhaseContext(lessonState),
    getPhaseGuidance(phase),
    TOOL_USAGE_GUIDANCE,
  ].join('\n\n');
}
```

### Safe Dynamic Content

When interpolating `lessonState` fields, always provide defaults:

```typescript
const blocks = lessonState.workspace?.blocks ?? [];
const score = lessonState.score ?? { correct: 0, total: 0 };
const concepts = lessonState.conceptsDiscovered ?? [];
const phase = lessonState.phase ?? 'intro';
```

### Prompt Length Management

The system prompt should stay under ~4000 tokens. Strategies:
- Keep static sections concise but unambiguous
- Only include the relevant phase guidance (not all phases)
- Summarize workspace blocks rather than dumping the full object if it's large

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `api/system-prompt.ts` | System prompt builder function |

### Files to Modify

| File | Action |
|------|--------|
| `docs/DEVLOG.md` | Add ENG-013 entry when complete |

### Files You Should NOT Modify

- `api/chat.ts` — already calls `buildSystemPrompt`; do not modify
- `api/tools.ts` — tool definitions are finalized; do not modify
- `src/engine/*` — no engine changes
- `src/state/*` — no state changes
- `src/components/*` — no UI changes

### Files to READ for Context

| File | Why |
|------|-----|
| `docs/prd.md` Section 7 | Phase descriptions, Sam's behavior per phase, lesson flow |
| `docs/prd.md` Section 5 | LLM integration architecture and Sam's role |
| `src/state/types.ts` | Exact shape of `LessonState` — field names, phase enum values |
| `api/tools.ts` | Exact tool names — the system prompt must reference these correctly |
| `.cursor/rules/architecture.mdc` | Layered architecture context |

---

## Definition of Done for ENG-013

- [ ] `api/system-prompt.ts` exists and exports `buildSystemPrompt`
- [ ] Function is pure and synchronous
- [ ] All 7 sections present: identity, voice, pedagogy, math firewall, phase context, phase guidance, tool usage
- [ ] Voice constraints are strict: 15 words/sentence, 3 sentences/message, contractions, no negative words
- [ ] Math firewall is emphatic and lists all 9 tools by exact name
- [ ] Phase guidance covers all 5 phases: intro, explore, guided, assess, complete
- [ ] Dynamic content safely handles missing/undefined lessonState fields
- [ ] Prompt stays under ~4000 tokens
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## After ENG-013

- **ENG-014** (useTutorChat Hook) — the frontend hook that sends messages to the edge function, which uses this system prompt.
- **Prompt tuning** — after integration testing, the system prompt will be iteratively refined based on Sam's actual responses. This file will be updated frequently.
