import { SignIn, useUser } from '@clerk/clerk-react';
import { setProgressUserId } from '../../state/progressStore';
import { isClerkEnabled } from '../../hooks/useClerkSafe';

export interface LandingPageProps {
  onPlay: () => void;
}

function ClerkLanding({ onPlay }: LandingPageProps) {
  const { isSignedIn, user } = useUser();

  // Sync user ID for progress isolation
  if (user) {
    setProgressUserId(user.id);
  }

  if (isSignedIn) {
    return (
      <LandingShell>
        <button
          type="button"
          onClick={onPlay}
          style={{
            width: '100%',
            padding: '14px 0',
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            background: 'linear-gradient(180deg, #4A90D9 0%, #3570b8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(74,144,217,0.4)',
            letterSpacing: 0.5,
          }}
        >
          Continue Playing
        </button>
      </LandingShell>
    );
  }

  return (
    <LandingShell>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <SignIn
          appearance={{
            elements: {
              rootBox: { width: '100%' },
              card: {
                background: 'transparent',
                boxShadow: 'none',
                border: 'none',
                padding: 0,
                width: '100%',
              },
              formButtonPrimary: {
                background: 'linear-gradient(180deg, #4A90D9 0%, #3570b8 100%)',
                boxShadow: '0 3px 10px rgba(74,144,217,0.4)',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                padding: '12px 0',
              },
              formFieldInput: {
                borderRadius: '10px',
                border: '1.5px solid #d4c5a0',
                fontSize: '16px',
                padding: '12px 14px',
              },
              footerActionLink: {
                color: '#4A90D9',
              },
              headerTitle: { display: 'none' },
              headerSubtitle: { display: 'none' },
            },
          }}
        />
      </div>

      <div style={{ width: '100%', height: 1, backgroundColor: '#d4c5a0', margin: '16px 0' }} />

      <button
        type="button"
        onClick={onPlay}
        style={{
          background: 'none',
          border: 'none',
          color: '#4A90D9',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        Play as Guest
      </button>
    </LandingShell>
  );
}

function GuestLanding({ onPlay }: LandingPageProps) {
  return (
    <LandingShell>
      <button
        type="button"
        onClick={onPlay}
        style={{
          width: '100%',
          padding: '14px 0',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          background: 'linear-gradient(180deg, #4A90D9 0%, #3570b8 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(74,144,217,0.4)',
          letterSpacing: 0.5,
        }}
      >
        Play
      </button>
    </LandingShell>
  );
}

function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/assets/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1a0a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <img
        src="/assets/title-logo.png"
        alt="Fraction Quest"
        style={{
          width: '80%',
          maxWidth: 420,
          height: 'auto',
          objectFit: 'contain',
          marginBottom: 24,
        }}
      />

      <div
        style={{
          width: '85%',
          maxWidth: 380,
          background: 'linear-gradient(180deg, #faf3e0 0%, #f5e6c8 100%)',
          borderRadius: 20,
          padding: '32px 28px 24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </div>

      <img
        src="/assets/sam-waving.png"
        alt="Sam the Math Wizard"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          height: 220,
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
}

export function LandingPage(props: LandingPageProps) {
  if (isClerkEnabled()) {
    return <ClerkLanding {...props} />;
  }
  return <GuestLanding {...props} />;
}
