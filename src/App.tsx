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
import { Confetti } from './components/shared/Confetti';
import { useSoundManager } from './audio/useSoundManager';
import { selectAssessmentProblems, getLesson } from './content/curriculum';
import { areEquivalent, addFractions } from './engine/FractionEngine';
import { useTutorChat } from './brain/useTutorChat';
import { useVoiceOutput } from './brain/useVoiceOutput';
import { parseFractionReferences } from './brain/parseFractionReferences';
import type { ComparisonResult } from './components/Workspace/ComparisonZone';
import { useExplorationObserver } from './observers/useExplorationObserver';
import { useIntroObserver } from './observers/useIntroObserver';
import { useTutorialDemoObserver } from './observers/useTutorialDemoObserver';
import { useGuidedPracticeObserver } from './observers/useGuidedPracticeObserver';
import { useInactivityPrompt } from './hooks/useInactivityPrompt';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { StartScreen } from './components/shared/StartScreen';
import { LessonMap } from './components/LessonSelect/LessonMap';
import { markLessonComplete } from './state/progressStore';
import { ProgressDots } from './components/shared/ProgressDots';
import { MagicButton } from './components/shared/MagicButton';
import { RoundBanner } from './components/shared/RoundBanner';
import { TutorialOverlay } from './components/Onboarding/TutorialOverlay';
import { COLORS } from './theme';

const SPLIT_REJECTION_MESSAGE = 'Those pieces are as small as they can get!';
const SPLIT_ANIMATION_MS = 400;

function getCompletionMessage(correct: number, total: number): string {
  if (total === 0) return "Great exploring today! Let's try again.";
  const ratio = correct / total;
  if (ratio === 1) return "You're a fraction master! You proved that the same amount can be written in lots of different ways.";
  if (ratio >= 0.67) return "Great job! You really understand equivalent fractions. Want to try the one you missed again?";
  if (ratio >= 0.34) return "You're getting there! Want to practice a little more?";
  return "Fractions take practice, and you did great exploring today! Let's try again.";
}

