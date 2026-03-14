/**
 * Shared block creation utilities. Used by reducer and curriculum.
 */

import type { Fraction } from '../engine/FractionEngine';
import type { FractionBlock } from '../state/types';

const DENOMINATOR_COLORS: Record<number, string> = {
  1: '#B2BEC3',
  2: '#4A90D9',
  3: '#27AE60',
  4: '#8E44AD',
  6: '#E67E22',
  8: '#16A085',
  12: '#E84393',
};

const DEFAULT_BLOCK_COLOR = '#95a5a6';

export function getColorForDenominator(denominator: number): string {
  return DENOMINATOR_COLORS[denominator] ?? DEFAULT_BLOCK_COLOR;
}

export function createBlock(
  id: string,
  fraction: Fraction,
  position: FractionBlock['position'],
  isSelected: boolean
): FractionBlock {
  return {
    id,
    fraction,
    color: getColorForDenominator(fraction.denominator),
    position,
    isSelected,
  };
}
