/**
 * ENG-024: React hook wrapping SoundManager singleton.
 * Mute state, unlock, prefers-reduced-motion.
 */

import { useState, useCallback, useEffect } from 'react';
import { soundManager } from './SoundManager';

function getInitialMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useSoundManager() {
  const [muted, setMuted] = useState(getInitialMuted);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      return next;
    });
  }, []);

  const unlock = useCallback(() => {
    soundManager.unlock();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    soundManager.setMuted(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      soundManager.setMuted(e.matches);
      setMuted(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return {
    muted,
    toggleMute,
    unlock,
    playPop: soundManager.playPop.bind(soundManager),
    playSnap: soundManager.playSnap.bind(soundManager),
    playCorrect: soundManager.playCorrect.bind(soundManager),
    playIncorrect: soundManager.playIncorrect.bind(soundManager),
    playCelebration: soundManager.playCelebration.bind(soundManager),
  };
}
