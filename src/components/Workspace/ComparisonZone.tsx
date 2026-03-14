import { forwardRef, useEffect, useRef } from 'react';
import type { FractionBlock } from '../../state/types';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';

export type ComparisonResult = 'equivalent' | 'not-equivalent' | null;

export interface ComparisonZoneProps {
  blocks: FractionBlock[];
  referenceWidth: number;
  onSelectBlock?: (blockId: string) => void;
  onReturnToWorkspace?: (blockId: string) => void;
  /** Result of comparing 2 blocks on the altar — drives animations */
  comparisonResult?: ComparisonResult;
}

export const ComparisonZone = forwardRef<HTMLElement, ComparisonZoneProps>(
  function ComparisonZone({ blocks, referenceWidth, onSelectBlock, onReturnToWorkspace, comparisonResult }, ref) {

    const sectionRef = useRef<HTMLElement | null>(null);

    // ENG-026: Golden pulse when equivalent
    useEffect(() => {
      if (comparisonResult !== 'equivalent' || !sectionRef.current) return;
      sectionRef.current.animate(
        [
          { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.8)', borderColor: 'rgba(255, 215, 0, 1)' },
          { boxShadow: '0 0 24px 8px rgba(255, 215, 0, 0.4)', borderColor: 'rgba(255, 215, 0, 1)' },
          { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)', borderColor: 'rgba(0,0,0,0.2)' },
        ],
        { duration: 1200, easing: 'ease-out' }
      );
    }, [comparisonResult]);

    // ENG-027: Red shake when not equivalent
    useEffect(() => {
      if (comparisonResult !== 'not-equivalent' || !sectionRef.current) return;
      sectionRef.current.animate(
        [
          { transform: 'translateX(0)', boxShadow: '0 0 0 0 rgba(231, 76, 60, 0.8)' },
          { transform: 'translateX(-6px)', boxShadow: '0 0 12px 4px rgba(231, 76, 60, 0.6)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)', boxShadow: '0 0 0 0 rgba(231, 76, 60, 0)' },
        ],
        { duration: 500, easing: 'ease-out' }
      );
    }, [comparisonResult]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, pointerEvents: 'none' }}>
      <section
        ref={(el) => {
          sectionRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
        }}
        aria-label="Comparison zone"
      style={{
        minHeight: 56,
        padding: 12,
        border: '2px dashed rgba(0,0,0,0.2)',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
        width: '100%',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {blocks.length === 0 ? (
        <div style={{ height: 56 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
            {blocks.map((block) => (
              <div key={block.id} style={{ position: 'relative' }}>
                <FractionBlockComponent
                  block={block}
                  referenceWidth={referenceWidth}
                  onSelect={onReturnToWorkspace ? () => onReturnToWorkspace(block.id) : onSelectBlock ? () => onSelectBlock(block.id) : undefined}
                />
              </div>
            ))}
            {/* ENG-026: Equals sign overlay when equivalent */}
            {comparisonResult === 'equivalent' && blocks.length >= 2 && (
              <div
                aria-live="polite"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 36,
                  fontWeight: 900,
                  fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                  color: '#FFD700',
                  textShadow: '0 0 12px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.5)',
                  zIndex: 10,
                  animation: 'eq-pop 600ms ease-out',
                  pointerEvents: 'none',
                }}
              >
                =
              </div>
            )}
          </div>
          {/* ENG-027: "Not equal" indicator */}
          {comparisonResult === 'not-equivalent' && blocks.length >= 2 && (
            <div
              aria-live="polite"
              style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                color: '#E74C3C',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                animation: 'eq-pop 400ms ease-out',
              }}
            >
              Different sizes!
            </div>
          )}
        </div>
      )}
      <style>{`
        @keyframes eq-pop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </section>
      </div>
    );
  }
);
