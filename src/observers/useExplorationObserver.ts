/**
 * Exploration phase observer. Round-aware: detects when each round's goal
 * is met and dispatches ADVANCE_ROUND. Manages timer-based rounds.
 */

import { useEffect, useRef } from 'react';
import { areEquivalent } from '../engine/FractionEngine';
import type { LessonState, LessonAction } from '../state/types';
import { getLesson } from '../content/curriculum';

interface ExplorationObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  sendMessage?: (text: string) => void;
  isLoading?: boolean;
}

export function useExplorationObserver({
  state,
  dispatch,
}: ExplorationObserverOptions): void {
  const prevBlocksRef = useRef(state.blocks);
  const prevRoundRef = useRef(state.explorationRound);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lesson = getLesson(state.lessonId);
  const rounds = lesson?.explorationRounds ?? [];
  const currentRoundConfig = rounds[state.explorationRound - 1];
  const isTimerRound = currentRoundConfig?.goalType === 'timer';
  const timerMs = lesson?.lastRoundTimerMs ?? null;

  // Reset timers when leaving explore or timer round
  useEffect(() => {
    if (state.phase !== 'explore') {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    } else if (!isTimerRound) {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    }
  }, [state.phase, isTimerRound]);

  // Timer round: start timer when entering
  useEffect(() => {
    if (state.phase !== 'explore' || !isTimerRound || timerMs === null) return;
    if (timerRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (currentRoundConfig) {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: currentRoundConfig.celebration,
          isStreaming: false,
        });
      }
      dispatch({ type: 'ADVANCE_ROUND' });
    }, timerMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.phase, isTimerRound, timerMs, currentRoundConfig, dispatch]);

  // Goal detection via block/state changes
  useEffect(() => {
    if (state.phase !== 'explore') return;
    if (!currentRoundConfig || currentRoundConfig.goalType === 'timer') return;

    const prev = prevBlocksRef.current;
    const curr = state.blocks;
    prevBlocksRef.current = curr;

    // Skip processing when round just advanced
    if (prevRoundRef.current !== state.explorationRound) {
      prevRoundRef.current = state.explorationRound;
      return;
    }

    if (prev === curr) return;

    const goalType = currentRoundConfig.goalType;
    let goalMet = false;

    switch (goalType) {
      case 'any_split':
        goalMet = curr.length > prev.length;
        break;

      case 'any_combine':
        goalMet = curr.length === prev.length - 1;
        break;

      case 'different_split': {
        if (curr.length > prev.length) {
          const parts = curr.length - prev.length + 1;
          const round1Parts = state.explorationRoundProgress?.round1SplitParts;
          goalMet = round1Parts !== undefined && parts !== round1Parts;
        }
        break;
      }

      case 'equivalence_compare': {
        const comparisonBlocks = curr.filter((b) => b.position === 'comparison');
        if (comparisonBlocks.length >= 2) {
          for (let i = 0; i < comparisonBlocks.length && !goalMet; i++) {
            for (let j = i + 1; j < comparisonBlocks.length && !goalMet; j++) {
              const a = comparisonBlocks[i]!.fraction;
              const b = comparisonBlocks[j]!.fraction;
              if (a.denominator !== b.denominator && areEquivalent(a, b)) {
                goalMet = true;
              }
            }
          }
        }
        break;
      }

      case 'any_add':
        goalMet = curr.length === prev.length - 1;
        break;

      case 'unlike_add': {
        if (curr.length === prev.length - 1) {
          // Check that the blocks that were removed had different denominators
          const removedIds = prev.filter((b) => !curr.some((c) => c.id === b.id));
          if (removedIds.length === 2) {
            goalMet = removedIds[0]!.fraction.denominator !== removedIds[1]!.fraction.denominator;
          }
        }
        break;
      }
    }

    if (goalMet) {
      // Track round1SplitParts for 'any_split' goal
      const advanceAction: any = { type: 'ADVANCE_ROUND' };
      if (goalType === 'any_split' && curr.length > prev.length) {
        advanceAction.round1SplitParts = curr.length - prev.length + 1;
      }

      dispatch({
        type: 'TUTOR_RESPONSE',
        content: currentRoundConfig.celebration,
        isStreaming: false,
      });

      // Pause 2s so the user sees the celebration before blocks change
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null;
        dispatch(advanceAction);
      }, 2000);
    }
  }, [
    state.phase,
    state.blocks,
    state.explorationRound,
    state.explorationRoundProgress,
    state.lessonId,
    currentRoundConfig,
    dispatch,
  ]);
}
