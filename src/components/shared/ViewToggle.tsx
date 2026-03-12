/**
 * ENG-030: Portrait mode tab bar — Spell Table / Sam's Chat.
 */

const MIN_TAP_PX = 44;

export interface ViewToggleProps {
  activeView: 'workspace' | 'chat';
  onToggle: (view: 'workspace' | 'chat') => void;
  /** Optional unread indicator on chat tab */
  hasUnread?: boolean;
}

export function ViewToggle({
  activeView,
  onToggle,
  hasUnread = false,
}: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View toggle"
      style={{
        display: 'flex',
        gap: 0,
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderRadius: 22,
        padding: 4,
      }}
    >
      <button
        role="tab"
        aria-selected={activeView === 'workspace'}
        aria-label="Spell Table"
        type="button"
        onClick={() => onToggle('workspace')}
        style={{
          minWidth: MIN_TAP_PX,
          minHeight: MIN_TAP_PX,
          padding: '8px 20px',
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          borderRadius: 18,
          cursor: 'pointer',
          backgroundColor: activeView === 'workspace' ? '#4A90D9' : 'transparent',
          color: activeView === 'workspace' ? '#fff' : 'rgba(0,0,0,0.5)',
        }}
      >
        Spell Table
      </button>
      <button
        role="tab"
        aria-selected={activeView === 'chat'}
        aria-label="Sam's Chat"
        type="button"
        onClick={() => onToggle('chat')}
        style={{
          position: 'relative',
          minWidth: MIN_TAP_PX,
          minHeight: MIN_TAP_PX,
          padding: '8px 20px',
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          borderRadius: 18,
          cursor: 'pointer',
          backgroundColor: activeView === 'chat' ? '#4A90D9' : 'transparent',
          color: activeView === 'chat' ? '#fff' : 'rgba(0,0,0,0.5)',
        }}
      >
        Sam&apos;s Chat
        {hasUnread && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#e74c3c',
            }}
          />
        )}
      </button>
    </div>
  );
}
