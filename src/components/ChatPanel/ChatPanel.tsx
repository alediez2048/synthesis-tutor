import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../state/types';
import { MessageBubble } from './MessageBubble';
import { InputField } from './InputField';

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isLoading = false,
}: ChatPanelProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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
        <InputField onSend={onSendMessage} disabled={isLoading} />
      </div>
    </section>
  );
}
