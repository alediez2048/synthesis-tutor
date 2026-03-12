# ENG-031 Primer: Accessibility — ARIA + Keyboard

**For:** New Cursor Agent session
**Project:** Fraction Quest — Interactive AI-Powered Fractions Tutor for Ages 8–12
**Phase:** Phase 6: Polish + Edge Cases (Day 6)
**Date:** Mar 12, 2026
**Previous work:** ENG-005 through ENG-029 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-031 brings the app to **WCAG 2.1 Level AA** compliance. The current codebase has partial ARIA support — most buttons have labels, blocks are focusable, progress bar is well-implemented — but there are critical gaps: no keyboard alternative for drag-and-drop, chat messages aren't announced to screen readers, the multiple-choice assessment leaks correct answers via aria-labels, and there's no skip link or semantic landmark structure.

### Current State (Audit Summary)

**What works well:**
- FractionBlock: `role="button"`, `aria-label` (spoken fraction), `tabIndex={0}`, Enter/Space to select
- ActionBar: `aria-expanded`, `aria-haspopup`, `role="group"` on picker, `role="alert"` on rejection
- ProgressDots: `role="progressbar"` with `aria-valuenow/max` and label
- Confetti: `aria-hidden="true"`, respects `prefers-reduced-motion`
- ErrorBoundary: `role="alert"`, `aria-live="assertive"`
- Recovery/welcome dialogs: `role="dialog"`, `aria-modal`, `aria-labelledby`
- InputField: all buttons and input labeled

**What's broken or missing:**

| Issue | Severity | Component |
|-------|----------|-----------|
| No keyboard drag-and-drop alternative | Critical | FractionBlock, Workspace, ComparisonZone |
| Chat messages not announced (`aria-live` missing) | Critical | ChatPanel |
| MultipleChoice `aria-label` reveals correct answer | Critical | MultipleChoice |
| Student messages have no `aria-label` | High | MessageBubble |
| No skip link to main content | High | App.tsx |
| No `<main>` / `<header>` semantic landmarks | High | App.tsx |
| Picker doesn't move focus on open | Medium | ActionBar |
| Assessment state changes not announced | Medium | AssessmentPhase, ConstructionTask, GeneralizationTask |
| "Sam is typing..." not announced | Medium | ChatPanel |
| Comparison zone not keyboard-droppable | Critical | ComparisonZone |

---

## Contract

### 1. Modify `src/App.tsx` — Semantic landmarks + skip link

- Wrap header in `<header>` element (replace styled div)
- Wrap main content area in `<main>` element
- Add a visually-hidden skip link as the first element in the body: `<a href="#main-content" class="skip-link">Skip to main content</a>`
- Add `id="main-content"` to the `<main>` element
- Skip link styling: visually hidden until focused, then appears at top of viewport

```typescript
// Skip link styles (visually hidden, visible on focus)
{
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
}
// On focus:
{
  position: 'fixed',
  top: 8,
  left: 8,
  width: 'auto',
  height: 'auto',
  zIndex: 10000,
  padding: '8px 16px',
  backgroundColor: '#4A90D9',
  color: '#fff',
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 600,
}
```

### 2. Modify `src/components/ChatPanel/ChatPanel.tsx` — Live region for messages

- Change message container from `role="list"` to `role="log"` with `aria-live="polite"` and `aria-atomic="false"`
- This makes screen readers announce new messages as they arrive
- Add `aria-live="polite"` to the "Sam is thinking..." loading indicator
- Add `aria-label` to the floating message bar (portrait mode)

### 3. Modify `src/components/ChatPanel/MessageBubble.tsx` — Label all messages

- Student messages currently have no `aria-label` — add `aria-label="You: ${message.content}"`
- Tutor messages already have `aria-label="Sam: ${content}"` — keep as-is

### 4. Modify `src/components/Assessment/MultipleChoice.tsx` — Don't leak correct answer

**Critical bug:** The current `aria-label` includes `"(correct)"` on the right option BEFORE the student answers. This reveals the answer to screen reader users.

Fix:
```typescript
// Before (WRONG):
aria-label={`Option ${label}${opt.correct ? ' (correct)' : ''}`}

// After (CORRECT):
aria-label={`Option ${label}`}
// Only after feedback is shown:
aria-label={`Option ${label}, ${opt.correct ? 'correct' : 'incorrect'}`}
```

Also add:
- `role="alert"` on the feedback message when answer is revealed
- Focus should move to the feedback message or "Next" button after answering

### 5. Modify `src/components/Workspace/ActionBar.tsx` — Focus management on picker

When the picker opens (user clicks Split):
- Move focus to the first picker option button
- When picker closes (option selected or Escape pressed), return focus to the Split button
- Add `onKeyDown` handler for Escape to close picker

```typescript
const firstOptionRef = useRef<HTMLButtonElement>(null);
// On picker open:
useEffect(() => {
  if (pickerOpen) firstOptionRef.current?.focus();
}, [pickerOpen]);
```

### 6. Keyboard alternative for drag-and-drop — `src/components/Workspace/FractionBlock.tsx` + `src/App.tsx`

This is the biggest gap. Kids using keyboard or Switch Control cannot drag blocks to the comparison zone or combine them.

**Approach: Context menu on focused block**

