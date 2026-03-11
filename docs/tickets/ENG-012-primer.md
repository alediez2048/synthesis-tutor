# ENG-012 Primer: Claude Tool Definitions

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Date:** Mar 10, 2026
**Previous work:** ENG-011 (Edge Function), ENG-002 (FractionEngine) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-012 defines the **9 tools** that Claude can call during a tutoring session. These are declared in Anthropic's tool schema format and paired with an `executeToolCall` dispatcher that runs each tool server-side using the FractionEngine. This file is the bridge between Claude's reasoning and the deterministic math layer — Claude decides *when* to check an answer; the tool *executes* the check with zero hallucination risk.

### Why Does This Exist?

Claude must never compute fraction math itself. The system prompt (ENG-013) tells Claude to always use tools. This file provides:
1. **Tool schemas** — so Claude knows what tools exist, what parameters they accept, and when to use them
2. **`executeToolCall`** — a dispatcher that routes tool calls to the correct FractionEngine function and returns structured results
3. **Composite tools** — `check_answer` combines parsing, equivalence checking, and misconception detection into one call

### Current State

| Component | Status |
|-----------|--------|
| `api/` directory | **Exists** (from ENG-011) |
| `api/tools.ts` | **Does not exist** — create here |
| `src/engine/FractionEngine.ts` | **Complete** (ENG-002) — all pure math functions available |
| `api/chat.ts` | **Complete** (ENG-011) — imports and calls `executeToolCall` |
| `src/state/types.ts` | **Complete** (ENG-004) — `LessonState` type defined |

---

## What Was Already Done

- ENG-002: FractionEngine with simplify, areEquivalent, split, combine, toCommonDenominator, isValidFraction, parseStudentInput
- ENG-011: Edge function that intercepts tool_use events and calls `executeToolCall`
- ENG-004: LessonState type with phases, blocks, score, conceptsDiscovered

---

## ENG-012 Contract

### Tool Schema Format

