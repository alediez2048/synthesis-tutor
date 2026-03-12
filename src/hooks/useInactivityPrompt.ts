/**
 * ENG-029: Cross-phase inactivity detection.
 * 60s: Sam nudge. 180s: dim overlay + tap to continue. 600s: auto-checkpoint.
 * Exploration phase has its own useExplorationObserver — this hook skips explore.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { LessonState, LessonAction } from '../state/types';
import { saveCheckpoint } from '../state/checkpoint';

const IDLE_60_MS = 60_000;
const IDLE_180_MS = 180_000;
const IDLE_600_MS = 600_000;
const CHECK_INTERVAL_MS = 10_000;

const NUDGE_60 = "Take your time — I'm here whenever you're ready!";

export interface UseInactivityPromptOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  onCheckpointAndRecovery?: () => void;
}

export function useInactivityPrompt({
  state,
  dispatch,
  onCheckpointAndRecovery,
}: UseInactivityPromptOptions): {
  showDimOverlay: boolean;
  showWelcomeBack: boolean;
  onTapToContinue: () => void;
  onDismissWelcomeBack: () => void;
} {
  const [showDimOverlay, setShowDimOverlay] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const lastActionRef = useRef(0);

  // Initialize on mount
  useEffect(() => {
    lastActionRef.current = Date.now();
  }, []);
  const nudge60SentRef = useRef(false);
  const nudge180SentRef = useRef(false);
  const checkpoint600Ref = useRef(false);
  const stateRef = useRef(state);
  const dispatchRef = useRef(dispatch);
  const onCheckpointRef = useRef(onCheckpointAndRecovery);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);
  useEffect(() => { onCheckpointRef.current = onCheckpointAndRecovery; }, [onCheckpointAndRecovery]);

  const onTapToContinue = useCallback(() => {
    setShowDimOverlay(false);
    nudge180SentRef.current = false;
    lastActionRef.current = Date.now();
  }, []);

  const onDismissWelcomeBack = useCallback(() => {
    setShowWelcomeBack(false);
    lastActionRef.current = Date.now();
  }, []);

  // Track last action from state changes
  useEffect(() => {
    lastActionRef.current = Date.now();
    nudge60SentRef.current = false;
  }, [
    state.chatMessages.length,
    state.phase,
    state.blocks.length,
    state.assessmentStep,
    state.conceptsDiscovered.length,
  ]);

  // Track last action from direct user interaction (clicks, touches, keys)
  useEffect(() => {
    const reset = () => {
      lastActionRef.current = Date.now();
    };
    document.addEventListener('click', reset, { passive: true });
    document.addEventListener('touchstart', reset, { passive: true });
    document.addEventListener('keydown', reset, { passive: true });
    return () => {
      document.removeEventListener('click', reset);
      document.removeEventListener('touchstart', reset);
      document.removeEventListener('keydown', reset);
    };
  }, []);

  const prevPhaseRef = useRef(state.phase);

  // Stable interval — uses refs, no state in dep array
  useEffect(() => {
    const interval = setInterval(() => {
      const phase = stateRef.current.phase;

      // Reset on phase change
      if (prevPhaseRef.current !== phase) {
        prevPhaseRef.current = phase;
        nudge60SentRef.current = false;
        nudge180SentRef.current = false;
        checkpoint600Ref.current = false;
        setShowDimOverlay(false);
        setShowWelcomeBack(false);
        lastActionRef.current = Date.now();
        return;
      }

      if (phase === 'explore' || phase === 'complete') return;

      const idle = Date.now() - lastActionRef.current;

      if (idle >= IDLE_600_MS && !checkpoint600Ref.current) {
        checkpoint600Ref.current = true;
        saveCheckpoint(stateRef.current);
        setShowDimOverlay(false);
        setShowWelcomeBack(true);
        onCheckpointRef.current?.();
        return;
      }

      if (idle >= IDLE_180_MS && !nudge180SentRef.current) {
        nudge180SentRef.current = true;
        setShowDimOverlay(true);
      }

      if (idle >= IDLE_60_MS && !nudge60SentRef.current) {
        nudge60SentRef.current = true;
        dispatchRef.current({ type: 'TUTOR_RESPONSE', content: NUDGE_60, isStreaming: false });
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return { showDimOverlay, showWelcomeBack, onTapToContinue, onDismissWelcomeBack };
}
