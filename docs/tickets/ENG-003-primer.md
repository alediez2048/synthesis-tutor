# ENG-003 Primer: Engine Property-Based Tests

**For:** New Cursor Agent session  
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Date:** Mar 10, 2026  
**Previous work:** ENG-001 (Project scaffold) and ENG-002 (Fraction Engine) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-003 adds **property-based tests** for the FractionEngine using `fast-check`. Instead of testing a handful of hand-picked examples, we generate thousands of random valid fractions and assert that mathematical invariants hold for all of them. This catches whole classes of bugs that unit tests can miss (e.g. off-by-one in edge cases, wrong sign handling, overflow).

### Why Does This Exist?

The Fraction Engine is the zero-hallucination firewall. Unit tests (ENG-002) verify specific cases; property-based tests verify that the engine obeys mathematical laws for **every** valid input. The PRD and `.cursor/rules/testing.mdc` require four invariants with 10,000+ iterations. Success criteria for Day 7 include: "All Fraction Engine property tests pass (10K iterations)."

### Current State

| Component | Status |
|-----------|--------|
| `src/engine/FractionEngine.ts` | **Complete** (ENG-002) — all 7 functions implemented |
| `src/engine/FractionEngine.test.ts` | **Exists** — 29 unit tests (simplify, areEquivalent, split, combine, toCommonDenominator, isValidFraction, parseStudentInput) |
| `fast-check` | **May already be installed** (ENG-001 updated primer includes it) — check `package.json` first; install only if missing |
| Property-based tests | **Do not exist** — add to test file |

---

## What Was Already Done

- ENG-002: FractionEngine with `Fraction` type and all 7 pure functions
- Vitest and jsdom already configured
- Unit tests in `FractionEngine.test.ts` — keep these; add a new `describe('FractionEngine property-based')` block (or equivalent) with fast-check properties

---

## ENG-003 Contract

### Four Mandatory Properties

Run each property with **at least 10,000 random iterations**. Use `fc.assert(property, { numRuns: 10000 })` (or the fast-check equivalent).

| Property | Statement | Purpose |
|----------|-----------|---------|
| **Reflexivity** | `areEquivalent(f, f) === true` for all valid fractions `f` | Equivalence relation requirement |
| **Symmetry** | `areEquivalent(a, b) === areEquivalent(b, a)` for all valid pairs `(a, b)` | Equivalence relation requirement |
| **Split-combine roundtrip** | `areEquivalent(combine(split(f, n)), f)` for all valid `f` and `n` (2 ≤ n ≤ 6 or similar so result denominator stays in range) | Split is inverse of combine |
| **Simplify preserves value** | `areEquivalent(f, simplify(f))` and `simplify(f).denominator <= f.denominator` for all valid `f` | Simplify does not change value; denominator never increases |

### Valid Fraction Arbitrary

Define a `fast-check` arbitrary for lesson-scope fractions:

- **Numerator:** positive integer (e.g. `fc.integer({ min: 1, max: 24 })` or higher to allow 12/12, 24/12 simplified, etc.).
- **Denominator:** integer between 1 and 12 (inclusive).

Ensure the generated values are integers. Use something like:

```typescript
const arbitraryFraction: fc.Arbitrary<Fraction> = fc.record({
  numerator: fc.integer({ min: 1, max: 100 }),
  denominator: fc.integer({ min: 1, max: 12 }),
});
```

For the **split-combine roundtrip**, restrict `parts` so that `f.denominator * parts` does not exceed a reasonable bound if the engine or test assumes a cap (e.g. `parts` in 2..6 so denominator stays ≤ 12 for typical f). The engine returns correct math even when result denominator > 12; the property should hold for all mathematically valid splits. If the engine’s `split` can produce denominator > 12, `combine(split(f, n))` is still equivalent to `f` — so the property holds. Use `fc.integer({ min: 2, max: 6 })` for `parts` to keep generated fractions in a reasonable range and avoid huge denominators.

### Edge Case Unit Tests (Confirm Existing)

ENG-002 already includes unit tests for these edge cases. **Confirm** they are present and passing — do not duplicate:

- **Denominator 0:** `isValidFraction({ numerator: 1, denominator: 0 })` → false; `parseStudentInput('1/0')` → null.
- **Denominator > 12:** `isValidFraction({ numerator: 1, denominator: 13 })` → false; `parseStudentInput('1/13')` → null.
- **Negative numbers:** `isValidFraction({ numerator: -1, denominator: 2 })` → false; `parseStudentInput('-1/2')` → null.
- **Non-integer inputs:** `parseStudentInput('1.5/2')` → null (or no match).

Only add new edge case tests if a gap is found. The focus of this ticket is property-based coverage, not additional unit tests.

### Performance

Property-based tests must complete in under a few seconds. 10,000 runs per property is the target. If the suite is slow, reduce to 5,000 or tune `numRuns`; document in a comment. Prefer 10,000 if feasible.

---

## Deliverables Checklist

### A. Dependency

