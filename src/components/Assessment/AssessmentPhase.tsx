/**
 * ENG-021: Assessment phase orchestrator.
 * Renders the correct sub-component based on current problem type.
 */

import type { AssessmentProblem } from '../../state/types';
import type { LessonAction } from '../../state/types';
import type { FractionBlock } from '../../state/types';
import { MultipleChoice } from './MultipleChoice';
import { ConstructionTask } from './ConstructionTask';
import { GeneralizationTask } from './GeneralizationTask';
import { COLORS } from '../../theme';

export interface AssessmentPhaseProps {
  pool: AssessmentProblem[];
  step: number;
  attempts: number;
  score: { correct: number; total: number };
  blocks: FractionBlock[];
  selectedBlockId: string | null;
  nextBlockId: number;
  isDragging: boolean;
  draggingBlockId: string | null;
  dispatch: React.Dispatch<LessonAction>;
  onAnswer: (correct: boolean) => void;
  onAdvance: () => void;
}

export function AssessmentPhase({
  pool,
  step,
  attempts,
  score,
  blocks,
  selectedBlockId,
  nextBlockId,
  isDragging,
  draggingBlockId,
  dispatch,
  onAnswer,
  onAdvance,
}: AssessmentPhaseProps) {
  if (step >= pool.length) {
    return (
      <div style={{ padding: 16, fontSize: 16, color: COLORS.text, fontFamily: 'Georgia, serif' }}>
        Assessment complete. Score: {score.correct}/{score.total}
      </div>
    );
  }

  const problem = pool[step];
  if (!problem) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <p
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 14,
          color: COLORS.textMuted,
          fontFamily: 'Georgia, serif',
        }}
      >
        Problem {step + 1} of 3
      </p>
      {problem.type === 'recognition' && (
        <MultipleChoice
          problem={problem}
          attempts={attempts}
          onAnswer={onAnswer}
          onAdvance={onAdvance}
        />
      )}
      {problem.type === 'construction' && (
        <ConstructionTask
          problem={problem}
          attempts={attempts}
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          nextBlockId={nextBlockId}
          isDragging={isDragging}
          draggingBlockId={draggingBlockId}
          dispatch={dispatch}
          onAnswer={onAnswer}
          onAdvance={onAdvance}
        />
      )}
      {problem.type === 'generalization' && (
        <GeneralizationTask
          problem={problem}
          attempts={attempts}
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          nextBlockId={nextBlockId}
          isDragging={isDragging}
          draggingBlockId={draggingBlockId}
          dispatch={dispatch}
          onAnswer={onAnswer}
          onAdvance={onAdvance}
        />
      )}
    </div>
  );
}
