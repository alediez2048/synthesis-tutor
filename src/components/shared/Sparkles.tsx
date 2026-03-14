/**
 * Sparkles — animated background particles for magical ambiance.
 * 30 absolute-positioned dots with random sizes, positions, and animation timing.
 */

import { useMemo } from 'react';
import { COLORS } from '../../theme';

const PARTICLE_COUNT = 30;
const SPARKLE_COLORS = [COLORS.goldLight, COLORS.crystalGlow];

interface Particle {
  left: string;
  top: string;
  size: number;
  color: string;
  duration: string;
  delay: string;
}

export function Sparkles() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 3,
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
      duration: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 2}s`,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            animation: `sparkle ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
