# ENG-002 Primer: Fraction Type + Engine Core

**For:** New Cursor Agent session  
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Date:** Mar 10, 2026  
**Previous work:** ENG-001 (Project scaffold) complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-002 implements the **FractionEngine** as a standalone TypeScript module in `src/engine/FractionEngine.ts`. All core fraction operations are pure, synchronous, deterministic functions. This is the safety-critical math layer — every mathematical claim shown to a student will be verified by this engine. It must be rock-solid before any UI or reducer work.

### Why Does This Exist?

The Fraction Engine is the zero-hallucination firewall. The LLM (and later, scripted dialogue) never evaluates math. The flow is:

```
Student Input → parseStudentInput() → FractionEngine.areEquivalent(input, target) → boolean → Script Branch
```

The boolean from the engine is the **sole authority** on correctness. Without a correct, pure engine, the entire tutoring model is unsafe. ENG-003 will add property-based tests; this ticket delivers the implementation (TDD: write tests first in ENG-003 or alongside this ticket).

### Current State

| Component | Status |
|-----------|--------|
| `src/engine/` | **Exists** — empty (scaffold from ENG-001) |
| `src/engine/FractionEngine.ts` | **Does not exist** — implement here |
| `Fraction` type | **Not defined** — define in this module (or in a shared types file; primer uses engine-owned type for ENG-002, ENG-004 may re-export from `state/types.ts`) |
| ENG-001 | **Complete** — Vite, React, TS, Vitest, ESLint all in place |

---

## What Was Already Done

- ENG-001: Project scaffold with `src/engine/` directory
- Vitest configured — tests can live in `src/engine/FractionEngine.test.ts` (added in ENG-003)
- TypeScript strict mode — all functions must have explicit types
- `.cursor/rules/math-engine.mdc` — defines the engine API and invariants

---

## ENG-002 Contract

### Fraction Type

Define the primitive type used by every engine function:

```typescript
export interface Fraction {
  numerator: number;   // positive integer
  denominator: number; // positive integer, 1–12
}
```

All engine functions accept and return this shape. No floating-point representation of fractions.

### Public API (Pure Functions)

Every function must be pure (no side effects, no state, no network), synchronous, and fully typed.

| Function | Signature | Description |
|----------|-----------|-------------|
| `simplify` | `(f: Fraction) => Fraction` | Reduce to lowest terms via GCD. Preserves value: `areEquivalent(f, simplify(f))` always true. |
| `areEquivalent` | `(a: Fraction, b: Fraction) => boolean` | Cross-multiply check: `a.numerator * b.denominator === b.numerator * a.denominator`. Never use floating-point comparison. |
| `split` | `(f: Fraction, parts: number) => Fraction[]` | Divide into N equal pieces. Must satisfy: `areEquivalent(combine(split(f, n)), f)`. |
| `combine` | `(fractions: Fraction[]) => Fraction` | Sum fractions with the same denominator. Input array non-empty, same denominator; result may be improper (e.g. 2/4). |
| `toCommonDenominator` | `(a: Fraction, b: Fraction) => [Fraction, Fraction]` | Express both with shared denominator (LCD). Returned pair has same denominator. |
| `isValidFraction` | `(f: Fraction) => boolean` | Guard: numerator and denominator positive integers; denominator between 1 and 12 inclusive. |
| `parseStudentInput` | `(raw: string) => Fraction \| null` | Parse student input into a Fraction or null. Accept "2/4", "2 / 4", "2/ 4", etc. Reject invalid (non-integer, zero denominator, denominator > 12). |

### Hard Constraints

- **Denominators:** Positive integers only, capped at 12 (lesson scope).
- **Numerators:** Positive integers only.
- **Equivalence:** Use integer cross-multiplication only. No `a.n/a.d === b.n/b.d` with floats.
- **Split/combine roundtrip:** `combine(split(f, n))` must be equivalent to `f` for all valid `f` and `n` (2 ≤ n, result denominator ≤ 12).
- **Simplify:** `simplify(f).denominator <= f.denominator` and `areEquivalent(f, simplify(f))`.
- **Invalid user input:** Return a safe value or null; do not throw. Callers (reducer) will show a Sam message. This applies to `parseStudentInput` (returns `null`) and `isValidFraction` (returns `false`).
- **Programming errors:** Internal precondition violations (e.g., `combine` with empty array or mismatched denominators) should throw, since these indicate bugs in calling code, not bad student input.

