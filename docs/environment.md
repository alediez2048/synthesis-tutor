# Environment Guide

Quick reference for running, testing, deploying, and troubleshooting the Synthesis Tutor stack.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LOCAL (Development)                        │  PRODUCTION                    │
│                                             │                                │
│  Vite dev server (:5173)                    │  Vercel (single project)       │
│    └─ React app (fraction manipulative +    │    └─ Static site (Vite build)  │
│       chat panel, useReducer state)         │    └─ Edge Function /api/chat  │
│         │                                   │         │                      │
│  vercel dev (optional)                      │         ▼                      │
│    └─ Local /api/chat → Anthropic           │  Anthropic Claude API          │
│         │                                   │  (ANTHROPIC_API_KEY in Vercel) │
│         ▼                                   │                                │
│  Anthropic Claude API                       │  iPad Safari / PWA (planned)    │
│  (ANTHROPIC_API_KEY in .env.local)          │                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The app runs entirely in the browser; the only server dependency is the chat API (Claude via Vercel Edge or local `vercel dev`).**

---

## 0. API Keys & External Services

### Required Accounts (Sign Up Before Using Chat)

| Service | Sign Up URL | What You Get | Cost |
|---------|-------------|--------------|------|
| Anthropic | https://console.anthropic.com/ | `ANTHROPIC_API_KEY` — Claude API for Sam tutor | Pay-per-use (usage-based) |
| Vercel | https://vercel.com/ | Frontend + Edge API hosting | Free tier |

**Note:** The fraction manipulative (split, combine, compare) works without any API key. Chat and future LLM features require `ANTHROPIC_API_KEY`.

### Verifying the API Key

```bash
# Load key (create .env.local with ANTHROPIC_API_KEY=sk-ant-... first)
source .env.local 2>/dev/null || true

# Anthropic — minimal check (list models or use messages API)
curl -sS https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":5,"messages":[{"role":"user","content":"hi"}]}' \
  | head -c 200
# Expect JSON with "content" or "id"; 401 = bad key.
```

---

## 1. Local Development Environment

### 1.1 Initial Setup (First Time Only)

```bash
# 1. Clone the repo
git clone <repo-url>
cd Superbuilders   # or your repo directory name

# 2. Install dependencies
npm install

# 3. Configure environment (for chat / future LLM features)
# Create .env.local in project root (gitignored). Add:
#   ANTHROPIC_API_KEY=sk-ant-api03-...
# Do not commit .env.local.

# 4. Verify setup
npm run build
# Expect: tsc -b && vite build to complete with no errors
```

### 1.2 Start the App (Frontend Only)

```bash
npm run dev
```

The app is at `http://localhost:5173`. The fraction workspace (split, combine, compare, blocks) works without the API. Hot reload on file changes.

### 1.3 Run the Chat API Locally (Optional)

To test the chat flow against Claude without deploying:

```bash
# Install Vercel CLI if needed
npm i -g vercel

# From project root: run Vercel dev server (proxies /api/* to Edge runtime)
vercel dev
```

Then open the app at the URL Vercel prints (e.g. `http://localhost:3000`). The frontend must call `/api/chat` on the same origin (same port as `vercel dev`). If you use `npm run dev` (port 5173) while `vercel dev` is on 3000, either proxy API from Vite to 3000 or open the app at `http://localhost:3000` when testing chat.

### 1.4 Run Tests

```bash
# All tests (Vitest)
npm test

# Watch mode
npm run test:watch
```

### 1.5 Lint

```bash
npm run lint
```

### 1.6 Type Check

```bash
npx tsc -b
```

### 1.7 Build for Production

```bash
npm run build
# Output in dist/. Preview with:
npm run preview
```

---

## 2. Production Environment

### 2.1 Deployment Target

| Asset | Platform | URL (after deploy) | Config |
|-------|----------|--------------------|--------|
| Frontend (static) | Vercel | `https://<project>.vercel.app` | `vite.config.ts`, `package.json` |
| Chat API | Vercel Edge | `https://<project>.vercel.app/api/chat` | `api/chat.ts`, `vercel.json` |

**Single Vercel project:** One repo deploy serves both the SPA and the Edge function. `vercel.json` rewrites `/api/*` to the Edge runtime.

### 2.2 Deploy to Vercel

1. Push the repo to GitHub (or connect your Git provider).
2. In Vercel: **Add New Project** → Import the repo.
3. **Environment variables** (Project Settings → Environment Variables):
   - `ANTHROPIC_API_KEY` — your Anthropic API key (required for `/api/chat`). Add for **Production** (and Preview if you want).
4. **Build & development:**
   - Build command: `npm run build` (or leave default if it detects Vite).
   - Output directory: `dist`.
   - Install command: `npm install`.
5. Deploy. Vercel runs `npm run build` and serves `dist`; requests to `/api/chat` are handled by `api/chat.ts` (Edge).

### 2.3 Verify Production

```bash
# Replace <project> with your Vercel project URL
BASE=https://<project>.vercel.app

# Frontend — should return 200 and HTML
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/"

# Chat API — requires POST with body; 500 if ANTHROPIC_API_KEY missing
curl -sS -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}' \
  | head -c 300
# Expect SSE stream (event: text_delta / done) or JSON error.
```

### 2.4 iPad / PWA Notes

- **Viewport:** `index.html` includes iPad-friendly viewport and `apple-mobile-web-app-capable`.
- **Target:** Test on real iPad Safari; Chrome DevTools is not sufficient for final validation (per `.cursor/rules/ipad-first.mdc`).
- **PWA:** `manifest.json` is linked; full PWA configuration (service worker, offline) is planned in ENG-032.

---

## 3. Environment Variables Reference

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for chat) | `.env.local` (local), Vercel env (production) | Anthropic API key for Claude. Used only by `api/chat.ts`. |

