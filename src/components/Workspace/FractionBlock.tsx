import { useRef, useState, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import type { FractionBlock as FractionBlockType } from '../../state/types';

const MIN_SIZE_PX = 60;

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
  referenceWidth = 400,
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
        { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
        { boxShadow: '0 0 0 12px rgba(255, 215, 0, 0)' },
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
  const widthPx = Math.max(MIN_SIZE_PX, Math.round(value * referenceWidth));
  const heightPx = 56;

  const isWhole = fraction.numerator === fraction.denominator;
  const label = isWhole ? '1 whole' : `${fraction.numerator}/${fraction.denominator}`;
  const ariaLabel = isWhole ? 'One whole' : getSpokenFraction(fraction.numerator, fraction.denominator);

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
        height: heightPx,
        outline: 'none',
        cursor: onSelect ? 'pointer' : 'default',
        touchAction: 'none',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
        background: 'linear-gradient(135deg, rgba(74,144,217,0.7), rgba(50,100,180,0.5))',
        border: isSelected ? '2px solid #D4A843' : '2px solid rgba(74,144,217,0.6)',
        borderRadius: 12,
        boxShadow: isSelected
          ? '0 0 20px rgba(212,168,67,0.5), inset 0 0 15px rgba(212,168,67,0.2)'
          : isDraggingThis
            ? '0 8px 20px rgba(0,0,0,0.4)'
            : '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        transform: isDraggingThis
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.08)`
          : isSelected
            ? 'scale(1.08)'
            : 'scale(1)',
        transition: 'border 0.2s ease, box-shadow 0.2s ease',
        overflow: 'hidden',
        margin: 4,
        ...(isDraggingThis ? { willChange: 'transform' as const, zIndex: 100 } : {}),
      }}
    >
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
}
