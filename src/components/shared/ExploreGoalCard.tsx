/**
 * Persistent goal card for the exploration phase.
 * Shows round number, goal text, progress dots, and optional timer.
 */

import { COLORS } from '../../theme';

export interface ExploreGoalCardProps {
  round: number;
  totalRounds: number;
  roundName: string;
  goal: string;
  isTimerRound: boolean;
  secondsRemaining: number | null;
}

export function ExploreGoalCard({
  round,
  totalRounds,
  roundName,
  goal,
  isTimerRound,
  secondsRemaining,
}: ExploreGoalCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 16px',
        background: `linear-gradient(135deg, ${COLORS.crystal}15, ${COLORS.crystal}08)`,
        border: `1px solid ${COLORS.crystal}40`,
        borderRadius: 12,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header: round name + progress dots */}
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
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Fredoka One', 'Nunito', Georgia, serif",
            color: COLORS.crystal,
          }}
        >
          Round {round}: {roundName}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  i < round - 1
                    ? COLORS.correct
                    : i === round - 1
                    ? COLORS.crystal
                    : 'rgba(255,255,255,0.15)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Goal text */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.4,
          fontFamily: 'Georgia, serif',
          color: COLORS.text,
          textAlign: 'center',
        }}
      >
        {isTimerRound && secondsRemaining !== null
          ? `Free play — ${secondsRemaining}s remaining`
          : goal}
      </p>
    </div>
  );
}
