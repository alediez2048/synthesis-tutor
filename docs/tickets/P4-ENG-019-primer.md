# ENG-019 Primer: Misconception Detector Tests

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 4: Integration + Voice + Observability (Day 4)
**Date:** Mar 11, 2026
**Previous work:** ENG-018 (MisconceptionDetector implemented). See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-019 creates a comprehensive **truth table test suite** for `detectMisconception` in `src/engine/MisconceptionDetector.test.ts`. Every misconception type must fire on its matching inputs and NOT fire on non-matching inputs. This is a pure testing ticket — no production code changes.

### Why Does This Exist?

The MisconceptionDetector drives Sam's scaffolding responses. If it misclassifies a misconception, Sam gives the wrong pedagogical feedback. These tests are the safety net — they ensure deterministic, correct detection for every pattern.

### Current State

| Component | Status |
|-----------|--------|
| `src/engine/MisconceptionDetector.ts` | **Complete** (ENG-018) — `detectMisconception(parsed, target)` returns `{ type, description }` |
| `src/engine/MisconceptionDetector.test.ts` | **Does not exist** — create here |
| Test framework | **Vitest** — `import { describe, it, expect } from 'vitest'` |
| Existing test pattern | See `src/state/reducer.test.ts` for style reference |

---

## ENG-019 Contract

### Test File

Create `src/engine/MisconceptionDetector.test.ts` using Vitest.

### Truth Table

Every test calls `detectMisconception(parsed, target)` and asserts the returned `type`.

**PRECONDITION**: All test inputs must have `areEquivalent(parsed, target) === false`. The detector's contract says it is only called for wrong answers. Do NOT test with equivalent fractions — that's FractionEngine's job.

#### `flipped_fraction`

| Parsed | Target | Expected Type | Notes |
|--------|--------|---------------|-------|
| `3/1` | `1/3` | `flipped_fraction` | Direct flip |
| `2/1` | `1/2` | `flipped_fraction` | Direct flip |
| `4/3` | `3/4` | `flipped_fraction` | Non-unit flip |
| `4/2` | `1/2` | NOT `flipped_fraction` | 4/2 simplifies to 2/1, target simplifies to 1/2 — actually this IS flipped. Detector uses simplified forms. |

#### `used_whole_number`

| Parsed | Target | Expected Type | Notes |
|--------|--------|---------------|-------|
| `2/1` | `1/3` | `used_whole_number` | Gave 2 instead of 1/3 — BUT check: is 2/1 a flip of 1/2? No, target is 1/3. Flipped check: simplified(2/1)=2/1, simplified(1/3)=1/3. 2≠3 or 1≠1. So flipped doesn't match. Whole number fires. |
| `5/1` | `1/2` | `used_whole_number` | Gave 5 as a whole number |
| `3/1` | `1/3` | `flipped_fraction` | Flipped takes priority over whole number (3/1 is flip of 1/3) |
| `1/1` | `1/2` | NOT `used_whole_number` | `parsed.numerator > 1` fails — 1/1 is not caught here |

#### `same_denominator`

| Parsed | Target | Expected Type | Notes |
|--------|--------|---------------|-------|
| `3/4` | `1/4` | `same_denominator` | Right bottom, wrong top |
| `1/6` | `5/6` | `same_denominator` | Right bottom, wrong top |

#### `same_numerator`

| Parsed | Target | Expected Type | Notes |
|--------|--------|---------------|-------|
| `1/3` | `1/4` | `same_numerator` | Right top, wrong bottom |
| `2/5` | `2/3` | `same_numerator` | Right top, wrong bottom |

#### `off_by_one`

| Parsed | Target | Expected Type | Notes |
|--------|--------|---------------|-------|
| `2/4` | `3/4` | `off_by_one` | Numerator off by 1, same denominator |
| `1/5` | `1/6` | `off_by_one` | Denominator off by 1, same numerator |

Note: `off_by_one` checks fire AFTER `same_denominator`/`same_numerator` in priority order. A case like `3/4` vs target `1/4` hits `same_denominator` first, not `off_by_one`. The `off_by_one` with `abs === 1` and same denominator would only fire if `same_denominator` didn't match — but `same_denominator` checks `parsed.denominator === target.denominator` too. So `off_by_one` (numerator variant) is actually unreachable when `same_denominator` also matches. Test to confirm the priority behavior is correct.

#### `random_guess`

| Parsed | Target | Expected Type | Notes |
|--------|--------|---------------|-------|
| `5/7` | `1/2` | `random_guess` | No pattern match |
| `3/11` | `2/5` | `random_guess` | No pattern match |

