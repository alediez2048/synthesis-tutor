/**
 * ENG-022: End-of-lesson completion screen.
 * Score display, Sam's message per bracket, concepts discovered, action buttons.
 */

import { COLORS } from '../../theme';
import { MagicButton } from '../shared/MagicButton';

function getScoreMessage(correct: number, total: number, passed: boolean): string {
  if (total === 0) return "Great exploring today! Let's try again.";
  if (passed && correct === total) return "Perfect score! You've mastered this lesson!";
  if (passed) return "Great job! You passed the challenge! Ready for the next lesson?";
  const ratio = correct / total;
  if (ratio >= 0.34) return "You're getting there! A little more practice and you'll pass the challenge.";
  return "Fractions take practice, and you did great exploring today! Let's try again.";
}

const CONCEPT_LABELS: Record<string, string> = {
  splitting: 'Splitting makes smaller equal pieces',
  combining: 'Combining fuses pieces together',
  equivalence: 'Different fractions can be the same size!',
};

export interface CompletionScreenProps {
  score: { correct: number; total: number };
  passed: boolean;
  conceptsDiscovered: string[];
  onRetryMissed: () => void;
  onLoopToPractice: () => void;
  onRestartLesson: () => void;
  onFinish: () => void;
}

export function CompletionScreen({
  score,
  passed,
  conceptsDiscovered,
  onRetryMissed,
  onLoopToPractice,
  onRestartLesson,
  onFinish,
}: CompletionScreenProps) {
  const { correct, total } = score;
  const message = getScoreMessage(correct, total, passed);

  const conceptItems = conceptsDiscovered.map((id) => ({
    id,
    label: CONCEPT_LABELS[id] ?? id,
  }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: 24,
        flex: 1,
        overflow: 'auto',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Score display */}
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <p style={{ margin: 0, fontSize: 14, color: COLORS.textMuted, marginBottom: 8 }}>
          Your Score
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.goldLight,
            lineHeight: 1,
            textShadow: `0 0 20px ${COLORS.gold}66`,
          }}
        >
          {correct} <span style={{ color: COLORS.textMuted }}>/</span> {total}
        </p>
      </div>

      {/* Sam's message */}
      <div
        style={{
          padding: 20,
          background: `rgba(124, 58, 237, 0.1)`,
          borderRadius: 12,
          border: `1px solid ${COLORS.panelBorder}`,
        }}
      >
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: COLORS.text }}>
          {message}
        </p>
      </div>

      {/* Concepts discovered */}
      {conceptItems.length > 0 && (
        <div
          style={{
            padding: 16,
            background: 'rgba(96, 165, 250, 0.08)',
            borderRadius: 10,
            border: `1px solid ${COLORS.crystal}30`,
          }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: COLORS.crystal }}>
            Concepts Discovered
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {conceptItems.map(({ id, label }) => (
              <li
                key={id}
                style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.4, color: COLORS.text }}
              >
                <span style={{ color: COLORS.correct }}>&#10003;</span> {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 'auto',
          justifyContent: 'center',
        }}
      >
        {passed && (
          <MagicButton variant="success" onClick={onFinish}>
            {correct === total ? 'Next Lesson' : 'Next Lesson'}
          </MagicButton>
        )}
        {!passed && total > 0 && correct > 0 && (
          <>
            <MagicButton variant="primary" onClick={onRetryMissed}>
              Try Again
            </MagicButton>
            <MagicButton variant="ghost" onClick={onLoopToPractice}>
              Practice More
            </MagicButton>
          </>
        )}
        {!passed && (total === 0 || correct === 0) && (
          <MagicButton variant="gold" onClick={onRestartLesson}>
            Let's Explore Again
          </MagicButton>
        )}
      </div>
    </div>
  );
}
