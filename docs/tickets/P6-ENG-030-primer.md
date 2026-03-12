# ENG-030 Primer: Responsive Layout — Portrait Mode

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 6: Polish + Edge Cases (Day 6)
**Date:** Mar 12, 2026
**Previous work:** ENG-006 (Workspace), ENG-010 (ChatPanel), ENG-015 (integration). See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-030 makes the app work well in **iPad portrait mode** (and any narrow viewport ≤ 768px). Currently the layout is a single centered column with a bottom chat bar — it works but wastes space and doesn't adapt to orientation changes. This ticket adds a **stacked layout** for portrait: workspace on top, chat panel below, with a toggle tab to switch between them when space is tight.

### Why Does This Exist?

The primary device is iPad. In landscape (1024×768), the current centered layout is fine. In portrait (768×1024), the workspace and chat need to stack vertically. Kids will rotate the iPad — the layout must adapt without breaking state or losing context.

### Current State

- **No media queries exist** — layout is flexbox with fixed maxWidth
- **ChatPanel has two layout modes**: `'bottomBar'` (compact, used now) and `'sidebar'` (scrollable message list, unused)
- **Workspace accepts `referenceWidth` prop** — currently hardcoded at 400px
- **`100dvh`** already handles Safari dynamic toolbar
- **Viewport meta** already set with `maximum-scale=1, user-scalable=no`

---

## Contract

### 1. Define breakpoints

Use a single breakpoint based on viewport width:

```
≤ 768px  → portrait / narrow (stacked layout)
> 768px  → landscape / wide (side-by-side layout)
```

Detection: CSS `@media (max-width: 768px)` for styles, plus a `useMediaQuery` hook for JS layout switching.

### 2. Create `src/hooks/useMediaQuery.ts`

A small hook that returns whether a media query matches.

```typescript
export function useMediaQuery(query: string): boolean;
```

Usage in App.tsx:
```typescript
const isPortrait = useMediaQuery('(max-width: 768px)');
```

### 3. Modify `src/App.tsx` — Responsive layout switching

**Landscape (> 768px) — side-by-side layout:**
- Left panel (40%): ChatPanel in `'sidebar'` mode — full scrollable message history
- Right panel (60%): Workspace + ActionBar
- This is the 40/60 split from the PRD (currently not implemented)

**Portrait (≤ 768px) — stacked layout with toggle:**
- Full-width workspace on top (visible by default)
- Full-width chat panel below
- **Toggle tab bar** between workspace and chat views:
  - Two tabs: "Spell Table" (workspace) and "Sam's Chat" (chat)
  - Active tab highlighted, inactive dimmed
  - Sticky at top or bottom of the content area
  - Smooth transition (no jarring layout shift)
- When workspace tab is active: show Workspace + ActionBar, hide ChatPanel (but keep latest Sam message visible as a floating bar)
- When chat tab is active: show ChatPanel in `'sidebar'` mode, hide Workspace

**Shared:**
- `referenceWidth` adapts: `Math.min(400, viewportWidth - 32)`
- Header stays fixed at top in both modes
- Assessment phase uses same responsive logic

### 4. Create `src/components/shared/ViewToggle.tsx`

The tab bar for portrait mode.

**Props:**
```typescript
export interface ViewToggleProps {
  activeView: 'workspace' | 'chat';
  onToggle: (view: 'workspace' | 'chat') => void;
  /** Optional unread indicator on chat tab */
  hasUnread?: boolean;
}
```

