/**
 * ENG-023: Phase progress indicator — 4 labeled dots with connecting lines.
 */

import type { Phase } from '../../state/types';
import { COLORS } from '../../theme';

const PHASE_LABELS: { phase: Phase; label: string }[] = [
  { phase: 'intro', label: 'Intro' },
  { phase: 'explore', label: 'Explore' },
  { phase: 'guided', label: 'Practice' },
  { phase: 'assess', label: 'Quest' },
];

export interface ProgressDotsProps {
  currentPhase: Phase;
  explorationRound?: number;
}

export function ProgressDots({ currentPhase, explorationRound }: ProgressDotsProps) {
  const currentIndex = PHASE_LABELS.findIndex((p) => p.phase === currentPhase);
  const isComplete = currentPhase === 'complete';
  const completedCount = isComplete ? 4 : Math.max(0, currentIndex);

  return (
    <div
      role="progressbar"
      aria-valuenow={completedCount}
      aria-valuemax={4}
      aria-label={`Lesson progress: ${completedCount} of 4 phases complete`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
      }}
    >
      {PHASE_LABELS.map((item, i) => {
        const isCompleted = isComplete || i < currentIndex;
        const isCurrent = !isComplete && i === currentIndex;

        return (
          <div key={item.phase} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Connecting line before (except first) */}
            {i > 0 && (
              <div
                aria-hidden="true"
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: isCompleted ? COLORS.gold : 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s',
                }}
              />
            )}
            {/* Dot + label + optional explore sub-dots */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: isCompleted
                    ? COLORS.gold
                    : isCurrent
                      ? COLORS.crystal
                      : 'rgba(255,255,255,0.15)',
                  boxShadow: isCurrent ? `0 0 8px ${COLORS.crystal}` : 'none',
                  animation: isCurrent ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  transition: 'all 0.3s',
                }}
              />
              {item.phase === 'explore' &&
                currentPhase === 'explore' &&
                explorationRound !== undefined && (
                  <div
                    aria-hidden="true"
                    style={{
                      display: 'flex',
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((r) => {
                      const subCompleted = r < explorationRound;
                      const subCurrent = r === explorationRound;
                      return (
                        <div
                          key={r}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: subCompleted
                              ? COLORS.gold
                              : subCurrent
                                ? COLORS.crystal
                                : 'rgba(255,255,255,0.15)',
                            boxShadow: subCurrent ? `0 0 4px ${COLORS.crystal}` : 'none',
                            transition: 'all 0.3s',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'Georgia, serif',
                  letterSpacing: 0.5,
                  color: isCompleted || isCurrent ? COLORS.goldLight : COLORS.textMuted,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
