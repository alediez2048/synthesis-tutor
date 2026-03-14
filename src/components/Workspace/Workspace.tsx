import { useRef, useCallback } from 'react';
import type { FractionBlock } from '../../state/types';
import { COLORS } from '../../theme';
import { FractionBlock as FractionBlockComponent } from './FractionBlock';
import { ComparisonZone } from './ComparisonZone';
import type { ComparisonResult } from './ComparisonZone';

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
  onAltarSplit?: (blockId: string, parts: number) => void;
  comparisonResult?: ComparisonResult;
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
  onAltarSplit,
  comparisonResult = null,
  isDragging = false,
  draggingBlockId = null,
  combinedBlockId = null,
  splitBlockIds = null,
  highlightedBlockIds = [],
}: WorkspaceProps) {
  void _selectedBlockId;
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
        width: '100%',
        maxWidth: referenceWidth + 80,
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 14,
      }}
    >
      {/* Crystal Workspace */}
      <section
        data-tutorial-target="workspace-blocks"
        aria-label="Workspace"
        onClick={(e) => {
          if (e.target === e.currentTarget) onWorkspaceBackgroundClick?.();
        }}
        style={{
          flex: 1,
          minHeight: 100,
          padding: 14,
          position: 'relative',
          background: `rgba(139, 92, 246, 0.06)`,
          border: `1.5px solid ${COLORS.panelBorder}`,
          borderRadius: 14,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        {workspaceBlocks.length === 0 && (
          <span style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
            Tap a crystal to select it, then split or compare
          </span>
        )}
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

      {/* Comparison Portal */}
      <ComparisonZone
        ref={comparisonZoneRef}
        blocks={comparisonBlocks}
        referenceWidth={referenceWidth}
        onSelectBlock={onSelectBlock}
        onReturnToWorkspace={onReturnToWorkspace}
        onAltarSplit={onAltarSplit}
        comparisonResult={comparisonResult}
      />
    </div>
  );
}
