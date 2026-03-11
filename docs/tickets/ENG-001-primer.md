# ENG-001 Primer: Project Scaffold

**For:** New Cursor Agent session
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Date:** Mar 10, 2026
**Previous work:** None — this is the first ticket. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-001 scaffolds the **Vite + React + TypeScript** project from scratch. The result is a clean, buildable, deployable foundation that loads correctly on iPad Safari and auto-deploys to Vercel from GitHub.

### Why Does This Exist?

Every subsequent ticket depends on a working project scaffold. The scaffold must get several things right from the start:

1. **TypeScript strict mode** — the entire codebase relies on strong typing (especially `types.ts` in ENG-004)
2. **Vitest configured** — property-based engine tests (ENG-003) run from Day 1
3. **Vite dev server** — fast HMR for the interactive manipulative work on Day 2
4. **iPad Safari compatible** — viewport meta, dvh units, touch-action — many of these are hard to retrofit
5. **Vercel deployment** — auto-deploy on push to `main` so the prototype is always shareable

### Current State

| Component | Status |
|-----------|--------|
| Project directory | **Exists** — contains `docs/`, `README.md`, `.cursor/rules/`, `.git/` |
| `package.json` | **Does not exist** — needs creation via `npm create vite@latest` |
| `src/` | **Does not exist** — needs full scaffold |
| `public/manifest.json` | **Does not exist** — needed for PWA (ENG-032, but manifest stub goes in now) |
| Vercel deployment | **Not connected** — needs Vercel project linked to GitHub repo |

---

## What Was Already Done

- Git repo initialized, connected to `git@github.com:alediez2048/synthesis-tutor.git`
- `README.md` created at project root
- `docs/` directory with `prd.md`, `interviews.md`, `requirements.md`, `DEVLOG.md`
- `.cursor/rules/` with 11 rule files enforcing architecture, tech stack, testing, etc.

---

## ENG-001 Contract

### Tech Stack (Pinned — see `.cursor/rules/tech-stack.mdc`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Build tool | Vite | latest |
| Framework | React | 18.x |
| Language | TypeScript | 5.x (strict mode) |
| Testing | Vitest | latest |
| Testing (DOM) | jsdom | latest (Vitest environment) |
| Property testing | fast-check | latest (needed by ENG-003) |
| Linting | ESLint | latest (flat config, with React + TS plugins) |
| Deploy | Vercel | via GitHub integration |

### Project Template

Use the official Vite React + TypeScript template as the starting point:

```bash
npm create vite@latest . -- --template react-ts
```

**Note:** Run this in the existing project directory (`.`), not a new subdirectory, since we already have files in place (`docs/`, `README.md`, `.cursor/`).

**Fallback:** If `npm create vite@latest .` refuses to run in a non-empty directory or prompts interactively, use this approach instead:

```bash
# Scaffold into a temp directory, then copy files over
npm create vite@latest temp-scaffold -- --template react-ts
cp -n temp-scaffold/* temp-scaffold/.* . 2>/dev/null
rm -rf temp-scaffold
```

This copies only files that don't already exist (`-n` = no-clobber), preserving `README.md`, `docs/`, and `.cursor/`.

### Additional Dev Dependencies

After scaffolding with Vite, install these dev dependencies that subsequent tickets need:

```bash
npm install -D jsdom fast-check
```

- **`jsdom`** — Vitest DOM environment for component testing (ENG-005+)
- **`fast-check`** — Property-based testing for Fraction Engine (ENG-003)

Installing them now avoids a "missing dependency" blocker when ENG-002/003 start immediately after this ticket.

### Vite Configuration

The `vite.config.ts` must include Vitest config inline (no separate `vitest.config.ts`):

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // exposes on local network for iPad testing
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

The `host: true` setting enables `npm run dev` to be accessible at `http://<local-ip>:5173` for iPad testing on the same Wi-Fi network.

The `test` block configures Vitest with `jsdom` for DOM testing (needed for future component tests) and `globals: true` so `describe`/`it`/`expect` don't need explicit imports.

### TypeScript Configuration

`tsconfig.json` must enforce strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### iPad Safari — Critical Meta Tags

