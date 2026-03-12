export interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/assets/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1a1040',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          maxWidth: 460,
          width: '100%',
        }}
      >
        {/* Title logo */}
        <img
          src="/assets/title-logo.png"
          alt="Fraction Quest with Sam the Math Wizard"
          style={{ height: 280, objectFit: 'contain' }}
        />

        {/* Instructions card */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(30,15,60,0.95) 0%, rgba(50,25,80,0.95) 100%)',
            borderRadius: 16,
            padding: 28,
            border: '2px solid #D4A843',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <img
              src="/assets/sam-avatar.png"
              alt=""
              aria-hidden="true"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '3px solid #D4A843',
                objectFit: 'cover',
                flexShrink: 0,
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.5,
              fontFamily: "'Nunito', sans-serif",
              color: '#E8D5F5',
            }}>
              Hi there! I'm <strong style={{ color: '#fff' }}>Sam the Math Wizard</strong>. Let me show you how to play!
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <p style={{
              margin: '0 0 10px',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "'Fredoka One', 'Nunito', sans-serif",
              color: '#D4A843',
            }}>
              How to Play
            </p>
            <ul style={{
              margin: 0,
              paddingLeft: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {[
                'Tap a crystal to select it',
                'Split it into smaller equal pieces',
                'Drag two same-size pieces together to combine them',
                'Drag crystals to the altar to compare',
              ].map((text) => (
                <li key={text} style={{
                  fontSize: 15,
                  lineHeight: 1.4,
                  fontFamily: "'Nunito', sans-serif",
                  color: '#E8D5F5',
                }}>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(232,213,245,0.5)',
            textAlign: 'center',
            fontFamily: "'Nunito', sans-serif",
          }}>
            This tutor uses AI. No personal information is collected or stored.
          </p>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          style={{
            padding: '14px 48px',
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            background: 'linear-gradient(180deg, #7B2FBE 0%, #5B1F9E 100%)',
            color: '#fff',
            border: '3px solid #D4A843',
            borderRadius: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(123,47,190,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            letterSpacing: 1,
          }}
        >
          Start Lesson
        </button>
      </div>
    </div>
  );
}
