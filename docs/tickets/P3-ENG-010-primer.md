# ENG-010 Primer: Chat Panel UI

**For:** New Cursor Agent session  
**Project:** Synthesis Tutor — Interactive AI-Powered Fractions Tutor for Ages 8–12  
**Phase:** Phase 3: Chat + LLM Integration (Day 3)  
**Date:** Mar 11, 2026  
**Previous work:** ENG-001 through ENG-009 complete. See `docs/DEVLOG.md`.

---

## What Is This Ticket?

ENG-010 adds the **Chat Panel UI**: a scrollable message list with Sam’s avatar on tutor messages, student message bubbles, and a student input area. Layout is **40% chat / 60% workspace** in landscape (chat on left, workspace on right). New student messages are appended via **STUDENT_RESPONSE** and the list auto-scrolls to the latest message. This ticket is **UI and layout only** — no call to `/api/chat` yet (ENG-014 / ENG-039 wire the LLM). Messages are read from `state.chatMessages`; sending text dispatches `STUDENT_RESPONSE` so the reducer stays the single source of truth.

### Why Does This Exist?

PRD Phase 3: “Sam talks to the student through Claude.” The chat panel is the conversation surface. ENG-010 delivers the shell (messages + input); ENG-011 provides the API; ENG-014/039 connect the panel to the API and streaming.

### Current State

| Item | Status |
|------|--------|
| `src/state/types.ts` | **Complete** — `ChatMessage` (id, sender, content, timestamp?), `LessonState.chatMessages` |
| `src/state/reducer.ts` | **Complete** — `STUDENT_RESPONSE` appends student message to `chatMessages` |
| `src/App.tsx` | **Has** useReducer, Workspace, ActionBar; **no** ChatPanel or two-column layout |
| ChatPanel / MessageBubble / InputField / SamAvatar | **Do not exist** — create in this ticket |

---

## Contract

### Layout

- **Landscape:** Two columns — **chat ~40%** (left), **workspace ~60%** (right). Use flex or grid; chat has a min-width so it doesn’t collapse.
- **Chat column:** Scrollable message list (flex-grow 1, overflow auto), then fixed input area at bottom (input + send button).
- **Auto-scroll:** When `chatMessages` changes (e.g. new message), scroll the message list to the bottom (ref + scrollTop or scrollIntoView on last message).

### Components

1. **ChatPanel** (`src/components/ChatPanel/ChatPanel.tsx`)
   - **Props (suggested):** `messages: ChatMessage[]`, `onSendMessage: (value: string) => void`, optional `disabled?: boolean` (e.g. while loading).
   - Renders: scrollable list of `MessageBubble` + `InputField` at bottom.
   - Uses a ref on the scroll container (or last message) to auto-scroll on `messages` change.

2. **MessageBubble** (`src/components/ChatPanel/MessageBubble.tsx`)
   - **Props:** `message: ChatMessage`.
   - **Tutor messages:** Left-aligned; show **SamAvatar** next to message bubble.
   - **Student messages:** Right-aligned; no avatar. Distinct styling (e.g. different background) so tutor vs student is clear.

3. **InputField** (`src/components/ChatPanel/InputField.tsx`)
   - **Props:** `onSubmit: (value: string) => void`, `disabled?: boolean`, optional `placeholder?: string`.
   - Text input + Send button. **Send:** min 44×44pt touch target (ipad-first.mdc). On submit: call `onSubmit(value)`, clear input. Submit on Enter key as well as button click.

4. **SamAvatar** (`src/components/ChatPanel/SamAvatar.tsx` or `src/components/shared/SamAvatar.tsx`)
   - Simple avatar for Sam: e.g. circle with eyes (geometric, no image asset). Used only next to tutor bubbles. Size ~32–40px; can be a presentational component with no props or a single `size?: number` prop.

### Wiring (App)

