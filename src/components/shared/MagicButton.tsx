/**
 * MagicButton — reusable themed button for Fraction Quest.
 * Variants: primary (purple), gold, success (green), danger (red), ghost (transparent).
 */

import type { CSSProperties, ReactNode, MouseEvent, KeyboardEvent } from 'react';
import { COLORS } from '../../theme';

export type MagicButtonVariant = 'primary' | 'gold' | 'success' | 'danger' | 'ghost';

export interface MagicButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  variant?: MagicButtonVariant;
  disabled?: boolean;
  small?: boolean;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'true';
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}

const VARIANT_STYLES: Record<MagicButtonVariant, { bg: string; border: string; color: string; shadow: string }> = {
  primary: {
    bg: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleDark})`,
    border: `1px solid ${COLORS.purpleLight}40`,
    color: '#fff',
    shadow: `0 4px 15px rgba(124, 58, 237, 0.4)`,
  },
  gold: {
    bg: `linear-gradient(135deg, ${COLORS.gold}, #b8860b)`,
    border: `1px solid ${COLORS.goldLight}60`,
    color: '#fff',
    shadow: `0 4px 15px rgba(212, 168, 67, 0.4)`,
  },
  success: {
    bg: `linear-gradient(135deg, ${COLORS.correct}, #16a34a)`,
    border: `1px solid #4ade8060`,
    color: '#fff',
    shadow: `0 4px 15px rgba(34, 197, 94, 0.4)`,
  },
  danger: {
    bg: `linear-gradient(135deg, ${COLORS.incorrect}, #dc2626)`,
    border: `1px solid #f8717160`,
    color: '#fff',
    shadow: `0 4px 15px rgba(239, 68, 68, 0.4)`,
  },
  ghost: {
    bg: 'transparent',
    border: `1px solid ${COLORS.panelBorder}`,
    color: COLORS.textMuted,
    shadow: 'none',
  },
};

export function MagicButton({
  children,
  onClick,
  onKeyDown,
  variant = 'primary',
  disabled = false,
  small = false,
  type = 'button',
  style,
  ...ariaProps
}: MagicButtonProps) {
  const v = VARIANT_STYLES[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      {...ariaProps}
      style={{
        background: disabled ? 'rgba(148, 163, 184, 0.3)' : v.bg,
        border: disabled ? `1px solid rgba(148, 163, 184, 0.3)` : v.border,
        color: disabled ? 'rgba(100, 116, 139, 0.5)' : v.color,
        boxShadow: disabled ? 'none' : v.shadow,
        padding: small ? '6px 14px' : '10px 22px',
        fontSize: small ? 13 : 15,
        fontWeight: 700,
        fontFamily: "'Fredoka One', 'Nunito', Georgia, serif",
        borderRadius: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: 0.5,
        minHeight: 44,
        minWidth: 44,
        transition: 'all 0.2s ease',
        textShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
