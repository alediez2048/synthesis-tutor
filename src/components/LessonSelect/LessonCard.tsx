/**
 * Individual lesson card for the lesson map.
 * Min 44x44 touch target (iPad HIG).
 */

import { COLORS } from '../../theme';
import { MagicButton } from '../shared/MagicButton';
import type { LessonConfig } from '../../content/curriculum';

export interface LessonCardProps {
  lesson: LessonConfig;
  unlocked: boolean;
  completed: boolean;
  onSelect: () => void;
}

export function LessonCard({
  lesson,
  unlocked,
  completed,
  onSelect,
}: LessonCardProps) {
  const score = completed ? '✓' : '';

  return (
    <div
      style={{
        background: COLORS.panel,
        borderRadius: 14,
        padding: 20,
        border: `2px solid ${unlocked ? COLORS.gold : COLORS.panelBorder}`,
        boxShadow: unlocked ? `0 0 20px ${COLORS.gold}33` : undefined,
        opacity: unlocked ? 1 : 0.7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 24,
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {unlocked ? '📚' : '🔒'}
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: COLORS.goldLight, fontFamily: 'Georgia, serif' }}>
            {lesson.title}
            {completed && (
              <span style={{ marginLeft: 8, color: COLORS.correct }}>{score}</span>
            )}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: COLORS.textMuted, fontFamily: 'Georgia, serif' }}>
            {lesson.description}
          </p>
        </div>
      </div>
      <MagicButton
        variant={unlocked ? 'gold' : 'ghost'}
        onClick={unlocked ? onSelect : undefined}
        disabled={!unlocked}
        style={{ minHeight: 44, minWidth: 44 }}
        aria-label={`${unlocked ? 'Start' : 'Locked'}: ${lesson.title}`}
      >
        {unlocked ? 'Start' : 'Locked'}
      </MagicButton>
    </div>
  );
}
