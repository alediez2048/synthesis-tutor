import { describe, it, expect } from 'vitest';
import {
  getInitialLessonState,
  lessonReducer,
} from './reducer';
import type { LessonState } from './types';

describe('lesson reducer', () => {
  describe('getInitialLessonState', () => {
    it('returns state with phase intro', () => {
      const state = getInitialLessonState();
      expect(state.phase).toBe('intro');
    });
    it('returns one block (1/1 whole) in workspace', () => {
      const state = getInitialLessonState();
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 1 });
      expect(state.blocks[0]!.position).toBe('workspace');
      expect(state.blocks[0]!.isSelected).toBe(false);
    });
    it('returns stepIndex 0, score 0/0, hintCount 0', () => {
      const state = getInitialLessonState();
      expect(state.stepIndex).toBe(0);
      expect(state.score).toEqual({ correct: 0, total: 0 });
      expect(state.hintCount).toBe(0);
    });
    it('returns empty chatMessages, assessmentPool, conceptsDiscovered', () => {
      const state = getInitialLessonState();
      expect(state.chatMessages).toEqual([]);
      expect(state.assessmentPool).toEqual([]);
      expect(state.conceptsDiscovered).toEqual([]);
    });
    it('returns isDragging false, nextBlockId 1', () => {
      const state = getInitialLessonState();
      expect(state.isDragging).toBe(false);
      expect(state.nextBlockId).toBe(1);
    });
    it('returns tutorialComplete false, tutorialStep 0', () => {
      const state = getInitialLessonState();
      expect(state.tutorialComplete).toBe(false);
      expect(state.tutorialStep).toBe(0);
    });
    it('returns explorationRound 1', () => {
      const state = getInitialLessonState();
      expect(state.explorationRound).toBe(1);
    });
  });

  describe('PHASE_TRANSITION', () => {
    it('intro -> tutorial', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      expect(next.phase).toBe('tutorial');
    });
    it('tutorial -> explore -> guided', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'explore' });
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'guided' });
      expect(state.phase).toBe('guided');
    });
    it('guided -> assess -> complete', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'explore' });
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'guided' });
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'assess' });
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'complete' });
      expect(state.phase).toBe('complete');
    });
    it('invalid transition intro -> complete leaves state unchanged', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'complete' });
      expect(next.phase).toBe('intro');
    });
  });

  describe('TUTORIAL_STEP', () => {
    it('updates tutorialStep', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      const next = lessonReducer(state, { type: 'TUTORIAL_STEP', step: 3 });
      expect(next.tutorialStep).toBe(3);
    });
  });

  describe('COMPLETE_TUTORIAL', () => {
    it('sets tutorialComplete, phase explore, tutorialStep 0, explorationRound 1, resets to initial blocks', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, {
        type: 'SPLIT_BLOCK',
        blockId: state.blocks[0]!.id,
        parts: 2,
      });
      const next = lessonReducer(state, { type: 'COMPLETE_TUTORIAL' });
      expect(next.tutorialComplete).toBe(true);
      expect(next.phase).toBe('explore');
      expect(next.tutorialStep).toBe(0);
      expect(next.explorationRound).toBe(1);
      expect(next.blocks).toHaveLength(1);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 1 });
    });
  });

  describe('SPLIT_BLOCK', () => {
    it('splits 1/1 (whole) into 2 parts and replaces block with two halves', () => {
      const state = getInitialLessonState();
      const blockId = state.blocks[0]!.id;
      const next = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId, parts: 2 });
      expect(next.blocks).toHaveLength(2);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 2 });
      expect(next.blocks[1]!.fraction).toEqual({ numerator: 1, denominator: 2 });
      expect(next.nextBlockId).toBe(state.nextBlockId + 2);
    });
    it('rejects split when result denominator > 12', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId: state.blocks[0]!.id, parts: 2 });
      const blockId = state.blocks[0]!.id;
      // 1/2 split into 7 -> denominator 14
      const next = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId, parts: 7 });
      expect(next.blocks).toHaveLength(2);
      expect(next.blocks[0]!.fraction.denominator).toBe(2);
    });
    it('returns state unchanged when blockId not found', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId: 'nonexistent', parts: 2 });
      expect(next).toBe(state);
    });
  });

  describe('COMBINE_BLOCKS', () => {
    it('combines two same-denominator blocks into one', () => {
      let state = getInitialLessonState();
      // Split the 1/1 whole into 2 halves, then split a half into 2 quarters
      state = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId: state.blocks[0]!.id, parts: 2 });
      state = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId: state.blocks[0]!.id, parts: 2 });
      // Now we have 1/4, 1/4, 1/2 — combine the two 1/4s
      const quarters = state.blocks.filter((b) => b.fraction.denominator === 4);
      const [idA, idB] = [quarters[0]!.id, quarters[1]!.id];
      const next = lessonReducer(state, { type: 'COMBINE_BLOCKS', blockIds: [idA, idB] });
      expect(next.blocks).toHaveLength(2); // 2/4 + 1/2
      const combined = next.blocks.find((b) => b.fraction.denominator === 4);
      expect(combined!.fraction).toEqual({ numerator: 2, denominator: 4 });
    });
    it('returns state unchanged when block ids invalid', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, {
        type: 'COMBINE_BLOCKS',
        blockIds: ['no-1', 'no-2'],
      });
      expect(next.blocks).toEqual(state.blocks);
    });
    it('returns state unchanged when denominators differ', () => {
      const state: LessonState = {
        ...getInitialLessonState(),
        blocks: [
          { id: 'b1', fraction: { numerator: 1, denominator: 2 }, color: '#4A90D9', position: 'workspace', isSelected: false },
          { id: 'b2', fraction: { numerator: 1, denominator: 3 }, color: '#27AE60', position: 'workspace', isSelected: false },
        ],
        nextBlockId: 3,
        explorationRound: 1,
      };
      const next = lessonReducer(state, { type: 'COMBINE_BLOCKS', blockIds: ['b1', 'b2'] });
      expect(next.blocks).toHaveLength(2);
      expect(next.blocks).toEqual(state.blocks);
    });
  });

  describe('COMPARE_BLOCKS', () => {
    it('moves two blocks to comparison position', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, {
        type: 'SPLIT_BLOCK',
        blockId: state.blocks[0]!.id,
        parts: 2,
      });
      const [idA, idB] = [state.blocks[0]!.id, state.blocks[1]!.id];
      const next = lessonReducer(state, { type: 'COMPARE_BLOCKS', blockIds: [idA, idB] });
      expect(next.blocks.every((b) => b.position === 'comparison')).toBe(true);
    });
  });

  describe('STUDENT_RESPONSE', () => {
    it('appends student message to chatMessages', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'STUDENT_RESPONSE', value: '2/4' });
      expect(next.chatMessages).toHaveLength(1);
      expect(next.chatMessages[0]!.sender).toBe('student');
      expect(next.chatMessages[0]!.content).toBe('2/4');
    });
  });

  describe('ADVANCE_SCRIPT', () => {
    it('increments stepIndex', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'ADVANCE_SCRIPT' });
      expect(next.stepIndex).toBe(1);
    });
  });

  describe('REQUEST_HINT', () => {
    it('increments hintCount', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'REQUEST_HINT' });
      expect(next.hintCount).toBe(1);
    });
  });

  describe('ADD_BLOCK', () => {
    it('adds a block with the given fraction', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'ADD_BLOCK', fraction: { numerator: 2, denominator: 4 } });
      expect(next.blocks).toHaveLength(2);
      expect(next.blocks[1]!.fraction).toEqual({ numerator: 2, denominator: 4 });
    });
    it('does nothing when blocks.length >= 8', () => {
      const state = getInitialLessonState();
      let s = state;
      for (let i = 0; i < 7; i++) {
        s = lessonReducer(s, { type: 'ADD_BLOCK', fraction: { numerator: 1, denominator: 2 } });
      }
      expect(s.blocks).toHaveLength(8);
      const next = lessonReducer(s, { type: 'ADD_BLOCK', fraction: { numerator: 1, denominator: 3 } });
      expect(next.blocks).toHaveLength(8);
    });
  });

  describe('RESET_WORKSPACE', () => {
    it('replaces blocks with lesson initial blocks', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, {
        type: 'SPLIT_BLOCK',
        blockId: state.blocks[0]!.id,
        parts: 2,
      });
      const next = lessonReducer(state, { type: 'RESET_WORKSPACE' });
      expect(next.blocks).toHaveLength(1);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 1 });
    });
  });

  describe('SELECT_BLOCK', () => {
    it('sets selected block and deselects others', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, {
        type: 'SPLIT_BLOCK',
        blockId: state.blocks[0]!.id,
        parts: 2,
      });
      const firstId = state.blocks[0]!.id;
      const next = lessonReducer(state, { type: 'SELECT_BLOCK', blockId: firstId });
      const selected = next.blocks.find((b) => b.isSelected);
      expect(selected?.id).toBe(firstId);
      expect(next.blocks.filter((b) => b.isSelected)).toHaveLength(1);
    });
  });

  describe('DESELECT_ALL', () => {
    it('clears all selection', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'SELECT_BLOCK', blockId: state.blocks[0]!.id });
      const next = lessonReducer(state, { type: 'DESELECT_ALL' });
      expect(next.blocks.every((b) => !b.isSelected)).toBe(true);
    });
  });

  describe('DRAG_START / DRAG_END', () => {
    it('sets isDragging true on DRAG_START', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'DRAG_START', blockId: state.blocks[0]!.id });
      expect(next.isDragging).toBe(true);
    });
    it('sets isDragging false on DRAG_END', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'DRAG_START', blockId: state.blocks[0]!.id });
      const next = lessonReducer(state, { type: 'DRAG_END' });
      expect(next.isDragging).toBe(false);
    });
  });

  describe('SET_LOADING', () => {
    it('sets isLoading', () => {
      const state = getInitialLessonState();
      expect(lessonReducer(state, { type: 'SET_LOADING', loading: true }).isLoading).toBe(true);
      expect(lessonReducer(state, { type: 'SET_LOADING', loading: false }).isLoading).toBe(false);
    });
  });

  describe('DISCOVER_CONCEPT', () => {
    it('adds concept to conceptsDiscovered once', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'DISCOVER_CONCEPT', concept: 'splitting' });
      expect(next.conceptsDiscovered).toEqual(['splitting']);
      const next2 = lessonReducer(next, { type: 'DISCOVER_CONCEPT', concept: 'splitting' });
      expect(next2.conceptsDiscovered).toEqual(['splitting']);
    });
    it('appends new concepts', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'DISCOVER_CONCEPT', concept: 'splitting' });
      state = lessonReducer(state, { type: 'DISCOVER_CONCEPT', concept: 'combining' });
      expect(state.conceptsDiscovered).toEqual(['splitting', 'combining']);
    });
  });

  describe('ADVANCE_ROUND', () => {
    it('returns state unchanged when phase is not explore', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      expect(next.phase).toBe('intro');
      expect(next.explorationRound).toBe(1);
    });
    it('round 1 -> 2: keeps blocks and stores round1SplitParts', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, { type: 'COMPLETE_TUTORIAL' });
      state = lessonReducer(state, {
        type: 'SPLIT_BLOCK',
        blockId: state.blocks[0]!.id,
        parts: 4,
      });
      expect(state.explorationRound).toBe(1);
      expect(state.blocks).toHaveLength(4);
      const next = lessonReducer(state, { type: 'ADVANCE_ROUND', round1SplitParts: 4 });
      expect(next.explorationRound).toBe(2);
      expect(next.blocks).toHaveLength(4);
      expect(next.explorationRoundProgress?.round1SplitParts).toBe(4);
    });
    it('round 2 -> 3: keeps blocks unchanged (round 2 = combine, round 3 = split differently)', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, { type: 'COMPLETE_TUTORIAL' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND', round1SplitParts: 2 });
      const blockCount = state.blocks.length;
      const next = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      expect(next.explorationRound).toBe(3);
      expect(next.blocks).toHaveLength(blockCount);
    });
    it('round 3 -> 4: resets blocks to 1/2 and 2/4', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, { type: 'COMPLETE_TUTORIAL' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND', round1SplitParts: 2 });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      const next = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      expect(next.explorationRound).toBe(4);
      expect(next.blocks).toHaveLength(2);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 2 });
      expect(next.blocks[1]!.fraction).toEqual({ numerator: 2, denominator: 4 });
    });
    it('round 5 -> guided: transitions to guided phase with blocks from first problem', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, { type: 'COMPLETE_TUTORIAL' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND', round1SplitParts: 2 });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      expect(state.explorationRound).toBe(5);
      const next = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      expect(next.phase).toBe('guided');
      expect(next.explorationRound).toBe(1);
      expect(next.guidedProblemIndex).toBe(0);
      expect(next.guidedPrompt).toBeTruthy();
    });
  });

  describe('SKIP_TO_GUIDED', () => {
    it('transitions from explore to guided phase with blocks from first problem', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'COMPLETE_INTRO' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND', round1SplitParts: 2 });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      expect(state.phase).toBe('explore');
      expect(state.explorationRound).toBe(4);
      const next = lessonReducer(state, { type: 'SKIP_TO_GUIDED' });
      expect(next.phase).toBe('guided');
      expect(next.guidedProblemIndex).toBe(0);
      expect(next.guidedPrompt).toBeTruthy();
      expect(next.blocks.length).toBeGreaterThan(0);
    });
    it('returns state unchanged when phase is not explore', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'SKIP_TO_GUIDED' });
      expect(next.phase).toBe('intro');
    });
  });

  describe('DEMO_SPLIT and COMPLETE_INTRO', () => {
    it('DEMO_SPLIT splits block and sets isDemoActive', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'DEMO_SPLIT', blockId: 'block-0', parts: 2 });
      expect(next.blocks).toHaveLength(2);
      expect(next.isDemoActive).toBe(true);
    });
    it('COMPLETE_INTRO transitions to explore with lesson initial blocks', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'COMPLETE_INTRO' });
      expect(next.phase).toBe('explore');
      expect(next.blocks).toHaveLength(1);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 1 });
    });
  });

  describe('INIT_GUIDED_PROBLEM', () => {
    it('sets up GP-1 blocks (one 1/2)', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'tutorial' });
      state = lessonReducer(state, { type: 'COMPLETE_TUTORIAL' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND', round1SplitParts: 2 });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      state = lessonReducer(state, { type: 'ADVANCE_ROUND' });
      const next = lessonReducer(state, { type: 'INIT_GUIDED_PROBLEM', problemIndex: 0 });
      expect(next.blocks).toHaveLength(1);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 2 });
      expect(next.guidedProblemIndex).toBe(0);
      expect(next.guidedStep).toBe('problem');
    });
  });

  describe('TUTOR_RESPONSE', () => {
    it('appends or updates tutor message; streaming sets isStreaming true', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, {
        type: 'TUTOR_RESPONSE',
        content: 'Hello!',
        isStreaming: true,
      });
      expect(next.chatMessages).toHaveLength(1);
      expect(next.chatMessages[0]!.sender).toBe('tutor');
      expect(next.chatMessages[0]!.content).toBe('Hello!');
      expect(next.isStreaming).toBe(true);
    });
    it('final message sets isStreaming false', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, {
        type: 'TUTOR_RESPONSE',
        content: 'Hi',
        isStreaming: true,
      });
      const next = lessonReducer(state, {
        type: 'TUTOR_RESPONSE',
        content: 'Hi there!',
        isStreaming: false,
      });
      expect(next.chatMessages).toHaveLength(1);
      expect(next.chatMessages[0]!.content).toBe('Hi there!');
      expect(next.isStreaming).toBe(false);
    });
  });
});
