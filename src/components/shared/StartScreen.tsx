import { COLORS } from '../../theme';
import { MagicButton } from './MagicButton';

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
        background: COLORS.bgGradient,
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 460,
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Title logo */}
        <img
          src="/assets/title-logo.png"
          alt="Fraction Practice with Sam"
          style={{ height: 250, objectFit: 'contain', marginBottom: 8 }}
        />

        {/* Instructions card */}
        <div
          style={{
            background: COLORS.panel,
            borderRadius: 16,
            padding: 28,
            border: `2px solid ${COLORS.gold}`,
            boxShadow: `0 8px 40px rgba(0,0,0,0.1)`,
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
                border: `3px solid ${COLORS.gold}`,
                objectFit: 'cover',
                flexShrink: 0,
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.5,
              fontFamily: "Georgia, serif",
              color: COLORS.text,
            }}>
              Hi there! I'm <strong style={{ color: COLORS.goldLight }}>Sam</strong>, your friendly guide. Let me show you how to play!
            </p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.03)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <p style={{
              margin: '0 0 10px',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "'Fredoka One', Georgia, serif",
              color: COLORS.gold,
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
                'Tap a block to select it',
                'Split it into smaller equal pieces',
                'Drag two same-size pieces together to combine them',
                'Drag blocks to the comparison area to compare',
              ].map((text) => (
                <li key={text} style={{
                  fontSize: 15,
                  lineHeight: 1.4,
                  fontFamily: "Georgia, serif",
                  color: COLORS.text,
                }}>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p style={{
            margin: 0,
            fontSize: 11,
            color: COLORS.textMuted,
            textAlign: 'center',
            fontFamily: "Georgia, serif",
            letterSpacing: 0.5,
          }}>
            Aligned to Common Core 3.NF.A.3 · Ages 8-12
          </p>
        </div>

        {/* Start button */}
        <div style={{ marginTop: 20 }}>
          <MagicButton
            variant="gold"
            onClick={onStart}
            style={{ padding: '14px 48px', fontSize: 20 }}
          >
            Let's Start!
          </MagicButton>
        </div>
      </div>
    </div>
  );
}
