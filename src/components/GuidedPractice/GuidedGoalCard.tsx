/**
 * Persistent goal card for guided practice phase.
 * Shows problem number, progress dots, goal text, and "Correct!" state.
 */

import { COLORS } from '../../theme';

export interface GuidedGoalCardProps {
  problemIndex: number;
  totalProblems: number;
  prompt: string | null;
  solved: boolean;
}

export function GuidedGoalCard({
  problemIndex,
  totalProblems,
  prompt,
  solved,
}: GuidedGoalCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 16px',
        background: solved
          ? `linear-gradient(135deg, ${COLORS.correct}25, ${COLORS.correct}15)`
          : `linear-gradient(135deg, ${COLORS.purple}30, ${COLORS.purpleDark}30)`,
        border: `1px solid ${solved ? COLORS.correct + '60' : COLORS.purple + '50'}`,
        borderRadius: 12,
        width: '100%',
        boxSizing: 'border-box',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      {/* Header: problem number + progress dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Fredoka One', 'Nunito', Georgia, serif",
            color: solved ? COLORS.correct : COLORS.gold,
            transition: 'color 0.4s ease',
          }}
        >
          {solved ? 'Correct!' : `Problem ${problemIndex + 1} of ${totalProblems}`}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: totalProblems }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background:
                  i < problemIndex || (i === problemIndex && solved)
                    ? COLORS.correct
                    : i === problemIndex
                    ? COLORS.gold
                    : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Goal text */}
      {prompt && !solved && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.4,
            fontFamily: 'Georgia, serif',
            color: COLORS.text,
            textAlign: 'center',
          }}
        >
          {prompt}
        </p>
      )}
    </div>
  );
}
