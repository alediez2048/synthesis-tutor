/**
 * ENG-028: Celebration confetti — crystal-colored particles on 3/3 perfect score.
 * Uses only transform and opacity for 60fps composited animation.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

const CRYSTAL_PALETTE = [
  '#4A90D9', // Sapphire
  '#27AE60', // Emerald
  '#8E44AD', // Amethyst
  '#F39C12', // Citrine
  '#E67E22', // Topaz
  '#16A085', // Aquamarine
  '#E84393', // Rose Quartz
  '#FDCB6E', // Gold
];

export interface ConfettiProps {
  /** Number of particles to spawn. Default: 60 */
  count?: number;
  /** Total animation duration in ms. Default: 2000 */
  duration?: number;
  /** Callback when animation completes (for cleanup/unmount) */
  onComplete?: () => void;
}

interface Particle {
  id: number;
  left: number;
  startOffset: number;
  drift: number;
  rotation: number;
  size: number;
  width: number;
  height: number;
  color: string;
  delay: number;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateParticles(count: number): Particle[] {
  const result: Particle[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: i,
      left: Math.random() * 100,
      startOffset: Math.random() * -20,
      drift: (Math.random() - 0.5) * 120,
      rotation: Math.random() * 720,
      size: 8 + Math.random() * 6,
      width: 1,
      height: Math.random() < 0.5 ? 1 : 1.5, // aspect 1:1 or 1:1.5
      color: pick(CRYSTAL_PALETTE),
      delay: Math.random() * 400,
    });
  }
  return result;
}

export function Confetti({
  count = 60,
  duration = 2000,
  onComplete,
}: ConfettiProps) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(count));
  }, [count]);

  const keyframesCss = useMemo(() => {
    return particles
      .map(
        (p) => `
        @keyframes confetti-${p.id} {
          0% { transform: translateY(${p.startOffset}vh) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100vh) translateX(${p.drift}px) rotate(${p.rotation}deg); opacity: 0; }
        }
      `
      )
      .join('');
  }, [particles]);

  useEffect(() => {
    if (reducedMotion) {
      onComplete?.();
      return;
    }
    const maxDelay = Math.max(...particles.map((p) => p.delay), 0);
    completeTimeoutRef.current = setTimeout(() => {
      onComplete?.();
    }, maxDelay + duration);
    return () => {
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, [duration, onComplete, particles, reducedMotion]);

  if (reducedMotion || particles.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <style>{keyframesCss}</style>
      {particles.map((p) => {
        const w = p.size * p.width;
        const h = p.size * p.height;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}vw`,
              top: 0,
              width: w,
              height: h,
              borderRadius: 2,
              backgroundColor: p.color,
              animation: `confetti-${p.id} ${duration}ms linear ${p.delay}ms forwards`,
              transformOrigin: 'center center',
            }}
          />
        );
      })}
    </div>
  );
}
