/**
 * ENG-016: Exploration phase config. Values mirror exploration-config.json.
 */

export const explorationConfig = {
  goals: ['splitting', 'combining', 'equivalence'] as const,
  nudges: {
    inactivityDelayMs: 15_000,
    inactivityMinActions: 3,
    consecutiveSplitsThreshold: 5,
    overwhelmMinDenominator: 8,
    phaseTimeoutMs: 180_000,
  },
  transitionDelayMs: 3000,
  checkIntervalMs: 5000,
} as const;
