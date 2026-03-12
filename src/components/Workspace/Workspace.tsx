import { useRef, useCallback } from 'react';
import type { FractionBlock } from '../../state/types';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';
import { ComparisonZone } from './ComparisonZone';

const REFERENCE_BAR_COLOR = '#9E9E9E';

function rectsOverlap(a: DOMRect, b: DOMRect): boolean {
  const overlapX =
    Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const overlapY =
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return overlapX > 0 && overlapY > 0;
}

function findDropTarget(
  blockRefs: Map<string, HTMLElement>,
  draggedId: string,
  draggedRect: DOMRect
): string | null {
  for (const [id, el] of blockRefs) {
    if (id === draggedId) continue;
    const rect = el.getBoundingClientRect();
    if (rectsOverlap(draggedRect, rect)) return id;
  }
  return null;
}

export interface WorkspaceProps {
  blocks: FractionBlock[];
  referenceWidth?: number;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  onDragStart?: (blockId: string) => void;
  onCombineAttempt?: (draggedId: string, targetId: string | null) => void;
  onDropOnComparisonZone?: (draggedId: string) => void;
  onWorkspaceBackgroundClick?: () => void;
  onReturnToWorkspace?: (blockId: string) => void;
  isDragging?: boolean;
  draggingBlockId?: string | null;
  combinedBlockId?: string | null;
  splitBlockIds?: string[] | null;
  highlightedBlockIds?: string[];
}

export function Workspace({
  blocks,
  referenceWidth = 300,
  selectedBlockId: _selectedBlockId = null,
  onSelectBlock,
  onDragStart,
  onCombineAttempt,
  onDropOnComparisonZone,
  onWorkspaceBackgroundClick,
  onReturnToWorkspace,
  isDragging = false,
  draggingBlockId = null,
  combinedBlockId = null,
  splitBlockIds = null,
  highlightedBlockIds = [],
}: WorkspaceProps) {
  void _selectedBlockId; // Reserved for ActionBar (ENG-007)
  const workspaceBlocks = blocks.filter((b) => b.position === 'workspace');
  const comparisonBlocks = blocks.filter((b) => b.position === 'comparison');
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const comparisonZoneRef = useRef<HTMLElement | null>(null);

  const setBlockRef = useCallback((blockId: string, element: HTMLElement | null) => {
    if (element) blockRefs.current.set(blockId, element);
    else blockRefs.current.delete(blockId);
  }, []);

  const handleDragEnd = useCallback(
    (draggedId: string, dropRect: DOMRect) => {
      const targetId = findDropTarget(blockRefs.current, draggedId, dropRect);
      if (targetId !== null) {
        onCombineAttempt?.(draggedId, targetId);
        return;
      }
      const zoneEl = comparisonZoneRef.current;
      if (zoneEl) {
        const zoneRect = zoneEl.getBoundingClientRect();
        if (rectsOverlap(dropRect, zoneRect)) {
          onDropOnComparisonZone?.(draggedId);
          return;
        }
      }
      onCombineAttempt?.(draggedId, null);
    },
    [onCombineAttempt, onDropOnComparisonZone]
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
        gap: 0,
      }}
    >
      {/* Active blocks area */}
      <section
        aria-label="Workspace"
        onClick={(e) => {
          if (e.target === e.currentTarget) onWorkspaceBackgroundClick?.();
        }}
        style={{
          minHeight: 80,
          padding: 12,
          marginBottom: 0,
          zIndex: 2,
          position: 'relative',
          backgroundColor: 'transparent',
          borderRadius: 8,
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 8,
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
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
            animateIn={
              block.id === combinedBlockId ||
              (splitBlockIds != null && splitBlockIds.includes(block.id))
            }
            isHighlighted={highlightedBlockIds.includes(block.id)}
          />
        ))}
      </section>

      {/* Comparison zone */}
      <ComparisonZone
        ref={comparisonZoneRef}
        blocks={comparisonBlocks}
        referenceWidth={referenceWidth}
        onSelectBlock={onSelectBlock}
        onReturnToWorkspace={onReturnToWorkspace}
      />
    </div>
  );
}
