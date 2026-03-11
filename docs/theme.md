# Fraction Quest — Theme & Design System

**Version:** 1.0
**Date:** Mar 11, 2026
**Theme:** Fantasy Adventure / RPG
**Tagline:** "Every fraction is a spell waiting to be discovered."

---

## 1. Concept

Fraction Quest transforms fraction learning into a magical adventure. Students are young apprentice wizards learning to master "Fraction Magic" — the art of splitting, combining, and comparing enchanted crystal shards. Sam is their wise owl mentor who guides them through spell lessons.

The workspace is a **Spell Table** where crystals are placed and manipulated. The comparison zone is a **Spell Altar** where crystals are tested for equivalence. Splitting a crystal is "casting a break spell," combining is "fusing crystals," and discovering equivalence is "unlocking a secret."

---

## 2. App Name

**Fraction Quest**

- Header: "Fraction Quest" (display font)
- Subtitle: "A Magical Math Adventure"
- Browser title: "Fraction Quest — Learn Fractions with Magic"

---

## 3. Color Palette

### Core Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--fq-bg-primary` | `#1A1A2E` | App background (deep midnight) |
| `--fq-bg-secondary` | `#16213E` | Panel backgrounds (dark navy) |
| `--fq-bg-surface` | `#0F3460` | Cards, containers (royal blue) |
| `--fq-bg-workspace` | `#1A1A2E` | Spell table surface |
| `--fq-accent-primary` | `#6C5CE7` | Primary actions, Sam's speech bubbles |
| `--fq-accent-secondary` | `#00CEC9` | Secondary actions, highlights, magic glow |
| `--fq-accent-gold` | `#FDCB6E` | Rewards, stars, equivalence reveal |
| `--fq-accent-pink` | `#FD79A8` | Alerts, rejections (gentle) |
| `--fq-text-primary` | `#DFE6E9` | Body text (soft white) |
| `--fq-text-secondary` | `#B2BEC3` | Secondary text, labels |
| `--fq-text-heading` | `#FFFFFF` | Headings |

### Crystal Colors (by Denominator)

| Denominator | Color Name | Hex | Crystal Type |
|-------------|-----------|-----|--------------|
| 1 (whole) | Moonstone | `#B2BEC3` | Gray quartz — the whole, uncut crystal |
| 2 (halves) | Sapphire | `#4A90D9` | Blue crystal — the first split |
| 3 (thirds) | Emerald | `#27AE60` | Green crystal — three-way break |
| 4 (fourths) | Amethyst | `#8E44AD` | Purple crystal — refined quarters |
| 5 (fifths) | Citrine | `#F39C12` | Amber crystal |
| 6 (sixths) | Topaz | `#E67E22` | Orange crystal — sixths |
| 8 (eighths) | Aquamarine | `#16A085` | Teal crystal — fine splits |
| 12 (twelfths) | Rose Quartz | `#E84393` | Pink crystal — finest division |

### Gradients

| Name | Value | Usage |
|------|-------|-------|
| Crystal Glow | `linear-gradient(135deg, color 0%, lighten(color, 15%) 100%)` | Applied to all fraction blocks |
| Magic Shimmer | `radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.2), transparent 70%)` | Overlay on blocks for glass/crystal effect |
| Night Sky | `linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)` | App background |
| Altar Glow | `radial-gradient(ellipse, rgba(108,92,231,0.15), transparent 70%)` | Comparison zone background |

---

## 4. Typography

### Fonts

| Role | Font | Weight | Size | Source |
|------|------|--------|------|--------|
| Display / App Title | **Fredoka One** | 400 | 28px | Google Fonts |
| Headings | **Nunito** | 700 | 20-24px | Google Fonts |
| Body / Chat | **Nunito** | 400-600 | 16px | Google Fonts |
| Block Labels | **Nunito** | 700 | 16px | Google Fonts |
| Code / Fractions | **Nunito** | 700 | 18px | Google Fonts |

### Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--fq-text-xs` | 12px | 1.4 | Captions, timestamps |
| `--fq-text-sm` | 14px | 1.5 | Secondary info |
| `--fq-text-base` | 16px | 1.5 | Body, chat messages |
| `--fq-text-lg` | 18px | 1.4 | Block labels, emphasis |
| `--fq-text-xl` | 20px | 1.3 | Section headings |
| `--fq-text-2xl` | 24px | 1.2 | Page headings |
| `--fq-text-3xl` | 28px | 1.1 | App title (Fredoka One) |

---

## 5. Sam — The Wizard Owl

### Character Design

Sam is a **small wizard owl** — round body, big expressive eyes behind round glasses, a slightly crooked pointed hat (purple with gold stars), and small feathered wings that gesture while talking.

### Visual Specs

- **Avatar size:** 40px (chat), 48px (header if shown)
- **Shape:** Rounded, fits in a circle
- **Colors:** Body `#6C5CE7` (purple), hat `#6C5CE7` with `#FDCB6E` stars, glasses `#FDCB6E` gold rims, eyes white with dark pupils
- **Implementation:** SVG component with expression variants

