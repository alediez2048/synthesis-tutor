import { useRef, useState, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import type { FractionBlock as FractionBlockType } from '../../state/types';
import { COLORS, getDenomColor } from '../../theme';

const MIN_WIDTH_PX = 50;

const DENOMINATOR_WORDS: Record<number, string> = {
  1: 'whole', 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth',
  6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth',
  11: 'eleventh', 12: 'twelfth',
};

const NUMERATOR_WORDS: Record<number, string> = {
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six',
  7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Eleven', 12: 'Twelve',
};

function getSpokenFraction(numerator: number, denominator: number): string {
  const numWord = NUMERATOR_WORDS[numerator] ?? String(numerator);
  const denWord = DENOMINATOR_WORDS[denominator] ?? String(denominator);
  if (numerator === 1) return `One ${denWord}`;
  const plurals: Record<string, string> = { half: 'halves', third: 'thirds', fourth: 'fourths', sixth: 'sixths', eighth: 'eighths', twelfth: 'twelfths' };
  const plural = plurals[denWord] ?? `${denWord}s`;
  return `${numWord} ${plural}`;
}

export interface FractionBlockProps {
  block: FractionBlockType;
  referenceWidth?: number;
  onSelect?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (draggedBlockId: string, dropRect: DOMRect) => void;
  onBlockRef?: (blockId: string, element: HTMLElement | null) => void;
  isDragging?: boolean;
  dragDisabled?: boolean;
  animateIn?: boolean;
  isHighlighted?: boolean;
}

export function FractionBlock({
  block,
  referenceWidth = 280,
  onSelect,
  onDragStart,
  onDragEnd,
  onBlockRef,
  dragDisabled = false,
  animateIn = false,
  isHighlighted = false,
}: FractionBlockProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isDraggingThis = dragOffset.x !== 0 || dragOffset.y !== 0;

  useEffect(() => {
    if (!animateIn || !rootRef.current) return;
    const el = rootRef.current;
    el.style.transformOrigin = 'left';
    el.animate(
      [
        { transform: 'scaleX(0)', opacity: 0.5 },
        { transform: 'scaleX(1)', opacity: 1 },
      ],
      { duration: 400, easing: 'ease-out' }
    );
  }, [animateIn]);

  useEffect(() => {
    if (!isHighlighted || !rootRef.current) return;
    const el = rootRef.current;
    el.animate(
      [
        { boxShadow: `0 0 0 0 ${COLORS.goldLight}b3` },
        { boxShadow: `0 0 0 12px ${COLORS.goldLight}00` },
      ],
      { duration: 600, iterations: 2, easing: 'ease-out' }
    );
  }, [isHighlighted]);

  const bind = useDrag(
    ({ first, last, movement: [mx, my] }) => {
      if (first) onDragStart?.();
      if (last) {
        const el = rootRef.current;
        const dropRect = el?.getBoundingClientRect();
        setDragOffset({ x: 0, y: 0 });
        if (el && dropRect && onDragEnd) onDragEnd(block.id, dropRect);
      } else {
        setDragOffset({ x: mx, y: my });
      }
    },
    { enabled: !dragDisabled, pointer: { touch: true }, preventDefault: true, filterTaps: true }
  );

  const { fraction, isSelected } = block;
  const value = fraction.numerator / fraction.denominator;
  const widthPx = Math.max(MIN_WIDTH_PX, Math.round(value * referenceWidth));
  const denomColor = getDenomColor(fraction.denominator);

  const label = `${fraction.numerator}/${fraction.denominator}`;
  const ariaLabel = getSpokenFraction(fraction.numerator, fraction.denominator);

  // Subdivision lines
  const subdivisionLines: number[] = [];
  for (let i = 1; i < fraction.denominator; i++) {
    const pos = (i / fraction.denominator) * 100;
    if (pos > 0 && pos < 100) subdivisionLines.push(pos);
  }

  return (
    <div
      ref={(el) => {
        (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        onBlockRef?.(block.id, el);
      }}
      {...(block.id === 'block-0' ? { 'data-tutorial-target': 'initial-crystal' } : {})}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-grabbed={isDraggingThis}
      {...(onDragEnd ? bind() : {})}
      onClick={(e) => {
        if (isDraggingThis) e.preventDefault();
        else onSelect?.();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isDraggingThis) onSelect?.();
        }
      }}
      style={{
        position: 'relative',
        width: widthPx,
        height: 56,
        background: `linear-gradient(135deg, ${denomColor.bg}dd, ${denomColor.bg}88)`,
        border: `2px solid ${isSelected ? COLORS.gold : denomColor.border}`,
        borderRadius: 12,
        cursor: onSelect ? 'pointer' : 'default',
        touchAction: 'none',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
        userSelect: 'none',
        margin: 4,
        transition: 'all 0.3s ease',
        transform: isDraggingThis
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.08)`
          : isSelected
            ? 'scale(1.08)'
            : 'scale(1)',
        boxShadow: isSelected
          ? `0 0 20px ${COLORS.gold}80, inset 0 0 15px ${COLORS.gold}30`
          : isDraggingThis
            ? '0 8px 20px rgba(0,0,0,0.4)'
            : `0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 ${denomColor.border}40`,
        outline: 'none',
        overflow: 'hidden',
        ...(isDraggingThis ? { willChange: 'transform' as const, zIndex: 100 } : {}),
      }}
    >
      {/* Shimmer overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(110deg, transparent 30%, ${denomColor.border}20 50%, transparent 70%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite',
          pointerEvents: 'none',
          borderRadius: 10,
        }}
      />

      {/* Subdivision lines */}
      {subdivisionLines.map((pos) => (
        <div
          key={pos}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${pos}%`,
            top: 4,
            bottom: 4,
            width: 1,
            backgroundColor: `${denomColor.border}50`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Fraction label */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'Georgia, serif',
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </span>

      {/* Selection sparkle */}
      {isSelected && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: COLORS.gold,
            boxShadow: `0 0 6px ${COLORS.goldLight}`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
