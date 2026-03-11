import { forwardRef } from 'react';
import type { FractionBlock } from '../../state/types';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';

export interface ComparisonZoneProps {
  blocks: FractionBlock[];
  referenceWidth: number;
  onSelectBlock?: (blockId: string) => void;
}

export const ComparisonZone = forwardRef<HTMLElement, ComparisonZoneProps>(
  function ComparisonZone({ blocks, referenceWidth, onSelectBlock }, ref) {
    return (
      <section
        ref={ref}
        aria-label="Comparison zone"
      style={{
        minHeight: 80,
        padding: 12,
        border: '2px dashed rgba(0,0,0,0.2)',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
      }}
    >
      {blocks.length === 0 ? (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'rgba(0,0,0,0.5)',
            textAlign: 'center',
            lineHeight: '56px',
          }}
        >
          Drop blocks here to compare
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
          {blocks.map((block) => (
            <FractionBlockComponent
              key={block.id}
              block={block}
              referenceWidth={referenceWidth}
              onSelect={onSelectBlock ? () => onSelectBlock(block.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
    );
  }
);
