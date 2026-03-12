/**
 * ENG-023: Phase progress indicator — 4 dots for intro, explore, guided, assess.
 * Filled = completed, pulsing = current, hollow = upcoming.
 * When complete, all 4 are filled.
 */

import type { Phase } from '../../state/types';

const PHASES: Phase[] = ['intro', 'explore', 'guided', 'assess'];

export interface ProgressDotsProps {
  currentPhase: Phase;
}

export function ProgressDots({ currentPhase }: ProgressDotsProps) {
  const currentIndex = PHASES.indexOf(currentPhase);
  const isComplete = currentPhase === 'complete';
  const completedCount = isComplete ? 4 : Math.max(0, currentIndex);

  return (
    <>
      <div
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemax={4}
        aria-label={`Lesson progress: ${completedCount} of 4 phases complete`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'rgba(0,0,0,0.7)',
        }}
      >
        {PHASES.map((phase, i) => {
          const isCompleted = isComplete || i < currentIndex;
          const isCurrent = !isComplete && i === currentIndex;
          const isFilled = isCompleted || isCurrent;
          return (
            <div
              key={phase}
              aria-hidden="true"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                ...(isFilled
                  ? {
                      backgroundColor: 'currentColor',
                      opacity: 1,
                    }
                  : {
                      backgroundColor: 'transparent',
                      border: '2px solid currentColor',
                      opacity: 0.4,
                    }),
                ...(isCurrent && {
                  animation: 'pulse-dot 1.5s ease-in-out infinite',
                }),
              }}
            />
          );
        })}
      </div>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