Each tool must be defined in [Anthropic's tool format](https://docs.anthropic.com/en/docs/tool-use):

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}
```

The `description` field is critical — it tells Claude *when* to use the tool. Write descriptions that are clear, concise, and oriented toward tutoring use cases.

### The 9 Tools

#### 1. `check_equivalence`

Check whether two fractions are mathematically equivalent.

```typescript
{
  name: 'check_equivalence',
  description: 'Check if two fractions are mathematically equivalent. Use this when comparing two fractions a student is working with, or verifying a visual equivalence on the workspace.',
  input_schema: {
    type: 'object',
    properties: {
      a: {
        type: 'object',
        properties: {
          numerator: { type: 'number', description: 'Numerator of the first fraction' },
          denominator: { type: 'number', description: 'Denominator of the first fraction' }
        },
        required: ['numerator', 'denominator']
      },
      b: {
        type: 'object',
        properties: {
          numerator: { type: 'number', description: 'Numerator of the second fraction' },
          denominator: { type: 'number', description: 'Denominator of the second fraction' }
        },
        required: ['numerator', 'denominator']
      }
    },
    required: ['a', 'b']
  }
}
```

**Execution:** calls `FractionEngine.areEquivalent(a, b)` and returns `{ equivalent: boolean }`.

#### 2. `simplify_fraction`

Reduce a fraction to its lowest terms.

```typescript
{
  name: 'simplify_fraction',
  description: 'Simplify a fraction to its lowest terms using GCD. Use this when a student asks what the simplified form is, or when you need to show the simplest representation.',
  input_schema: {
    type: 'object',
    properties: {
      fraction: {
        type: 'object',
        properties: {
          numerator: { type: 'number' },
          denominator: { type: 'number' }
        },
        required: ['numerator', 'denominator']
      }
    },
    required: ['fraction']
  }
}
```

**Execution:** calls `FractionEngine.simplify(fraction)` and returns `{ simplified: Fraction }`.

#### 3. `split_fraction`

Split a fraction into N equal parts.

```typescript
{
  name: 'split_fraction',
  description: 'Split a fraction into N equal parts. Use this when the student needs to divide a fraction block on the workspace into smaller pieces.',
  input_schema: {
    type: 'object',
    properties: {
      fraction: {
        type: 'object',
        properties: {
          numerator: { type: 'number' },
          denominator: { type: 'number' }
        },
        required: ['numerator', 'denominator']
      },
      parts: { type: 'number', description: 'Number of equal parts to split into (integer >= 2)' }
    },
    required: ['fraction', 'parts']
  }
}
```

**Execution:** calls `FractionEngine.split(fraction, parts)` and returns `{ pieces: Fraction[] }`.

#### 4. `combine_fractions`

Sum fractions that share the same denominator.

```typescript
{
  name: 'combine_fractions',
  description: 'Combine (add) fractions that have the same denominator into a single fraction. Use this when the student merges fraction blocks on the workspace.',
  input_schema: {
    type: 'object',
    properties: {
      fractions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            numerator: { type: 'number' },
            denominator: { type: 'number' }
          },
          required: ['numerator', 'denominator']
        },
        description: 'Array of fractions with the same denominator'
      }
    },
    required: ['fractions']
  }
}
```

**Execution:** calls `FractionEngine.combine(fractions)` and returns `{ combined: Fraction }`.

#### 5. `find_common_denominator`

Express two fractions with a shared denominator (LCD).

```typescript
{
  name: 'find_common_denominator',
  description: 'Find the least common denominator of two fractions and express both with that shared denominator. Use this when the student needs to compare or add fractions with different denominators.',
  input_schema: {
    type: 'object',
    properties: {
      a: {
        type: 'object',
        properties: {
          numerator: { type: 'number' },
          denominator: { type: 'number' }
        },
        required: ['numerator', 'denominator']
      },
      b: {
        type: 'object',
        properties: {
          numerator: { type: 'number' },
          denominator: { type: 'number' }
        },
        required: ['numerator', 'denominator']
      }
    },
    required: ['a', 'b']
  }
}
```

**Execution:** calls `FractionEngine.toCommonDenominator(a, b)` and returns `{ result: [Fraction, Fraction] }`.

#### 6. `validate_fraction`

Check whether a fraction is valid within lesson constraints.

```typescript
{
  name: 'validate_fraction',
  description: 'Check if a fraction has valid positive integer numerator and denominator (1-12). Use this to verify fractions are within lesson scope before performing operations.',
  input_schema: {
    type: 'object',
    properties: {
      fraction: {
        type: 'object',
        properties: {
          numerator: { type: 'number' },
          denominator: { type: 'number' }
        },
        required: ['numerator', 'denominator']
      }
    },
    required: ['fraction']
  }
}
```

**Execution:** calls `FractionEngine.isValidFraction(fraction)` and returns `{ valid: boolean }`.

#### 7. `parse_student_input`

Parse a raw text string into a Fraction.

```typescript
{
  name: 'parse_student_input',
  description: 'Parse a student\'s text input (like "2/4" or "3 / 6") into a structured fraction. Returns null if the input cannot be parsed as a valid fraction. Use this when you receive raw text that might be a fraction.',
  input_schema: {
    type: 'object',
    properties: {
      raw: { type: 'string', description: 'The raw text input from the student' }
    },
    required: ['raw']
  }
}
```

**Execution:** calls `FractionEngine.parseStudentInput(raw)` and returns `{ parsed: Fraction | null }`.

#### 8. `check_answer`

Composite tool: parse student input, check equivalence to target, detect misconceptions.

```typescript
{
  name: 'check_answer',
  description: 'Check a student\'s answer against the target fraction. Parses the input, checks equivalence, and identifies potential misconceptions. This is the primary tool for evaluating student responses — use it whenever a student submits an answer.',
  input_schema: {
    type: 'object',
    properties: {
      student_input: { type: 'string', description: 'The raw text the student typed' },
      target: {
        type: 'object',
        properties: {
          numerator: { type: 'number' },
          denominator: { type: 'number' }
        },
        required: ['numerator', 'denominator'],
        description: 'The correct target fraction to check against'
      }
    },
    required: ['student_input', 'target']
  }
}
```

**Execution:**
1. Call `FractionEngine.parseStudentInput(student_input)` → `parsed`
2. If `parsed` is null → return `{ correct: false, parsed: null, misconception: 'Could not parse input as a fraction' }`
3. Call `FractionEngine.areEquivalent(parsed, target)` → `correct`
4. If not correct and MisconceptionDetector is available (ENG-018, future), call it to identify the specific misconception
5. Return `{ correct: boolean, parsed: Fraction | null, misconception?: string }`

For now (before ENG-018), if the answer is incorrect, return a generic `misconception: undefined` — the system prompt will instruct Claude to scaffold without specific misconception data.

#### 9. `get_workspace_state`

Summarize the current workspace for Claude's awareness.

```typescript
{
  name: 'get_workspace_state',
  description: 'Get a summary of the current lesson workspace state including blocks on the workspace, current phase, score, and concepts discovered. Use this to understand what the student is currently seeing and working with.',
  input_schema: {
    type: 'object',
    properties: {
      lessonState: {
        type: 'object',
        description: 'The current lesson state object'
      }
    },
    required: ['lessonState']
  }
}
```

**Execution:** Extract and return a structured summary from the `LessonState`:
```typescript
{
  phase: lessonState.phase,
  stepIndex: lessonState.stepIndex,
  blocks: lessonState.workspace.blocks,
  score: lessonState.score,
  conceptsDiscovered: lessonState.conceptsDiscovered,
  targetFraction: lessonState.targetFraction
}
```

### `executeToolCall` Dispatcher

```typescript
export function executeToolCall(
  name: string,
  input: Record<string, any>,
  lessonState: LessonState
): Record<string, any>
```

- Switch on `name` to route to the correct handler
- Each handler calls the appropriate FractionEngine function(s)
- Returns a plain object (JSON-serializable)
- Unknown tool names → return `{ error: 'Unknown tool' }`
- Wrap FractionEngine calls in try/catch → return `{ error: message }` on failure (do not throw)

### Export

```typescript
export const toolDefinitions: ToolDefinition[];
export function executeToolCall(name: string, input: Record<string, any>, lessonState: LessonState): Record<string, any>;
```

---

## Deliverables Checklist

### A. Tool Definitions

- [ ] 9 tool schemas defined in Anthropic tool format
- [ ] Each tool has a clear, tutoring-oriented `description`
- [ ] Input schemas fully typed with `required` fields
- [ ] Exported as `toolDefinitions` array

### B. `executeToolCall` Dispatcher

- [ ] Routes to correct FractionEngine function based on tool name
- [ ] `check_answer` is composite (parse → equivalence → misconception stub)
- [ ] `get_workspace_state` extracts summary from LessonState
- [ ] Unknown tools return `{ error: 'Unknown tool' }`
- [ ] All FractionEngine errors caught and returned as `{ error }` — no thrown exceptions

### C. Integration

- [ ] `api/chat.ts` (ENG-011) can import `toolDefinitions` and `executeToolCall`
- [ ] Tool definitions compatible with Anthropic SDK `tools` parameter

### D. Repo Housekeeping

- [ ] Update `docs/DEVLOG.md` with ENG-012 entry when complete
- [ ] Feature branch: `feature/eng-012-tool-definitions`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-012-tool-definitions
# ... implement ...
git add api/tools.ts
git commit -m "feat: define Claude tool schemas and executeToolCall dispatcher (ENG-012)"
git push -u origin feature/eng-012-tool-definitions
```

