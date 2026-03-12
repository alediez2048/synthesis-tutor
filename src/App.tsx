import { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import {
  getInitialLessonState,
  lessonReducer,
} from './state/reducer';
import { Workspace } from './components/Workspace/Workspace';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { ActionBar } from './components/Workspace/ActionBar';
import { AssessmentPhase } from './components/Assessment/AssessmentPhase';
import { CompletionScreen } from './components/Assessment/CompletionScreen';
import { ProgressDots } from './components/shared/ProgressDots';
import { useSoundManager } from './audio/useSoundManager';
import { selectAssessmentProblems } from './content/assessment-pools';
import { useTutorChat } from './brain/useTutorChat';
import { parseFractionReferences } from './brain/parseFractionReferences';
import { useExplorationObserver } from './observers/useExplorationObserver';

const SPLIT_REJECTION_MESSAGE = 'Those pieces are as small as they can get!';
const SPLIT_ANIMATION_MS = 400;

const COMPLETION_MESSAGES: Record<string, string> = {
  '3/3':
    "You're a fraction master! You proved that the same amount can be written in lots of different ways.",
  '2/3':
    "Great job! You really understand equivalent fractions. Want to try the one you missed again?",
  '1/3':
    "You're getting there! Want to practice a little more?",
  '0/3':
    "Fractions take practice, and you did great exploring today! Let's try again.",
};

function App() {
  const [state, dispatch] = useReducer(lessonReducer, getInitialLessonState());
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [combineRejectionMessage, setCombineRejectionMessage] = useState<string | null>(null);
  const [combinedBlockId, setCombinedBlockId] = useState<string | null>(null);
  const [splitRejectionMessage, setSplitRejectionMessage] = useState<string | null>(null);
  const [splitBlockIds, setSplitBlockIds] = useState<string[] | null>(null);
  const [highlightedBlockIds, setHighlightedBlockIds] = useState<string[]>([]);

  const { sendMessage, notifySam, isLoading } = useTutorChat(state, dispatch);
  const {
    muted,
    toggleMute,
    unlock,
    playPop,
    playSnap,
    playCorrect,
    playIncorrect,
    playCelebration,
  } = useSoundManager();
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const ensureAudioUnlocked = useCallback(() => {
    if (!audioUnlocked) {
      unlock();
      setAudioUnlocked(true);
    }
  }, [audioUnlocked, unlock]);
  const selectedBlockId = state.blocks.find((b) => b.isSelected)?.id ?? null;

  useExplorationObserver({
    state,
    dispatch,
    sendMessage,
    isLoading,
  });

  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (prevPhaseRef.current !== 'assess' && state.phase === 'assess') {
      const pool = selectAssessmentProblems();
      dispatch({ type: 'INIT_ASSESSMENT', pool });
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, dispatch]);

  const completionDispatchedRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.phase !== 'complete') {
      completionDispatchedRef.current = null;
      return;
    }
    const key = `${state.score.correct}/${state.score.total}`;
    if (completionDispatchedRef.current === key) return;
    completionDispatchedRef.current = key;
    const msg = COMPLETION_MESSAGES[key] ?? COMPLETION_MESSAGES['0/3'];
    dispatch({ type: 'TUTOR_RESPONSE', content: msg, isStreaming: false });
    if (state.score.correct === 3 && state.score.total === 3) {
      playCelebration();
    }
  }, [state.phase, state.score.correct, state.score.total, dispatch, playCelebration]);

  useEffect(() => {
    const lastMsg = state.chatMessages[state.chatMessages.length - 1];
    if (!lastMsg || lastMsg.sender !== 'tutor' || state.isStreaming) return;
    const refs = parseFractionReferences(lastMsg.content);
    if (refs.length === 0) return;
    const matchingIds = state.blocks
      .filter((b) =>
        refs.some(
          (r) =>
            r.numerator === b.fraction.numerator &&
            r.denominator === b.fraction.denominator
        )
      )
      .map((b) => b.id);
    if (matchingIds.length > 0) {
      const id = setTimeout(() => setHighlightedBlockIds(matchingIds), 0);
      const clearId = setTimeout(() => setHighlightedBlockIds([]), 1500);
      return () => {
        clearTimeout(id);
        clearTimeout(clearId);
      };
    }
  }, [state.chatMessages, state.isStreaming, state.blocks]);

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
    ensureAudioUnlocked();
    setCombineRejectionMessage(null);
    setSplitRejectionMessage(null);
    dispatch({ type: 'SELECT_BLOCK', blockId });
  };

  const handleSplitRequest = (parts: number) => {
    ensureAudioUnlocked();
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
    playPop();
    const { numerator, denominator } = selectedBlock.fraction;
    notifySam(
      `I split the ${numerator}/${denominator} crystal into ${parts} pieces`
    );
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
      const d = dragged.fraction.denominator;
      const combinedNum = dragged.fraction.numerator + target.fraction.numerator;
      playSnap(combinedNum / d);
      notifySam(
        `I combined ${dragged.fraction.numerator}/${d} and ${target.fraction.numerator}/${d}`
      );
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
    const block = state.blocks.find((b) => b.id === draggedId);
    if (block) {
      const { numerator, denominator } = block.fraction;
      notifySam(`I placed ${numerator}/${denominator} on the spell altar`);
    }
  };

  const handleWorkspaceBackgroundClick = () => {
    dispatch({ type: 'DESELECT_ALL' });
  };

  const handleSendMessage = useCallback(
    (text: string) => {
      ensureAudioUnlocked();
      sendMessage(text);
    },
    [ensureAudioUnlocked, sendMessage]
  );

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
      <header
        style={{
          flexShrink: 0,
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <ProgressDots currentPhase={state.phase} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', flex: 1 }}>Fraction Quest</h1>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: 8,
            minWidth: 44,
            minHeight: 44,
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
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
            isLoading={isLoading}
          />
        </div>
        <div style={{ flex: '0 0 60%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {combineRejectionMessage && state.phase !== 'assess' && (
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
            {state.phase === 'complete' ? (
              <CompletionScreen
                score={state.score}
                conceptsDiscovered={state.conceptsDiscovered}
                onRetryMissed={() => dispatch({ type: 'RETRY_MISSED' })}
                onLoopToPractice={() => dispatch({ type: 'LOOP_TO_PRACTICE' })}
                onRestartLesson={() => dispatch({ type: 'RESTART_LESSON' })}
                onFinish={() => {}}
              />
            ) : state.phase === 'assess' ? (
              <AssessmentPhase
                pool={state.assessmentPool}
                step={state.assessmentStep}
                attempts={state.assessmentAttempts}
                score={state.score}
                blocks={state.blocks}
                selectedBlockId={selectedBlockId}
                nextBlockId={state.nextBlockId}
                isDragging={state.isDragging}
                draggingBlockId={draggingBlockId}
                dispatch={dispatch}
                onAnswer={(correct) => {
                  ensureAudioUnlocked();
                  if (correct) playCorrect();
                  else playIncorrect();
                  dispatch({ type: 'ASSESSMENT_ANSWER', correct });
                }}
                onAdvance={() => dispatch({ type: 'ADVANCE_ASSESSMENT' })}
              />
            ) : (
              <>
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
                  splitBlockIds={splitBlockIds}
                  highlightedBlockIds={highlightedBlockIds}
                />
                <ActionBar
                  selectedBlockId={selectedBlockId}
                  onSplitRequest={handleSplitRequest}
                  rejectionMessage={splitRejectionMessage}
                  disabled={state.isDragging}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
