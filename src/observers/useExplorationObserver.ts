/**
 * ENG-016: Exploration phase observer. Tracks discovery goals and fires nudges via Sam.
 */

import { useEffect, useRef } from 'react';
import { areEquivalent } from '../engine/FractionEngine';
import type { LessonState, LessonAction } from '../state/types';
import { explorationConfig } from '../content/exploration-config';

const NUDGES = explorationConfig.nudges;
const TRANSITION_DELAY_MS = explorationConfig.transitionDelayMs;
const CHECK_INTERVAL_MS = explorationConfig.checkIntervalMs;

interface ExplorationObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  sendMessage: (text: string) => void;
  isLoading: boolean;
}

function allGoalsDiscovered(concepts: string[]): boolean {
  return (
    concepts.includes('splitting') &&
    concepts.includes('combining') &&
    concepts.includes('equivalence')
  );
}

export function useExplorationObserver({
  state,
  dispatch,
  sendMessage,
  isLoading,
}: ExplorationObserverOptions): void {
  const statsRef = useRef({
    actionCount: 0,
    consecutiveSplits: 0,
    lastActionTime: 0,
    phaseStartTime: 0,
  });
  const prevBlocksRef = useRef(state.blocks);
  const previousPhaseRef = useRef(state.phase);
  const hasTriggeredTimeoutRef = useRef(false);
  const hasTriggeredCompleteRef = useRef(false);

  useEffect(() => {
    if (state.phase === 'explore') {
      if (previousPhaseRef.current !== 'explore') {
        const now = Date.now();
        statsRef.current.phaseStartTime = now;
        statsRef.current.lastActionTime = now;
        previousPhaseRef.current = 'explore';
      }
    } else {
      previousPhaseRef.current = state.phase;
      hasTriggeredTimeoutRef.current = false;
      hasTriggeredCompleteRef.current = false;
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'explore') return;

    const prev = prevBlocksRef.current;
    const curr = state.blocks;
    prevBlocksRef.current = curr;

    if (prev === curr) return;

    const stats = statsRef.current;
    stats.lastActionTime = Date.now();
    stats.actionCount += 1;

    if (curr.length > prev.length) {
      stats.consecutiveSplits += 1;
      if (!state.conceptsDiscovered.includes('splitting')) {
        dispatch({ type: 'DISCOVER_CONCEPT', concept: 'splitting' });
      }
      if (
        stats.consecutiveSplits >= NUDGES.consecutiveSplitsThreshold &&
        !isLoading
      ) {
        sendMessage(
          '[Student has done 5 consecutive splits without combining. Nudge them to try combining.]'
        );
        stats.consecutiveSplits = 0;
      }
    }

    if (curr.length === prev.length - 1) {
      stats.consecutiveSplits = 0;
      if (!state.conceptsDiscovered.includes('combining')) {
        dispatch({ type: 'DISCOVER_CONCEPT', concept: 'combining' });
      }
    }

    const workspaceBlocks = curr.filter((b) => b.position === 'workspace');
    if (
      workspaceBlocks.length > 0 &&
      workspaceBlocks.every(
        (b) => b.fraction.denominator > NUDGES.overwhelmMinDenominator
      ) &&
      !isLoading
    ) {
      sendMessage(
        '[All blocks have very small pieces (denominator > 8). Student may be overwhelmed. Suggest starting fresh.]'
      );
      dispatch({ type: 'RESET_WORKSPACE' });
    }

    const comparisonBlocks = curr.filter((b) => b.position === 'comparison');
    if (comparisonBlocks.length >= 2 && !state.conceptsDiscovered.includes('equivalence')) {
      for (let i = 0; i < comparisonBlocks.length; i++) {
        for (let j = i + 1; j < comparisonBlocks.length; j++) {
          const a = comparisonBlocks[i]!.fraction;
          const b = comparisonBlocks[j]!.fraction;
          if (
            a.denominator !== b.denominator &&
            areEquivalent(a, b)
          ) {
            dispatch({ type: 'DISCOVER_CONCEPT', concept: 'equivalence' });
            break;
          }
        }
      }
    }
  }, [state.blocks, state.phase, state.conceptsDiscovered, dispatch, sendMessage, isLoading]);

  useEffect(() => {
    if (state.phase !== 'explore') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const stats = statsRef.current;
      const elapsed = now - stats.lastActionTime;
      const phaseElapsed = now - stats.phaseStartTime;
      const concepts = state.conceptsDiscovered;
      const allDone = allGoalsDiscovered(concepts);

      if (
        elapsed > NUDGES.inactivityDelayMs &&
        stats.actionCount < NUDGES.inactivityMinActions &&
        !isLoading
      ) {
        sendMessage(
          '[Student has been inactive for 15 seconds with few actions. Suggest tapping a crystal and pressing Split.]'
        );
        stats.lastActionTime = now;
      }

      if (
        phaseElapsed > NUDGES.phaseTimeoutMs &&
        !allDone &&
        !hasTriggeredTimeoutRef.current
      ) {
        hasTriggeredTimeoutRef.current = true;
        sendMessage(
          '[3 minutes have passed in exploration. Please demonstrate any undiscovered concepts and transition to guided practice.]'
        );
        dispatch({ type: 'PHASE_TRANSITION', to: 'guided' });
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state.phase, state.conceptsDiscovered, dispatch, sendMessage, isLoading]);

  useEffect(() => {
    if (state.phase !== 'explore') return;
    if (!allGoalsDiscovered(state.conceptsDiscovered)) return;
    if (hasTriggeredCompleteRef.current) return;

    hasTriggeredCompleteRef.current = true;
    sendMessage(
      '[Student has discovered all 3 concepts (splitting, combining, equivalence)! Celebrate and transition to guided practice.]'
    );
    const t = setTimeout(() => {
      dispatch({ type: 'PHASE_TRANSITION', to: 'guided' });
    }, TRANSITION_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.conceptsDiscovered, dispatch, sendMessage]);
}
