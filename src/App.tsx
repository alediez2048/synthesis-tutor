import { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import {
  getInitialLessonState,
  lessonReducer,
} from './state/reducer';
import { loadCheckpoint, saveCheckpoint, clearCheckpoint } from './state/checkpoint';
import { Workspace } from './components/Workspace/Workspace';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { ActionBar } from './components/Workspace/ActionBar';
import { AssessmentPhase } from './components/Assessment/AssessmentPhase';
import { CompletionScreen } from './components/Assessment/CompletionScreen';
import { ProgressDots } from './components/shared/ProgressDots';
import { Confetti } from './components/shared/Confetti';
import { useSoundManager } from './audio/useSoundManager';
import { selectAssessmentProblems } from './content/assessment-pools';
import { useTutorChat } from './brain/useTutorChat';
import { useVoiceOutput } from './brain/useVoiceOutput';
import { parseFractionReferences } from './brain/parseFractionReferences';
import { useExplorationObserver } from './observers/useExplorationObserver';
import { useInactivityPrompt } from './hooks/useInactivityPrompt';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

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
  const [recoveryState, setRecoveryState] = useState<ReturnType<typeof loadCheckpoint>>(
    () => loadCheckpoint()
  );
  const [state, dispatch] = useReducer(
    lessonReducer,
    recoveryState ?? getInitialLessonState()
  );
  const [showRecovery, setShowRecovery] = useState(recoveryState !== null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [combineRejectionMessage, setCombineRejectionMessage] = useState<string | null>(null);
  const [combinedBlockId, setCombinedBlockId] = useState<string | null>(null);
  const [splitRejectionMessage, setSplitRejectionMessage] = useState<string | null>(null);
  const [splitBlockIds, setSplitBlockIds] = useState<string[] | null>(null);
  const [highlightedBlockIds, setHighlightedBlockIds] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const { sendMessage, notifySam, isLoading } = useTutorChat(state, dispatch);
  const {
    unlock,
    playPop,
    playSnap,
    playCorrect,
    playIncorrect,
    playCelebration,
  } = useSoundManager();
  const voice = useVoiceOutput();
  const [voiceInputListening, setVoiceInputListening] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const ensureAudioUnlocked = useCallback(() => {
    if (!audioUnlocked) {
      unlock();
      setAudioUnlocked(true);
    }
  }, [audioUnlocked, unlock]);
  const handleConfettiComplete = useCallback(() => setShowConfetti(false), []);
  const selectedBlockId = state.blocks.find((b) => b.isSelected)?.id ?? null;

  useExplorationObserver({
    state,
    dispatch,
    sendMessage,
    isLoading,
  });

  const {
    showDimOverlay,
    showWelcomeBack,
    onTapToContinue,
    onDismissWelcomeBack,
  } = useInactivityPrompt({ state, dispatch });

  // Send Sam's intro greeting on first load
  const introSentRef = useRef(false);
  useEffect(() => {
    if (
      !showRecovery &&
      state.phase === 'intro' &&
      state.chatMessages.length === 0 &&
      !isLoading &&
      !introSentRef.current
    ) {
      introSentRef.current = true;
      sendMessage('[Student just arrived — greet them and introduce Fraction Quest!]');
    }
  }, [showRecovery, state.phase, state.chatMessages.length, isLoading, sendMessage]);

  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (prevPhaseRef.current !== 'assess' && state.phase === 'assess') {
      const pool = selectAssessmentProblems();
      dispatch({ type: 'INIT_ASSESSMENT', pool });
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, dispatch]);

  const handleKeepGoing = useCallback(() => {
    clearCheckpoint();
    setShowRecovery(false);
    setRecoveryState(null);
  }, []);

  const handleStartOver = useCallback(() => {
    clearCheckpoint();
    dispatch({ type: 'FULL_RESET' });
    setShowRecovery(false);
    setRecoveryState(null);
  }, [dispatch]);

  useEffect(() => {
    if (!showRecovery) {
      saveCheckpoint(state);
    }
  }, [
    showRecovery,
    state.phase,
    state.score.correct,
    state.score.total,
    state.assessmentStep,
    state.conceptsDiscovered.length,
    state.chatMessages.length,
    state,
  ]);

  useEffect(() => {
    if (state.phase === 'complete') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.phase]);

  const hasPushedHistoryRef = useRef(false);
  useEffect(() => {
    if (state.phase === 'complete') {
      hasPushedHistoryRef.current = false;
      return;
    }
    if (!hasPushedHistoryRef.current) {
      window.history.pushState(null, '', window.location.href);
      hasPushedHistoryRef.current = true;
    }
    const handler = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [state.phase]);

  const prevStreamingRef = useRef(state.isStreaming);
  useEffect(() => {
    const wasStreaming = prevStreamingRef.current;
    prevStreamingRef.current = state.isStreaming;

    if (
      wasStreaming &&
      !state.isStreaming &&
      voice.enabled &&
      !voiceInputListening
    ) {
      const lastMsg = state.chatMessages[state.chatMessages.length - 1];
      if (lastMsg?.sender === 'tutor') {
        voice.speak(lastMsg.content);
      }
    }
  }, [
    state.isStreaming,
    state.chatMessages,
    voice.enabled,
    voiceInputListening,
    voice.speak,
    voice,
  ]);

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
      queueMicrotask(() => setShowConfetti(true));
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

  const combineCooldownRef = useRef(false);

  const handleDragStart = (blockId: string) => {
    setCombineRejectionMessage(null);
    setDraggingBlockId(blockId);
    dispatch({ type: 'DRAG_START', blockId });
  };

  const handleCombineAttempt = (draggedId: string, targetId: string | null) => {
    dispatch({ type: 'DRAG_END' });
    setDraggingBlockId(null);

    if (targetId === null) return;
    if (combineCooldownRef.current) return;

    const dragged = state.blocks.find((b) => b.id === draggedId);
    const target = state.blocks.find((b) => b.id === targetId);
    if (!dragged || !target) return;

    if (dragged.fraction.denominator === target.fraction.denominator) {
      combineCooldownRef.current = true;
      setTimeout(() => { combineCooldownRef.current = false; }, SPLIT_ANIMATION_MS);
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

  if (showRecovery) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recovery-title"
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          padding: 16,
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              aria-hidden
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#4A90D9',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <p id="recovery-title" style={{ margin: 0, fontSize: 16, lineHeight: 1.4 }}>
              Hey, welcome back! Want to keep going where we left off?
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleKeepGoing}
              style={{
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: 600,
                backgroundColor: '#4A90D9',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Keep Going
            </button>
            <button
              type="button"
              onClick={handleStartOver}
              style={{
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: 600,
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showConfetti && (
        <Confetti onComplete={handleConfettiComplete} />
      )}
      {showDimOverlay && (
        <div
          role="button"
          tabIndex={0}
          onClick={onTapToContinue}
          onKeyDown={(e) => e.key === 'Enter' && onTapToContinue()}
          aria-label="Tap to continue"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            cursor: 'pointer',
          }}
        >
          <p style={{ margin: 0, fontSize: 18, color: '#333', backgroundColor: '#fff', padding: '16px 24px', borderRadius: 8 }}>
            Tap to continue
          </p>
        </div>
      )}
      {showWelcomeBack && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-back-title"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 360,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <h2 id="welcome-back-title" style={{ margin: '0 0 12px', fontSize: 20 }}>Welcome back!</h2>
            <p style={{ margin: '0 0 20px', fontSize: 15, color: '#555' }}>
              Tap below to continue your lesson.
            </p>
            <button
              type="button"
              onClick={onDismissWelcomeBack}
              style={{
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: 600,
                backgroundColor: '#4A90D9',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          fontFamily: "'Nunito', sans-serif",
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundImage: 'url(/assets/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a1040',
        }}
      >
      {/* Header */}
      <header
        style={{
          flexShrink: 0,
          padding: '0px 20px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
          <img
            src="/assets/title-logo.png"
            alt="Fraction Quest"
            style={{ height: 340, objectFit: 'contain', marginBottom: -180 }}
          />
        </h1>
      </header>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Game panel (centered) */}
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {combineRejectionMessage && state.phase !== 'assess' && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                flexShrink: 0,
                padding: '6px 10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              {combineRejectionMessage}
            </div>
          )}

          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
                  referenceWidth={400}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={handleSelectBlock}
                  onDragStart={handleDragStart}
                  onCombineAttempt={handleCombineAttempt}
                  onDropOnComparisonZone={handleDropOnComparisonZone}
                  onWorkspaceBackgroundClick={handleWorkspaceBackgroundClick}
                  onReturnToWorkspace={(blockId) => dispatch({ type: 'RETURN_TO_WORKSPACE', blockId })}
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

      {/* Bottom chat bar */}
      <div style={{ flexShrink: 0, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <ChatPanel
          messages={state.chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onVoiceInputStateChange={setVoiceInputListening}
          layout="bottomBar"
        />
      </div>
    </div>
    </>
  );
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
