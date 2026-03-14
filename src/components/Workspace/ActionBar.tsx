import { useState, useCallback, useEffect, useRef } from 'react';

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
    // #region agent log
    fetch('http://127.0.0.1:7645/ingest/06da57cd-98d4-4d53-aae0-efe3eb248d50',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'505951'},body:JSON.stringify({sessionId:'505951',location:'ActionBar.tsx:handleSplitClick',message:'Split clicked',data:{disabled,selectedBlockId,debounceActive,willReturnEarly:Boolean(disabled||!selectedBlockId||debounceActive)},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (disabled || !selectedBlockId || debounceActive) return;
    setPickerOpen((open) => !open);
  }, [disabled, selectedBlockId, debounceActive]);

  const handlePick = useCallback(
    (parts: number) => {
      // #region agent log
      fetch('http://127.0.0.1:7645/ingest/06da57cd-98d4-4d53-aae0-efe3eb248d50',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'505951'},body:JSON.stringify({sessionId:'505951',location:'ActionBar.tsx:handlePick',message:'Picker picked',data:{parts},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setPickerOpen(false);
      setDebounceActive(true);
      onSplitRequest(parts);
    },
    [onSplitRequest]
  );

  const pickerRef = useRef<HTMLDivElement>(null);

  // Focus first picker button when opened
  useEffect(() => {
    if (pickerOpen && pickerRef.current) {
      const firstBtn = pickerRef.current.querySelector('button');
      firstBtn?.focus();
    }
  }, [pickerOpen]);

  // Close picker on Escape
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPickerOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [pickerOpen]);

  const canSplit = Boolean(selectedBlockId) && !disabled && !debounceActive;

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7645/ingest/06da57cd-98d4-4d53-aae0-efe3eb248d50',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'505951'},body:JSON.stringify({sessionId:'505951',location:'ActionBar.tsx',message:'ActionBar render',data:{selectedBlockId,disabled,debounceActive,canSplit},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  }, [selectedBlockId, disabled, debounceActive, canSplit]);
  // #endregion

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleSplitClick}
          disabled={!canSplit}
          aria-label="Split selected block"
          aria-expanded={pickerOpen}
          aria-haspopup="true"
          style={{
            minWidth: 120,
            minHeight: 52,
            padding: '10px 28px',
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            letterSpacing: 1,
            color: canSplit ? '#fff' : 'rgba(255,255,255,0.5)',
            background: canSplit
              ? 'linear-gradient(180deg, #7B2FBE 0%, #5B1F9E 100%)'
              : 'rgba(60,30,90,0.4)',
            border: canSplit ? '2px solid #D4A843' : '2px solid rgba(150,120,60,0.3)',
            borderRadius: 12,
            cursor: canSplit ? 'pointer' : 'not-allowed',
            boxShadow: canSplit
              ? '0 4px 12px rgba(123,47,190,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
              : 'none',
            textShadow: canSplit ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          Split
        </button>
        {pickerOpen && (
          <div
            ref={pickerRef}
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
                  minWidth: 52,
                  minHeight: 52,
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                  color: '#fff',
                  background: 'linear-gradient(180deg, #D4A843 0%, #B8892E 100%)',
                  border: '2px solid #E8C65A',
                  borderRadius: 12,
                  cursor: 'pointer',
                  boxShadow: '0 3px 8px rgba(180,137,46,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
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