- [ ] `fast-check` available as a dev dependency (check `package.json` first — ENG-001 may have already installed it; run `npm install -D fast-check` only if missing)

### B. Property-Based Tests

- [ ] **Reflexivity:** `fc.assert(property(arbitraryFraction, f => areEquivalent(f, f)))` with 10,000 runs
- [ ] **Symmetry:** `fc.assert(property(arbitraryFraction, arbitraryFraction, (a, b) => areEquivalent(a, b) === areEquivalent(b, a)))` with 10,000 runs
- [ ] **Split-combine roundtrip:** `fc.assert(property(arbitraryFraction, fc.integer({ min: 2, max: 6 }), (f, parts) => areEquivalent(combine(split(f, parts)), f)))` with 10,000 runs
- [ ] **Simplify preserves value:** `fc.assert(property(arbitraryFraction, f => areEquivalent(f, simplify(f)) && simplify(f).denominator <= f.denominator))` with 10,000 runs

### C. Edge Case Coverage

- [ ] Confirm existing ENG-002 unit tests cover: denominator 0, denominator > 12, negative, non-integer parse input
- [ ] All edge case tests pass (no new tests needed unless a gap is found)

### D. Repo Housekeeping

- [ ] All tests pass with `npm test`
- [ ] Update `docs/DEVLOG.md` with ENG-003 entry when complete
- [ ] Feature branch: `feature/eng-003-engine-property-tests`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-003-engine-property-tests
# ... add fast-check, add property tests ...
git add package.json package-lock.json src/engine/FractionEngine.test.ts
git commit -m "test: add FractionEngine property-based tests with fast-check (ENG-003)"
git push -u origin feature/eng-003-engine-property-tests
```

Use Conventional Commits: `test:`, `chore:` (e.g. for adding dependency).

---

## Technical Specification

### fast-check Usage with Vitest

Import `fc` from `'fast-check'` and use `fc.assert` in a Vitest `it` block:

```typescript
import * as fc from 'fast-check';

it('areEquivalent is reflexive (property)', () => {
  fc.assert(
    fc.property(arbitraryFraction, (f) => areEquivalent(f, f)),
    { numRuns: 10_000 }
  );
});
```

If a property fails, fast-check will shrink to a minimal counterexample and report it.

### Arbitrary for Fraction

Use `fc.record` with integer generators so that numerator and denominator are always integers. Avoid floats.

### Split-Combine and Parts

The engine’s `split(f, parts)` returns an array of length `parts`; `combine` sums them. For arbitrary `f` with denominator 1–12 and `parts` 2–6, the product denominator can be up to 72. The engine (ENG-002) does not cap denominator; it returns correct math. So `combine(split(f, n))` is always equivalent to `f`. Use `parts` in range 2–6 to keep test time and generated sizes reasonable.

---

## Important Context

### Files to Create

None. All work is in existing files.

### Files to Modify

| File | Action |
|------|--------|
| `package.json` | Add `fast-check` to devDependencies only if not already present (check first) |
| `src/engine/FractionEngine.test.ts` | Add `describe` block for property-based tests; define `arbitraryFraction`; add four `fc.assert` properties |
| `docs/DEVLOG.md` | Add ENG-003 entry when complete |

### Files You Should NOT Modify

- `src/engine/FractionEngine.ts` — engine implementation is unchanged
- Vitest or Vite config (unless needed for fast-check; default Vitest runs .test.ts files)
- Other test files or source files outside engine

### Files to READ for Context

| File | Why |
|------|-----|
| `src/engine/FractionEngine.ts` | API and types for writing properties |
| `src/engine/FractionEngine.test.ts` | Existing unit tests; add properties alongside |
| `.cursor/rules/testing.mdc` | Four mandatory properties and iteration count |
| `docs/prd.md` Section 16 | Testing strategy — Fraction Engine 10K iterations |

### Cursor Rules to Follow

- `testing.mdc` — four properties, 10,000 iterations, no mocking engine
- `tdd.mdc` — tests are the specification; keep existing unit tests passing

---

## Definition of Done for ENG-003

- [ ] `fast-check` available as dev dependency (installed if not already present from ENG-001)
- [ ] Reflexivity property: 10,000 runs, passing
- [ ] Symmetry property: 10,000 runs, passing
- [ ] Split-combine roundtrip property: 10,000 runs, passing
- [ ] Simplify preserves value property: 10,000 runs, passing
- [ ] Existing ENG-002 edge case unit tests confirmed present and passing (den 0, den > 12, negative, non-integer parse)
- [ ] `npm test` passes (all unit + property tests)
- [ ] DEVLOG updated with ENG-003 entry
- [ ] Feature branch pushed

---

## After ENG-003

The Fraction Engine is fully covered by unit + property-based tests. Next:

- **ENG-004** (LessonState types + reducer) — reducer will call FractionEngine; no changes to engine tests required.
- Future **MisconceptionDetector** (ENG-018/019) will have its own truth-table tests; engine tests remain as-is.
