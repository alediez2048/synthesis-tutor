import { useState, useCallback, useEffect } from 'react';

const MIN_TOUCH_PX = 44;
const DEBOUNCE_MS = 500;

export interface ActionBarProps {
  selectedBlockId: string | null;
  onSplitRequest: (parts: number) => void;
  rejectionMessage?: string | null;
  disabled?: boolean;
}

export function ActionBar({
  selectedBlockId,
  onSplitRequest,
  rejectionMessage = null,
  disabled = false,
}: ActionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [debounceActive, setDebounceActive] = useState(false);

  useEffect(() => {
    if (!debounceActive) return;
    const t = setTimeout(() => setDebounceActive(false), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [debounceActive]);

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
        gap: 8,
        marginTop: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleSplitClick}
          disabled={!canSplit}
          aria-label="Split selected block"
          aria-expanded={pickerOpen}
          aria-haspopup="true"
          style={{
            minWidth: MIN_TOUCH_PX,
            minHeight: MIN_TOUCH_PX,
            padding: '0 14px',
            fontSize: 14,
            fontWeight: 600,
            color: canSplit ? '#fff' : 'rgba(0,0,0,0.5)',
            backgroundColor: canSplit ? '#4A90D9' : 'rgba(0,0,0,0.08)',
            border: 'none',
            borderRadius: 8,
            cursor: canSplit ? 'pointer' : 'not-allowed',
            boxShadow: canSplit ? '0 2px 4px rgba(74,144,217,0.3)' : 'none',
          }}
        >
          Split
        </button>
        {pickerOpen && (
          <div
            role="group"
            aria-label="Split into how many pieces?"
            style={{ display: 'flex', gap: 8 }}
          >
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handlePick(n)}
                aria-label={`Split into ${n} pieces`}
                style={{
                  minWidth: MIN_TOUCH_PX,
                  minHeight: MIN_TOUCH_PX,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#4A90D9',
                  backgroundColor: '#fff',
                  border: '2px solid #4A90D9',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
      {rejectionMessage && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            padding: '6px 10px',
            fontSize: 13,
            color: '#856404',
            backgroundColor: 'rgba(255,193,7,0.2)',
            border: '1px solid rgba(255,193,7,0.5)',
            borderRadius: 6,
          }}
        >
          {rejectionMessage}
        </div>
      )}
    </div>
  );
}