### Expressions (SVG variants)

| State | Eyes | Extras | When |
|-------|------|--------|------|
| `neutral` | Open, looking forward | — | Default, waiting |
| `thinking` | Looking up-right | Small sparkles near hat | Processing, loading |
| `happy` | Curved smile eyes (^‿^) | Wings slightly raised | Correct answer, discovery |
| `encouraging` | Soft open eyes, slight smile | One wing gesturing | Hints, nudges |
| `celebrating` | Big eyes, open smile | Both wings up, stars around | Assessment complete, 3/3 |

### Voice/Personality (updates to PRD Section 5)

Sam retains all existing voice constraints but gains themed vocabulary:

| Old Term | Fraction Quest Term |
|----------|-------------------|
| "fraction block" | "crystal" or "crystal shard" |
| "split" | "break the crystal" or "cast a split spell" |
| "combine" | "fuse the crystals" |
| "comparison zone" | "spell altar" |
| "workspace" | "spell table" |
| "equivalent" | "same magical power" or "equivalent" |
| "correct" | "the spell worked!" |
| "incorrect" | "not quite — the crystals don't match" |

**Important:** Sam still uses proper math terms alongside themed terms. Example: *"You split that crystal into two pieces — each one is one-fourth. That's a quarter!"* The fantasy layer is flavor, not a replacement for mathematical vocabulary.

---

## 6. Component Styling

### 6.1 Fraction Blocks → Crystals

**Current:** Flat colored rectangles with 4px border-radius, thin grid lines, white text label.

**Fraction Quest:**

```
- Border-radius: 8px (more gem-like)
- Background: Crystal gradient (see Section 3)
- Overlay: Magic shimmer gradient for glass effect
- Grid lines: 1px rgba(255,255,255,0.3) — glowing crystal facets
- Label: Nunito 700, 16-18px, white with text-shadow: 0 1px 2px rgba(0,0,0,0.5)
- Box-shadow (resting): 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)
- Box-shadow (selected): 0 0 0 3px #FDCB6E, 0 0 12px rgba(253,203,110,0.4)
- Box-shadow (dragging): 0 8px 24px rgba(0,0,0,0.4), 0 0 16px rgba(108,92,231,0.3)
- Selection ring: Gold (#FDCB6E) instead of blue
```

### 6.2 Reference Bar → The Ancient Crystal (1 whole)

**Current:** Gray rectangle with "1/1" label.

**Fraction Quest:**

```
- Background: linear-gradient(135deg, #B2BEC3, #95A5A6) — moonstone
- Border-radius: 8px
- Box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)
- Label: "1/1 — The Whole Crystal" (or just "1/1")
- Subtle shimmer animation (slow, 4s loop)
```

### 6.3 Comparison Zone → Spell Altar

**Current:** Dashed gray border, "Drop blocks here to compare" text.

**Fraction Quest:**

```
- Border: 2px dashed rgba(108,92,231,0.4) — purple dashed
- Background: Altar glow gradient (radial, subtle purple)
- Border-radius: 12px
- Label: "Place crystals here to compare" (or "Spell Altar")
- Icon: Small ✨ sparkle icon next to label
- On hover/active: border brightens, glow intensifies
- On blocks placed: altar glows more, awaiting second block
```

### 6.4 Workspace → Spell Table

**Current:** Light gray background, flex wrap.

**Fraction Quest:**

```
- Background: rgba(15,52,96,0.3) — subtle dark surface
- Border-radius: 12px
- Border: 1px solid rgba(108,92,231,0.15)
- Min-height: 100px
- Inner shadow: inset 0 2px 4px rgba(0,0,0,0.1)
```

### 6.5 ActionBar → Spell Controls

**Current:** Plain "Split" button with gray background.

**Fraction Quest:**

```
- Split button:
  - Background: linear-gradient(135deg, #6C5CE7, #5A4BD1)
  - Color: white
  - Border-radius: 12px
  - Box-shadow: 0 2px 8px rgba(108,92,231,0.3)
  - Icon: ✂️ or ⚡ before "Split"
  - Hover/active: brighten, scale(1.02)
  - Disabled: opacity 0.5, grayscale
- Split picker [2][3][4]:
  - Styled as small crystal-shaped buttons
  - Each shows the number + a tiny crystal icon
  - Background: --fq-bg-surface
  - Border: 1px solid --fq-accent-secondary
```

### 6.6 Chat Panel → Sam's Scroll

**Current:** White background, plain bubbles.

**Fraction Quest:**