The `index.html` must include these in `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

### PWA Manifest Stub

Create `public/manifest.json` with the basic structure. Full PWA configuration happens in ENG-032, but the stub goes in now so the manifest link in `index.html` doesn't 404:

```json
{
  "name": "Synthesis Tutor",
  "short_name": "Fractions",
  "display": "standalone",
  "theme_color": "#4A90D9",
  "background_color": "#FFFFFF",
  "start_url": "/",
  "icons": []
}
```

### Directory Structure (Scaffold Only)

Create the directory skeleton per PRD Section 15. Files will be empty or minimal stubs — actual implementation comes in subsequent tickets.

**Important:** Git does not track empty directories. Place a `.gitkeep` file in each empty directory so the structure survives `git clone`:

```bash
# After creating directories, add .gitkeep files
for dir in src/engine src/brain src/state src/components/ChatPanel src/components/Workspace src/components/Assessment src/components/shared src/observers src/content src/audio; do
  touch "$dir/.gitkeep"
done
```

```
src/
├── engine/          ← ENG-002, ENG-003
├── brain/           ← ENG-011, ENG-013
├── state/           ← ENG-004
├── components/
│   ├── ChatPanel/   ← ENG-010
│   ├── Workspace/   ← ENG-005 through ENG-009
│   ├── Assessment/  ← ENG-021, ENG-022
│   └── shared/      ← ENG-023
├── observers/       ← ENG-016
├── content/         ← ENG-012, ENG-017, ENG-020
├── audio/           ← ENG-024
├── App.tsx          ← main app shell
├── App.css          ← global styles
├── main.tsx         ← entry point
└── vite-env.d.ts    ← Vite type declarations
```

### Smoke Test

Create a minimal Vitest smoke test to confirm the test runner works:

```typescript
// src/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('Smoke Test', () => {
  it('project is alive', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### ESLint Configuration

The Vite template now ships with **flat config** (`eslint.config.js`), not the legacy `.eslintrc.*` format. Work with the generated flat config — do not convert to legacy format.

Ensure the config enforces:
- No `any` types allowed (`@typescript-eslint/no-explicit-any`)
- Unused variables are errors
- React hooks rules enabled

**No Prettier** — formatting is handled by ESLint only. Do not install or configure Prettier.

### .gitignore

Ensure these are ignored (Vite template provides most, but verify):

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
```

---

## Deliverables Checklist

### A. Project Setup

- [ ] Vite + React + TypeScript project scaffolded in project root
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts dev server successfully
- [ ] `npm run build` produces a production build with zero errors
- [ ] TypeScript strict mode enabled in `tsconfig.json`

### B. iPad Safari Readiness

- [ ] Viewport meta tag in `index.html` (no pinch-zoom, no scaling)
- [ ] `apple-mobile-web-app-capable` meta tag
- [ ] App loads in a browser without layout issues
- [ ] `public/manifest.json` stub exists with correct metadata

### C. Testing Infrastructure

- [ ] Vitest configured inline in `vite.config.ts` (with `jsdom` environment, `globals: true`)
- [ ] `jsdom` and `fast-check` installed as dev dependencies
- [ ] Smoke test passes with `npm test`
- [ ] `test` script defined in `package.json`

### D. Linting

- [ ] ESLint configured with flat config (`eslint.config.js`) and React + TypeScript rules
- [ ] `npm run lint` runs with zero errors on the scaffold
- [ ] `lint` script defined in `package.json`

### E. Directory Structure

- [ ] All `src/` subdirectories created per PRD Section 15
- [ ] Each empty directory contains a `.gitkeep` file
- [ ] Directories contain no implementation code (stubs only)

### F. Deployment

Vercel setup is a manual step that requires GitHub integration. Follow these sub-steps:

1. **Install Vercel CLI** (if not already): `npm i -g vercel`
2. **Link project**: Run `vercel link` in the project root, select the GitHub repo
3. **Configure build**: Framework preset = Vite, output directory = `dist`
4. **Enable GitHub integration**: In the Vercel dashboard, connect the `alediez2048/synthesis-tutor` repo and set auto-deploy on push to `main`
5. **Verify**: Push the scaffold commit and confirm the deploy succeeds

If Vercel setup is blocked (e.g., no account access), this deliverable can be deferred to a follow-up without blocking other tickets. The scaffold is valid without it.

- [ ] Vercel project connected to GitHub repo `alediez2048/synthesis-tutor`
- [ ] Push to `main` triggers auto-build on Vercel
- [ ] Deployed URL is accessible and loads the app

### G. Repo Housekeeping

- [ ] `.gitignore` covers `node_modules/`, `dist/`, `.env`, `.DS_Store`
- [ ] Update `docs/DEVLOG.md` with ENG-001 entry (move to Completed Tickets section)
- [ ] Feature branch pushed: `feature/eng-001-project-scaffold`

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-001-project-scaffold
# ... scaffold ...
git add .
git commit -m "feat: scaffold Vite + React + TS project (ENG-001)"
git push -u origin feature/eng-001-project-scaffold
```

Use Conventional Commits: `feat:`, `chore:`, `docs:`.

---

## Important Context

### Files to Create

| File | Action |
|------|--------|
| `package.json` | Generated by `npm create vite@latest` |
| `tsconfig.json` | Generated, then enforce strict mode |
| `vite.config.ts` | Generated, then add `host: true` + Vitest `test` block |
| `index.html` | Generated, then add iPad meta tags + manifest link |
| `public/manifest.json` | PWA manifest stub |
| `src/main.tsx` | Vite entry point (generated) |
| `src/App.tsx` | Minimal app shell (generated, clean up) |
| `src/smoke.test.ts` | Vitest smoke test |
| `src/engine/` | Empty directory (with `.gitkeep`) |
| `src/brain/` | Empty directory (with `.gitkeep`) |
| `src/state/` | Empty directory (with `.gitkeep`) |
| `src/components/ChatPanel/` | Empty directory (with `.gitkeep`) |
| `src/components/Workspace/` | Empty directory (with `.gitkeep`) |
| `src/components/Assessment/` | Empty directory (with `.gitkeep`) |
| `src/components/shared/` | Empty directory (with `.gitkeep`) |
| `src/observers/` | Empty directory (with `.gitkeep`) |
| `src/content/` | Empty directory (with `.gitkeep`) |
| `src/audio/` | Empty directory (with `.gitkeep`) |

### Files You Should NOT Modify

- `docs/prd.md` — reference only
- `docs/interviews.md` — reference only
- `docs/requirements.md` — reference only
- `README.md` — already created, update only if needed
- `.cursor/rules/*` — do not change rule files

### Files to READ for Context

| File | Why |
|------|-----|
| `docs/prd.md` Section 4.2 | Tech stack rationale |
| `docs/prd.md` Section 6.3 | Critical iPad/Safari requirements |
| `docs/prd.md` Section 15 | Codebase structure to scaffold |
| `.cursor/rules/tech-stack.mdc` | Pinned technologies and banned libraries |
| `.cursor/rules/ipad-first.mdc` | Viewport, touch, and performance requirements |

### Cursor Rules to Follow

- `tech-stack.mdc` — do not substitute any pinned technology
- `ipad-first.mdc` — viewport meta tags, dvh units awareness
- `verify-before-done.mdc` — `tsc --noEmit`, tests, lint, build must all pass
- `git-workflow.mdc` — feature branch, conventional commits

---

## Definition of Done for ENG-001

- [ ] Vite + React + TypeScript project builds cleanly (`npm run build` — zero errors)
- [ ] Dev server runs (`npm run dev`) and app loads in a browser
- [ ] TypeScript strict mode is ON
- [ ] Vitest configured and smoke test passes (`npm test`)
- [ ] `jsdom` and `fast-check` installed as dev dependencies
- [ ] ESLint configured (flat config) and lint passes (`npm run lint`)
- [ ] iPad Safari meta tags in `index.html`
- [ ] `public/manifest.json` PWA stub exists
- [ ] All `src/` subdirectories created per PRD Section 15 (with `.gitkeep` files)
- [ ] Vercel deployment connected and auto-building (deferrable if blocked)
- [ ] `.gitignore` covers standard exclusions
- [ ] DEVLOG updated with ENG-001 entry
- [ ] Feature branch pushed

---

## After ENG-001

With the scaffold in place, three tickets can begin in parallel:

- **ENG-002** (Fraction Engine) — implement `src/engine/FractionEngine.ts`
- **ENG-003** (Engine Tests) — depends on ENG-002 but can be written TDD-style alongside it
- **ENG-004** (Types + Reducer) — implement `src/state/types.ts` and `src/state/reducer.ts`

All three are Day 1 tickets. ENG-002 + ENG-003 are the critical path — the engine must be rock-solid before any UI work begins on Day 2.
