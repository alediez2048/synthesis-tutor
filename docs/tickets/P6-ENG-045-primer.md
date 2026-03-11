# ENG-045 Primer: Fraction Quest Theme Pass

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8-12
**Phase:** Phase 6: Polish + Edge Cases
**Date:** Mar 11, 2026
**Previous work:** ENG-001 through ENG-011 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-045 applies the **Fraction Quest** visual theme to the entire app. The app transforms from a plain developer prototype into a polished fantasy-adventure experience with dark backgrounds, glowing crystal blocks, a wizard owl avatar for Sam, and themed typography. This is a **presentation-only** ticket — no state, logic, or API changes.

### Why Does This Exist?

The app is for children ages 8-12. The current UI is functional but has no personality or visual appeal. The Fraction Quest theme (fantasy RPG) makes the app engaging and age-appropriate without being babyish. See `docs/theme.md` for the full design system.

### Design Reference

**`docs/theme.md`** is the single source of truth for all visual specs. Read it fully before starting. Key sections:

- Section 3: Color palette (tokens + crystal colors by denominator)
- Section 4: Typography (Fredoka One + Nunito, size scale)
- Section 5: Sam character design (SVG owl, 5 expressions)
- Section 6: Component-by-component styling specs
- Section 7: Animation specs

---

## Contract

### Phase 1: Theme Foundation

1. **`src/theme/theme.ts`** — Export all color tokens, spacing, border-radius, shadows as a typed JS object. Include crystal color map keyed by denominator (replaces `DENOMINATOR_COLORS` in reducer).

2. **`src/theme/fonts.css`** — Google Fonts import for Nunito (400, 600, 700) and Fredoka One (400). Imported in `main.tsx` or `index.html`.

3. **`index.html`** — Update `<title>` to "Fraction Quest". Add Google Fonts preconnect links. Update meta description.

### Phase 2: App Shell

4. **`src/App.tsx`** — Apply night sky gradient background. Update header: "Fraction Quest" in Fredoka One, subtitle "A Magical Math Adventure" in Nunito. Set `font-family: 'Nunito', sans-serif` on root. All text colors from theme tokens (light on dark).

### Phase 3: Workspace Components

5. **`src/components/Workspace/FractionBlock.tsx`** —
   - Replace flat background with crystal gradient + shimmer overlay
   - Update border-radius from 4px to 8px
   - Grid lines: `rgba(255,255,255,0.3)` for crystal facet look
   - Selection ring: gold `#FDCB6E` with glow shadow
   - Drag shadow: purple glow
   - Import colors from theme.ts (crystal color map)

6. **`src/components/Workspace/Workspace.tsx`** —
   - Reference bar: moonstone gradient, shimmer, "1/1" label
   - Workspace section: dark surface background, subtle border
   - Update aria-labels if desired ("Spell table" etc — keep original labels as well for accessibility)

7. **`src/components/Workspace/ComparisonZone.tsx`** —
   - Purple dashed border, altar glow gradient background
   - Label: "Place crystals here to compare"
   - Glow intensifies when blocks are present

8. **`src/components/Workspace/ActionBar.tsx`** —
   - Split button: purple gradient, white text, 12px border-radius
   - Picker buttons: dark surface with teal border
   - Rejection message: themed styling (dark bg, pink accent)

### Phase 4: Chat Panel

9. **`src/components/ChatPanel/ChatPanel.tsx`** —
   - Dark panel background (`#16213E`)
   - Border with subtle purple tint
   - Empty state text in secondary color

10. **`src/components/ChatPanel/MessageBubble.tsx`** —
    - Tutor bubbles: translucent purple background
    - Student bubbles: translucent teal background
    - Text color: light (--fq-text-primary)
    - Replace circle avatar with Sam owl SVG