Use Conventional Commits: `feat:`.

---

## Technical Specification

### File Structure

```typescript
// api/tools.ts

import {
  simplify,
  areEquivalent,
  split,
  combine,
  toCommonDenominator,
  isValidFraction,
  parseStudentInput,
} from '../src/engine/FractionEngine';
import type { LessonState } from '../src/state/types';
import type { Fraction } from '../src/engine/FractionEngine';

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  // ... all 9 tools
];

export function executeToolCall(
  name: string,
  input: Record<string, any>,
  lessonState: LessonState
): Record<string, any> {
  try {
    switch (name) {
      case 'check_equivalence':
        return { equivalent: areEquivalent(input.a, input.b) };
      case 'simplify_fraction':
        return { simplified: simplify(input.fraction) };
      case 'split_fraction':
        return { pieces: split(input.fraction, input.parts) };
      case 'combine_fractions':
        return { combined: combine(input.fractions) };
      case 'find_common_denominator':
        return { result: toCommonDenominator(input.a, input.b) };
      case 'validate_fraction':
        return { valid: isValidFraction(input.fraction) };
      case 'parse_student_input':
        return { parsed: parseStudentInput(input.raw) };
      case 'check_answer':
        return executeCheckAnswer(input.student_input, input.target);
      case 'get_workspace_state':
        return extractWorkspaceState(lessonState);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Tool execution failed' };
  }
}
```

