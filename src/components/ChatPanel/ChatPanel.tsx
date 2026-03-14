import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../../state/types';
import { COLORS } from '../../theme';
import { MessageBubble } from './MessageBubble';
import { InputField } from './InputField';
import { useVoiceInput } from '../../brain/useVoiceInput';

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  onVoiceInputStateChange?: (isListening: boolean) => void;
  layout?: 'sidebar' | 'bottomBar';
}

export function ChatPanel({
  messages,
  onSendMessage,
  isLoading = false,
  onVoiceInputStateChange,
  layout = 'sidebar',
}: ChatPanelProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  const voice = useVoiceInput((transcript) => {
    setInputValue(transcript);
  });

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    onVoiceInputStateChange?.(voice.isListening);
  }, [voice.isListening, onVoiceInputStateChange]);

  const handleSend = (text: string) => {
    onSendMessage(text);
    setInputValue('');
  };

  const lastTutorMsg = [...messages].reverse().find((m) => m.sender === 'tutor');

  if (layout === 'bottomBar') {
    return (
      <section
        aria-label="Chat with Sam"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '10px 16px',
          width: '100%',
          boxSizing: 'border-box',
          background: 'rgba(10, 5, 30, 0.6)',
          borderTop: `1px solid ${COLORS.panelBorder}`,
        }}
      >
        {/* Sam's latest message */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: `2px solid ${COLORS.gold}`,
                overflow: 'hidden',
              }}
            >
              <img
                src="/assets/sam-avatar.png"
                alt=""
                aria-hidden="true"
                style={{ width: 48, height: 48, objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>
          <p
            aria-live="polite"
            aria-atomic="true"
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.5,
              flex: 1,
              minWidth: 0,
              fontFamily: 'Georgia, serif',
              color: COLORS.text,
            }}
          >
            {isLoading
              ? 'Sam is thinking...'
              : lastTutorMsg?.content ?? 'Say hi to get started!'}
          </p>
        </div>
        {/* Input */}
        <InputField
          onSend={handleSend}
          disabled={isLoading}
          value={inputValue}
          onChange={setInputValue}
          voiceSupported={voice.supported}
          isListening={voice.isListening}
          transcript={voice.transcript}
          onStartListening={voice.startListening}
          onStopListening={voice.stopListening}
        />
        <div ref={scrollEndRef} />
      </section>
    );
  }

  // Sidebar layout
  return (
    <section
      aria-label="Chat with Sam"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'rgba(10, 5, 30, 0.4)',
        borderRight: `1px solid ${COLORS.panelBorder}`,
      }}
    >
      <div
        role="list"
        aria-label="Message list"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 14,
          minHeight: 120,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 100,
              color: COLORS.textMuted,
              fontSize: 14,
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            <p style={{ margin: 0 }}>Say hi to get started!</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 0',
              fontSize: 13,
              color: COLORS.textMuted,
              fontFamily: 'Georgia, serif',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: COLORS.purpleLight,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <span>Sam is thinking...</span>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${COLORS.panelBorder}`, background: 'rgba(10, 5, 30, 0.6)' }}>
        {voice.error && (
          <div
            role="alert"
            style={{
              marginBottom: 8,
              padding: '8px 12px',
              fontSize: 13,
              color: COLORS.incorrect,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 8,
              fontFamily: 'Georgia, serif',
            }}
          >
            {voice.error}
          </div>
        )}
        <InputField
          onSend={handleSend}
          disabled={isLoading}
          value={inputValue}
          onChange={setInputValue}
          voiceSupported={voice.supported}
          isListening={voice.isListening}
          transcript={voice.transcript}
          onStartListening={voice.startListening}
          onStopListening={voice.stopListening}
        />
      </div>
    </section>
  );
}
