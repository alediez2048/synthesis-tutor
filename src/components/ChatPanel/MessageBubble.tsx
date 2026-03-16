import type { ChatMessage } from '../../state/types';
import { COLORS } from '../../theme';

export interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isTutor = message.sender === 'tutor';

  return (
    <div
      role="listitem"
      aria-label={isTutor ? `Sam: ${message.content}` : undefined}
      style={{
        display: 'flex',
        flexDirection: isTutor ? 'row' : 'row-reverse',
        gap: 10,
        alignItems: 'flex-start',
        marginBottom: 10,
        animation: 'fadeSlideIn 0.4s ease-out',
      }}
    >
      {isTutor && (
        <img
          src="/assets/sam-avatar.png"
          alt=""
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `2px solid ${COLORS.gold}`,
            objectFit: 'cover',
            flexShrink: 0,
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: isTutor ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          fontSize: 14,
          fontFamily: 'Georgia, serif',
          lineHeight: 1.5,
          background: isTutor
            ? `rgba(124,58,237,0.08)`
            : `rgba(96,165,250,0.1)`,
          border: isTutor
            ? `1px solid rgba(124,58,237,0.15)`
            : `1px solid rgba(96,165,250,0.2)`,
          color: COLORS.text,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {isTutor && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.purpleLight,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Sam
          </div>
        )}
        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </span>
      </div>
    </div>
  );
}
