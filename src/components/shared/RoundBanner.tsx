/**
 * Animated banner showing the current exploration round name.
 * Gold text, fade-in, displays ~1.5s then calls onComplete.
 */

import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../../theme';

const BANNER_DISPLAY_MS = 1500;

export interface RoundBannerProps {
  roundName: string;
  visible: boolean;
  onComplete?: () => void;
}

export function RoundBanner({ roundName, visible, onComplete }: RoundBannerProps) {
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      queueMicrotask(() => setMounted(false));
      return;
    }

    queueMicrotask(() => setMounted(true));

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setMounted(false);
      onComplete?.();
    }, BANNER_DISPLAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Round: ${roundName}`}
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: `translateX(-50%) translateY(${mounted ? 0 : -12}px)`,
        opacity: mounted ? 1 : 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        padding: '8px 20px',
        background: `linear-gradient(135deg, ${COLORS.gold}22, ${COLORS.gold}11)`,
        border: `1px solid ${COLORS.gold}60`,
        borderRadius: 12,
        boxShadow: `0 4px 20px ${COLORS.gold}30`,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.goldLight,
          textShadow: `0 1px 2px rgba(0,0,0,0.5)`,
        }}
      >
        {roundName}
      </span>
    </div>
  );
}
