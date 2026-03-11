import { useReducer, useState, useEffect } from 'react';
import {
  getInitialLessonState,
  lessonReducer,
} from './state/reducer';
import { Workspace } from './components/Workspace/Workspace';
import { ChatPanel } from './components/ChatPanel/ChatPanel';

function App() {
  const [state, dispatch] = useReducer(lessonReducer, getInitialLessonState());
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [combineRejectionMessage, setCombineRejectionMessage] = useState<string | null>(null);
  const [combinedBlockId, setCombinedBlockId] = useState<string | null>(null);

  const selectedBlockId = state.blocks.find((b) => b.isSelected)?.id ?? null;

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

  const handleDropOnComparisonZone = (draggedId: string) => {
    dispatch({ type: 'DRAG_END' });
    setDraggingBlockId(null);
    dispatch({ type: 'COMPARE_BLOCKS', blockIds: [draggedId, draggedId] });
  };

  const handleWorkspaceBackgroundClick = () => {
    dispatch({ type: 'DESELECT_ALL' });
  };

  const handleSendMessage = (text: string) => {
    dispatch({ type: 'STUDENT_RESPONSE', value: text });
  };

  return (
    <div
      style={{
        padding: '1rem',
        fontFamily: 'system-ui, sans-serif',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ flexShrink: 0, marginBottom: '0.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Synthesis Tutor</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
          Fraction equivalence lesson — scaffold ready.
        </p>
      </header>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          gap: 16,
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <div style={{ flex: '0 0 40%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <ChatPanel
            messages={state.chatMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
        <div style={{ flex: '0 0 60%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {combineRejectionMessage && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                flexShrink: 0,
                marginBottom: '0.5rem',
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
          <div style={{ flex: 1, minHeight: 0 }}>
            <Workspace
              blocks={state.blocks}
              referenceWidth={300}
              selectedBlockId={selectedBlockId}
              onSelectBlock={handleSelectBlock}
              onDragStart={handleDragStart}
              onCombineAttempt={handleCombineAttempt}
              onDropOnComparisonZone={handleDropOnComparisonZone}
              onWorkspaceBackgroundClick={handleWorkspaceBackgroundClick}
              isDragging={state.isDragging}
              draggingBlockId={draggingBlockId}
              combinedBlockId={combinedBlockId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