### parseStudentInput Behavior

- Trim whitespace. Accept a single fraction-like string.
- Patterns: `n/d`, `n / d`, `n/ d`, `n /d` (n, d digits).
- Return `Fraction` with numerator and denominator as numbers (integers).
- Return `null` if: not a valid pattern, denominator 0, denominator > 12, non-positive, or non-integer.
- Multi-digit numerators are valid (e.g., `"12/4"` → `{ numerator: 12, denominator: 4 }`). The numerator has no upper bound in parsing; `isValidFraction` can be used separately if the caller needs to enforce lesson-scope constraints.
- Do not accept "one half" or other words in this ticket (optional enhancement later).

### toCommonDenominator

- Compute LCD (least common denominator) of the two denominators using `lcm(a, b) = (a * b) / gcd(a, b)`.
- Return `[a', b']` such that `a'` is equivalent to `a`, `b'` is equivalent to `b`, and `a'.denominator === b'.denominator === lcd`.
- **LCD > 12 policy:** The engine returns the mathematically correct result even if LCD > 12. The reducer (ENG-004) enforces the denominator cap. The engine is pure math; it does not enforce lesson-scope constraints.

### combine

- Input: array of fractions, all with the same denominator.
- Output: one fraction with that denominator and numerator = sum of numerators.
- Example: `combine([{ numerator: 1, denominator: 4 }, { numerator: 1, denominator: 4 }])` → `{ numerator: 2, denominator: 4 }`.
- Do not simplify in this function; caller or reducer can call `simplify` if needed.
- **Precondition violations:** `combine` has two preconditions: non-empty array, and all denominators match. These are programming errors (not user input errors), so **throw** on violation. An empty array or mismatched denominators means a bug in the caller, not bad student input. Use descriptive error messages (e.g., `"combine: empty array"`, `"combine: mismatched denominators"`).

### split

- Input: fraction `f`, number of parts `parts` (integer ≥ 2).
- Output: array of `parts` fractions, each equivalent to `f/parts` (i.e. numerator 1 in some representation, or equivalent). Each piece has denominator `f.denominator * parts` and numerator `f.numerator` (so each piece is `{ numerator: f.numerator, denominator: f.denominator * parts }` — check: 1/2 split into 2 → [1/4, 1/4]).
- Mathematical rule: each part = `f` scaled by 1/parts. So each part is `{ numerator: f.numerator, denominator: f.denominator * parts }`. Then `combine(split(f, n))` gives back `f`.
- **Denominator > 12 policy:** If `f.denominator * parts > 12`, the engine returns the mathematically correct result anyway. The reducer (ENG-004) enforces the denominator cap. The engine is pure math; it does not enforce lesson-scope constraints. This is consistent with `toCommonDenominator`.

---

## Deliverables Checklist

### A. Fraction Type

- [ ] `Fraction` interface exported from `src/engine/FractionEngine.ts` (or from a shared type later re-exported by state)
- [ ] `numerator` and `denominator` as numbers (integers in practice)

### B. Core Functions

- [ ] `simplify(f)` — GCD-based reduction to lowest terms
- [ ] `areEquivalent(a, b)` — cross-multiply only
- [ ] `split(f, parts)` — N equal pieces, roundtrip with combine
- [ ] `combine(fractions)` — same-denominator sum
- [ ] `toCommonDenominator(a, b)` — LCD pair
- [ ] `isValidFraction(f)` — positive integers, 1 ≤ den ≤ 12
- [ ] `parseStudentInput(raw)` — parse "n/d" style, return Fraction | null

### C. Purity and Types

- [ ] All functions are pure (no side effects, no mutable state, no network)
- [ ] All functions synchronous (no async/Promise)
- [ ] Full TypeScript annotations (params and return types)
- [ ] No `any` types

### D. Invariants (Verified by ENG-003 Tests)

- [ ] `areEquivalent(f, f)` for any valid f
- [ ] `areEquivalent(a, b) === areEquivalent(b, a)`
- [ ] `areEquivalent(combine(split(f, n)), f)` for valid f, n
- [ ] `areEquivalent(f, simplify(f))` and `simplify(f).denominator <= f.denominator`

