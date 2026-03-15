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
        borderRadius: 10,
        padding: 14,
        border: `2px solid ${unlocked ? COLORS.gold : COLORS.panelBorder}`,
        boxShadow: unlocked ? `0 0 20px ${COLORS.gold}33` : undefined,
        opacity: unlocked ? 1 : 0.7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span
          style={{
            fontSize: 18,
            minWidth: 36,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {unlocked ? '📚' : '🔒'}
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 15, color: COLORS.goldLight, fontFamily: 'Georgia, serif' }}>
            {lesson.title}
            {completed && (
              <span style={{ marginLeft: 8, color: COLORS.correct }}>{score}</span>
            )}
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: COLORS.textMuted, fontFamily: 'Georgia, serif' }}>
            {lesson.description}
          </p>
        </div>
      </div>
      <MagicButton
        variant={unlocked ? 'gold' : 'ghost'}
        onClick={unlocked ? onSelect : undefined}
        disabled={!unlocked}
        style={{ minHeight: 36, minWidth: 36, fontSize: 13, padding: '6px 16px' }}
        aria-label={`${unlocked ? 'Start' : 'Locked'}: ${lesson.title}`}
      >
        {unlocked ? 'Start' : 'Locked'}
      </MagicButton>
    </div>
  );
}
