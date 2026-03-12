import { forwardRef } from 'react';
import type { FractionBlock } from '../../state/types';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';

const MIN_TOUCH_PX = 44;

export interface ComparisonZoneProps {
  blocks: FractionBlock[];
  referenceWidth: number;
  onSelectBlock?: (blockId: string) => void;
  onReturnToWorkspace?: (blockId: string) => void;
  /** Called when user picks a split option on the altar. Only shown when 1 block present. */
  onAltarSplit?: (blockId: string, parts: number) => void;
}

export const ComparisonZone = forwardRef<HTMLElement, ComparisonZoneProps>(
  function ComparisonZone({ blocks, referenceWidth, onSelectBlock, onReturnToWorkspace, onAltarSplit }, ref) {
    const singleBlock = blocks.length === 1 ? blocks[0] : null;
    const splitOptions = singleBlock
      ? ([2, 3, 4] as const).filter((n) => singleBlock.fraction.denominator * n <= 12)
      : [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginTop: -100, pointerEvents: 'none' }}>
        <img
          src="/assets/dragacrystal.png"
          alt="Drag and drop your crystal here"
          style={{ height: 200, objectFit: 'contain', marginBottom: -16 }}
        />
      <section
        ref={ref}
        aria-label="Comparison zone"
      style={{
        minHeight: 80,
        padding: 12,
        border: '2px dashed rgba(0,0,0,0.2)',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
        width: '100%',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}
    >
      {blocks.length === 0 ? (
        <div style={{ height: 56 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, alignItems: 'flex-end', justifyContent: 'center' }}>
            {blocks.map((block) => (
              <div key={block.id} style={{ position: 'relative' }}>
                <FractionBlockComponent
                  block={block}
                  referenceWidth={referenceWidth}
                  onSelect={onReturnToWorkspace ? () => onReturnToWorkspace(block.id) : onSelectBlock ? () => onSelectBlock(block.id) : undefined}
                />
              </div>
            ))}
          </div>
          {/* Altar split picker: shown when exactly 1 block is on the altar */}
          {singleBlock && splitOptions.length > 0 && onAltarSplit && (
            <div
              role="group"
              aria-label="Split crystal on the altar"
              style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
            >
              {splitOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onAltarSplit(singleBlock.id, n)}
                  aria-label={`Split into ${n} pieces`}
                  style={{
                    minWidth: MIN_TOUCH_PX,
                    minHeight: MIN_TOUCH_PX,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#6C5CE7',
                    backgroundColor: '#fff',
                    border: '2px solid #6C5CE7',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  Split ÷{n}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
      </div>
    );
  }
);
