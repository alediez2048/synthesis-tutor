/**
 * Interactive tutorial step configuration.
 * 7 steps walking students through the crystal workspace, split, comparison, and chat.
 */

export interface TutorialStepConfig {
  id: number;
  spotlightTarget: string | null;
  samText: string;
  ctaLabel: string;
  requiresInteraction: boolean;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    id: 0,
    spotlightTarget: null,
    samText:
      "Welcome, young wizard! Fractions are how we split things into equal pieces. Let me show you around!",
    ctaLabel: "Next",
    requiresInteraction: false,
  },
  {
    id: 1,
    spotlightTarget: "initial-crystal",
    samText:
      "This is a whole crystal. Watch me split it into two equal pieces — that's how we make halves!",
    ctaLabel: "Next",
    requiresInteraction: false,
  },
  {
    id: 2,
    spotlightTarget: "initial-crystal",
    samText:
      "Watch me split this whole crystal into two equal pieces! Then you try — tap one of the pieces and press Split.",
    ctaLabel: "Next",
    requiresInteraction: true,
  },
  {
    id: 3,
    spotlightTarget: "split-picker",
    samText: "Now pick how many pieces to split it into. Try 2!",
    ctaLabel: "Next",
    requiresInteraction: true,
  },
  {
    id: 4,
    spotlightTarget: "workspace-blocks",
    samText:
      "You split one-half into two pieces! Each piece is now one-fourth. See how the numbers changed?",
    ctaLabel: "Next",
    requiresInteraction: false,
  },
  {
    id: 5,
    spotlightTarget: "workspace-blocks",
    samText:
      "Now watch me fuse two same-sized pieces back together! When pieces are the same size, they can combine into one bigger piece.",
    ctaLabel: "Next",
    requiresInteraction: true,
  },
  {
    id: 6,
    spotlightTarget: "workspace-blocks",
    samText:
      "Your turn! Drag one crystal onto another same-sized crystal to fuse them together.",
    ctaLabel: "Next",
    requiresInteraction: true,
  },
  {
    id: 7,
    spotlightTarget: "workspace-blocks",
    samText:
      "You fused them! Splitting and combining are the two main powers you'll use on your quest.",
    ctaLabel: "Next",
    requiresInteraction: false,
  },
  {
    id: 8,
    spotlightTarget: "comparison-portal",
    samText:
      "This is the Spell Altar! Drag two crystals here to compare their sizes. It's how you discover that different fractions can be the same!",
    ctaLabel: "Next",
    requiresInteraction: false,
  },
  {
    id: 9,
    spotlightTarget: "chat-input",
    samText:
      "I'm Sam, your guide! You can ask me anything about fractions anytime. Ready to explore on your own?",
    ctaLabel: "Start Exploring",
    requiresInteraction: false,
  },
];
