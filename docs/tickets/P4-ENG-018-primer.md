# ENG-018 Primer: MisconceptionDetector (Claude Tool)

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 4: Integration + Voice + Observability (Day 4)
**Date:** Mar 11, 2026
**Previous work:** ENG-002 (FractionEngine), ENG-012 (tools with `check_answer` stub). See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-018 creates a **MisconceptionDetector** in `src/engine/MisconceptionDetector.ts` — a pure, deterministic function that identifies common fraction misconceptions when a student's answer is wrong. It enhances the existing `check_answer` tool in `api/tools.ts` so that when a student gives an incorrect answer, Claude receives a specific misconception label and can respond with targeted remediation instead of generic "try again" messages.

### Why Does This Exist?

When a student says "2/3" but the target is "1/2", there are many possible reasons:
- They added numerators and denominators (1+1)/(2+1) = 2/3
- They flipped the fraction
- They guessed randomly

Each misconception calls for a different teaching response. The detector gives Sam (via Claude) the **why** behind the wrong answer, not just that it's wrong. This is the pedagogical core — generic "try again" is bad teaching; targeted scaffolding is good teaching.

### Current State

| Component | Status |
|-----------|--------|
| `src/engine/FractionEngine.ts` | **Complete** (ENG-002) — `areEquivalent`, `parseStudentInput`, `simplify` |
| `api/tools.ts` | **Complete** (ENG-012) — `check_answer` tool exists with basic misconception stub |
| `src/engine/MisconceptionDetector.ts` | **Does not exist** — create here |
| `executeCheckAnswer` in `api/tools.ts` | **Exists** — returns `{ correct, parsed, misconception? }` but only detects "Could not parse" |

---

## What Was Already Done

The `check_answer` tool in `api/tools.ts` (lines 145-158) already has this flow:

```typescript
function executeCheckAnswer(
  studentInput: string,
  target: Fraction
): { correct: boolean; parsed: Fraction | null; misconception?: string } {
  const parsed = parseStudentInput(studentInput);
  if (parsed === null) {
    return { correct: false, parsed: null, misconception: 'Could not parse input as a fraction' };
  }
  const correct = areEquivalent(parsed, target);
  return { correct, parsed };
}
```

When `correct` is `false`, there's **no misconception returned** — Claude gets `{ correct: false, parsed: { numerator: 2, denominator: 3 } }` with no guidance on what went wrong. ENG-018 fills this gap.

---

## ENG-018 Contract

### Misconception Types

