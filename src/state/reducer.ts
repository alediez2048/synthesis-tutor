/**
 * Lesson state reducer — single source of truth for lesson state.
 * Pure function: (state, action) => newState. No side effects.
 */

import { split, combine, isValidFraction, addFractions } from '../engine/FractionEngine';
import type { Fraction } from '../engine/FractionEngine';
import type {
  LessonState,
  LessonAction,
  FractionBlock,
  Phase,
} from './types';
import { getInitialBlocks, getLesson, getLessonWorkspaceActions } from '../content/curriculum';

const PHASE_ORDER: Phase[] = ['intro', 'tutorial', 'explore', 'guided', 'assess', 'complete'];

function getNextPhase(current: Phase): Phase | null {
  const i = PHASE_ORDER.indexOf(current);
  return i >= 0 && i < PHASE_ORDER.length - 1 ? PHASE_ORDER[i + 1]! : null;
}

function isValidPhaseTransition(from: Phase, to: Phase): boolean {
  const next = getNextPhase(from);
  return next === to;
}

import { createBlock, getColorForDenominator } from '../utils/blockUtils';

export { getColorForDenominator };

export function getInitialLessonState(lessonId: string = 'fractions-101'): LessonState {
  const initialBlocks = getInitialBlocks(lessonId, 0);
  return {
    lessonId,
    phase: 'intro',
    stepIndex: 0,
    blocks: initialBlocks,
    score: { correct: 0, total: 0 },
    hintCount: 0,
    chatMessages: [],
    assessmentPool: [],
    assessmentStep: 0,
    assessmentAttempts: 0,
    assessmentResults: [],
    conceptsDiscovered: [],
    explorationRound: 1,
    isDragging: false,
    nextBlockId: initialBlocks.length,
    isLoading: false,
    isStreaming: false,
    tutorialComplete: false,
    tutorialStep: 0,
    isDemoActive: false,
    guidedProblemIndex: 0,
    guidedStep: 'problem',
    guidedAttempts: 0,
    cfuQuestion: null,
    cfuExpectedAnswer: null,
  };
}

export type LessonReducer = (state: LessonState, action: LessonAction) => LessonState;

