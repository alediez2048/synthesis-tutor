/**
 * Returns the current viewport width and updates on resize.
 * Used for responsive layout (mobile vs tablet/desktop).
 */

import { useState, useEffect } from 'react';

export function useViewportWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 768
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return width;
}

/** Breakpoint for mobile (phones). Below this, use compact layout. */
export const MOBILE_BREAKPOINT = 480;

/** Breakpoint for narrow viewports (large phones, small tablets). */
export const NARROW_BREAKPOINT = 768;
