/**
 * Guided practice observer: GP-1 through GP-4.
 * Sets up problems, validates answers, runs CFU, triggers re-model on failure.
 */

import { useEffect, useRef } from 'react';
import { areEquivalent, combine } from '../engine/FractionEngine';
import type { LessonState, LessonAction } from '../state/types';
import { GUIDED_PROBLEMS } from '../content/guided-practice-config';
import { GUIDED_DEMO_SCRIPTS } from '../content/guided-demo-scripts';

const CFU_QUESTIONS: { question: string; expectedAnswer: number }[] = [
  {
    question: "If I split 1/2 into 3 pieces, how many pieces will I have?",
    expectedAnswer: 3,
  },
  {
    question: "If I split 1/3 into 2 pieces, how many pieces will I have?",
    expectedAnswer: 2,
  },
  {
    question: "If I combine two 1/4 pieces, what fraction do I get?",
    expectedAnswer: 2, // 2/4 numerator, or we could accept "1/2" - use numeric for simplicity
  },
];

interface GuidedPracticeObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  playPop: () => void;
  playSnap: (pitch?: number) => void;
  playCorrect: () => void;
  playIncorrect: () => void;
}

export function useGuidedPracticeObserver({
  state,
  dispatch,
  playPop,
  playSnap,
  playCorrect,
  playIncorrect,
}: GuidedPracticeObserverOptions): void {
  const prevPhaseRef = useRef(state.phase);
  const prevProblemIndexRef = useRef(state.guidedProblemIndex);
  const hasInitializedRef = useRef(false);
  const prevBlocksRef = useRef(state.blocks);
  const prevChatLengthRef = useRef(state.chatMessages.length);

  function parseCFUAnswer(text: string, expected: number): boolean {
    const normalized = text.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (num === expected) return true;
    const words: Record<number, string> = {
      1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
    };
    const word = words[expected];
    return normalized.includes(String(expected)) || (word !== undefined && normalized.includes(word));
  }

  // Initialize workspace when entering guided
  useEffect(() => {
    if (state.phase !== 'guided') {
      hasInitializedRef.current = false;
      prevPhaseRef.current = state.phase;
      return;
    }
    if (prevPhaseRef.current !== 'guided') {
      hasInitializedRef.current = true;
      dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: 0 });
      const config = GUIDED_PROBLEMS[0];
      if (config) {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: config.prompt,
          isStreaming: false,
        });
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, dispatch]);

  // Set up workspace when advancing to next problem
  useEffect(() => {
    if (state.phase !== 'guided') return;
    if (state.guidedStep !== 'problem') return;

    const idx = state.guidedProblemIndex;
    if (idx !== prevProblemIndexRef.current && idx < GUIDED_PROBLEMS.length) {
      prevProblemIndexRef.current = idx;
      dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: idx });
      const config = GUIDED_PROBLEMS[idx];
      if (config) {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: config.prompt,
          isStreaming: false,
        });
      }
    }
  }, [state.phase, state.guidedProblemIndex, state.guidedStep, dispatch]);

  // Validate workspace actions against current problem
  useEffect(() => {
    if (state.phase !== 'guided') return;
    if (state.guidedStep !== 'problem') return;
    if (state.isDemoActive) return;

    const config = GUIDED_PROBLEMS[state.guidedProblemIndex];
    if (!config) return;

    const prev = prevBlocksRef.current;
    const curr = state.blocks;
    prevBlocksRef.current = curr;

    if (prev === curr) return;

    const workspaceBlocks = curr.filter((b) => b.position === 'workspace');
    const comparisonBlocks = curr.filter((b) => b.position === 'comparison');

    let correct = false;

    if (config.type === 'split') {
      // GP-1: split 1/2 into 2
      if (curr.length === 2 && prev.length === 1) {
        try {
          const combined = combine(workspaceBlocks.map((b) => b.fraction));
          correct = areEquivalent(combined, { numerator: 1, denominator: 2 });
        } catch {
          correct = false;
        }
      }
    } else if (config.type === 'build-equivalent') {
      // GP-2: build equivalent to 1/3
      if (workspaceBlocks.length >= 1) {
        try {
          const result = combine(workspaceBlocks.map((b) => b.fraction));
          const different =
            result.numerator !== 1 || result.denominator !== 3;
          correct =
            areEquivalent(result, { numerator: 1, denominator: 3 }) && different;
        } catch {
          correct = false;
        }
      }
    } else if (config.type === 'compare') {
      // GP-3: both in comparison, equivalent
      if (comparisonBlocks.length >= 2) {
        const [a, b] = comparisonBlocks;
        if (a && b) {
          correct = areEquivalent(a.fraction, b.fraction);
        }
      }
    } else if (config.type === 'simplify') {
      // GP-4: simplify 2/4 to 1/2
      if (workspaceBlocks.length >= 1) {
        try {
          const result = combine(workspaceBlocks.map((b) => b.fraction));
          correct =
            areEquivalent(result, { numerator: 1, denominator: 2 }) &&
            result.denominator < 4;
        } catch {
          correct = false;
        }
      }
    }

    if (correct) {
      playCorrect();
      const cfq = CFU_QUESTIONS[state.guidedProblemIndex];
      if (cfq && state.guidedProblemIndex < 3) {
        dispatch({ type: 'SET_CFU_QUESTION', question: cfq.question, expectedAnswer: cfq.expectedAnswer });
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: cfq.question,
          isStreaming: false,
        });
      } else {
        if (state.guidedProblemIndex >= 3) {
          dispatch({ type: 'PHASE_TRANSITION', to: 'assess' });
        } else {
          dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
        }
      }
    } else if (config.type === 'split' || config.type === 'build-equivalent' || config.type === 'simplify') {
      const newAttempts = state.guidedAttempts + 1;
      dispatch({ type: 'GUIDED_ATTEMPT' });
      if (newAttempts >= 2) {
        const demoScript = GUIDED_DEMO_SCRIPTS[state.guidedProblemIndex];
        if (demoScript) {
          dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
          if (demoScript.type === 'split') {
            const block = curr.find(
              (b) =>
                b.fraction.numerator === demoScript.blockFraction.numerator &&
                b.fraction.denominator === demoScript.blockFraction.denominator
            );
            if (block) {
              dispatch({ type: 'DEMO_SPLIT', blockId: block.id, parts: demoScript.parts });
              playPop();
            }
          } else if (demoScript.type === 'combine') {
            const [f1, f2] = demoScript.fractions;
            const b1 = curr.find((b) => b.fraction.numerator === f1.numerator && b.fraction.denominator === f1.denominator);
            const b2 = curr.find((b) => b.fraction.numerator === f2.numerator && b.fraction.denominator === f2.denominator);
            if (b1 && b2) {
              dispatch({ type: 'DEMO_COMBINE', blockIds: [b1.id, b2.id] });
              playSnap(1);
            }
          }
          setTimeout(() => {
            dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
            dispatch({
              type: 'TUTOR_RESPONSE',
              content: "Let me show you. Now you try!",
              isStreaming: false,
            });
            dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: state.guidedProblemIndex });
          }, 600);
        } else {
          dispatch({
            type: 'TUTOR_RESPONSE',
            content: "Not quite — try again!",
            isStreaming: false,
          });
        }
      } else {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: "Not quite — try again!",
          isStreaming: false,
        });
      }
    }
  }, [
    state.phase,
    state.blocks,
    state.guidedProblemIndex,
    state.guidedStep,
    state.guidedAttempts,
    state.isDemoActive,
    dispatch,
    playCorrect,
    playPop,
    playSnap,
    playIncorrect,
  ]);

  // CFU validation: when student sends message and we're in CFU step
  useEffect(() => {
    if (state.phase !== 'guided' || state.guidedStep !== 'cfu') return;
    if (state.cfuExpectedAnswer === null) return;

    const msgs = state.chatMessages;
    if (msgs.length <= prevChatLengthRef.current) return;
    prevChatLengthRef.current = msgs.length;

    const lastMsg = msgs[msgs.length - 1];
    if (!lastMsg || lastMsg.sender !== 'student') return;

    const correct = parseCFUAnswer(lastMsg.content, state.cfuExpectedAnswer);
    if (correct) {
      playCorrect();
      dispatch({ type: 'CLEAR_CFU' });
      if (state.guidedProblemIndex >= 3) {
        dispatch({ type: 'PHASE_TRANSITION', to: 'assess' });
      } else {
        dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
      }
    } else {
      playIncorrect();
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: "Almost! The answer is " + state.cfuExpectedAnswer + ". Let's move on.",
        isStreaming: false,
      });
      dispatch({ type: 'CLEAR_CFU' });
      if (state.guidedProblemIndex >= 3) {
        dispatch({ type: 'PHASE_TRANSITION', to: 'assess' });
      } else {
        dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
      }
    }
  }, [
    state.phase,
    state.guidedStep,
    state.chatMessages,
    state.cfuExpectedAnswer,
    state.guidedProblemIndex,
    dispatch,
    playCorrect,
    playIncorrect,
  ]);
}