export const lessonReducer: LessonReducer = (state, action) => {
  switch (action.type) {
    case 'PHASE_TRANSITION': {
      if (!isValidPhaseTransition(state.phase, action.to)) {
        return state;
      }
      return { ...state, phase: action.to };
    }

    case 'TUTORIAL_STEP': {
      return { ...state, tutorialStep: action.step };
    }

    case 'COMPLETE_TUTORIAL': {
      const initialBlocks = getInitialBlocks(state.lessonId, state.nextBlockId);
      return {
        ...state,
        tutorialComplete: true,
        phase: 'explore',
        tutorialStep: 0,
        explorationRound: 1,
        blocks: initialBlocks,
        nextBlockId: state.nextBlockId + initialBlocks.length,
      };
    }

    case 'SET_DEMO_ACTIVE':
      return { ...state, isDemoActive: action.active };

    case 'DEMO_SPLIT': {
      const { blockId, parts } = action;
      const block = state.blocks.find((b) => b.id === blockId);
      if (!block) return state;
      let pieces: Fraction[];
      try {
        pieces = split(block.fraction, parts);
      } catch {
        return state;
      }
      if (pieces.some((p) => p.denominator > 12)) return state;
      const startId = state.nextBlockId;
      const newBlocks: FractionBlock[] = pieces.map((fraction, i) =>
        createBlock(`block-${startId + i}`, fraction, block.position, false)
      );
      const rest = state.blocks.filter((b) => b.id !== blockId);
      return {
        ...state,
        blocks: [...rest, ...newBlocks],
        nextBlockId: state.nextBlockId + pieces.length,
        isDemoActive: true,
      };
    }

    case 'DEMO_COMBINE': {
      const [idA, idB] = action.blockIds;
      const blockA = state.blocks.find((b) => b.id === idA);
      const blockB = state.blocks.find((b) => b.id === idB);
      if (!blockA || !blockB || blockA.fraction.denominator !== blockB.fraction.denominator)
        return state;
      let combined: Fraction;
      try {
        combined = combine([blockA.fraction, blockB.fraction]);
      } catch {
        return state;
      }
      if (!isValidFraction(combined)) return state;
      const newBlock = createBlock(
        `block-${state.nextBlockId}`,
        combined,
        'workspace',
        false
      );
      const rest = state.blocks.filter((b) => b.id !== idA && b.id !== idB);
      return {
        ...state,
        blocks: [...rest, newBlock],
        nextBlockId: state.nextBlockId + 1,
        isDemoActive: true,
      };
    }

    case 'COMPLETE_INTRO': {
      const initialBlocks = getInitialBlocks(state.lessonId, state.nextBlockId);
      return {
        ...state,
        phase: 'explore',
        blocks: initialBlocks,
        nextBlockId: state.nextBlockId + initialBlocks.length,
        explorationRound: 1,
      };
    }

    case 'SPLIT_BLOCK': {
      const { blockId, parts } = action;
      const block = state.blocks.find((b) => b.id === blockId);
      if (!block) return state;
      let pieces: Fraction[];
      try {
        pieces = split(block.fraction, parts);
      } catch {
        return state;
      }
      if (pieces.some((p) => p.denominator > 12)) return state;
      const startId = state.nextBlockId;
      // New pieces inherit the parent block's position (workspace or comparison)
      const newBlocks: FractionBlock[] = pieces.map((fraction, i) =>
        createBlock(`block-${startId + i}`, fraction, block.position, false)
      );
      const rest = state.blocks.filter((b) => b.id !== blockId);
      return {
        ...state,
        blocks: [...rest, ...newBlocks],
        nextBlockId: state.nextBlockId + pieces.length,
      };
    }

    case 'COMBINE_BLOCKS': {
      const [idA, idB] = action.blockIds;
      const blockA = state.blocks.find((b) => b.id === idA);
      const blockB = state.blocks.find((b) => b.id === idB);
      if (!blockA || !blockB || blockA.fraction.denominator !== blockB.fraction.denominator)
        return state;
      let combined: Fraction;
      try {
        combined = combine([blockA.fraction, blockB.fraction]);
      } catch {
        return state;
      }
      if (!isValidFraction(combined)) return state;
      const newBlock = createBlock(
        `block-${state.nextBlockId}`,
        combined,
        'workspace',
        false
      );
      const rest = state.blocks.filter((b) => b.id !== idA && b.id !== idB);
      return {
        ...state,
        blocks: [...rest, newBlock],
        nextBlockId: state.nextBlockId + 1,
      };
    }

    case 'COMPARE_BLOCKS': {
      const [idA, idB] = action.blockIds;
      const set = new Set([idA, idB]);
      const blocks = state.blocks.map((b) =>
        set.has(b.id) ? { ...b, position: 'comparison' as const } : b
      );
      return { ...state, blocks };
    }

    case 'STUDENT_RESPONSE': {
      const msgId = `msg-${state.nextBlockId}-${state.chatMessages.length}`;
      const newMsg = {
        id: msgId,
        sender: 'student' as const,
        content: action.value,
      };
      return {
        ...state,
        chatMessages: [...state.chatMessages, newMsg],
      };
    }

    case 'ADVANCE_SCRIPT':
      return { ...state, stepIndex: state.stepIndex + 1 };

    case 'REQUEST_HINT':
      return { ...state, hintCount: state.hintCount + 1 };

    case 'RESET_WORKSPACE': {
      const initialBlocks = getInitialBlocks(state.lessonId, state.nextBlockId);
      return {
        ...state,
        blocks: initialBlocks,
        nextBlockId: state.nextBlockId + initialBlocks.length,
      };
    }

    case 'ADD_BLOCK': {
      if (!isValidFraction(action.fraction)) return state;
      if (state.blocks.length >= 8) return state;
      const newBlock = createBlock(
        `block-${state.nextBlockId}`,
        action.fraction,
        'workspace',
        false
      );
      return {
        ...state,
        blocks: [...state.blocks, newBlock],
        nextBlockId: state.nextBlockId + 1,
      };
    }

    case 'RESET_ASSESSMENT_WORKSPACE': {
      const whole = createBlock(
        `block-${state.nextBlockId}`,
        { numerator: 1, denominator: 1 },
        'workspace',
        false
      );
      return {
        ...state,
        blocks: [whole],
        nextBlockId: state.nextBlockId + 1,
      };
    }

    case 'SELECT_BLOCK': {
      const MAX_ADD_SELECT = 2;
      const actions = getLessonWorkspaceActions(state.lessonId);
      const hasAddAction = actions.includes('add');
      const currentlySelected = state.blocks.filter((b) => b.isSelected);
      const tappedBlock = state.blocks.find((b) => b.id === action.blockId);

      if (!tappedBlock) return state;

      if (hasAddAction && currentlySelected.length >= 1 && currentlySelected.length <= MAX_ADD_SELECT) {
        const isTappedSelected = tappedBlock.isSelected;
        if (isTappedSelected) {
          const blocks = state.blocks.map((b) => ({
            ...b,
            isSelected: b.id === action.blockId ? false : b.isSelected,
          }));
          return { ...state, blocks };
        }
        if (currentlySelected.length === MAX_ADD_SELECT) {
          const [keep] = currentlySelected;
          const blocks = state.blocks.map((b) => ({
            ...b,
            isSelected: b.id === keep!.id || b.id === action.blockId,
          }));
          return { ...state, blocks };
        }
        const blocks = state.blocks.map((b) => ({
          ...b,
          isSelected: b.id === action.blockId || b.isSelected,
        }));
        return { ...state, blocks };
      }

      const blocks = state.blocks.map((b) => ({
        ...b,
        isSelected: b.id === action.blockId,
      }));
      return { ...state, blocks };
    }

    case 'DESELECT_ALL': {
      const blocks = state.blocks.map((b) => ({ ...b, isSelected: false }));
      return { ...state, blocks };
    }

    case 'DRAG_START':
      return { ...state, isDragging: true };

    case 'DRAG_END':
      return { ...state, isDragging: false };

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };

    case 'TUTOR_RESPONSE': {
      const msgs = [...state.chatMessages];
      const lastMsg = msgs[msgs.length - 1];
      if (action.isStreaming) {
        if (lastMsg && lastMsg.sender === 'tutor') {
          msgs[msgs.length - 1] = { ...lastMsg, content: action.content };
        } else {
          msgs.push({
            id: `msg-tutor-${Date.now()}`,
            sender: 'tutor',
            content: action.content,
          });
        }
        return { ...state, chatMessages: msgs, isStreaming: true };
      }
      if (lastMsg && lastMsg.sender === 'tutor') {
        msgs[msgs.length - 1] = { ...lastMsg, content: action.content };
      } else if (action.content) {
        msgs.push({
          id: `msg-tutor-${Date.now()}`,
          sender: 'tutor',
          content: action.content,
        });
      }
      return { ...state, chatMessages: msgs, isStreaming: false };
    }

    case 'DISCOVER_CONCEPT': {
      if (state.conceptsDiscovered.includes(action.concept)) return state;
      return {
        ...state,
        conceptsDiscovered: [...state.conceptsDiscovered, action.concept],
      };
    }

    case 'INIT_ASSESSMENT': {
      const pool = action.pool;
      const first = pool[0];
      const blocks =
        first && 'startingBlock' in first
          ? [createBlock(`block-${state.nextBlockId}`, first.startingBlock, 'workspace', false)]
          : first && 'requiredCount' in first
            ? [createBlock(`block-${state.nextBlockId}`, { numerator: 1, denominator: 1 }, 'workspace', false)]
            : state.blocks;
      return {
        ...state,
        assessmentPool: pool,
        assessmentStep: 0,
        assessmentAttempts: 0,
        assessmentResults: [],
        blocks: blocks as FractionBlock[],
        nextBlockId: state.nextBlockId + (blocks !== state.blocks ? 1 : 0),
      };
    }

    case 'ASSESSMENT_ANSWER': {
      const { correct } = action;
      const newAttempts = state.assessmentAttempts + 1;
      const problem = state.assessmentPool[state.assessmentStep] as
        | { maxAttempts?: number }
        | undefined;
      const maxAttempts = problem?.maxAttempts ?? 2;
      const atMax = newAttempts >= maxAttempts;
      const doneWithProblem = correct || atMax;
      const newScore = {
        correct: state.score.correct + (correct ? 1 : 0),
        total: state.score.total + (doneWithProblem ? 1 : 0),
      };
      const newResults = doneWithProblem
        ? [...state.assessmentResults, correct]
        : state.assessmentResults;
      return {
        ...state,
        assessmentAttempts: newAttempts,
        score: newScore,
        assessmentResults: newResults,
      };
    }

    case 'ADVANCE_ASSESSMENT': {
      const newStep = state.assessmentStep + 1;
      const nextProblem = state.assessmentPool[newStep];
      const blocks =
        nextProblem && 'startingBlock' in nextProblem
          ? [createBlock(`block-${state.nextBlockId}`, nextProblem.startingBlock, 'workspace', false)]
          : nextProblem && 'requiredCount' in nextProblem
            ? [createBlock(`block-${state.nextBlockId}`, { numerator: 1, denominator: 1 }, 'workspace', false)]
            : state.blocks;
      if (newStep >= state.assessmentPool.length) {
        return {
          ...state,
          assessmentStep: newStep,
          assessmentAttempts: 0,
          phase: 'complete',
        };
      }
      return {
        ...state,
        assessmentStep: newStep,
        assessmentAttempts: 0,
        blocks: blocks as FractionBlock[],
        nextBlockId: state.nextBlockId + (blocks !== state.blocks ? 1 : 0),
      };
    }

    case 'RETRY_MISSED': {
      const missed = state.assessmentPool.filter(
        (_, i) => state.assessmentResults[i] === false
      );
      if (missed.length === 0) return state;
      const first = missed[0];
      const blocks =
        first && 'startingBlock' in first
          ? [createBlock(`block-${state.nextBlockId}`, first.startingBlock, 'workspace', false)]
          : first && 'requiredCount' in first
            ? [createBlock(`block-${state.nextBlockId}`, { numerator: 1, denominator: 1 }, 'workspace', false)]
            : state.blocks;
      return {
        ...state,
        assessmentPool: missed,
        assessmentStep: 0,
        assessmentAttempts: 0,
        assessmentResults: [],
        phase: 'assess',
        blocks: blocks as FractionBlock[],
        nextBlockId: state.nextBlockId + (blocks !== state.blocks ? 1 : 0),
      };
    }

    case 'LOOP_TO_PRACTICE': {
      const lesson = getLesson(state.lessonId);
      const midPoint = lesson ? Math.max(0, Math.floor(lesson.guidedProblems.length / 2)) : 2;
      return {
        ...state,
        phase: 'guided',
        stepIndex: midPoint,
        guidedProblemIndex: midPoint,
        guidedStep: 'problem',
        guidedAttempts: 0,
        cfuQuestion: null,
        cfuExpectedAnswer: null,
        assessmentStep: 0,
        assessmentAttempts: 0,
        assessmentResults: [],
        assessmentPool: [],
      };
    }

    case 'RESTART_LESSON': {
      const initialBlocks = getInitialBlocks(state.lessonId, state.nextBlockId);
      return {
        ...state,
        phase: 'explore',
        stepIndex: 0,
        blocks: initialBlocks,
        score: { correct: 0, total: 0 },
        assessmentPool: [],
        assessmentStep: 0,
        assessmentAttempts: 0,
        assessmentResults: [],
        explorationRound: 1,
        explorationRoundProgress: undefined,
        nextBlockId: state.nextBlockId + initialBlocks.length,
      };
    }

    case 'RETURN_TO_WORKSPACE': {
      const block = state.blocks.find((b) => b.id === action.blockId);
      if (!block || block.position !== 'comparison') return state;
      const blocks = state.blocks.map((b) =>
        b.id === action.blockId ? { ...b, position: 'workspace' as const, isSelected: false } : b
      );
      return { ...state, blocks };
    }

    case 'FULL_RESET':
      return getInitialLessonState(state.lessonId);

    case 'SET_GUIDED_PROBLEM':
      return {
        ...state,
        guidedProblemIndex: action.index,
        guidedStep: action.step,
        guidedAttempts: 0,
      };

    case 'GUIDED_ATTEMPT':
      return { ...state, guidedAttempts: state.guidedAttempts + 1 };

    case 'ADVANCE_GUIDED_PROBLEM':
      return {
        ...state,
        guidedProblemIndex: state.guidedProblemIndex + 1,
        guidedStep: 'problem',
        guidedAttempts: 0,
        cfuQuestion: null,
        cfuExpectedAnswer: null,
      };

    case 'SET_CFU_QUESTION':
      return {
        ...state,
        guidedStep: 'cfu',
        cfuQuestion: action.question,
        cfuExpectedAnswer: action.expectedAnswer,
      };

    case 'CLEAR_CFU':
      return {
        ...state,
        cfuQuestion: null,
        cfuExpectedAnswer: null,
      };

    case 'RESET_GUIDED_WORKSPACE':
      return {
        ...state,
        blocks: action.blocks,
      };

    case 'INIT_GUIDED_PROBLEM': {
      const lesson = getLesson(state.lessonId);
      const config = lesson?.guidedProblems[action.problemIndex];
      if (!config) return state;
      const nextId = state.nextBlockId;
      const blocks: FractionBlock[] = config.setup.map((fraction, i) =>
        createBlock(`block-${nextId + i}`, fraction, 'workspace', false)
      );
      return {
        ...state,
        blocks,
        nextBlockId: nextId + blocks.length,
        guidedProblemIndex: action.problemIndex,
        guidedStep: 'problem',
        guidedAttempts: 0,
        cfuQuestion: null,
        cfuExpectedAnswer: null,
      };
    }

    case 'SKIP_TO_GUIDED': {
      if (state.phase !== 'explore') return state;
      return {
        ...state,
        phase: 'guided',
        explorationRound: 1,
        guidedProblemIndex: 0,
        guidedStep: 'problem',
        guidedAttempts: 0,
        cfuQuestion: null,
        cfuExpectedAnswer: null,
      };
    }

    case 'ADVANCE_ROUND': {
      if (state.phase !== 'explore') return state;
      const lesson = getLesson(state.lessonId);
      const rounds = lesson?.explorationRounds ?? [];
      const round = state.explorationRound;
      if (round >= rounds.length) {
        return {
          ...state,
          phase: 'guided',
          explorationRound: 1,
          guidedProblemIndex: 0,
          guidedStep: 'problem',
          guidedAttempts: 0,
          cfuQuestion: null,
          cfuExpectedAnswer: null,
        };
      }
      const nextRound = round + 1;
      let blocks = state.blocks;
      let nextBlockId = state.nextBlockId;
      let explorationRoundProgress = state.explorationRoundProgress;

      if (round === 1) {
        if (action.round1SplitParts !== undefined) {
          explorationRoundProgress = { round1SplitParts: action.round1SplitParts };
        }
      }

      // Use startingBlocks from the NEXT round config if defined
      const nextRoundConfig = rounds[nextRound - 1];
      if (nextRoundConfig?.startingBlocks) {
        blocks = nextRoundConfig.startingBlocks.map((fraction, i) =>
          createBlock(`block-${nextBlockId + i}`, fraction, 'workspace', false)
        );
        nextBlockId += blocks.length;
      }

      return {
        ...state,
        explorationRound: nextRound,
        explorationRoundProgress,
        blocks,
        nextBlockId,
      };
    }

    case 'ADD_BLOCKS': {
      const [idA, idB] = action.blockIds;
      const blockA = state.blocks.find((b) => b.id === idA);
      const blockB = state.blocks.find((b) => b.id === idB);
      if (!blockA || !blockB) return state;
      let sum: Fraction;
      try {
        sum = addFractions(blockA.fraction, blockB.fraction);
      } catch {
        return state;
      }
      if (!isValidFraction(sum)) return state;
      const newBlock = createBlock(
        `block-${state.nextBlockId}`,
        sum,
        'workspace',
        false
      );
      const rest = state.blocks.filter((b) => b.id !== idA && b.id !== idB);
      return {
        ...state,
        blocks: [...rest, newBlock],
        nextBlockId: state.nextBlockId + 1,
      };
    }

    case 'START_LESSON': {
      const lesson = getLesson(action.lessonId);
      if (!lesson) return state;
      const initialBlocks = getInitialBlocks(action.lessonId, 0);
      return {
        ...state,
        lessonId: action.lessonId,
        phase: 'intro',
        stepIndex: 0,
        blocks: initialBlocks,
        score: { correct: 0, total: 0 },
        hintCount: 0,
        chatMessages: [],
        assessmentPool: [],
        assessmentStep: 0,
        assessmentAttempts: 0,
        assessmentResults: [],
        conceptsDiscovered: [],
        explorationRound: 1,
        explorationRoundProgress: undefined,
        isDragging: false,
        nextBlockId: initialBlocks.length,
        isLoading: false,
        isStreaming: false,
        tutorialComplete: false,
        tutorialStep: 0,
        isDemoActive: false,
        guidedProblemIndex: 0,
        guidedStep: 'problem',
        guidedAttempts: 0,
        cfuQuestion: null,
        cfuExpectedAnswer: null,
      };
    }

    default: {
      const _exhaust: never = action;
      void _exhaust;
      return state;
    }
  }
};
