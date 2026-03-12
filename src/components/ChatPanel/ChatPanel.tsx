import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../../state/types';
import { MessageBubble } from './MessageBubble';
import { InputField } from './InputField';
import { useVoiceInput } from '../../brain/useVoiceInput';

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  /** Called when voice input listening state changes (for TTS to avoid mic interference) */
  onVoiceInputStateChange?: (isListening: boolean) => void;
  /** 'sidebar' = tall left panel (default), 'bottomBar' = compact full-width bottom bar */
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
          backgroundColor: 'rgba(255,255,255,0.95)',
        }}
      >
        {/* Top row: Sam avatar + latest message */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#4A90D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src="/assets/sam-avatar.png"
                alt=""
                aria-hidden="true"
                style={{ width: 72, height: 72, objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700 }}>Sam</span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.4,
              flex: 1,
              minWidth: 0,
            }}
          >
            {isLoading
              ? 'Sam is typing...'
              : lastTutorMsg?.content ?? 'Say hi to get started!'}
          </p>
        </div>
        {/* Bottom row: input field */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <InputField
              onSend={(text) => {
                onSendMessage(text);
                setInputValue('');
              }}
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
        </div>
        <div ref={scrollEndRef} />
      </section>
    );
  }

  return (
    <section
      aria-label="Chat with Sam"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        backgroundColor: '#fafafa',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div
        role="list"
        aria-label="Message list"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
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
              color: 'rgba(0,0,0,0.45)',
              fontSize: 14,
            }}
          >
            <p style={{ margin: 0 }}>No messages yet. Say hi to get started!</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 0',
              fontSize: 14,
              color: 'rgba(0,0,0,0.5)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'currentColor',
              }}
            />
            <span>Sam is typing...</span>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        {voice.error && (
          <div
            role="alert"
            style={{
              marginBottom: 8,
              padding: '8px 12px',
              fontSize: 14,
              color: '#c0392b',
              backgroundColor: 'rgba(192, 57, 43, 0.1)',
              borderRadius: 8,
            }}
          >
            {voice.error}
          </div>
        )}
        <InputField
          onSend={(text) => {
            onSendMessage(text);
            setInputValue('');
          }}
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
