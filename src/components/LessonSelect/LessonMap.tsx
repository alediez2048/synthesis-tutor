/**
 * Lesson selection screen — choose which lesson to play.
 */

import { COLORS } from '../../theme';
import { LessonCard } from './LessonCard';
import { LESSONS, getUnlockedLessons } from '../../content/curriculum';
import { getProgress } from '../../state/progressStore';
import { isClerkEnabled } from '../../hooks/useClerkSafe';
import { useUser, useClerk } from '@clerk/clerk-react';

export interface LessonMapProps {
  onSelectLesson: (lessonId: string) => void;
}

function SignOutButton() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span style={{
        fontSize: 13,
        color: COLORS.goldLight,
        fontFamily: 'Georgia, serif',
      }}>
        {user.firstName ?? 'Wizard'}
      </span>
      <button
        type="button"
        onClick={() => { signOut(); }}
        style={{
          background: 'none',
          border: `1px solid ${COLORS.panelBorder}`,
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          color: COLORS.textMuted,
          cursor: 'pointer',
          fontFamily: 'Georgia, serif',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export function LessonMap({ onSelectLesson }: LessonMapProps) {
  const progress = getProgress();
  const unlockedLessons = getUnlockedLessons(progress.completedLessons);
  const clerkEnabled = isClerkEnabled();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: COLORS.bgGradient,
        padding: 24,
        overflow: 'auto',
      }}
    >
      {clerkEnabled && <SignOutButton />}
      <img
        src="/assets/title-logo.png"
        alt="Fraction Quest"
        style={{ height: 120, objectFit: 'contain', marginBottom: 24 }}
      />
      <h2 style={{
        margin: '0 0 20px',
        fontSize: 22,
        fontFamily: 'Georgia, serif',
        color: COLORS.goldLight,
      }}>
        Choose Your Lesson
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        maxWidth: 400,
      }}>
        {LESSONS.map((lesson) => {
          const unlocked = unlockedLessons.some((l) => l.id === lesson.id);
          const completed = progress.completedLessons.includes(lesson.id);
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              unlocked={unlocked}
              completed={completed}
              onSelect={() => onSelectLesson(lesson.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