11. **`src/components/ChatPanel/InputField.tsx`** —
    - Dark input background with subtle border
    - Teal send button (#00CEC9) with dark text
    - White placeholder text at 40% opacity

### Phase 5: Sam Avatar

12. **`src/components/shared/SamAvatar.tsx`** (or update existing in MessageBubble) —
    - SVG wizard owl: round body (#6C5CE7), round glasses (#FDCB6E rims), pointed hat with stars, white eyes with dark pupils
    - Props: `size?: number`, `expression?: 'neutral' | 'thinking' | 'happy' | 'encouraging' | 'celebrating'`
    - Default expression: `neutral`
    - `aria-hidden="true"` (decorative)

### Phase 6: Color Source Migration

13. **`src/state/reducer.ts`** — Update `DENOMINATOR_COLORS` map to import from `theme.ts` crystal colors. The hex values stay the same (or update to theme values). This is the only non-presentation file touched.

---

## Deliverables Checklist

- [ ] Theme token file (`src/theme/theme.ts`) with all colors, fonts, spacing
- [ ] Google Fonts loaded (Nunito + Fredoka One)
- [ ] Dark background gradient on app shell
- [ ] "Fraction Quest" header with themed typography
- [ ] Crystal-styled fraction blocks (gradients, shimmer, gold selection)
- [ ] Themed comparison zone (spell altar)
- [ ] Themed workspace area (spell table)
- [ ] Themed action bar (purple split button)
- [ ] Dark-themed chat panel with colored bubbles
- [ ] Sam wizard owl SVG avatar (at least `neutral` expression)
- [ ] All text readable on dark backgrounds (WCAG AA)
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] All existing tests pass (no logic changes)
- [ ] `index.html` title updated to "Fraction Quest"

---

## Definition of Done

- [ ] App looks like a fantasy adventure game, not a developer prototype
- [ ] All components use theme tokens (no hardcoded colors outside theme.ts and reducer)
- [ ] Typography is Nunito/Fredoka One at 16px+ base size
- [ ] Sam has an owl avatar (SVG, at least neutral expression)
- [ ] Dark theme with proper contrast (WCAG AA)
- [ ] No functional regressions — all tests pass, all interactions work
- [ ] DEVLOG updated with ENG-045 entry

---

## Files

### Create

| File | Purpose |
|------|---------|
| `src/theme/theme.ts` | All theme tokens (colors, fonts, spacing, shadows) |
| `src/theme/fonts.css` | Google Fonts import |
| `src/components/shared/SamAvatar.tsx` | SVG wizard owl avatar component |

### Modify

| File | Changes |
|------|---------|
| `index.html` | Title, fonts preconnect, meta description |
| `src/main.tsx` | Import `fonts.css` |
| `src/App.tsx` | Dark background, themed header, font-family |
| `src/components/Workspace/FractionBlock.tsx` | Crystal gradients, gold selection, themed shadows |
| `src/components/Workspace/Workspace.tsx` | Dark workspace, themed reference bar |
| `src/components/Workspace/ComparisonZone.tsx` | Altar styling |
| `src/components/Workspace/ActionBar.tsx` | Purple split button, themed picker |
| `src/components/ChatPanel/ChatPanel.tsx` | Dark panel |
| `src/components/ChatPanel/MessageBubble.tsx` | Themed bubbles, owl avatar |
| `src/components/ChatPanel/InputField.tsx` | Dark input, teal send |
| `src/state/reducer.ts` | Import crystal colors from theme (optional) |
| `docs/DEVLOG.md` | Add ENG-045 entry |

### Do Not Modify

- `src/state/types.ts` — No type changes needed
- `src/engine/FractionEngine.ts` — Pure math, no visual concern
- `api/chat.ts` — API layer unchanged
- Test files — No test changes (this is visual only)

---

## Design Reference

**Read `docs/theme.md` fully before starting.** It contains:
- Exact hex values for every color
- CSS specs for every component (gradients, shadows, border-radius)
- Sam avatar design (shapes, colors, expressions)
- Animation specs
- Accessibility requirements
