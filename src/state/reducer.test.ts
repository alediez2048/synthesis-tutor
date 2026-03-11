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
    it('returns one block (1/2) in workspace', () => {
      const state = getInitialLessonState();
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 2 });
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
  });

  describe('PHASE_TRANSITION', () => {
    it('intro -> explore', () => {
      const state = getInitialLessonState();
      const next = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'explore' });
      expect(next.phase).toBe('explore');
    });
    it('explore -> guided', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'explore' });
      state = lessonReducer(state, { type: 'PHASE_TRANSITION', to: 'guided' });
      expect(state.phase).toBe('guided');
    });
    it('guided -> assess -> complete', () => {
      let state = getInitialLessonState();
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

  describe('SPLIT_BLOCK', () => {
    it('splits 1/2 into 2 parts and replaces block with two blocks', () => {
      const state = getInitialLessonState();
      const blockId = state.blocks[0]!.id;
      const next = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId, parts: 2 });
      expect(next.blocks).toHaveLength(2);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 4 });
      expect(next.blocks[1]!.fraction).toEqual({ numerator: 1, denominator: 4 });
      expect(next.nextBlockId).toBe(state.nextBlockId + 2);
    });
    it('rejects split when result denominator > 12', () => {
      const state = getInitialLessonState();
      const blockId = state.blocks[0]!.id;
      // 1/2 split into 7 -> denominator 14
      const next = lessonReducer(state, { type: 'SPLIT_BLOCK', blockId, parts: 7 });
      expect(next.blocks).toHaveLength(1);
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
      state = lessonReducer(state, {
        type: 'SPLIT_BLOCK',
        blockId: state.blocks[0]!.id,
        parts: 2,
      });
      const [idA, idB] = [state.blocks[0]!.id, state.blocks[1]!.id];
      const next = lessonReducer(state, { type: 'COMBINE_BLOCKS', blockIds: [idA, idB] });
      expect(next.blocks).toHaveLength(1);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 2, denominator: 4 });
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

  describe('RESET_WORKSPACE', () => {
    it('replaces blocks with single 1/2 block', () => {
      let state = getInitialLessonState();
      state = lessonReducer(state, {
        type: 'SPLIT_BLOCK',
        blockId: state.blocks[0]!.id,
        parts: 2,
      });
      const next = lessonReducer(state, { type: 'RESET_WORKSPACE' });
      expect(next.blocks).toHaveLength(1);
      expect(next.blocks[0]!.fraction).toEqual({ numerator: 1, denominator: 2 });
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