### E. Repo Housekeeping

- [ ] Update `docs/DEVLOG.md` with ENG-002 entry when complete
- [ ] Feature branch: `feature/eng-002-fraction-engine`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-002-fraction-engine
# ... implement (TDD: consider writing ENG-003 tests first or in parallel) ...
git add src/engine/FractionEngine.ts
git commit -m "feat: implement FractionEngine core (ENG-002)"
git push -u origin feature/eng-002-fraction-engine
```

Use Conventional Commits: `feat:`, `test:` (if adding tests in this branch).

---

## Technical Specification

### `gcd` — Private Helper (Do Not Export)

Implement a private `gcd(a: number, b: number): number` helper using the Euclidean algorithm. This is used by both `simplify` (GCD of numerator/denominator) and `toCommonDenominator` (LCM via `lcm(a, b) = (a * b) / gcd(a, b)`). Do not export it — it's an implementation detail.

### GCD for simplify

Use the `gcd` helper to compute GCD of numerator and denominator, then divide both by GCD. Result must have positive denominator.

### Cross-multiply for areEquivalent

`a.numerator * b.denominator === b.numerator * a.denominator`. Integer arithmetic only.

### split Formula

For fraction `f` and `parts` (integer ≥ 2), each piece has the same total value as `f/parts`. So each piece is:

- `numerator = f.numerator`
- `denominator = f.denominator * parts`

Then `combine(split(f, n))` yields `{ numerator: f.numerator * n, denominator: f.denominator * n }`, which is equivalent to `f`.

### combine Formula

All elements of `fractions` must have the same `denominator`. Result:

- `denominator = fractions[0].denominator`
- `numerator = sum of all fractions[i].numerator`

### parseStudentInput Regex / Logic

- Match pattern like `(\d+)\s*/\s*(\d+)`.
- Parse two capture groups as integers.
- If denominator 0 or > 12 or numerator < 1 or denominator < 1, return null.
- Return `{ numerator, denominator }`.

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `src/engine/FractionEngine.ts` | Implement all functions and export `Fraction` and API |

### Files to Modify

| File | Action |
|------|--------|
| `docs/DEVLOG.md` | Add ENG-002 entry when complete |

### Files You Should NOT Modify

- `src/state/types.ts` — does not exist yet (ENG-004). Fraction type can live in engine for now; ENG-004 may re-export or move to shared types.
- Any component, reducer, or app shell
- `vite.config.ts`, `tsconfig.json`, `package.json` (unless adding a dependency for ENG-002 — none required)
- Existing tests (e.g. smoke test)

### Files to READ for Context

| File | Why |
|------|-----|
| `docs/prd.md` Section 4.3–4.4 | Data models and Fraction Engine API table |
| `.cursor/rules/math-engine.mdc` | Engine API and invariants |
| `.cursor/rules/tdd.mdc` | TDD workflow — consider writing tests first (ENG-003) or in same branch |

### Cursor Rules to Follow

- `math-engine.mdc` — all functions pure, typed, no floats for equivalence
- `tdd.mdc` — TDD required for engine; write tests first or in parallel with implementation
- `architecture.mdc` — engine is domain layer; no imports from React or reducer

---

## Definition of Done for ENG-002

- [ ] `Fraction` interface defined and exported
- [ ] `simplify`, `areEquivalent`, `split`, `combine`, `toCommonDenominator`, `isValidFraction`, `parseStudentInput` implemented and exported
- [ ] All functions pure, synchronous, fully typed
- [ ] Cross-multiply used for equivalence; no floating-point comparison
- [ ] Denominator 1–12 enforced in `isValidFraction` and `parseStudentInput`
- [ ] ENG-003 property-based tests pass (if run in same branch) or implementation ready for ENG-003
- [ ] DEVLOG updated with ENG-002 entry
- [ ] Feature branch pushed

---

## After ENG-002

- **ENG-003** (Engine property-based tests) — add `FractionEngine.test.ts` with fast-check; all invariants must pass (10,000 iterations).
- **ENG-004** (LessonState types + reducer) — reducer will call `FractionEngine` for validation and state updates; `Fraction` may be re-exported from `state/types.ts` for app-wide use.
