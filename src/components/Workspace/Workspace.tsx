import type { FractionBlock } from '../../state/types';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';
import { ComparisonZone } from './ComparisonZone';

const REFERENCE_BAR_COLOR = '#9E9E9E';

export interface WorkspaceProps {
  blocks: FractionBlock[];
  referenceWidth?: number;
  onSelectBlock?: (blockId: string) => void;
}

export function Workspace({
  blocks,
  referenceWidth = 300,
  onSelectBlock,
}: WorkspaceProps) {
  const workspaceBlocks = blocks.filter((b) => b.position === 'workspace');
  const comparisonBlocks = blocks.filter((b) => b.position === 'comparison');

  return (
    <div
      role="region"
      aria-label="Fraction workspace"
      style={{
        width: referenceWidth,
        maxWidth: '100%',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Reference bar: 1 whole */}
      <section
        aria-label="Reference bar"
        style={{
          width: referenceWidth,
          height: 28,
          backgroundColor: REFERENCE_BAR_COLOR,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}>
          1/1
        </span>
      </section>

      {/* Comparison zone */}
      <ComparisonZone
        blocks={comparisonBlocks}
        referenceWidth={referenceWidth}
        onSelectBlock={onSelectBlock}
      />

      {/* Active blocks area */}
      <section
        aria-label="Workspace"
        style={{
          minHeight: 80,
          padding: 12,
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: 8,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        {workspaceBlocks.map((block) => (
          <FractionBlockComponent
            key={block.id}
            block={block}
            referenceWidth={referenceWidth}
            onSelect={onSelectBlock ? () => onSelectBlock(block.id) : undefined}
          />
        ))}
      </section>
    </div>
  );
}
