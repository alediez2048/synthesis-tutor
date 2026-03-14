/**
 * Exploration phase observer. Round-aware: detects when each round's goal
 * is met and dispatches ADVANCE_ROUND. Manages round 5 timer.
 */

import { useEffect, useRef } from 'react';
import { areEquivalent } from '../engine/FractionEngine';
import type { LessonState, LessonAction } from '../state/types';
import {
  EXPLORATION_ROUNDS,
  ROUND_5_TIMER_MS,
} from '../content/exploration-rounds';

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
  const round5TimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset round 5 timer when leaving explore or round 5
  useEffect(() => {
    if (state.phase !== 'explore' || state.explorationRound !== 5) {
      if (round5TimerRef.current) {
        clearTimeout(round5TimerRef.current);
        round5TimerRef.current = null;
      }
    }
  }, [state.phase, state.explorationRound]);

  // Round 5: start 60s timer when entering
  useEffect(() => {
    if (state.phase !== 'explore' || state.explorationRound !== 5) return;
    if (round5TimerRef.current) return;

    round5TimerRef.current = setTimeout(() => {
      round5TimerRef.current = null;
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: EXPLORATION_ROUNDS[4]!.celebration,
        isStreaming: false,
      });
      dispatch({ type: 'ADVANCE_ROUND' });
    }, ROUND_5_TIMER_MS);

    return () => {
      if (round5TimerRef.current) {
        clearTimeout(round5TimerRef.current);
        round5TimerRef.current = null;
      }
    };
  }, [state.phase, state.explorationRound, dispatch]);

  // Round 1–4 goal detection via block/state changes
  useEffect(() => {
    if (state.phase !== 'explore') return;
    if (state.explorationRound === 5) return; // Round 5 uses timer or button

    const round = state.explorationRound;
    const prev = prevBlocksRef.current;
    const curr = state.blocks;
    prevBlocksRef.current = curr;

    // Skip processing when round just advanced (blocks changed from reducer, not user)
    if (prevRoundRef.current !== round) {
      prevRoundRef.current = round;
      return;
    }

    if (prev === curr) return;

    // Round 1: any SPLIT_BLOCK
    if (round === 1 && curr.length > prev.length) {
      const parts = curr.length - prev.length + 1;
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: EXPLORATION_ROUNDS[0]!.celebration,
        isStreaming: false,
      });
      dispatch({ type: 'ADVANCE_ROUND', round1SplitParts: parts });
      return;
    }

    // Round 2: any COMBINE_BLOCKS (combine first so student has blocks they can split differently)
    if (round === 2 && curr.length === prev.length - 1) {
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: EXPLORATION_ROUNDS[1]!.celebration,
        isStreaming: false,
      });
      dispatch({ type: 'ADVANCE_ROUND' });
      return;
    }

    // Round 3: SPLIT_BLOCK into different number than round 1
    if (round === 3 && curr.length > prev.length) {
      const parts = curr.length - prev.length + 1;
      const round1Parts = state.explorationRoundProgress?.round1SplitParts;
      if (round1Parts !== undefined && parts !== round1Parts) {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: EXPLORATION_ROUNDS[2]!.celebration,
          isStreaming: false,
        });
        dispatch({ type: 'ADVANCE_ROUND' });
      }
      return;
    }

    // Round 4: 2 blocks in comparison zone, equivalent
    if (round === 4) {
      const comparisonBlocks = curr.filter((b) => b.position === 'comparison');
      if (comparisonBlocks.length >= 2) {
        for (let i = 0; i < comparisonBlocks.length; i++) {
          for (let j = i + 1; j < comparisonBlocks.length; j++) {
            const a = comparisonBlocks[i]!.fraction;
            const b = comparisonBlocks[j]!.fraction;
            if (a.denominator !== b.denominator && areEquivalent(a, b)) {
              dispatch({
                type: 'TUTOR_RESPONSE',
                content: EXPLORATION_ROUNDS[3]!.celebration,
                isStreaming: false,
              });
              dispatch({ type: 'ADVANCE_ROUND' });
              return;
            }
          }
        }
      }
    }
  }, [
    state.phase,
    state.blocks,
    state.explorationRound,
    state.explorationRoundProgress,
    dispatch,
  ]);
}
