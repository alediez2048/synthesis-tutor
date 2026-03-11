# Synthesis Tutor

**An interactive, iPad-first AI tutor that teaches fraction equivalence to children aged 8–12 through guided discovery and digital manipulatives.**

[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://synthesis-tutor.vercel.app)
[![Standards](https://img.shields.io/badge/Common_Core-3.NF.A.3_·_4.NF.A.1-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## What Is This?

Synthesis Tutor reimagines math education by making learning feel like exploration, not homework. Students interact with a conversational AI tutor named **Sam** alongside a visual fraction workspace where they can **split**, **combine**, and **compare** fraction blocks — discovering equivalence through hands-on experimentation rather than rote memorization.

The app delivers a single, self-contained lesson on fraction equivalence aligned to Common Core Standards **3.NF.A.3a**, **3.NF.A.3b**, and **4.NF.A.1**, targeting grades 3–5.

### The Learning Journey

```
Curious → Exploring → Struggling → Discovering → Confident
```

1. **Introduction** — Sam guides the student through their first block split
2. **Exploration** — Free play with nudges; the system detects "aha" moments
3. **Guided Practice** — 4 scaffolded problems with branching hints and auto-demonstrations
4. **Assessment** — 3 problems (recognition, construction, generalization) with randomized pools
5. **Completion** — Score-based feedback and celebration

## Key Features

- **Deterministic Fraction Engine** — All math is verified by pure functions, never by an LLM. Zero mathematical hallucinations.
- **Conversational Tutor (Sam)** — Warm, encouraging scripted dialogue with branching that feels adaptive. Never says "wrong."
- **Visual Manipulatives** — Rectangular fraction blocks with split/combine/compare interactions and smooth animations.
- **iPad-First Design** — Touch-optimized with 60×60pt tap targets, `touch-action: none` on the workspace, and PWA standalone mode.
- **Misconception Detection** — Catches common errors (added numerators & denominators, flipped fractions) and responds with targeted remediation.
- **Offline Support** — Full PWA with service worker caching. Works in airplane mode after first load.
- **COPPA Compliant** — Zero data collection. No accounts, no cookies, no analytics, no server-side storage.
- **Synthesized Audio** — 5 Web Audio API tones (split pop, combine snap, correct chime, gentle low, celebration arpeggio) with zero file size.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (iPad Safari)                    │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │ Chat Panel   │   │ Manipulative │   │ Sound Manager│  │
│  │ (React)      │   │ Workspace    │   │ (Web Audio)  │  │
│  └──────┬──────┘   └──────┬───────┘   └──────┬───────┘  │
│         │                 │                   │          │
│  ┌──────▼─────────────────▼───────────────────▼───────┐  │
│  │           State Reducer (useReducer)                │  │
│  │           Single Source of Truth                    │  │
│  └──────┬─────────────────┬───────────────────────────┘  │
│         │                 │                              │
│  ┌──────▼──────┐   ┌──────▼───────────────┐             │
│  │ Scripted    │   │ Fraction Engine       │             │
│  │ TutorBrain  │   │ (Deterministic Math)  │             │
│  └─────────────┘   └─────────────────────┘              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Checkpoint Layer (sessionStorage)                 │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                │
                │ Static deploy (no backend)
                ▼
          Vercel / PWA
```

**Core principle:** Fully client-side. No backend, no API calls, no database. The Fraction Engine, script engine, and all state management run in the browser.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React + TypeScript |
| State | `useReducer` (finite state machine) |
| Touch/Gestures | `@use-gesture/react` |
| Animation | CSS Transitions + Web Animations API |
| Audio | Web Audio API (synthesized, zero files) |
| Testing | Vitest + fast-check (property-based) |
| E2E | Cypress |
| Deploy | Vercel + `vite-plugin-pwa` |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install & Run

```bash
git clone git@github.com:alediez2048/synthesis-tutor.git
cd synthesis-tutor
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (iPad Safari recommended).

### Run on iPad (Local Network)

```bash
npm run dev -- --host 0.0.0.0
```

Then open `http://<your-local-ip>:5173` on the iPad.

### Run Tests

```bash
npm test              # Unit + property-based tests
npm run test:e2e      # Cypress E2E tests
```

### Build & Deploy

```bash
npm run build         # Production build
npm run preview       # Preview production build locally
```

Pushes to `main` auto-deploy to Vercel.

## Project Structure

```
synthesis-tutor/
├── public/
│   └── manifest.json
├── src/
│   ├── engine/                  ← Fraction math (pure functions)
│   │   ├── FractionEngine.ts
│   │   └── MisconceptionDetector.ts
│   ├── brain/                   ← TutorBrain abstraction
│   │   ├── TutorBrain.ts           (interface)
│   │   └── ScriptedTutorBrain.ts   (prototype implementation)
│   ├── state/                   ← State management
│   │   ├── types.ts                (shared type contracts)
│   │   ├── reducer.ts
│   │   └── checkpoint.ts
│   ├── components/              ← React UI
│   │   ├── ChatPanel/
│   │   ├── Workspace/
│   │   ├── Assessment/
│   │   └── shared/
│   ├── observers/               ← Exploration phase observer
│   ├── content/                 ← Lesson scripts (JSON)
│   ├── audio/                   ← Sound synthesis
│   └── index.tsx
├── cypress/                     ← E2E tests
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Standards Alignment

| Standard | Description | Taught In | Assessed In |
|---|---|---|---|
| 3.NF.A.3a | Understand equivalence as same size | Exploration | A-1 (Recognition) |
| 3.NF.A.3b | Recognize & generate equivalents with visual models | GP-1, GP-2 | A-2 (Construction) |
| 4.NF.A.1 | Explain why a/b = (n×a)/(n×b) visually | GP-3, GP-4 | A-3 (Generalization) |

**Grade Range:** 3–5  
**Prerequisite Knowledge:** Basic fraction notation (numerator/denominator), understanding of "whole"

## The Tutor: Sam

Sam is a warm, curious guide — not a teacher, not a parent, not a peer. Think museum exhibit guide energy.

**Voice rules:**
- Max 15 words per sentence, max 3 sentences per message
- Contractions always ("let's", "that's") — never formal
- Never says "wrong", "incorrect", "mistake", "error", or "fail"
- Celebrates discovery over compliance
- Pairs formal math terms with plain English on first use

## Design Decisions

**Why deterministic math, not LLM?** An LLM that says "2/4 = 1/3" teaches a child something false. The Fraction Engine uses integer arithmetic — `areEquivalent(a, b)` is `a.n × b.d === b.n × a.d`. The LLM is never the authority on correctness.

**Why scripted dialogue?** An 8-year-old won't wait 2–3 seconds for a GPT round-trip between every interaction. Scripted branching with template interpolation feels adaptive and is instantaneous. The `TutorBrain` interface allows swapping in an LLM-powered implementation later.

**Why rectangles, not pie charts?** Rectangles tile and subdivide cleanly, enable edge-aligned comparison, and map to the number line model students encounter later. Pedagogically superior for fractions.

**Why Web Audio synthesis?** Zero loading time, zero asset pipeline, zero CORS issues, dynamic pitch based on fraction size, and consistent latency across devices. Five sounds in ~50 lines of code.

## Performance Budgets

| Metric | Target |
|---|---|
| Initial load (LCP) | < 2 seconds |
| Time to interactive | < 3 seconds |
| JS bundle (gzipped) | < 150 KB |
| Animation framerate | 60 fps |
| Touch response latency | < 100ms |
| Memory (heap) | < 80 MB |

Targets validated against a 2020 iPad 8th gen (A12 chip) — the oldest hardware commonly found in classrooms.

## Known Limitations

- Single lesson only (fraction equivalence) — no lesson library
- No student accounts or cross-session persistence
- No teacher dashboard
- "Smashing" (fraction addition with unlike denominators) is architecturally supported but not implemented
- Full Switch Control accessibility testing deferred
- No LLM integration in prototype (seam is built, implementation is scripted)

## Future Upgrades

The architecture supports these without refactoring:

- **LLM-powered TutorBrain** — Swap `ScriptedTutorBrain` for `LLMTutorBrain`. Math correctness still verified by the engine.
- **Multiple lessons** — JSON-driven lesson schema with a lesson validator CLI
- **Teacher dashboard** — Event-sourced session logs enable analytics queries
- **Smashing interaction** — Action type exists, reducer gracefully redirects
- **RAG pedagogical engine** — Retrieval over curated misconception/scaffolding corpus

## License

MIT

---

Built as part of the [Superbuilders](https://superbuilders.school) program — a 1-week sprint challenge in AI-powered EdTech.
