/**
 * Lesson selection screen — choose which lesson to play.
 */

import { COLORS } from '../../theme';
import { LessonCard } from './LessonCard';
import { LESSONS, getUnlockedLessons } from '../../content/curriculum';
import { getProgress } from '../../state/progressStore';

export interface LessonMapProps {
  onSelectLesson: (lessonId: string) => void;
}

export function LessonMap({ onSelectLesson }: LessonMapProps) {
  const progress = getProgress();
  const unlockedLessons = getUnlockedLessons(progress.completedLessons);

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
