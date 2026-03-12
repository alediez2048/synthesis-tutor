import { forwardRef } from 'react';
import type { FractionBlock } from '../../state/types';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';

export interface ComparisonZoneProps {
  blocks: FractionBlock[];
  referenceWidth: number;
  onSelectBlock?: (blockId: string) => void;
  onReturnToWorkspace?: (blockId: string) => void;
}

export const ComparisonZone = forwardRef<HTMLElement, ComparisonZoneProps>(
  function ComparisonZone({ blocks, referenceWidth, onSelectBlock, onReturnToWorkspace }, ref) {
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
      )}
    </section>
      </div>
    );
  }
);