**Behavior:**
- Two buttons side-by-side, pill-shaped toggle or tab bar
- Active tab: solid background (#4A90D9), white text
- Inactive tab: transparent, gray text
- If `hasUnread` is true, show a small dot indicator on the chat tab (new Sam message while viewing workspace)
- Min touch target: 44px
- `aria-label` on each tab

### 5. Modify `src/App.tsx` — Unread indicator logic

When in portrait mode and workspace tab is active:
- Track whether new tutor messages arrive while chat is hidden
- Set `hasUnread = true` when a new tutor message arrives and chat tab is not active
- Clear `hasUnread` when user switches to chat tab

### 6. Modify `src/components/ChatPanel/ChatPanel.tsx` — Floating message bar

In portrait mode when workspace is active, show a **floating bar** at the top of the workspace area with Sam's latest message (truncated to ~80 chars). Tapping it switches to chat view.

**Props addition:**
```typescript
/** Latest Sam message to show as floating bar */
floatingMessage?: string;
/** Callback when floating bar is tapped */
onFloatingTap?: () => void;
```

### 7. Modify `src/components/Workspace/Workspace.tsx` — Responsive reference width

Accept an optional `containerWidth` or use the existing `referenceWidth` prop. In portrait mode, App.tsx passes a smaller `referenceWidth` calculated from viewport width.

---

## Deliverables Checklist

- [ ] `src/hooks/useMediaQuery.ts` created
- [ ] `src/components/shared/ViewToggle.tsx` created — tab bar for portrait
- [ ] Landscape (> 768px): 40/60 side-by-side layout with sidebar ChatPanel
- [ ] Portrait (≤ 768px): stacked layout with toggle between workspace and chat
- [ ] Toggle tabs: "Spell Table" and "Sam's Chat" with active state styling
- [ ] Unread dot indicator on chat tab when Sam sends message while workspace is active
- [ ] Floating Sam message bar visible in portrait workspace view
- [ ] `referenceWidth` adapts to viewport width in portrait
- [ ] Assessment phase responsive (same breakpoint logic)
- [ ] CompletionScreen responsive (already flex column, should work — verify)
- [ ] Orientation change preserves state (no reset, no flash)
- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] All existing tests pass
- [ ] DEVLOG updated with ENG-030 entry

---

## Definition of Done

- [ ] Landscape iPad (1024×768): workspace and chat side-by-side, 40/60 split
- [ ] Portrait iPad (768×1024): workspace and chat in stacked tabs
- [ ] Tab toggle switches views without losing state
- [ ] Unread indicator appears when Sam messages arrive on hidden chat tab
- [ ] Floating Sam message visible while on workspace tab
- [ ] Rotating device switches layout smoothly (no flash, no state loss)
- [ ] Touch targets remain ≥ 44px in both orientations
- [ ] All phases work in both orientations (explore, guided, assess, complete)
- [ ] No functional regressions

---

## Files

### Create

| File | Purpose |
|------|---------|
| `src/hooks/useMediaQuery.ts` | Reactive media query hook |
| `src/components/shared/ViewToggle.tsx` | Portrait mode tab bar (Spell Table / Sam's Chat) |

### Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Responsive layout switching, unread tracking, referenceWidth calculation |
| `src/components/ChatPanel/ChatPanel.tsx` | Floating message bar prop for portrait workspace view |
| `docs/DEVLOG.md` | Add ENG-030 entry |

### Do Not Modify

- `src/state/reducer.ts` — No state changes
- `src/state/types.ts` — No type changes
- `src/components/Workspace/Workspace.tsx` — Already accepts `referenceWidth` prop
- `src/components/Workspace/FractionBlock.tsx` — Already responsive to width
- Test files — Layout is visual-only

---

## Existing Patterns to Follow

**ChatPanel layout modes** (`ChatPanel.tsx`):
- `layout="bottomBar"` — compact, shows latest message only (current)
- `layout="sidebar"` — full scrollable panel (use for landscape left panel and portrait chat tab)

**Workspace referenceWidth** (`Workspace.tsx`):
- Passed as prop, controls block proportional sizing
- Currently 400px — make responsive: `Math.min(400, viewportWidth - 32)`

**PRD references:**
- Section 6.1: "iPad Portrait: Manipulative stacks above chat with toggle tab"
- Section 6.3: "CSS dvh units instead of vh" (already done)
- interviews.md: "In portrait or on smaller screens, the manipulative stacks above the chat with a toggle tab"
