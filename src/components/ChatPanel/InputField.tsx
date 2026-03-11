import { useState, useCallback } from 'react';

export interface InputFieldProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const MIN_TOUCH_PX = 44;

export function InputField({ onSend, disabled = false }: InputFieldProps) {
  const [value, setValue] = useState('');

  const send = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '8px 0',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Type your answer"
        style={{
          flex: 1,
          minHeight: 40,
          padding: '8px 12px',
          fontSize: 16,
          border: '1px solid rgba(0,0,0,0.2)',
          borderRadius: 8,
          outline: 'none',
        }}
      />
      <button
        type="button"
        onClick={send}
        disabled={disabled}
        aria-label="Send message"
        style={{
          minWidth: MIN_TOUCH_PX,
          minHeight: MIN_TOUCH_PX,
          padding: '0 12px',
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          backgroundColor: '#4A90D9',
          border: 'none',
          borderRadius: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        Send
      </button>
    </div>
  );
}
