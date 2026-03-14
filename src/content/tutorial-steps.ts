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
    spotlightTarget: "comparison-portal",
    samText:
      "Drag crystals here to see if different fractions are the same size. That's the secret of equivalent fractions!",
    ctaLabel: "Next",
    requiresInteraction: false,
  },
  {
    id: 6,
    spotlightTarget: "chat-input",
    samText:
      "I'm Sam! You can ask me anything about fractions anytime. Ready to explore on your own?",
    ctaLabel: "Start Exploring",
    requiresInteraction: false,
  },
];
