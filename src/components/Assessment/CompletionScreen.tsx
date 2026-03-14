/**
 * ENG-022: End-of-lesson completion screen.
 * Score display, Sam's message per bracket, concepts discovered, action buttons.
 */

import { COLORS } from '../../theme';
import { MagicButton } from '../shared/MagicButton';

const SCORE_MESSAGES: Record<string, string> = {
  '3/3':
    "You're a fraction master! You proved that the same amount can be written in lots of different ways.",
  '2/3':
    "Great job! You really understand equivalent fractions. Want to try the one you missed again?",
  '1/3':
    "You're getting there! Want to practice a little more?",
  '0/3':
    "Fractions take practice, and you did great exploring today! Let's try again.",
};

const CONCEPT_LABELS: Record<string, string> = {
  splitting: 'Splitting makes smaller equal pieces',
  combining: 'Combining fuses pieces together',
  equivalence: 'Different fractions can be the same size!',
};

export interface CompletionScreenProps {
  score: { correct: number; total: number };
  conceptsDiscovered: string[];
  onRetryMissed: () => void;
  onLoopToPractice: () => void;
  onRestartLesson: () => void;
  onFinish: () => void;
}

export function CompletionScreen({
  score,
  conceptsDiscovered,
  onRetryMissed,
  onLoopToPractice,
  onRestartLesson,
  onFinish,
}: CompletionScreenProps) {
  const { correct, total } = score;
  const scoreKey = `${correct}/${total}`;
  const message = SCORE_MESSAGES[scoreKey] ?? SCORE_MESSAGES['0/3'];

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
        {correct === 3 && total === 3 && (
          <MagicButton variant="success" onClick={onFinish}>
            Finish
          </MagicButton>
        )}
        {correct === 2 && total === 3 && (
          <>
            <MagicButton variant="primary" onClick={onRetryMissed}>
              Try Again
            </MagicButton>
            <MagicButton variant="ghost" onClick={onFinish}>
              I'm Done
            </MagicButton>
          </>
        )}
        {correct === 1 && total === 3 && (
          <MagicButton variant="primary" onClick={onLoopToPractice}>
            Practice More
          </MagicButton>
        )}
        {correct === 0 && total === 3 && (
          <MagicButton variant="gold" onClick={onRestartLesson}>
            Let's Explore Again
          </MagicButton>
        )}
      </div>
    </div>
  );
}
