import { useReducer, useState, useEffect } from 'react';
import {
  getInitialLessonState,
  lessonReducer,
} from './state/reducer';
import { Workspace } from './components/Workspace/Workspace';
import { ActionBar } from './components/Workspace/ActionBar';

const SPLIT_REJECTION_MESSAGE = 'Those pieces are as small as they can get!';
const SPLIT_ANIMATION_MS = 400;

function App() {
  const [state, dispatch] = useReducer(lessonReducer, getInitialLessonState());
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [combineRejectionMessage, setCombineRejectionMessage] = useState<string | null>(null);
  const [combinedBlockId, setCombinedBlockId] = useState<string | null>(null);
  const [splitRejectionMessage, setSplitRejectionMessage] = useState<string | null>(null);
  const [splitBlockIds, setSplitBlockIds] = useState<string[] | null>(null);

  const selectedBlockId =
    state.blocks.find((b) => b.isSelected)?.id ?? null;

  useEffect(() => {
    if (!combinedBlockId) return;
    const t = setTimeout(() => setCombinedBlockId(null), SPLIT_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [combinedBlockId]);

  useEffect(() => {
    if (!splitBlockIds?.length) return;
    const t = setTimeout(() => setSplitBlockIds(null), SPLIT_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [splitBlockIds]);

  const handleSelectBlock = (blockId: string) => {
    setCombineRejectionMessage(null);
    setSplitRejectionMessage(null);
    dispatch({ type: 'SELECT_BLOCK', blockId });
  };

  const handleSplitRequest = (parts: number) => {
    if (!selectedBlockId) return;
    const selectedBlock = state.blocks.find((b) => b.id === selectedBlockId);
    if (!selectedBlock) return;
    if (selectedBlock.fraction.denominator * parts > 12) {
      setSplitRejectionMessage(SPLIT_REJECTION_MESSAGE);
      return;
    }
    setSplitRejectionMessage(null);
    const startId = state.nextBlockId;
    const newIds = Array.from({ length: parts }, (_, i) => `block-${startId + i}`);
    setSplitBlockIds(newIds);
    dispatch({ type: 'SPLIT_BLOCK', blockId: selectedBlockId, parts });
  };

  const handleDragStart = (blockId: string) => {
    setCombineRejectionMessage(null);
    setDraggingBlockId(blockId);
    dispatch({ type: 'DRAG_START', blockId });
  };

  const handleCombineAttempt = (draggedId: string, targetId: string | null) => {
    dispatch({ type: 'DRAG_END' });
    setDraggingBlockId(null);

    if (targetId === null) return;

    const dragged = state.blocks.find((b) => b.id === draggedId);
    const target = state.blocks.find((b) => b.id === targetId);
    if (!dragged || !target) return;

    if (dragged.fraction.denominator === target.fraction.denominator) {
      setCombinedBlockId(`block-${state.nextBlockId}`);
      dispatch({ type: 'COMBINE_BLOCKS', blockIds: [draggedId, targetId] });
    } else {
      setCombineRejectionMessage(
        'Those are different sizes — try blocks that are the same size!'
      );
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Synthesis Tutor</h1>
      <p>Fraction equivalence lesson — scaffold ready.</p>
      {combineRejectionMessage && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: 4,
            fontSize: 14,
          }}
        >
          {combineRejectionMessage}
        </div>
      )}
      <div style={{ marginTop: '1rem' }}>
        <Workspace
          blocks={state.blocks}
          referenceWidth={300}
          onSelectBlock={handleSelectBlock}
          onDragStart={handleDragStart}
          onCombineAttempt={handleCombineAttempt}
          isDragging={state.isDragging}
          draggingBlockId={draggingBlockId}
          combinedBlockId={combinedBlockId}
          splitBlockIds={splitBlockIds}
        />
        <ActionBar
          selectedBlockId={selectedBlockId}
          onSplitRequest={handleSplitRequest}
          rejectionMessage={splitRejectionMessage}
        />
      </div>
    </div>
  );
}

export default App;