When a block is focused and the user presses **Enter** or **Space**, it selects the block (already works). Add a secondary action:

- When a block is **already selected** and the user presses **Enter** again, show an action menu:
  - "Move to Spell Altar" (comparison zone) — dispatches `COMPARE_BLOCKS`
  - "Combine with..." (shows list of same-denominator blocks) — dispatches `COMBINE_BLOCKS`
  - "Cancel" — closes menu
- Menu is a `role="menu"` with `role="menuitem"` options
- Arrow keys navigate menu, Enter selects, Escape closes
- Focus returns to the block on close

**Implementation in App.tsx:**
- Add `showBlockMenu` state: `{ blockId: string; actions: Action[] } | null`
- Render a positioned menu near the selected block
- Handle keyboard events to populate and dismiss the menu

**Implementation in FractionBlock.tsx:**
- Modify `onKeyDown`: if block is already selected, Enter opens the menu instead of re-selecting
- Pass `onOpenMenu?: (blockId: string) => void` prop

### 7. Modify `src/components/Assessment/ConstructionTask.tsx` + `GeneralizationTask.tsx`

- Add `aria-label` to Submit button: `aria-label="Submit your answer"`
- Add `role="alert"` with `aria-live="polite"` on rejection messages (ConstructionTask already has `role="alert"` — verify `aria-live` is present)
- Announce state change when first answer is submitted in GeneralizationTask

### 8. Modify `src/components/Assessment/AssessmentPhase.tsx`

- Wrap in `<section aria-label="Assessment">`
- Add `aria-live="polite"` on the problem counter ("Problem 1 of 3") so screen readers announce when it changes

---

## Deliverables Checklist

- [ ] Skip link added to App.tsx (visually hidden, visible on focus)
- [ ] `<header>` and `<main>` semantic landmarks added
- [ ] Chat messages announced via `role="log"` + `aria-live="polite"`
- [ ] "Sam is thinking..." announced as live region
- [ ] Student messages have `aria-label="You: ..."`
- [ ] MultipleChoice no longer reveals correct answer in aria-label before feedback
- [ ] MultipleChoice announces correct/incorrect result after answer
- [ ] ActionBar picker moves focus on open, Escape to close
- [ ] Keyboard block action menu: "Move to Spell Altar" and "Combine with..."
- [ ] Assessment section has `aria-label`, problem counter has `aria-live`
- [ ] Submit buttons in assessment have `aria-label`
- [ ] `npx tsc -b` passes
- [ ] `npm run lint` passes
- [ ] All existing tests pass
- [ ] DEVLOG updated with ENG-031 entry

---

## Definition of Done

- [ ] Screen reader user can complete the entire lesson (explore → guided → assess → complete) using keyboard only
- [ ] New chat messages are announced without user action
- [ ] MultipleChoice does not reveal answer to screen readers before feedback
- [ ] All interactive elements are reachable via Tab
- [ ] All interactive elements are activatable via Enter or Space
- [ ] Blocks can be moved to comparison zone and combined via keyboard menu
- [ ] Skip link works (Tab from top of page, Enter to jump to main)
- [ ] Focus is managed on dialog open/close, picker open/close, and assessment feedback
- [ ] No functional regressions

---

## Files

### Create

None — all changes are modifications to existing components.

### Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Skip link, `<header>`/`<main>` landmarks, block action menu state + rendering |
| `src/components/ChatPanel/ChatPanel.tsx` | `role="log"` + `aria-live="polite"`, loading indicator live region |
| `src/components/ChatPanel/MessageBubble.tsx` | `aria-label` on student messages |
| `src/components/Assessment/MultipleChoice.tsx` | Remove correct answer from pre-feedback aria-label, add result announcement |
| `src/components/Workspace/ActionBar.tsx` | Focus management on picker open/close, Escape to close |
| `src/components/Workspace/FractionBlock.tsx` | `onOpenMenu` prop, Enter on selected block opens action menu |
| `src/components/Assessment/AssessmentPhase.tsx` | `<section aria-label>`, `aria-live` on problem counter |
| `src/components/Assessment/ConstructionTask.tsx` | `aria-label` on Submit, verify `aria-live` on rejection |
| `src/components/Assessment/GeneralizationTask.tsx` | `aria-label` on Submit, announce state changes |
| `docs/DEVLOG.md` | Add ENG-031 entry |

### Do Not Modify

- `src/state/reducer.ts` — No state changes needed
- `src/state/types.ts` — No type changes needed (existing actions cover all operations)
- `src/engine/FractionEngine.ts` — Pure math, no a11y concern
- `src/components/shared/ProgressDots.tsx` — Already excellent a11y
- `src/components/shared/Confetti.tsx` — Already `aria-hidden` + reduced motion
- `src/components/shared/ErrorBoundary.tsx` — Already `role="alert"` + `aria-live`

---

## Testing Approach

Manual testing with:
1. **Keyboard only** — Tab through entire lesson flow, complete all phases
2. **VoiceOver (macOS/iOS)** — Verify all announcements, no leaked answers
3. **axe DevTools** browser extension — automated WCAG audit
4. **Reduced motion** — Verify `prefers-reduced-motion` disables animations

No automated test changes needed — this is purely a presentation/a11y layer ticket.
