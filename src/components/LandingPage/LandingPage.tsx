import { useSignIn, useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import { setProgressUserId } from '../../state/progressStore';
import { isClerkEnabled } from '../../hooks/useClerkSafe';
import { useViewportWidth } from '../../hooks/useViewportWidth';

export interface LandingPageProps {
  onPlay: () => void;
}

const MOBILE_BREAKPOINT = 480;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 16,
  border: '1.5px solid #d4c5a0',
  borderRadius: 8,
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: "'Nunito', sans-serif",
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#5a4a3a',
  marginBottom: 6,
  fontFamily: "'Nunito', sans-serif",
};

function ClerkLanding({ onPlay }: LandingPageProps) {
  const { isSignedIn, user } = useUser();
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;

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
            padding: isMobile ? '12px 0' : '14px 0',
            fontSize: isMobile ? 16 : 18,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !setActive) return;
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
      } else {
        // For signup, redirect to Clerk's signup flow
        window.location.href = '/sign-up';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg.includes('identifier') ? 'Invalid email or password' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LandingShell>
      {/* Sam avatar */}
      <img
        src="/assets/sam-avatar.png"
        alt=""
        style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', marginBottom: isMobile ? 8 : 12 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 14 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: 13, color: '#e53e3e', textAlign: 'center' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: isMobile ? '12px 0' : '14px 0',
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            fontFamily: "'Fredoka One', 'Nunito', sans-serif",
            background: isLoading ? '#999' : 'linear-gradient(180deg, #4A90D9 0%, #3570b8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 3px 10px rgba(74,144,217,0.4)',
            letterSpacing: 0.5,
            marginTop: 4,
          }}
        >
          {isLoading ? 'Loading...' : 'Log In'}
        </button>
      </form>

      <div style={{ width: '100%', height: 1, backgroundColor: '#d4c5a0', margin: isMobile ? '12px 0' : '16px 0' }} />

      <button
        type="button"
        onClick={onPlay}
        style={{
          background: 'none',
          border: 'none',
          color: '#4A90D9',
          fontSize: isMobile ? 14 : 15,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif",
          marginBottom: 8,
        }}
      >
        Play as Guest
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        style={{
          background: 'none',
          border: 'none',
          color: '#5a4a3a',
          fontSize: isMobile ? 13 : 14,
          cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {mode === 'login' ? 'Create an account' : 'Already have an account? Log in'}
      </button>
    </LandingShell>
  );
}

function GuestLanding({ onPlay }: LandingPageProps) {
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  return (
    <LandingShell>
      <button
        type="button"
        onClick={onPlay}
        style={{
          width: '100%',
          padding: isMobile ? '12px 0' : '14px 0',
          fontSize: isMobile ? 16 : 18,
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
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/assets/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f0f4f8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Title — closer to top, smaller on mobile */}
      <img
        src="/assets/title-logo.png"
        alt="Fraction Practice"
        style={{
          position: 'absolute',
          top: isMobile ? 12 : 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? '85%' : '90%',
          maxWidth: isMobile ? 320 : 567,
          height: 'auto',
          objectFit: 'contain',
          zIndex: 1,
        }}
      />

      {/* Auth box — centered, compact on mobile */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% + 50px)',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '92%' : '85%',
          maxWidth: isMobile ? 340 : 380,
          padding: isMobile ? 16 : 24,
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(180deg, #faf3e0 0%, #f5e6c8 100%)',
            borderRadius: isMobile ? 16 : 20,
            padding: isMobile ? '24px 20px 20px' : '32px 28px 24px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {children}
        </div>
      </div>

      {/* Sam — smaller on mobile so auth box stays usable */}
      <img
        src="/assets/sam-waving.png"
        alt="Sam"
        style={{
          position: 'fixed',
          bottom: isMobile ? -60 : -40,
          right: isMobile ? -40 : -20,
          height: isMobile ? 220 : 380,
          objectFit: 'contain',
          objectPosition: 'bottom right',
          pointerEvents: 'none',
          zIndex: 10,
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
