import { useState, useCallback, useRef } from 'react';

export interface InputFieldProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  voiceSupported?: boolean;
  isListening?: boolean;
  transcript?: string;
  onStartListening?: () => void;
  onStopListening?: () => void;
}

const MIN_TOUCH_PX = 44;

export function InputField({
  onSend,
  disabled = false,
  value: controlledValue,
  onChange: controlledOnChange,
  voiceSupported = false,
  isListening = false,
  transcript = '',
  onStartListening,
  onStopListening,
}: InputFieldProps) {
  const [internalValue, setInternalValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledOnChange ?? setInternalValue;

  const send = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      if (!disabled && !value.trim()) {
        setShaking(true);
        clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = setTimeout(() => setShaking(false), 300);
      }
      return;
    }
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend, setValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const displayValue = isListening ? transcript : value;
  const isInterim = isListening && transcript !== '';

  return (
    <>
      <style>{`
        @keyframes pulse-recording {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes shake-input {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
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
        value={displayValue}
        onChange={(e) => !isListening && setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Type your answer"
        placeholder={isListening ? '' : 'Type your answer...'}
        style={{
          flex: 1,
          minHeight: 40,
          padding: '8px 12px',
          fontSize: 16,
          border: '1px solid rgba(0,0,0,0.2)',
          borderRadius: 8,
          outline: 'none',
          fontStyle: isInterim ? 'italic' : 'normal',
          color: isInterim ? 'rgba(0,0,0,0.6)' : undefined,
          animation: shaking ? 'shake-input 300ms ease' : 'none',
        }}
      />
      {voiceSupported && (
        <>
          {isListening && (
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#e74c3c',
                animation: 'pulse-recording 1.5s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
          )}
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            style={{
              minWidth: MIN_TOUCH_PX,
              minHeight: MIN_TOUCH_PX,
              padding: 0,
              fontSize: '1.25rem',
              backgroundColor: isListening ? '#e74c3c' : 'transparent',
              color: isListening ? '#fff' : 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 8,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isListening ? '⏹' : '🎤'}
          </button>
        </>
      )}
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
    </>
  );
}