### Edge Cases to Test

- **Simplified equivalence in flipped check**: Target `2/4`, parsed `4/2`. Simplified: target=1/2, parsed=2/1. Flipped check: 2===2 and 1===1 → `flipped_fraction`. Verify this works.
- **1/1 input**: Target `1/2`, parsed `1/1`. Not whole number (numerator not > 1). Same numerator (1===1, 1≠2) → `same_numerator`.
- **Large fractions**: Target `1/12`, parsed `12/1`. Flipped check: simplified 12/1 vs 1/12 → 12===12, 1===1 → `flipped_fraction`.

### Test Structure

```typescript
// src/engine/MisconceptionDetector.test.ts

import { describe, it, expect } from 'vitest';
import { detectMisconception } from './MisconceptionDetector';

describe('MisconceptionDetector', () => {
  describe('flipped_fraction', () => {
    it('detects 3/1 as flipped 1/3', () => {
      const result = detectMisconception(
        { numerator: 3, denominator: 1 },
        { numerator: 1, denominator: 3 }
      );
      expect(result.type).toBe('flipped_fraction');
    });
    // ... more cases
  });

  describe('used_whole_number', () => { /* ... */ });
  describe('same_denominator', () => { /* ... */ });
  describe('same_numerator', () => { /* ... */ });
  describe('off_by_one', () => { /* ... */ });
  describe('random_guess', () => { /* ... */ });

  describe('priority order', () => {
    it('flipped takes priority over used_whole_number', () => {
      // 3/1 vs target 1/3: both flipped AND whole number, flipped wins
      const result = detectMisconception(
        { numerator: 3, denominator: 1 },
        { numerator: 1, denominator: 3 }
      );
      expect(result.type).toBe('flipped_fraction');
    });

    it('same_denominator takes priority over off_by_one', () => {
      // 3/4 vs target 1/4: same_denominator fires, not off_by_one
      const result = detectMisconception(
        { numerator: 3, denominator: 4 },
        { numerator: 1, denominator: 4 }
      );
      expect(result.type).toBe('same_denominator');
    });
  });
});
```

### Running Tests

```bash
npm test                    # vitest run (all tests)
npm test -- --reporter verbose  # verbose output
npx vitest run src/engine/MisconceptionDetector.test.ts  # just this file
```

---

## Deliverables Checklist

- [ ] `src/engine/MisconceptionDetector.test.ts` created
- [ ] Tests for `flipped_fraction` (at least 3 cases including simplified forms)
- [ ] Tests for `used_whole_number` (at least 2 cases)
- [ ] Tests for `same_denominator` (at least 2 cases)
- [ ] Tests for `same_numerator` (at least 2 cases)
- [ ] Tests for `off_by_one` (at least 2 cases — numerator and denominator variants)
- [ ] Tests for `random_guess` (at least 2 cases)
- [ ] Priority order tests (flipped > whole_number, same_denominator > off_by_one)
- [ ] Edge case: simplified forms in flipped check (e.g., 4/2 vs 2/4)
- [ ] All tests pass: `npm test`
- [ ] Existing tests still pass (zero regressions)
- [ ] `npx tsc -b` passes
- [ ] Update `docs/DEVLOG.md` with ENG-019 entry
- [ ] Feature branch: `feature/eng-019-misconception-tests`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/engine/MisconceptionDetector.test.ts` | Truth table tests for all 6 misconception types |

## Files to Modify

| File | Change |
|------|--------|
| `docs/DEVLOG.md` | Add ENG-019 entry |

## Files You Should NOT Modify

- `src/engine/MisconceptionDetector.ts` — testing only, no production changes
- `src/engine/FractionEngine.ts` — no changes
- `api/*` — no changes

## Files to READ for Context

| File | Why |
|------|-----|
| `src/engine/MisconceptionDetector.ts` | The code under test — `detectMisconception`, `MisconceptionType`, priority order |
| `src/state/reducer.test.ts` | Vitest style reference — `describe/it/expect` from `vitest` |

---

## Definition of Done for ENG-019

- [ ] 15+ test cases covering all 6 misconception types
- [ ] Priority order verified (flipped > whole_number, same_denominator > off_by_one)
- [ ] Edge cases for simplified forms tested
- [ ] `npm test` passes — all new and existing tests green
- [ ] `npx tsc -b` passes
- [ ] DEVLOG updated
- [ ] Feature branch pushed