- **State:** `state.chatMessages` from useReducer (already in App).
- **Send:** When user submits from InputField, dispatch `{ type: 'STUDENT_RESPONSE', value: string }`. Do not call `/api/chat` in this ticket.
- **Layout:** App renders a two-column layout: left = ChatPanel (messages, onSendMessage), right = existing Workspace + ActionBar. Pass `messages={state.chatMessages}` and `onSendMessage={(value) => dispatch({ type: 'STUDENT_RESPONSE', value })}`.

### Accessibility

- Message list: `aria-label="Chat messages"` or role="log" for live region (new messages appear at bottom).
- Input: `aria-label="Your message"` or visible label; Send button `aria-label="Send message"`.
- SamAvatar: decorative or `aria-hidden="true"` (Sam is identified by message position/role).

### iPad-first

- Send button and any tappable controls: min **44×44pt** (Apple HIG).
- Chat list and input must work with touch (scroll, focus, tap); no hover-only behavior.

---

## Deliverables Checklist

### A. Components

- [ ] `ChatPanel.tsx` — scrollable message list + InputField; props: messages, onSendMessage, disabled?
- [ ] `MessageBubble.tsx` — left (tutor + SamAvatar) / right (student) alignment; message.content
- [ ] `InputField.tsx` — text input + Send (44×44pt min); onSubmit; clear on send; Enter to send
- [ ] `SamAvatar.tsx` — simple circle + eyes (or similar) for tutor messages

### B. Layout and wiring

- [ ] App: two-column layout (chat ~40%, workspace ~60%); ChatPanel in left column
- [ ] ChatPanel receives `state.chatMessages` and `onSendMessage` that dispatches STUDENT_RESPONSE
- [ ] Auto-scroll to latest message when messages change

### C. Quality

- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] Update `docs/DEVLOG.md` with ENG-010 entry when complete
- [ ] Feature branch: `feature/eng-010-chat-panel-ui`

---

## Definition of Done

- [ ] Scrollable message list showing `chatMessages`; tutor messages with Sam avatar (left), student messages right-aligned
- [ ] Student input area: text field + Send button (44×44pt min); submitting dispatches STUDENT_RESPONSE and clears input; Enter key submits
- [ ] Auto-scroll to bottom when a new message is added
- [ ] App layout: chat panel left (~40%), workspace + ActionBar right (~60%)
- [ ] No call to `/api/chat` in this ticket (UI only)
- [ ] `npx tsc -b` and `npm run lint` pass
- [ ] DEVLOG updated with ENG-010 entry
- [ ] Feature branch created (and optionally pushed)

---

## Files

### Create

| File | Purpose |
|------|---------|
| `src/components/ChatPanel/ChatPanel.tsx` | Container: message list + InputField; props messages, onSendMessage |
| `src/components/ChatPanel/MessageBubble.tsx` | Single message: tutor (left + avatar) or student (right) |
| `src/components/ChatPanel/InputField.tsx` | Text input + Send button; onSubmit, 44×44pt Send |
| `src/components/ChatPanel/SamAvatar.tsx` | Sam avatar (or `shared/SamAvatar.tsx`) — circle + eyes |

### Modify

| File | Action |
|------|--------|
| `src/App.tsx` | Two-column layout; render ChatPanel with messages + onSendMessage → STUDENT_RESPONSE |
| `docs/DEVLOG.md` | Add ENG-010 entry when complete |

### Do not modify

- `src/state/reducer.ts` — STUDENT_RESPONSE already implemented
- `src/state/types.ts` — ChatMessage already defined

---

## Branch & Merge Workflow

```bash
git switch main && git pull
git switch -c feature/eng-010-chat-panel-ui
# ... implement ChatPanel, layout, wiring ...
git add src/components/ChatPanel/*.tsx src/App.tsx docs/DEVLOG.md
git commit -m "feat: add Chat Panel UI and two-column layout (ENG-010)"
git push -u origin feature/eng-010-chat-panel-ui
```

---

## After ENG-010

- **ENG-011** — Vercel edge function at `/api/chat` (can be done before or after ENG-010).
- **ENG-014** — useTutorChat hook (SSE client, streaming).
- **ENG-039** — Wire ChatPanel to LLM: send messages via useTutorChat, show streaming responses.
