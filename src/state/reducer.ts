/**
 * Lesson state reducer — single source of truth for lesson state.
 * Pure function: (state, action) => newState. No side effects.
 */

import { split, combine, isValidFraction } from '../engine/FractionEngine';
import type { Fraction } from '../engine/FractionEngine';
import type {
  LessonState,
  LessonAction,
  FractionBlock,
  Phase,
} from './types';

const PHASE_ORDER: Phase[] = ['intro', 'explore', 'guided', 'assess', 'complete'];

function getNextPhase(current: Phase): Phase | null {
  const i = PHASE_ORDER.indexOf(current);
  return i >= 0 && i < PHASE_ORDER.length - 1 ? PHASE_ORDER[i + 1]! : null;
}

function isValidPhaseTransition(from: Phase, to: Phase): boolean {
  const next = getNextPhase(from);
  return next === to;
}

const DENOMINATOR_COLORS: Record<number, string> = {
  2: '#4A90D9',
  3: '#27AE60',
  4: '#8E44AD',
  6: '#E67E22',
  8: '#16A085',
  12: '#E84393',
};

const DEFAULT_BLOCK_COLOR = '#95a5a6';

export function getColorForDenominator(denominator: number): string {
  return DENOMINATOR_COLORS[denominator] ?? DEFAULT_BLOCK_COLOR;
}

function createBlock(
  id: string,
  fraction: Fraction,
  position: FractionBlock['position'],
  isSelected: boolean
): FractionBlock {
  return {
    id,
    fraction,
    color: getColorForDenominator(fraction.denominator),
    position,
    isSelected,
  };
}

export function getInitialLessonState(): LessonState {
  const initialBlock = createBlock('block-0', { numerator: 1, denominator: 2 }, 'workspace', false);
  return {
    phase: 'intro',
    stepIndex: 0,
    blocks: [initialBlock],
    score: { correct: 0, total: 0 },
    hintCount: 0,
    chatMessages: [],
    assessmentPool: [],
    assessmentStep: 0,
    assessmentAttempts: 0,
    assessmentResults: [],
    conceptsDiscovered: [],
    isDragging: false,
    nextBlockId: 1,
    isLoading: false,
    isStreaming: false,
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

    case 'SPLIT_BLOCK': {
      const { blockId, parts } = action;
      const block = state.blocks.find((b) => b.id === blockId);
      if (!block || block.position !== 'workspace') return state;
      let pieces: Fraction[];
      try {
        pieces = split(block.fraction, parts);
      } catch {
        return state;
      }
      if (pieces.some((p) => p.denominator > 12)) return state;
      const startId = state.nextBlockId;
      const newBlocks: FractionBlock[] = pieces.map((fraction, i) =>
        createBlock(`block-${startId + i}`, fraction, 'workspace', false)
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
      const initialBlock = createBlock(
        `block-${state.nextBlockId}`,
        { numerator: 1, denominator: 2 },
        'workspace',
        false
      );
      return {
        ...state,
        blocks: [initialBlock],
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
      const GP3_STEP = 2;
      return {
        ...state,
        phase: 'guided',
        stepIndex: GP3_STEP,
        assessmentStep: 0,
        assessmentAttempts: 0,
        assessmentResults: [],
        assessmentPool: [],
      };
    }

    case 'RESTART_LESSON': {
      const exploreBlock = createBlock(
        `block-${state.nextBlockId}`,
        { numerator: 1, denominator: 2 },
        'workspace',
        false
      );
      return {
        ...state,
        phase: 'explore',
        stepIndex: 0,
        blocks: [exploreBlock],
        score: { correct: 0, total: 0 },
        assessmentPool: [],
        assessmentStep: 0,
        assessmentAttempts: 0,
        assessmentResults: [],
        nextBlockId: state.nextBlockId + 1,
      };
    }

    case 'FULL_RESET':
      return getInitialLessonState();

    default: {
      const _exhaust: never = action;
      void _exhaust;
      return state;
    }
  }
};
