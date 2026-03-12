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
  isHighlighted?: boolean;
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
        // Capture rect while still translated, before resetting offset
        const dropRect = el?.getBoundingClientRect();
        setDragOffset({ x: 0, y: 0 });
        if (el && dropRect && onDragEnd) onDragEnd(block.id, dropRect);
      } else {
        setDragOffset({ x: mx, y: my });
      }
    },
    { enabled: !dragDisabled, pointer: { touch: true }, preventDefault: true }
  );

  const { fraction, isSelected } = block;
  const value = fraction.numerator / fraction.denominator;
  const sizePx = Math.max(MIN_SIZE_PX * 2, Math.round(value * referenceWidth * 1.2));

  const label = `${fraction.numerator}/${fraction.denominator}`;
  const ariaLabel = getSpokenFraction(fraction.numerator, fraction.denominator);

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
        width: sizePx,
        height: sizePx,
        outline: 'none',
        cursor: onSelect ? 'pointer' : 'default',
        touchAction: 'none',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
        filter: isSelected
          ? 'drop-shadow(0 0 8px rgba(74,144,217,0.8)) drop-shadow(0 0 16px rgba(74,144,217,0.4))'
          : isDraggingThis
            ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
            : 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
        transform: isDraggingThis
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.1)`
          : `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        ...(isDraggingThis ? { willChange: 'transform' as const } : {}),
      }}
    >
      <img
        src="/assets/crystal.png"
        alt=""
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          position: 'absolute',
          zIndex: 1,
          fontSize: Math.max(16, Math.round(sizePx * 0.22)),
          fontWeight: 700,
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.3)',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
