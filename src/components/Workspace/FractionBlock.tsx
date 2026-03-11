import { useRef, useState, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import type { FractionBlock as FractionBlockType } from '../../state/types';

const MIN_SIZE_PX = 60;

const DENOMINATOR_WORDS: Record<number, string> = {
  1: 'whole',
  2: 'half',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  8: 'eighth',
  9: 'ninth',
  10: 'tenth',
  11: 'eleventh',
  12: 'twelfth',
};

const NUMERATOR_WORDS: Record<number, string> = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten',
  11: 'Eleven',
  12: 'Twelve',
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
}

export function FractionBlock({
  block,
  referenceWidth = 200,
  onSelect,
  onDragStart,
  onDragEnd,
  onBlockRef,
  dragDisabled = false,
  animateIn = false,
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
      { duration: 350, easing: 'ease-in-out', fill: 'forwards' }
    );
  }, [animateIn]);

  const bind = useDrag(
    ({ first, last, movement: [mx, my] }) => {
      if (first) onDragStart?.();
      setDragOffset(last ? { x: 0, y: 0 } : { x: mx, y: my });
      if (last) {
        const el = rootRef.current;
        if (el && onDragEnd) onDragEnd(block.id, el.getBoundingClientRect());
      }
    },
    { enabled: !dragDisabled, pointer: { touch: true }, preventDefault: true }
  );

  const { fraction, color, isSelected } = block;
  const value = fraction.numerator / fraction.denominator;
  const widthPx = Math.max(MIN_SIZE_PX, Math.round(value * referenceWidth));
  const heightPx = MIN_SIZE_PX;

  const label = `${fraction.numerator}/${fraction.denominator}`;
  const ariaLabel = getSpokenFraction(fraction.numerator, fraction.denominator);

  const gridLines = fraction.denominator > 1
    ? Array.from({ length: fraction.denominator - 1 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${((i + 1) / fraction.denominator) * 100}%`,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />
      ))
    : null;

  return (
    <div
      ref={(el) => {
        (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        onBlockRef?.(block.id, el);
      }}
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
        minWidth: MIN_SIZE_PX,
        height: heightPx,
        minHeight: MIN_SIZE_PX,
        backgroundColor: color,
        borderRadius: 4,
        boxShadow: isDraggingThis
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : isSelected
            ? '0 0 0 3px #4A90D9'
            : '0 1px 3px rgba(0,0,0,0.2)',
        outline: 'none',
        cursor: onSelect ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transform: isDraggingThis
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.05)`
          : `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        ...(isDraggingThis ? { willChange: 'transform' as const } : {}),
      }}
    >
      {gridLines}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          textShadow: '0 1px 1px rgba(0,0,0,0.3)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
