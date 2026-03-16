import { useState, useCallback, useRef } from 'react';
import { COLORS } from '../../theme';
import { MagicButton } from '../shared/MagicButton';

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
    <div
      data-tutorial-target="chat-input"
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <input
        type="text"
        value={displayValue}
        onChange={(e) => !isListening && setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Type your answer"
        placeholder={isListening ? 'Listening...' : 'Type your answer...'}
        style={{
          flex: 1,
          minHeight: 40,
          padding: '10px 14px',
          fontSize: 14,
          fontFamily: 'Georgia, serif',
          background: 'rgba(255,255,255,0.8)',
          border: `1px solid ${COLORS.panelBorder}`,
          borderRadius: 12,
          outline: 'none',
          color: COLORS.text,
          fontStyle: isInterim ? 'italic' : 'normal',
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
                backgroundColor: COLORS.incorrect,
                animation: 'pulse 1.5s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
          )}
          <MagicButton
            variant={isListening ? 'danger' : 'ghost'}
            small
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            style={{ padding: '0 10px', fontSize: '1.25rem' }}
          >
            {isListening ? '⏹' : '🎤'}
          </MagicButton>
        </>
      )}
      <MagicButton
        variant="primary"
        small
        onClick={send}
        disabled={disabled}
        aria-label="Send message"
      >
        Send
      </MagicButton>
    </div>
  );
}