| ID | Pattern | Example | Detection Logic |
|----|---------|---------|----------------|
| `added_num_and_den` | Student added numerators and denominators instead of finding equivalence | Target: 1/2, Student: 2/4 via (1+1)/(2+2) thinking — but this is actually correct. Better example: Target: 1/3, Student: 2/5 via (1+1)/(3+2) | `parsed.numerator === target.numerator + target.denominator` AND `parsed.denominator === target.numerator + target.denominator` — no, need better heuristic. See detection logic below. |
| `flipped_fraction` | Student swapped numerator and denominator | Target: 1/3, Student: 3/1 | `parsed.numerator === target.denominator && parsed.denominator === target.numerator` |
| `used_whole_number` | Student gave a whole number (n/1) instead of a fraction | Target: 1/2, Student: 2/1 | `parsed.denominator === 1 && parsed.numerator > 1` |
| `same_denominator` | Student changed only the numerator, keeping denominator | Target: 2/4 (equiv to 1/2), Student: 3/4 | `parsed.denominator === target.denominator && !areEquivalent(parsed, target)` |
| `same_numerator` | Student changed only the denominator, keeping numerator | Target: 2/4 (equiv to 1/2), Student: 2/3 | `parsed.numerator === target.numerator && !areEquivalent(parsed, target)` |
| `off_by_one` | Student is close but off by 1 in numerator or denominator | Target: 2/6, Student: 2/5 or 3/6 | `abs(parsed.numerator - expected.numerator) === 1` OR `abs(parsed.denominator - expected.denominator) === 1` (where expected = target expressed with parsed's denominator, or vice versa) |
| `random_guess` | No recognizable pattern | Target: 1/2, Student: 5/7 | Fallback when no other pattern matches |

### MisconceptionDetector Function

```typescript
// src/engine/MisconceptionDetector.ts

import { areEquivalent, simplify } from './FractionEngine';
import type { Fraction } from './FractionEngine';

export type MisconceptionType =
  | 'flipped_fraction'
  | 'used_whole_number'
  | 'same_denominator'
  | 'same_numerator'
  | 'off_by_one'
  | 'random_guess';

export interface MisconceptionResult {
  type: MisconceptionType;
  description: string;
}

/**
 * Identify the most likely misconception when a student's answer is wrong.
 * PRECONDITION: parsed and target are valid fractions, and areEquivalent(parsed, target) === false.
 * This function MUST NOT check correctness — that's FractionEngine's job.
 */
export function detectMisconception(
  parsed: Fraction,
  target: Fraction
): MisconceptionResult {
  const simplifiedTarget = simplify(target);
  const simplifiedParsed = simplify(parsed);

  // Flipped: student swapped num/den
  if (
    simplifiedParsed.numerator === simplifiedTarget.denominator &&
    simplifiedParsed.denominator === simplifiedTarget.numerator
  ) {
    return {
      type: 'flipped_fraction',
      description: `Student may have flipped the fraction — gave ${parsed.numerator}/${parsed.denominator} instead of ${target.numerator}/${target.denominator}`,
    };
  }

  // Whole number: student gave n/1
  if (parsed.denominator === 1 && parsed.numerator > 1) {
    return {
      type: 'used_whole_number',
      description: `Student gave a whole number (${parsed.numerator}) instead of a fraction`,
    };
  }

  // Same denominator, different numerator
  if (parsed.denominator === target.denominator && parsed.numerator !== target.numerator) {
    return {
      type: 'same_denominator',
      description: `Student kept the denominator (${parsed.denominator}) but changed the numerator`,
    };
  }

  // Same numerator, different denominator
  if (parsed.numerator === target.numerator && parsed.denominator !== target.denominator) {
    return {
      type: 'same_numerator',
      description: `Student kept the numerator (${parsed.numerator}) but changed the denominator`,
    };
  }

  // Off by one (check against target expressed with same denominator)
  if (
    Math.abs(parsed.numerator - target.numerator) === 1 &&
    parsed.denominator === target.denominator
  ) {
    return {
      type: 'off_by_one',
      description: `Student is close — off by one in the numerator`,
    };
  }
  if (
    parsed.numerator === target.numerator &&
    Math.abs(parsed.denominator - target.denominator) === 1
  ) {
    return {
      type: 'off_by_one',
      description: `Student is close — off by one in the denominator`,
    };
  }

  // Fallback
  return {
    type: 'random_guess',
    description: `Student's answer (${parsed.numerator}/${parsed.denominator}) doesn't match a known pattern`,
  };
}
```

### Integration with `check_answer` Tool

Update `executeCheckAnswer` in `api/tools.ts` to use the detector:

```typescript
import { detectMisconception } from '../src/engine/MisconceptionDetector';

function executeCheckAnswer(
  studentInput: string,
  target: Fraction
): { correct: boolean; parsed: Fraction | null; misconception?: string; misconceptionType?: string } {
  const parsed = parseStudentInput(studentInput);
  if (parsed === null) {
    return {
      correct: false,
      parsed: null,
      misconception: 'Could not parse input as a fraction',
      misconceptionType: 'parse_error',
    };
  }
  const correct = areEquivalent(parsed, target);
  if (correct) {
    return { correct: true, parsed };
  }
  // Wrong answer — detect misconception
  const detection = detectMisconception(parsed, target);
  return {
    correct: false,
    parsed,
    misconception: detection.description,
    misconceptionType: detection.type,
  };
}
```

This is the only change to `api/tools.ts` — the tool schema for `check_answer` doesn't need to change since `misconception` is already an optional field in the return type.

### How Claude Uses This

When `check_answer` returns `{ correct: false, misconceptionType: 'flipped_fraction', misconception: 'Student may have flipped the fraction' }`, Claude (guided by the system prompt) can respond with targeted scaffolding:

- **flipped_fraction**: "Hmm, look at which number is on top and which is on the bottom!"
- **used_whole_number**: "Remember, a fraction has a top number and a bottom number with a line between them."
- **same_denominator**: "The bottom number is right! Now check the top number."
- **off_by_one**: "You're so close! Take another look."
- **random_guess**: "Let's look at this together. What do you notice about the crystal?"

Claude generates the actual words — the `description` field gives it context to choose the right scaffolding approach.

---

## Deliverables Checklist

### A. MisconceptionDetector

- [ ] `src/engine/MisconceptionDetector.ts` created and exported
- [ ] `MisconceptionType` union type exported
- [ ] `MisconceptionResult` interface exported
- [ ] `detectMisconception(parsed, target)` function exported
- [ ] Detects: `flipped_fraction`, `used_whole_number`, `same_denominator`, `same_numerator`, `off_by_one`, `random_guess`
- [ ] Uses `simplify` and `areEquivalent` from FractionEngine — no custom math
- [ ] Pure function, no side effects, deterministic

### B. Tool Integration

- [ ] `executeCheckAnswer` in `api/tools.ts` updated to call `detectMisconception` when answer is wrong
- [ ] Returns `misconceptionType` alongside existing `misconception` description
- [ ] Correct answers unchanged — still return `{ correct: true, parsed }`
- [ ] Parse failures unchanged — still return `misconception: 'Could not parse'`

### C. Repo Housekeeping

- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] Update `docs/DEVLOG.md` with ENG-018 entry
- [ ] Feature branch: `feature/eng-018-misconception-detector`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/engine/MisconceptionDetector.ts` | Pure function to classify wrong-answer patterns |

## Files to Modify

| File | Change |
|------|--------|
| `api/tools.ts` | Update `executeCheckAnswer` to call `detectMisconception` |
| `docs/DEVLOG.md` | Add ENG-018 entry |

## Files You Should NOT Modify

- `src/engine/FractionEngine.ts` — import from it, don't modify it
- `api/chat.ts` — no changes to the edge function
- `api/system-prompt.ts` — Claude already handles misconception context from tool results
- `src/state/*` — no state changes needed
- `src/components/*` — no UI changes

## Files to READ for Context

| File | Why |
|------|-----|
| `src/engine/FractionEngine.ts` | `areEquivalent`, `simplify`, `parseStudentInput`, `Fraction` interface |
| `api/tools.ts` | `executeCheckAnswer` function (lines 145-158) — you're enhancing this |
| `api/system-prompt.ts` | How Claude uses tool results — understand what context helps Sam scaffold |

---

## Design Decisions

### Why a Separate File?

The detector is pure engine logic (deterministic pattern matching on fractions), not API/tool logic. It belongs in `src/engine/` alongside `FractionEngine.ts`. This also makes it independently testable (ENG-019).

### Why Not Add Misconception Detection to Claude's Prompt?

The math firewall principle: Claude must never reason about math. If we told Claude "check if the student flipped the fraction", Claude might get it wrong. The detector does the math deterministically, then Claude uses the result to choose its words.

### Check Order Matters

The detection checks run in priority order. A flipped fraction (3/1 for target 1/3) also technically has `denominator === 1` (whole number). Flipped is checked first because it's more specific and more useful for scaffolding.

---

## Definition of Done for ENG-018

- [ ] `detectMisconception(parsed, target)` returns correct type for each misconception pattern
- [ ] `executeCheckAnswer` returns `misconceptionType` when answer is wrong
- [ ] Correct answers return no misconception
- [ ] Parse failures return `parse_error` type
- [ ] All detection is deterministic (uses FractionEngine, no LLM)
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated
- [ ] Feature branch pushed

---

## After ENG-018

- **ENG-019** (Misconception Detector Tests) — truth table tests for every misconception type + edge cases
