/**
 * Fraction Practice — shared color system and theme constants.
 * Single source of truth for all visual styling.
 */

export const COLORS = {
  // Backgrounds — calm, light palette (Hinten et al.: reduce extraneous cognitive load)
  bg: '#f0f4f8',
  bgGradient: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 40%, #f0f4f8 100%)',
  panel: 'rgba(255, 255, 255, 0.92)',
  panelBorder: 'rgba(100, 116, 139, 0.2)',

  // Accents
  gold: '#d4a843',
  goldLight: '#f0d080',
  purple: '#7c3aed',
  purpleLight: '#a78bfa',
  purpleDark: '#3b0764',
  accent: '#60a5fa',
  accentLight: '#93c5fd',
  /** @deprecated Use `accent` instead */
  crystal: '#60a5fa',
  /** @deprecated Use `accentLight` instead */
  crystalGlow: '#93c5fd',

  // Text — dark on light background
  text: '#1e293b',
  textMuted: '#64748b',

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