```
- Panel background: --fq-bg-secondary (#16213E)
- Border: 1px solid rgba(108,92,231,0.2)
- Border-radius: 16px (outer container)

- Tutor bubbles:
  - Background: rgba(108,92,231,0.2) — translucent purple
  - Border: 1px solid rgba(108,92,231,0.3)
  - Border-radius: 12px 12px 12px 4px
  - Color: --fq-text-primary

- Student bubbles:
  - Background: rgba(0,206,201,0.2) — translucent teal
  - Border: 1px solid rgba(0,206,201,0.3)
  - Border-radius: 12px 12px 4px 12px
  - Color: --fq-text-primary

- Input field:
  - Background: rgba(255,255,255,0.08)
  - Border: 1px solid rgba(255,255,255,0.15)
  - Border-radius: 12px
  - Color: white
  - Placeholder: rgba(255,255,255,0.4)

- Send button:
  - Background: --fq-accent-secondary (#00CEC9)
  - Border-radius: 12px
  - Color: #1A1A2E (dark text on teal)
```

### 6.7 Header

**Current:** Plain h1 "Synthesis Tutor" with subtitle.

**Fraction Quest:**

```
- Title: "Fraction Quest" in Fredoka One, 28px, white
- Subtitle: "A Magical Math Adventure" in Nunito 400, 14px, --fq-text-secondary
- Optional: Small Sam owl icon (24px) next to title
- Optional: Progress dots styled as crystal orbs (filled = glowing, empty = dim)
```

---

## 7. Animations & Effects

### Existing (update style)

| Animation | Current | Fraction Quest |
|-----------|---------|----------------|
| Split | scaleX(0→1), 400ms ease-out | Same timing + sparkle particle burst at split point |
| Combine snap | 350ms ease-in-out | Same + brief golden glow on merged crystal |
| Selection | Blue box-shadow ring | Gold ring + subtle pulse (1.5s infinite) |
| Drag | scale(1.05) + shadow | Same + faint purple trail/glow under crystal |

### New (add in theme pass)

| Animation | Trigger | Spec |
|-----------|---------|------|
| Crystal shimmer | Idle blocks | Subtle shimmer overlay, 4s loop, barely perceptible |
| Altar glow pulse | Blocks in comparison zone | Soft purple pulse, 2s loop |
| Equivalence reveal | Two equivalent blocks compared | Gold pulse + "=" + sparkle burst, 800ms |
| Star reward | Correct answer in assessment | Star flies to progress bar, 600ms |
| Confetti | 3/3 completion | Crystal-colored particles, 2s, CSS-only |

---

## 8. Implementation Plan

### New Files

| File | Purpose |
|------|---------|
| `src/theme/theme.ts` | Color tokens, spacing, border-radius, shadows as JS objects |
| `src/theme/ThemeProvider.tsx` | React Context provider (optional — can also use CSS vars) |
| `src/theme/fonts.css` | Google Fonts import (Nunito + Fredoka One) |
| `src/components/shared/SamAvatar.tsx` | Updated SVG owl with expression variants |

### Modified Files

| File | Changes |
|------|---------|
| `index.html` | Google Fonts preconnect, update `<title>` to "Fraction Quest" |
| `src/App.tsx` | Apply theme background, update header text, import fonts.css |
| `src/components/Workspace/FractionBlock.tsx` | Crystal gradients, shimmer overlay, updated shadows/radius |
| `src/components/Workspace/Workspace.tsx` | Spell table styling, updated section labels |
| `src/components/Workspace/ComparisonZone.tsx` | Altar styling, glow effect |
| `src/components/Workspace/ActionBar.tsx` | Themed split button, picker styling |
| `src/components/ChatPanel/ChatPanel.tsx` | Dark panel background, themed container |
| `src/components/ChatPanel/MessageBubble.tsx` | Themed bubbles, new Sam avatar |
| `src/components/ChatPanel/InputField.tsx` | Dark input styling, teal send button |
| `src/state/reducer.ts` | Update initial chat message from Sam (themed greeting) |

### Implementation Order

1. **Theme tokens + fonts** — `theme.ts`, `fonts.css`, `index.html` updates
2. **App shell** — background gradient, header, font application
3. **Fraction blocks** — crystal gradients, shimmer, shadows
4. **Chat panel** — dark theme, bubble colors, input styling
5. **Workspace + zones** — spell table, altar styling
6. **ActionBar** — themed buttons
7. **Sam avatar** — SVG owl with expressions
8. **Micro-animations** — shimmer, glow, particles (stretch)

---

## 9. Accessibility Notes

- Dark theme must maintain WCAG AA contrast (4.5:1 for body text, 3:1 for large text)
- All crystal colors tested against dark backgrounds for label readability
- Gold selection ring (#FDCB6E on #1A1A2E) = contrast ratio 9.2:1 (passes AAA)
- Animations respect `prefers-reduced-motion` — disable shimmer, reduce particles
- Sam's expressions are decorative (`aria-hidden="true"`) — emotion conveyed through text

---

## 10. What This Theme Does NOT Change

- **Math engine** — FractionEngine is pure logic, no visual concern
- **State management** — Reducer actions, types unchanged
- **Layout proportions** — 40/60 split stays
- **API layer** — `/api/chat` unchanged
- **Touch/drag mechanics** — `@use-gesture` config unchanged
- **Lesson flow / script** — Phase structure unchanged (Sam's themed vocabulary is prompt-level only)
