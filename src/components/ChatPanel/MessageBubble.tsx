import type { ChatMessage } from '../../state/types';

export interface MessageBubbleProps {
  message: ChatMessage;
}

const AVATAR_SIZE = 36;

function SamAvatar() {
  return (
    <div
      aria-hidden
      style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: '50%',
        backgroundColor: '#4A90D9',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* eyes */}
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: 6,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#fff',
          }}
        />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#fff',
          }}
        />
      </span>
    </div>
  );
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
        marginBottom: 12,
      }}
    >
      {isTutor && <SamAvatar />}
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: 12,
          fontSize: 15,
          lineHeight: 1.4,
          backgroundColor: isTutor ? 'rgba(74, 144, 217, 0.15)' : 'rgba(39, 174, 96, 0.2)',
          border: isTutor ? '1px solid rgba(74, 144, 217, 0.3)' : '1px solid rgba(39, 174, 96, 0.3)',
        }}
      >
        {isTutor && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#4A90D9',
              marginBottom: 4,
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
