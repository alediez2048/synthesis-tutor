import { forwardRef, useEffect, useRef } from 'react';
import type { FractionBlock } from '../../state/types';
import { COLORS } from '../../theme';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';
export type ComparisonResult = 'equivalent' | 'not-equivalent' | null;

export interface ComparisonZoneProps {
  blocks: FractionBlock[];
  referenceWidth: number;
  onSelectBlock?: (blockId: string) => void;
  onReturnToWorkspace?: (blockId: string) => void;
  onAltarSplit?: (blockId: string, parts: number) => void;
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
          { boxShadow: `0 0 0 0 ${COLORS.gold}cc`, borderColor: COLORS.gold },
          { boxShadow: `0 0 24px 8px ${COLORS.gold}66`, borderColor: COLORS.gold },
          { boxShadow: `0 0 0 0 ${COLORS.gold}00`, borderColor: `${COLORS.crystal}40` },
        ],
        { duration: 1200, easing: 'ease-out' }
      );
    }, [comparisonResult]);

    // ENG-027: Red shake when not equivalent
    useEffect(() => {
      if (comparisonResult !== 'not-equivalent' || !sectionRef.current) return;
      sectionRef.current.animate(
        [
          { transform: 'translateX(0)', boxShadow: `0 0 0 0 ${COLORS.incorrect}cc` },
          { transform: 'translateX(-6px)', boxShadow: `0 0 12px 4px ${COLORS.incorrect}99` },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)', boxShadow: `0 0 0 0 ${COLORS.incorrect}00` },
        ],
        { duration: 500, easing: 'ease-out' }
      );
    }, [comparisonResult]);

    return (
      <section
        data-tutorial-target="comparison-portal"
        ref={(el) => {
          sectionRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
        }}
        aria-label="Comparison zone"
        style={{
          minHeight: 80,
          padding: '10px 14px',
          border: `1.5px dashed ${COLORS.crystal}40`,
          borderRadius: 14,
          background: 'rgba(96, 165, 250, 0.06)',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Label */}
        <div style={{
          fontSize: 11,
          fontFamily: 'Georgia, serif',
          color: COLORS.crystal,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Comparison Area
        </div>

        {blocks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '12px 0',
            fontSize: 12,
            fontStyle: 'italic',
            color: COLORS.textMuted,
            fontFamily: 'Georgia, serif',
          }}>
            Drag blocks here to compare them
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {blocks.map((block) => (
                <div key={block.id} style={{ position: 'relative' }}>
                  <FractionBlockComponent
                    block={block}
                    referenceWidth={referenceWidth}
                    onSelect={onReturnToWorkspace ? () => onReturnToWorkspace(block.id) : onSelectBlock ? () => onSelectBlock(block.id) : undefined}
                  />
                </div>
              ))}
              {/* ENG-026: Equals sign overlay */}
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
                    fontFamily: 'Georgia, serif',
                    color: COLORS.goldLight,
                    textShadow: `0 0 12px ${COLORS.gold}cc, 0 2px 4px rgba(0,0,0,0.5)`,
                    zIndex: 10,
                    animation: 'eq-pop 600ms ease-out',
                    pointerEvents: 'none',
                  }}
                >
                  =
                </div>
              )}
            </div>
            {/* ENG-027: Not equal indicator */}
            {comparisonResult === 'not-equivalent' && blocks.length >= 2 && (
              <div
                aria-live="polite"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Georgia, serif',
                  color: COLORS.incorrect,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  animation: 'fadeSlideIn 0.4s ease-out',
                }}
              >
                Different sizes!
              </div>
            )}
          </div>
        )}
      </section>
    );
  }
);
