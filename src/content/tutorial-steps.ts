/**
 * Interactive tutorial step configuration.
 * 10 steps walking students through the crystal workspace, split, combine, comparison, and chat.
 *
 * samText can be a static string or a function receiving blocks to produce
 * dynamic feedback that reflects the user's actual actions.
 */

import type { FractionBlock } from '../state/types';

/** Human-readable fraction name, e.g. "one-half", "one-sixth" */
function fractionName(n: number, d: number): string {
  if (d === 1) return 'a whole';
  const numWords: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve' };
  const denomWords: Record<number, string> = { 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 11: 'eleventh', 12: 'twelfth' };
  const num = numWords[n] ?? String(n);
  const base = denomWords[d] ?? `/${d}`;
  if (n === 1) return `${num}-${base}`;
  return `${num}-${base}s`;
}

export type SamTextSource = string | ((blocks: FractionBlock[]) => string);

export interface TutorialStepConfig {
  id: number;
  spotlightTarget: string | null;
  samText: SamTextSource;
  ctaLabel: string;
  /** If true, Next is blocked while the demo animation is playing. */
  blockedDuringDemo: boolean;
  /** If true, Next is always blocked — step advances only via user interaction. */
  requiresInteraction: boolean;
}

/** Resolve samText to a string, passing blocks only when needed. */
export function resolveSamText(src: SamTextSource, blocks: FractionBlock[]): string {
  return typeof src === 'function' ? src(blocks) : src;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    id: 0,
    spotlightTarget: null,
    samText:
      "Welcome, young wizard! Fractions are how we split things into equal pieces. Let me show you around!",
    ctaLabel: "Next",
    blockedDuringDemo: false,
    requiresInteraction: false,
  },
  {
    id: 1,
    spotlightTarget: "initial-crystal",
    samText:
      "This is a whole crystal. Watch me split it into two equal pieces — that's how we make halves!",
    ctaLabel: "Next",
    blockedDuringDemo: false,
    requiresInteraction: false,
  },
  {
    id: 2,
    spotlightTarget: "workspace-blocks",
    samText:
      "I split the whole crystal into two halves! Now you try — tap one of the pieces and press Split.",
    ctaLabel: "Next",
    blockedDuringDemo: true,
    requiresInteraction: false,
  },
  {
    id: 3,
    spotlightTarget: "split-picker",
    samText: "Now pick how many pieces to split it into. Try 2!",
    ctaLabel: "Next",
    blockedDuringDemo: false,
    requiresInteraction: true,
  },
  {
    id: 4,
    spotlightTarget: "workspace-blocks",
    samText: (blocks) => {
      // Find the smallest pieces the user just created
      const sorted = [...blocks].sort((a, b) => b.fraction.denominator - a.fraction.denominator);
      const newest = sorted[0];
      if (!newest) return "Nice split! See how the numbers changed?";
      const { numerator: n, denominator: d } = newest.fraction;
      const count = blocks.filter(
        (b) => b.fraction.denominator === d && b.fraction.numerator === n
      ).length;
      return `You made ${count} pieces of ${fractionName(n, d)}! See how the numbers changed?`;
    },
    ctaLabel: "Next",
    blockedDuringDemo: false,
    requiresInteraction: false,
  },
  {
    id: 5,
    spotlightTarget: "workspace-blocks",
    samText:
      "Now watch me fuse two same-sized pieces back together! When pieces are the same size, they can combine into one bigger piece.",
    ctaLabel: "Next",
    blockedDuringDemo: true,
    requiresInteraction: false,
  },
  {
    id: 6,
    spotlightTarget: "workspace-blocks",
    samText:
      "Your turn! Drag one crystal onto another same-sized crystal to fuse them together.",
    ctaLabel: "Next",
    blockedDuringDemo: false,
    requiresInteraction: true,
  },
  {
    id: 7,
    spotlightTarget: "workspace-blocks",
    samText:
      "I fused two halves back into one whole! 1/1 means one whole piece — like a full pizza before you slice it. Splitting and combining are the two main powers you'll use!",
    ctaLabel: "Next",
    blockedDuringDemo: false,
    requiresInteraction: false,
  },
  {
    id: 8,
    spotlightTarget: "comparison-portal",
    samText:
      "This is the Spell Altar! Drag two crystals here to see if they're the same size. Watch what happens!",
    ctaLabel: "Next",
    blockedDuringDemo: false,
    requiresInteraction: false,
  },
  {
    id: 9,
    spotlightTarget: "comparison-portal",
    samText:
      "Watch — I'll place 1/2 and 2/4 on the altar. They're the same size, so they match! That golden glow means equal magical power!",
    ctaLabel: "Next",
    blockedDuringDemo: true,
    requiresInteraction: false,
  },
  {
    id: 10,
    spotlightTarget: "comparison-portal",
    samText:
      "Now watch what happens with 1/2 and 1/3. They're different sizes — see the red shake? That means they don't match!",
    ctaLabel: "Next",
    blockedDuringDemo: true,
    requiresInteraction: false,
  },
  {
    id: 11,
    spotlightTarget: "chat-input",
    samText:
      "I'm Sam, your guide! You can ask me anything about fractions anytime. Ready to explore on your own?",
    ctaLabel: "Start Exploring",
    blockedDuringDemo: false,
    requiresInteraction: false,
  },
];
