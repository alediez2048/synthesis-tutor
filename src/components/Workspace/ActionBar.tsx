import { useState, useCallback, useEffect, useRef } from 'react';
import { COLORS } from '../../theme';
import { MagicButton } from '../shared/MagicButton';

const DEBOUNCE_MS = 500;

export interface ActionBarProps {
  selectedBlockId: string | null;
  onSplitRequest: (parts: number) => void;
  rejectionMessage?: string | null;
  disabled?: boolean;
  tutorialStep?: number;
}

export function ActionBar({
  selectedBlockId,
  onSplitRequest,
  rejectionMessage = null,
  disabled = false,
  tutorialStep,
}: ActionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [debounceActive, setDebounceActive] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debounceActive) return;
    const t = setTimeout(() => setDebounceActive(false), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [debounceActive]);

  useEffect(() => {
    if (pickerOpen && pickerRef.current) {
      const firstBtn = pickerRef.current.querySelector('button');
      firstBtn?.focus();
    }
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [pickerOpen]);

  useEffect(() => {
    if (tutorialStep === 3 && selectedBlockId) {
      setPickerOpen(true);
    }
  }, [tutorialStep, selectedBlockId]);

  const handleSplitClick = useCallback(() => {
    if (disabled || !selectedBlockId || debounceActive) return;
    setPickerOpen((open) => !open);
  }, [disabled, selectedBlockId, debounceActive]);

  const handlePick = useCallback(
    (parts: number) => {
      setPickerOpen(false);
      setDebounceActive(true);
      onSplitRequest(parts);
    },
    [onSplitRequest]
  );

  const canSplit = Boolean(selectedBlockId) && !disabled && !debounceActive;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {rejectionMessage && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            padding: '6px 14px',
            fontSize: 13,
            color: COLORS.goldLight,
            background: 'rgba(212, 168, 67, 0.15)',
            border: `1px solid ${COLORS.gold}40`,
            borderRadius: 8,
            fontFamily: 'Georgia, serif',
          }}
        >
          {rejectionMessage}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span data-tutorial-target="split-button" style={{ display: 'inline-flex' }}>
          <MagicButton
            variant="primary"
            onClick={handleSplitClick}
            disabled={!canSplit}
            aria-label="Split selected block"
            aria-expanded={pickerOpen}
            aria-haspopup="true"
          >
            Split Crystal
          </MagicButton>
        </span>

        {pickerOpen && (
          <div
            ref={pickerRef}
            role="group"
            aria-label="Split into how many pieces?"
            data-tutorial-target="split-picker"
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 14px',
              background: COLORS.panel,
              border: `1px solid ${COLORS.panelBorder}`,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: COLORS.textMuted, fontFamily: 'Georgia, serif' }}>
              Split into:
            </span>
            {([2, 3, 4] as const).map((n) => (
              <MagicButton
                key={n}
                variant="gold"
                small
                onClick={() => handlePick(n)}
                aria-label={`Split into ${n} pieces`}
              >
                {n}
              </MagicButton>
            ))}
            <MagicButton
              variant="ghost"
              small
              onClick={() => setPickerOpen(false)}
              aria-label="Cancel split"
            >
              ✕
            </MagicButton>
          </div>
        )}
      </div>

      {!selectedBlockId && !disabled && (
        <span style={{
          fontSize: 12,
          fontStyle: 'italic',
          color: COLORS.textMuted,
          fontFamily: 'Georgia, serif',
        }}>
          Tap a crystal to select it, then split or compare
        </span>
      )}
    </div>
  );
}
