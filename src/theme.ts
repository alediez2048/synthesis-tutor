/**
 * Fraction Quest — shared color system and theme constants.
 * Single source of truth for all visual styling.
 */

export const COLORS = {
  // Backgrounds
  bg: '#1a0a2e',
  bgGradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #1a0a2e 100%)',
  panel: 'rgba(30, 15, 60, 0.85)',
  panelBorder: 'rgba(180, 140, 255, 0.3)',

  // Accents
  gold: '#d4a843',
  goldLight: '#f0d080',
  purple: '#7c3aed',
  purpleLight: '#a78bfa',
  purpleDark: '#3b0764',
  crystal: '#60a5fa',
  crystalGlow: '#93c5fd',

  // Text
  text: '#f0e6ff',
  textMuted: '#b8a0d8',

  // Semantic
  correct: '#22c55e',
  incorrect: '#ef4444',

  // Fraction blocks by denominator
  denom: {
    1:  { bg: '#60a5fa', border: '#93c5fd' },
    2:  { bg: '#3b82f6', border: '#60a5fa' },
    3:  { bg: '#22c55e', border: '#4ade80' },
    4:  { bg: '#8b5cf6', border: '#a78bfa' },
    6:  { bg: '#f59e0b', border: '#fbbf24' },
    8:  { bg: '#14b8a6', border: '#2dd4bf' },
    12: { bg: '#ec4899', border: '#f472b6' },
  },
} as const;

export const getDenomColor = (d: number) =>
  COLORS.denom[d as keyof typeof COLORS.denom] ?? COLORS.denom[4];