function App() {
  const [recoveryState, setRecoveryState] = useState<ReturnType<typeof loadCheckpoint>>(
    () => loadCheckpoint()
  );
  const [state, dispatch] = useReducer(
    lessonReducer,
    recoveryState ?? getInitialLessonState()
  );
  const [showRecovery, setShowRecovery] = useState(recoveryState !== null);
  const [showLessonMap, setShowLessonMap] = useState(recoveryState === null);
  const [showStart, setShowStart] = useState(false);
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [combineRejectionMessage, setCombineRejectionMessage] = useState<string | null>(null);
  const [combinedBlockId, setCombinedBlockId] = useState<string | null>(null);
  const [splitRejectionMessage, setSplitRejectionMessage] = useState<string | null>(null);
  const [splitBlockIds, setSplitBlockIds] = useState<string[] | null>(null);
  const [highlightedBlockIds, setHighlightedBlockIds] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult>(null);
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const [roundBannerName, setRoundBannerName] = useState('');
  const [round5SecondsRemaining, setRound5SecondsRemaining] = useState<number | null>(null);
  const round5StartRef = useRef<number | null>(null);

  const { sendMessage, notifySam, isLoading } = useTutorChat(state, dispatch);
  const {
    unlock,
    playPop,
    playSnap,
    playCorrect,
    playIncorrect,
    playCelebration,
    muted,
    toggleMute,
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
  const lesson = getLesson(state.lessonId);
  const explorationRounds = lesson?.explorationRounds ?? [];
  const lastRoundTimerMs = lesson?.lastRoundTimerMs ?? null;

  const handleConfettiComplete = useCallback(() => setShowConfetti(false), []);
  const handleSelectLesson = useCallback((lessonId: string) => {
    setPendingLessonId(lessonId);
    setShowLessonMap(false);
    setShowStart(true);
  }, []);
  const handleFinish = useCallback(() => {
    const passed = state.score.total > 0 && state.score.correct / state.score.total >= (lesson?.passThreshold ?? 0.67);
    if (passed) {
      markLessonComplete(state.lessonId, state.score);
    }
    clearCheckpoint(state.lessonId);
    setShowLessonMap(true);
  }, [state.lessonId, state.score, lesson]);
  const handleStartLesson = useCallback(() => {
    unlock();
    setAudioUnlocked(true);
    setShowStart(false);
    if (pendingLessonId) {
      dispatch({ type: 'START_LESSON', lessonId: pendingLessonId });
      setPendingLessonId(null);
    }
    // START_LESSON sets phase to 'intro' and tutorialComplete to false
    // so we always go through the tutorial first
    dispatch({ type: 'PHASE_TRANSITION', to: 'tutorial' });
  }, [unlock, pendingLessonId, dispatch]);
  const selectedBlockId = state.blocks.find((b) => b.isSelected)?.id ?? null;
  const selectedBlockIds = state.blocks.filter((b) => b.isSelected).map((b) => b.id);

  useExplorationObserver({
    state,
    dispatch,
  });

  useIntroObserver({
    state,
    dispatch,
    playPop,
    isLoading,
  });

  useTutorialDemoObserver({
    state,
    dispatch,
    playPop,
  });

  useGuidedPracticeObserver({
    state,
    dispatch,
    playPop,
    playSnap,
    playCorrect,
    playIncorrect,
  });

  const {
    showDimOverlay,
    showWelcomeBack,
    onTapToContinue,
    onDismissWelcomeBack,
  } = useInactivityPrompt({ state, dispatch });

  // Intro greeting is now sent by handleStartLesson when start screen is dismissed

  const prevPhaseRef = useRef(state.phase);
  const prevExplorationRoundRef = useRef(state.explorationRound);

  useEffect(() => {
    if (prevPhaseRef.current !== 'assess' && state.phase === 'assess') {
      const pool = selectAssessmentProblems(state.lessonId);
      dispatch({ type: 'INIT_ASSESSMENT', pool });
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, dispatch]);

  const handleRoundBannerComplete = useCallback(() => setShowRoundBanner(false), []);

  useEffect(() => {
    if (state.phase !== 'explore') {
      round5StartRef.current = null;
      return;
    }
    const round = state.explorationRound;
    const prev = prevExplorationRoundRef.current;
    prevExplorationRoundRef.current = round;

    if (round > prev && round > 1) {
      const config = explorationRounds[round - 1];
      if (config) {
        const name = `Round ${round}: ${config.name}`;
        queueMicrotask(() => {
          setRoundBannerName(name);
          setShowRoundBanner(true);
        });
      }
    }

    const currentRoundConfig = explorationRounds[round - 1];
    if (currentRoundConfig?.goalType === 'timer') {
      if (round5StartRef.current === null) {
        round5StartRef.current = Date.now();
        queueMicrotask(() =>
          setRound5SecondsRemaining(Math.ceil((lastRoundTimerMs ?? 60000) / 1000))
        );
      }
    } else {
      round5StartRef.current = null;
      setRound5SecondsRemaining(null);
    }
  }, [state.phase, state.explorationRound, explorationRounds, lastRoundTimerMs]);

  useEffect(() => {
    const currentRoundConfig = explorationRounds[state.explorationRound - 1];
    const isTimerRound = currentRoundConfig?.goalType === 'timer';
    if (state.phase !== 'explore' || !isTimerRound || round5StartRef.current === null) {
      return;
    }
    const timerDuration = lastRoundTimerMs ?? 60000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - (round5StartRef.current ?? 0);
      const remaining = Math.max(0, Math.ceil((timerDuration - elapsed) / 1000));
      setRound5SecondsRemaining(remaining);
      if (remaining <= 0) {
        setRound5SecondsRemaining(null);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [state.phase, state.explorationRound, explorationRounds, lastRoundTimerMs]);

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
    const msg = getCompletionMessage(state.score.correct, state.score.total);
    dispatch({ type: 'TUTOR_RESPONSE', content: msg, isStreaming: false });
    if (state.score.total > 0 && state.score.correct === state.score.total) {
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

  // Demo split animation: when isDemoActive and blocks increased (demo split), trigger split animation
  const prevBlocksCountRef = useRef(state.blocks.length);
  useEffect(() => {
    if (state.isDemoActive && state.blocks.length > prevBlocksCountRef.current) {
      setSplitBlockIds(state.blocks.map((b) => b.id));
    }
    prevBlocksCountRef.current = state.blocks.length;
  }, [state.blocks, state.isDemoActive]);

  // ENG-026/027: Detect 2 blocks on altar, check equivalence, animate
  const comparisonBlocks = state.blocks.filter((b) => b.position === 'comparison');
  const prevCompCountRef = useRef(0);
  useEffect(() => {
    const prev = prevCompCountRef.current;
    prevCompCountRef.current = comparisonBlocks.length;
    if (comparisonBlocks.length >= 2 && prev < 2) {
      const [a, b] = comparisonBlocks;
      const equiv = areEquivalent(a.fraction, b.fraction);
      setComparisonResult(equiv ? 'equivalent' : 'not-equivalent');
      if (equiv) {
        playCorrect();
        notifySam(
          `I placed ${a.fraction.numerator}/${a.fraction.denominator} and ${b.fraction.numerator}/${b.fraction.denominator} on the spell altar to compare them`
        );
      } else {
        playIncorrect();
        // Return non-equivalent blocks to workspace after animation
        setTimeout(() => {
          comparisonBlocks.forEach((bl) =>
            dispatch({ type: 'RETURN_TO_WORKSPACE', blockId: bl.id })
          );
          setComparisonResult(null);
        }, 1200);
        notifySam(
          `I placed ${a.fraction.numerator}/${a.fraction.denominator} and ${b.fraction.numerator}/${b.fraction.denominator} on the spell altar to compare them`
        );
      }
    }
    if (comparisonBlocks.length < 2 && comparisonResult === 'equivalent') {
      setComparisonResult(null);
    }
  }, [comparisonBlocks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectBlock = (blockId: string) => {
    ensureAudioUnlocked();
    setCombineRejectionMessage(null);
    setSplitRejectionMessage(null);
    if (state.phase === 'tutorial' && state.tutorialStep === 2) {
      dispatch({ type: 'TUTORIAL_STEP', step: 3 });
    }
    dispatch({ type: 'SELECT_BLOCK', blockId });
  };

  const handleSplitRequest = (parts: number) => {
    ensureAudioUnlocked();
    if (!selectedBlockId) return;
    const selectedBlock = state.blocks.find((b) => b.id === selectedBlockId);
    if (!selectedBlock) return;
    if (selectedBlock.fraction.denominator * parts > 12) {
      setSplitRejectionMessage(SPLIT_REJECTION_MESSAGE);
      const { numerator, denominator } = selectedBlock.fraction;
      notifySam(
        `[Student tried to split ${numerator}/${denominator} into ${parts} pieces, ` +
          `but that would make ${denominator * parts}ths which is beyond our crystal limit of 12. ` +
          `Help them understand why pieces can't get infinitely small and suggest trying a different crystal or combining first.]`
      );
      return;
    }
    setSplitRejectionMessage(null);
    if (state.phase === 'tutorial' && state.tutorialStep === 3 && parts === 2) {
      dispatch({ type: 'TUTORIAL_STEP', step: 4 });
    }
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

  const handleAltarSplit = (blockId: string, parts: number) => {
    ensureAudioUnlocked();
    const block = state.blocks.find((b) => b.id === blockId);
    if (!block) return;
    if (block.fraction.denominator * parts > 12) {
      setSplitRejectionMessage(SPLIT_REJECTION_MESSAGE);
      return;
    }
    setSplitRejectionMessage(null);
    const startId = state.nextBlockId;
    const newIds = Array.from({ length: parts }, (_, i) => `block-${startId + i}`);
    setSplitBlockIds(newIds);
    dispatch({ type: 'SPLIT_BLOCK', blockId, parts });
    playPop();
  };

  const handleWorkspaceBackgroundClick = () => {
    dispatch({ type: 'DESELECT_ALL' });
  };

  const handleAddBlocks = useCallback(
    (blockIds: [string, string]) => {
      const blockA = state.blocks.find((b) => b.id === blockIds[0]);
      const blockB = state.blocks.find((b) => b.id === blockIds[1]);
      if (!blockA || !blockB) return;
      ensureAudioUnlocked();
      try {
        const sum = addFractions(blockA.fraction, blockB.fraction);
        dispatch({ type: 'ADD_BLOCKS', blockIds });
        playSnap(sum.numerator / sum.denominator);
        notifySam(`I added ${blockA.fraction.numerator}/${blockA.fraction.denominator} and ${blockB.fraction.numerator}/${blockB.fraction.denominator}`);
      } catch {
        // addFractions throws if result denom > 12
      }
    },
    [state.blocks, dispatch, ensureAudioUnlocked, playSnap, notifySam]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      ensureAudioUnlocked();
      sendMessage(text);
    },
    [ensureAudioUnlocked, sendMessage]
  );

  const handleTutorialComplete = useCallback(() => {
    sendMessage('[Student completed the tutorial. Welcome them to explore!]');
  }, [sendMessage]);

  if (showLessonMap) {
    return <LessonMap onSelectLesson={handleSelectLesson} />;
  }
  if (showStart) {
    return <StartScreen onStart={handleStartLesson} />;
  }

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
          background: COLORS.bgGradient,
          zIndex: 1000,
          padding: 16,
        }}
      >
        <div
          style={{
            background: COLORS.panel,
            borderRadius: 16,
            padding: 32,
            maxWidth: 420,
            border: `2px solid ${COLORS.gold}`,
            boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${COLORS.gold}22`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
            border: `3px solid ${COLORS.gold}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}>
            🧙
          </div>
          <p id="recovery-title" style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.5,
            fontFamily: 'Georgia, serif',
            color: COLORS.text,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>
            Hey, welcome back! Want to keep going where we left off?
          </p>
          <div style={{ display: 'flex', gap: 14, width: '100%', justifyContent: 'center' }}>
            <MagicButton variant="primary" onClick={handleKeepGoing}>
              Keep Going
            </MagicButton>
            <MagicButton variant="gold" onClick={handleStartOver}>
              Start Over
            </MagicButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {state.phase === 'tutorial' && (
        <TutorialOverlay
          state={state}
          dispatch={dispatch}
          onComplete={handleTutorialComplete}
        />
      )}
      {/* ENG-031: Skip link for keyboard users */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: -9999,
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
          zIndex: 10000,
        }}
        onFocus={(e) => {
          const el = e.currentTarget;
          el.style.position = 'fixed';
          el.style.left = '8px';
          el.style.top = '8px';
          el.style.width = 'auto';
          el.style.height = 'auto';
          el.style.overflow = 'visible';
          el.style.padding = '8px 16px';
          el.style.background = '#7B2FBE';
          el.style.color = '#fff';
          el.style.borderRadius = '8px';
          el.style.fontSize = '14px';
          el.style.fontWeight = '700';
          el.style.textDecoration = 'none';
        }}
        onBlur={(e) => {
          const el = e.currentTarget;
          el.style.position = 'absolute';
          el.style.left = '-9999px';
          el.style.width = '1px';
          el.style.height = '1px';
          el.style.overflow = 'hidden';
        }}
      >
        Skip to main content
      </a>
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
            backgroundColor: 'rgba(26, 10, 46, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            cursor: 'pointer',
          }}
        >
          <p style={{
            margin: 0,
            fontSize: 18,
            fontFamily: 'Georgia, serif',
            color: COLORS.goldLight,
            background: COLORS.panel,
            padding: '16px 24px',
            borderRadius: 12,
            border: `1px solid ${COLORS.gold}40`,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}>
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
            backgroundColor: 'rgba(26, 10, 46, 0.7)',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: COLORS.panel,
              borderRadius: 14,
              padding: 24,
              maxWidth: 360,
              textAlign: 'center',
              border: `1px solid ${COLORS.panelBorder}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${COLORS.purple}22`,
            }}
          >
            <h2 id="welcome-back-title" style={{
              margin: '0 0 12px',
              fontSize: 20,
              fontFamily: 'Georgia, serif',
              color: COLORS.goldLight,
            }}>Welcome back!</h2>
            <p style={{
              margin: '0 0 20px',
              fontSize: 15,
              fontFamily: 'Georgia, serif',
              color: COLORS.textMuted,
            }}>
              Tap below to continue your lesson.
            </p>
            <MagicButton variant="primary" onClick={onDismissWelcomeBack}>
              Continue
            </MagicButton>
          </div>
        </div>
      )}
      <div
        style={{
          fontFamily: 'Georgia, serif',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          background: COLORS.bgGradient,
          color: COLORS.text,
        }}
      >
      {/* Header */}
      <header
        style={{
          flexShrink: 0,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${COLORS.panelBorder}`,
          background: COLORS.panel,
        }}
      >
        <h1 style={{ margin: 0, lineHeight: 0 }}>
          <img
            src="/assets/title-logo.png"
            alt="Fraction Quest"
            style={{ height: 72, objectFit: 'contain' }}
          />
        </h1>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {state.phase === 'tutorial' ? (
            <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: 'Georgia, serif' }}>
              Tutorial
            </span>
          ) : (
            <ProgressDots
              currentPhase={state.phase}
              explorationRound={state.phase === 'explore' ? state.explorationRound : undefined}
              lessonId={state.lessonId}
            />
          )}
        </div>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.panelBorder}`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 18,
            cursor: 'pointer',
            color: COLORS.text,
            opacity: muted ? 0.5 : 1,
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      {/* Main content */}
      <main
        id="main-content"
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
        <div style={{ position: 'relative', width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          {showRoundBanner && (
            <RoundBanner
              roundName={roundBannerName}
              visible={showRoundBanner}
              onComplete={handleRoundBannerComplete}
            />
          )}
          {state.phase === 'explore' && state.explorationRound >= explorationRounds.length - 1 && explorationRounds[state.explorationRound - 1]?.goalType !== 'timer' && (
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0',
              }}
            >
              <MagicButton
                variant="gold"
                onClick={() => dispatch({ type: 'SKIP_TO_GUIDED' })}
                aria-label="Continue to practice"
              >
                Continue to practice
              </MagicButton>
            </div>
          )}
          {state.phase === 'explore' && explorationRounds[state.explorationRound - 1]?.goalType === 'timer' && (
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
              }}
            >
              {round5SecondsRemaining !== null && (
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: 'Georgia, serif',
                    color: COLORS.textMuted,
                  }}
                >
                  {round5SecondsRemaining}s free exploration
                </span>
              )}
              <MagicButton
                variant="gold"
                onClick={() => {
                  dispatch({
                    type: 'TUTOR_RESPONSE',
                    content: explorationRounds[state.explorationRound - 1]?.celebration ?? '',
                    isStreaming: false,
                  });
                  dispatch({ type: 'ADVANCE_ROUND' });
                }}
                aria-label="Ready for a challenge"
              >
                Ready for a challenge?
              </MagicButton>
            </div>
          )}
          {combineRejectionMessage && state.phase !== 'assess' && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                fontSize: 13,
                color: COLORS.goldLight,
                background: 'rgba(212, 168, 67, 0.15)',
                border: `1px solid ${COLORS.gold}40`,
                borderRadius: 8,
                fontFamily: 'Georgia, serif',
              }}
            >
              {combineRejectionMessage}
            </div>
          )}

          <div style={{ minHeight: 0, overflow: 'auto' }}>
            {state.phase === 'complete' ? (
              <CompletionScreen
                score={state.score}
                passed={state.score.total > 0 && state.score.correct / state.score.total >= (lesson?.passThreshold ?? 0.67)}
                conceptsDiscovered={state.conceptsDiscovered}
                onRetryMissed={() => dispatch({ type: 'RETRY_MISSED' })}
                onLoopToPractice={() => dispatch({ type: 'LOOP_TO_PRACTICE' })}
                onRestartLesson={() => dispatch({ type: 'RESTART_LESSON' })}
                onFinish={handleFinish}
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
                  onAltarSplit={handleAltarSplit}
                  comparisonResult={comparisonResult}
                  isDragging={state.isDragging}
                  draggingBlockId={draggingBlockId}
                  combinedBlockId={combinedBlockId}
                  splitBlockIds={splitBlockIds}
                  highlightedBlockIds={highlightedBlockIds}
                  disabled={state.isDemoActive}
                />
                <ActionBar
                  selectedBlockId={selectedBlockId}
                  selectedBlockIds={selectedBlockIds}
                  lessonId={state.lessonId}
                  onSplitRequest={handleSplitRequest}
                  onAddRequest={lesson?.workspaceActions.includes('add') ? handleAddBlocks : undefined}
                  rejectionMessage={splitRejectionMessage}
                  disabled={state.isDragging || state.isDemoActive}
                  tutorialStep={state.phase === 'tutorial' ? state.tutorialStep : undefined}
                />
                {state.phase === 'explore' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <MagicButton
                      variant="ghost"
                      small
                      onClick={() => dispatch({ type: 'ADD_BLOCK', fraction: { numerator: 1, denominator: 2 } })}
                      disabled={state.blocks.length >= 8 || state.isDragging}
                      aria-label="Add new crystal"
                    >
                      New crystal
                    </MagicButton>
                    <MagicButton
                      variant="ghost"
                      small
                      onClick={() => dispatch({ type: 'RESET_WORKSPACE' })}
                      disabled={state.isDragging}
                      aria-label="Start fresh with one crystal"
                    >
                      Start fresh
                    </MagicButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Bottom chat bar */}
      <div style={{ flexShrink: 0, borderTop: `1px solid ${COLORS.panelBorder}` }}>
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