### `check_answer` Implementation

```typescript
function executeCheckAnswer(
  studentInput: string,
  target: Fraction
): { correct: boolean; parsed: Fraction | null; misconception?: string } {
  const parsed = parseStudentInput(studentInput);
  if (!parsed) {
    return { correct: false, parsed: null, misconception: 'Could not parse input as a fraction' };
  }
  const correct = areEquivalent(parsed, target);
  // Future: MisconceptionDetector (ENG-018) would provide specific misconception
  return { correct, parsed };
}
```

### Import Path Note

The import path from `api/tools.ts` to `src/engine/FractionEngine.ts` uses `../src/engine/FractionEngine`. Verify this resolves correctly in the Vercel Edge Runtime. If there are module resolution issues, the path may need adjustment or a `tsconfig` path alias.

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `api/tools.ts` | Tool definitions and executeToolCall dispatcher |

### Files to Modify

| File | Action |
|------|--------|
| `docs/DEVLOG.md` | Add ENG-012 entry when complete |

### Files You Should NOT Modify

- `src/engine/FractionEngine.ts` — import only, do not modify
- `src/state/types.ts` — import types only
- `src/state/reducer.ts` — do not modify
- `api/chat.ts` — ENG-011 already imports from this file; do not modify unless fixing integration issues
- `src/components/*` — no UI changes

### Files to READ for Context

| File | Why |
|------|-----|
| `src/engine/FractionEngine.ts` | Exact function signatures and exports |
| `src/state/types.ts` | `LessonState` shape — needed for `get_workspace_state` and `executeToolCall` signature |
| `docs/prd.md` Section 4.3–4.4 | Engine API and data model context |
| `api/chat.ts` | How tool definitions and executeToolCall are consumed |

---

## Definition of Done for ENG-012

- [ ] `api/tools.ts` exists with 9 tool schemas in Anthropic format
- [ ] `toolDefinitions` array exported and compatible with Anthropic SDK `tools` parameter
- [ ] `executeToolCall` exported and handles all 9 tool names
- [ ] `check_answer` is composite: parse → equivalence check → misconception stub
- [ ] `get_workspace_state` returns structured summary from LessonState
- [ ] All FractionEngine calls wrapped in try/catch — errors returned as `{ error }`, never thrown
- [ ] Unknown tool names return `{ error: 'Unknown tool' }`
- [ ] Tool descriptions are clear enough for Claude to know when to use each tool
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## After ENG-012

- **ENG-013** (System Prompt Engineering) — the system prompt will reference these tools by name and tell Claude when to use them.
- **ENG-014** (useTutorChat Hook) — the frontend hook will parse `tool_use` SSE events to update workspace state.
- **ENG-018** (MisconceptionDetector) — future ticket will provide specific misconception identification for `check_answer`.
