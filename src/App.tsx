import { useReducer, useState, useEffect } from 'react';
import {
  getInitialLessonState,
  lessonReducer,
} from './state/reducer';
import { Workspace } from './components/Workspace/Workspace';

function App() {
  const [state, dispatch] = useReducer(lessonReducer, getInitialLessonState());
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [combineRejectionMessage, setCombineRejectionMessage] = useState<string | null>(null);
  const [combinedBlockId, setCombinedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (!combinedBlockId) return;
    const t = setTimeout(() => setCombinedBlockId(null), 350);
    return () => clearTimeout(t);
  }, [combinedBlockId]);

  const handleSelectBlock = (blockId: string) => {
    setCombineRejectionMessage(null);
    dispatch({ type: 'SELECT_BLOCK', blockId });
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
        />
      </div>
    </div>
  );
}

export default App;
