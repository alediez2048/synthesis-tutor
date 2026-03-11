import { useRef, useCallback } from 'react';
import type { FractionBlock } from '../../state/types';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';
import { ComparisonZone } from './ComparisonZone';

const REFERENCE_BAR_COLOR = '#9E9E9E';

function findDropTarget(
  blockRefs: Map<string, HTMLElement>,
  draggedId: string,
  draggedRect: DOMRect
): string | null {
  for (const [id, el] of blockRefs) {
    if (id === draggedId) continue;
    const rect = el.getBoundingClientRect();
    const overlapX =
      Math.min(draggedRect.right, rect.right) - Math.max(draggedRect.left, rect.left);
    const overlapY =
      Math.min(draggedRect.bottom, rect.bottom) - Math.max(draggedRect.top, rect.top);
    if (overlapX > 0 && overlapY > 0) return id;
  }
  return null;
}

export interface WorkspaceProps {
  blocks: FractionBlock[];
  referenceWidth?: number;
  onSelectBlock?: (blockId: string) => void;
  onDragStart?: (blockId: string) => void;
  onCombineAttempt?: (draggedId: string, targetId: string | null) => void;
  isDragging?: boolean;
  draggingBlockId?: string | null;
  combinedBlockId?: string | null;
}

export function Workspace({
  blocks,
  referenceWidth = 300,
  onSelectBlock,
  onDragStart,
  onCombineAttempt,
  isDragging = false,
  draggingBlockId = null,
  combinedBlockId = null,
}: WorkspaceProps) {
  const workspaceBlocks = blocks.filter((b) => b.position === 'workspace');
  const comparisonBlocks = blocks.filter((b) => b.position === 'comparison');
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setBlockRef = useCallback((blockId: string, element: HTMLElement | null) => {
    if (element) blockRefs.current.set(blockId, element);
    else blockRefs.current.delete(blockId);
  }, []);

  const handleDragEnd = useCallback(
    (draggedId: string, dropRect: DOMRect) => {
      const targetId = findDropTarget(blockRefs.current, draggedId, dropRect);
      onCombineAttempt?.(draggedId, targetId);
    },
    [onCombineAttempt]
  );

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
            onDragStart={onDragStart ? () => onDragStart(block.id) : undefined}
            onDragEnd={onCombineAttempt ? handleDragEnd : undefined}
            onBlockRef={setBlockRef}
            isDragging={isDragging}
            dragDisabled={isDragging && draggingBlockId !== block.id}
            animateIn={block.id === combinedBlockId}
          />
        ))}
      </section>
    </div>
  );
}