**Local:** Create `.env.local` in the project root. It is gitignored; never commit it.

**Vercel:** Set in Project → Settings → Environment Variables. Required for `/api/chat` to work in production.

**No other env vars** are required for the current feature set (fraction engine, reducer, workspace, and chat API are self-contained or key-gated).

---

## 4. Key Files

| File | Purpose |
|------|---------|
| `.env.local` | Local secrets (gitignored). Only `ANTHROPIC_API_KEY` needed for chat. |
| `package.json` | Scripts: `dev`, `build`, `lint`, `test`; dependencies (React, Vite, Anthropic SDK, etc.). |
| `vite.config.ts` | Vite config; `server.host: true` for LAN access. |
| `vercel.json` | Rewrites `/api/*` to Edge; no serverless config. |
| `api/chat.ts` | Vercel Edge function: Claude API proxy, SSE streaming. |
| `index.html` | Viewport, PWA meta, root div; entry is `src/main.tsx`. |
| `src/state/reducer.ts` | Lesson state reducer (blocks, chatMessages, phase, etc.). |
| `src/state/types.ts` | `LessonState`, `ChatMessage`, `FractionBlock`, actions. |
| `src/engine/FractionEngine.ts` | Pure fraction math (split, combine, etc.). |
| `.cursor/rules/ipad-first.mdc` | iPad-first rules: touch targets, viewport, animations. |
| `docs/DEVLOG.md` | Development log; updated after each ticket. |
| `docs/prd.md` | Product requirements and phase plan. |
| `docs/environment.md` | This file — environment and runbook. |

---

## 5. Common Pitfalls and Fixes

### "ANTHROPIC_API_KEY not configured" (500 from /api/chat)

**Symptom:** POST to `/api/chat` returns 500 with message about API key.

**Cause:** Key not set in `.env.local` (local) or in Vercel project environment variables (production).

**Fix:**
- Local: add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local` in project root. For `vercel dev`, Vercel CLI reads `.env.local` by default.
- Production: Vercel → Project → Settings → Environment Variables → add `ANTHROPIC_API_KEY` for Production (and optionally Preview). Redeploy.

### CORS or "Failed to fetch" when calling /api/chat

**Symptom:** Browser console shows network error or CORS error when the app calls `/api/chat`.

**Cause:** Calling a different origin (e.g. frontend on 5173, API on 3000) or wrong path.

**Fix:**
- Use same origin: run `vercel dev` and open the app on the URL Vercel gives (e.g. 3000), or configure Vite proxy to forward `/api` to the Vercel dev server.
- In production, frontend and API are same origin on Vercel, so CORS is not required for same-origin requests.

### Module not found or TypeScript errors after pull

**Symptom:** `Module not found` or `tsc -b` errors.

**Cause:** Stale `node_modules` or TypeScript cache.

**Fix:**
```bash
rm -rf node_modules dist
npm install
npx tsc -b
npm run build
```

### Tests fail after adding a dependency

**Symptom:** Vitest fails with resolver or global errors.

**Cause:** New dependency not installed or test env (jsdom) mismatch.

**Fix:** `npm install` and run `npm test` again. If the issue is with React or DOM, ensure `vitest.config.*` has the correct environment (e.g. jsdom).

### Build passes but app is blank on deploy

**Symptom:** Vercel deploy succeeds but page is white.

**Cause:** SPA routing: Vercel may be returning 404 for client-side routes if there is no `rewrites` entry for `/*` → `/index.html`. Vite SPA typically has a single `index.html`; ensure Vercel is serving `index.html` for all routes (Vercel usually does this for static export from Vite).

**Fix:** If you added a client-side router, add a rewrite in `vercel.json` so all routes serve `index.html`:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Touch or drag not working on iPad

**Symptom:** Buttons or drag work in desktop browser but not on iPad.

**Cause:** Missing viewport meta, hover-only UI, or missing touch handlers.

**Fix:** See `.cursor/rules/ipad-first.mdc`: viewport in `index.html`, 44×44pt minimum touch targets, use `@use-gesture/react` for drag (already used in FractionBlock). Test on real device.

---

## 6. Quick Reference Card

```
SETUP:     npm install && (optional) echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
DEV:       npm run dev                    → http://localhost:5173
API LOCAL: vercel dev                     → same-origin /api/chat
BUILD:     npm run build                  → dist/
PREVIEW:   npm run preview                → local production build
TEST:      npm test
LINT:      npm run lint
TSC:       npx tsc -b
DEPLOY:    git push (with Vercel connected) or vercel --prod
HEALTH:    curl -s -o /dev/null -w "%{http_code}\n" https://<project>.vercel.app/
CHAT API:  POST https://<project>.vercel.app/api/chat with { "messages": [...] }
```

---

## 7. Pre-Demo Checklist

### 7.1 Production

```bash
BASE=https://<your-vercel-project>.vercel.app
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/"
curl -sS -X POST "$BASE/api/chat" -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}' | head -c 400
```

- Root returns 200.
- `/api/chat` returns SSE stream or JSON (not 500; 500 usually means missing `ANTHROPIC_API_KEY` on Vercel).

### 7.2 Local

```bash
npm run build
npm test
npm run lint
```

- Build and tests pass; no lint errors.

### 7.3 Summary

| Check | Blocking for Demo? |
|-------|--------------------|
| `npm run build` passes | Yes |
| `npm test` passes | Yes |
| Production URL loads (200) | Yes |
| `/api/chat` returns 200 + stream (or 400 for bad body) | Yes (if demoing chat) |
| Test on iPad Safari | Recommended (iPad-first) |
| `ANTHROPIC_API_KEY` set in Vercel | Yes (for chat) |
