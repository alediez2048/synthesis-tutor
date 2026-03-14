/**
 * ENG-021: A-2 Construction — workspace with startingBlock, submit button.
 * Student builds equivalent fraction; must be different representation.
 */

import { useState } from 'react';
import type { A2Construction } from '../../state/types';
import type { Fraction } from '../../engine/FractionEngine';
import { areEquivalent } from '../../engine/FractionEngine';
import { combine } from '../../engine/FractionEngine';
import { Workspace } from '../Workspace/Workspace';
import { ActionBar } from '../Workspace/ActionBar';
import type { FractionBlock } from '../../state/types';
import type { LessonAction } from '../../state/types';
import { COLORS } from '../../theme';
import { MagicButton } from '../shared/MagicButton';

export interface ConstructionTaskProps {
  problem: A2Construction;
  attempts: number;
  blocks: FractionBlock[];
  selectedBlockId: string | null;
  nextBlockId: number;
  isDragging: boolean;
  draggingBlockId: string | null;
  dispatch: React.Dispatch<LessonAction>;
  onAnswer: (correct: boolean) => void;
  onAdvance: () => void;
}

function getWorkspaceBlocks(blocks: FractionBlock[]): FractionBlock[] {
  return blocks.filter((b) => b.position === 'workspace');
}

export function ConstructionTask({
  problem,
  attempts,
  blocks,
  selectedBlockId,
  nextBlockId,
  isDragging,
  draggingBlockId,
  dispatch,
  onAnswer,
  onAdvance,
}: ConstructionTaskProps) {
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [combinedBlockId, setCombinedBlockId] = useState<string | null>(null);
  const [splitBlockIds, setSplitBlockIds] = useState<string[] | null>(null);

  const workspaceBlocks = getWorkspaceBlocks(blocks);

  const handleSubmit = () => {
    setRejectionMessage(null);
    if (workspaceBlocks.length === 0) {
      setRejectionMessage('Build a fraction first!');
      return;
    }
    let answer: Fraction;
    try {
      answer = combine(workspaceBlocks.map((b) => b.fraction));
    } catch {
      setRejectionMessage('Combine blocks of the same size to make one fraction.');
      return;
    }
    const equivalent = areEquivalent(answer, problem.target);
    const differentRepresentation =
      answer.numerator !== problem.target.numerator ||
      answer.denominator !== problem.target.denominator;

    if (equivalent && differentRepresentation) {
      onAnswer(true);
      onAdvance();
    } else {
      const atMax = attempts + 1 >= problem.maxAttempts;
      if (atMax) {
        onAnswer(false);
        onAdvance();
      } else {
        setRejectionMessage(
          equivalent
            ? 'That’s the same as the target — try a different representation!'
            : 'Not quite — try a different split!'
        );
      }
    }
  };

  const handleSelectBlock = (blockId: string) => {
    setRejectionMessage(null);
    dispatch({ type: 'SELECT_BLOCK', blockId });
  };

  const handleSplitRequest = (parts: number) => {
    if (!selectedBlockId) return;
    const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
    if (!selectedBlock) return;
    if (selectedBlock.fraction.denominator * parts > 12) {
      setRejectionMessage('Those pieces are as small as they can get!');
      return;
    }
    setRejectionMessage(null);
    const nextId = blocks.length;
    const newIds = Array.from({ length: parts }, (_, i) => `block-${nextId + i}`);
    setSplitBlockIds(newIds);
    dispatch({ type: 'SPLIT_BLOCK', blockId: selectedBlockId, parts });
    setTimeout(() => setSplitBlockIds(null), 400);
  };

  const handleCombineAttempt = (draggedId: string, targetId: string | null) => {
    dispatch({ type: 'DRAG_END' });
    if (targetId === null) return;
    const dragged = blocks.find((b) => b.id === draggedId);
    const target = blocks.find((b) => b.id === targetId);
    if (!dragged || !target) return;
    if (dragged.fraction.denominator === target.fraction.denominator) {
      setCombinedBlockId(`block-${nextBlockId}`);
      dispatch({ type: 'COMBINE_BLOCKS', blockIds: [draggedId, targetId] });
      setTimeout(() => setCombinedBlockId(null), 400);
    } else {
      setRejectionMessage(
        'Those are different sizes — try blocks that are the same size!'
      );
    }
  };

  const handleDragStart = (blockId: string) => {
    setRejectionMessage(null);
    dispatch({ type: 'DRAG_START', blockId });
  };

  const handleWorkspaceBackgroundClick = () => {
    dispatch({ type: 'DESELECT_ALL' });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
      }}
    >
      <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text, fontFamily: 'Georgia, serif' }}>
        Build a fraction equal to {problem.target.numerator}/{problem.target.denominator}
      </p>
      <Workspace
        blocks={blocks}
        referenceWidth={300}
        selectedBlockId={selectedBlockId}
        onSelectBlock={handleSelectBlock}
        onDragStart={handleDragStart}
        onCombineAttempt={handleCombineAttempt}
        onDropOnComparisonZone={() => {}}
        onWorkspaceBackgroundClick={handleWorkspaceBackgroundClick}
        isDragging={isDragging}
        draggingBlockId={draggingBlockId}
        combinedBlockId={combinedBlockId}
        splitBlockIds={splitBlockIds}
        highlightedBlockIds={[]}
      />
      {rejectionMessage && (
        <div
          role="alert"
          style={{
            padding: '6px 14px',
            fontSize: 13,
            color: COLORS.goldLight,
            background: 'rgba(212, 168, 67, 0.15)',
            border: `1px solid ${COLORS.gold}40`,
            borderRadius: 8,
            fontFamily: 'Georgia, serif',
          }}
        >
          {rejectionMessage}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <ActionBar
          selectedBlockId={selectedBlockId}
          onSplitRequest={handleSplitRequest}
          rejectionMessage={null}
          disabled={isDragging}
        />
        <MagicButton variant="primary" onClick={handleSubmit}>
          Submit
        </MagicButton>
      </div>
    </div>
  );
}