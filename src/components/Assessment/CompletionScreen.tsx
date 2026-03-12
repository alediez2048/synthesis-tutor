/**
 * ENG-022: End-of-lesson completion screen.
 * Score display, Sam's message per bracket, concepts discovered, action buttons.
 */

const MIN_TAP_PX = 44;

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

  const buttonStyle: React.CSSProperties = {
    minWidth: MIN_TAP_PX,
    minHeight: MIN_TAP_PX,
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#4A90D9',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(74,144,217,0.3)',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#fff',
    color: '#4A90D9',
    border: '2px solid #4A90D9',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: 24,
        flex: 1,
        overflow: 'auto',
      }}
    >
      {/* Score display */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 0',
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 8 }}>
          Your Score
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 700,
            color: '#4A90D9',
            lineHeight: 1,
          }}
        >
          {correct} <span style={{ color: 'rgba(0,0,0,0.3)' }}>/</span> {total}
        </p>
      </div>

      {/* Sam's message */}
      <div
        style={{
          padding: 20,
          backgroundColor: 'rgba(74,144,217,0.08)',
          borderRadius: 12,
          border: '1px solid rgba(74,144,217,0.2)',
        }}
      >
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {/* Concepts discovered */}
      {conceptItems.length > 0 && (
        <div
          style={{
            padding: 16,
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 8,
          }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>
            Concepts Discovered
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {conceptItems.map(({ id, label }) => (
              <li
                key={id}
                style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.4 }}
              >
                ✓ {label}
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
        }}
      >
        {correct === 3 && total === 3 && (
          <button type="button" onClick={onFinish} style={buttonStyle}>
            Finish
          </button>
        )}
        {correct === 2 && total === 3 && (
          <>
            <button type="button" onClick={onRetryMissed} style={buttonStyle}>
              Try Again
            </button>
            <button type="button" onClick={onFinish} style={secondaryButtonStyle}>
              I'm Done
            </button>
          </>
        )}
        {correct === 1 && total === 3 && (
          <button type="button" onClick={onLoopToPractice} style={buttonStyle}>
            Practice More
          </button>
        )}
        {correct === 0 && total === 3 && (
          <button type="button" onClick={onRestartLesson} style={buttonStyle}>
            Let's Explore Again
          </button>
        )}
      </div>
    </div>
  );
}
