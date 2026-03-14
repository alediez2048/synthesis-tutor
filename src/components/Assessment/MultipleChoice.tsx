/**
 * ENG-021: A-1 Recognition — multiple choice with tappable option cards.
 * Max 2 attempts; on exhaust, reveal correct with golden pulse.
 */

import { useState, useCallback } from 'react';
import type { A1Recognition } from '../../state/types';
import type { Fraction } from '../../engine/FractionEngine';
import { FractionBlock as FractionBlockComponent } from '../Workspace/FractionBlock';
import { getColorForDenominator } from '../../state/reducer';
import type { FractionBlock } from '../../state/types';

const MIN_TAP_PX = 60;
const CORRECT_DELAY_MS = 1500;
const REVEAL_DELAY_MS = 2000;

export interface MultipleChoiceProps {
  problem: A1Recognition;
  attempts: number;
  onAnswer: (correct: boolean) => void;
  onAdvance: () => void;
}

function fractionToBlock(f: Fraction, id: string): FractionBlock {
  return {
    id,
    fraction: f,
    color: getColorForDenominator(f.denominator),
    position: 'workspace',
    isSelected: false,
  };
}

export function MultipleChoice({
  problem,
  attempts,
  onAnswer,
  onAdvance,
}: MultipleChoiceProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleTap = useCallback(
    (option: { fraction: Fraction; correct: boolean }, optionId: string) => {
      if (revealed) return;
      setSelectedOptionId(optionId);
      if (option.correct) {
        setFeedback('correct');
        onAnswer(true);
        setTimeout(() => {
          setRevealed(true);
          onAdvance();
        }, CORRECT_DELAY_MS);
      } else {
        const atMax = attempts + 1 >= problem.maxAttempts;
        setFeedback('incorrect');
        if (atMax) {
          onAnswer(false);
          setRevealed(true);
          setTimeout(() => onAdvance(), REVEAL_DELAY_MS);
        } else {
          setTimeout(() => setFeedback(null), 600);
        }
      }
    },
    [problem.maxAttempts, attempts, onAnswer, onAdvance, revealed]
  );

  const targetBlock = fractionToBlock(problem.target, 'target');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
      }}
    >
      <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
        Which fraction equals {problem.target.numerator}/{problem.target.denominator}?
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <FractionBlockComponent
          block={targetBlock}
          referenceWidth={120}
          dragDisabled
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
        }}
      >
        {problem.options.map((opt, i) => {
          const optId = `opt-${i}`;
          const block = fractionToBlock(opt.fraction, optId);
          const isSelected = selectedOptionId === optId;
          const showCorrect = revealed && opt.correct;
          const showIncorrect = isSelected && feedback === 'incorrect';
          const bgColor =
            showCorrect
              ? '#27AE60'
              : showIncorrect
                ? '#E74C3C'
                : block.color;

          return (
            <div
              key={optId}
              role="button"
              tabIndex={0}
              aria-label={`Option ${opt.fraction.numerator}/${opt.fraction.denominator}${revealed && opt.correct ? ' (correct answer)' : ''}`}
              onClick={() => handleTap(opt, optId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTap(opt, optId);
                }
              }}
              style={{
                minWidth: MIN_TAP_PX,
                minHeight: MIN_TAP_PX,
                padding: 8,
                backgroundColor: bgColor,
                borderRadius: 8,
                boxShadow:
                  showCorrect
                    ? '0 0 12px rgba(39, 174, 96, 0.8)'
                    : showIncorrect
                      ? '0 0 8px rgba(231, 76, 60, 0.6)'
                      : '0 2px 6px rgba(0,0,0,0.15)',
                cursor: revealed ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: showIncorrect ? 'shake 0.4s ease' : undefined,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#fff',
                  textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                }}
              >
                {opt.fraction.numerator}/{opt.fraction.denominator}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
