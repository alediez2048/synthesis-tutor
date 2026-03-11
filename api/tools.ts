/**
 * ENG-012: Claude tool definitions and server-side execution.
 * All fraction math is delegated to FractionEngine (deterministic).
 */

import {
  simplify,
  areEquivalent,
  split,
  combine,
  toCommonDenominator,
  isValidFraction,
  parseStudentInput,
} from '../src/engine/FractionEngine';
import type { Fraction } from '../src/engine/FractionEngine';
import type { LessonState } from '../src/state/types';

const fractionSchema = {
  type: 'object' as const,
  properties: {
    numerator: { type: 'number' as const, description: 'Numerator' },
    denominator: { type: 'number' as const, description: 'Denominator' },
  },
  required: ['numerator', 'denominator'] as const,
};

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'check_equivalence',
    description:
      'Check if two fractions are mathematically equivalent. Use when comparing two fractions the student is working with, or verifying a visual equivalence on the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        a: { ...fractionSchema, description: 'First fraction' },
        b: { ...fractionSchema, description: 'Second fraction' },
      },
      required: ['a', 'b'],
    },
  },
  {
    name: 'simplify_fraction',
    description:
      'Simplify a fraction to its lowest terms using GCD. Use when a student asks for the simplified form or when you need to show the simplest representation.',
    input_schema: {
      type: 'object',
      properties: { fraction: fractionSchema },
      required: ['fraction'],
    },
  },
  {
    name: 'split_fraction',
    description:
      'Split a fraction into N equal parts. Use when the student needs to divide a fraction block on the workspace into smaller pieces.',
    input_schema: {
      type: 'object',
      properties: {
        fraction: fractionSchema,
        parts: { type: 'number', description: 'Number of equal parts (integer >= 2)' },
      },
      required: ['fraction', 'parts'],
    },
  },
  {
    name: 'combine_fractions',
    description:
      'Combine (add) fractions that have the same denominator into a single fraction. Use when the student merges fraction blocks on the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        fractions: {
          type: 'array',
          items: fractionSchema,
          description: 'Array of fractions with the same denominator',
        },
      },
      required: ['fractions'],
    },
  },
  {
    name: 'find_common_denominator',
    description:
      'Find the least common denominator of two fractions and express both with that shared denominator. Use when the student needs to compare or add fractions with different denominators.',
    input_schema: {
      type: 'object',
      properties: { a: fractionSchema, b: fractionSchema },
      required: ['a', 'b'],
    },
  },
  {
    name: 'validate_fraction',
    description:
      'Check if a fraction has valid positive integer numerator and denominator (1–12). Use to verify fractions are within lesson scope before performing operations.',
    input_schema: {
      type: 'object',
      properties: { fraction: fractionSchema },
      required: ['fraction'],
    },
  },
  {
    name: 'parse_student_input',
    description:
      "Parse a student's text input (e.g. \"2/4\" or \"3 / 6\") into a structured fraction. Returns null if the input cannot be parsed. Use when you receive raw text that might be a fraction.",
    input_schema: {
      type: 'object',
      properties: { raw: { type: 'string', description: 'Raw text from the student' } },
      required: ['raw'],
    },
  },
  {
    name: 'check_answer',
    description:
      "Check a student's answer against the target fraction. Parses the input, checks equivalence, and identifies potential misconceptions. Use whenever a student submits an answer.",
    input_schema: {
      type: 'object',
      properties: {
        student_input: { type: 'string', description: 'The raw text the student typed' },
        target: { ...fractionSchema, description: 'The correct target fraction' },
      },
      required: ['student_input', 'target'],
    },
  },
  {
    name: 'get_workspace_state',
    description:
      "Get a summary of the current lesson workspace state: blocks, phase, step index, score, and concepts discovered. No parameters needed — the server provides the current state. Use to understand what the student is seeing.",
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

function executeCheckAnswer(
  studentInput: string,
  target: Fraction
): { correct: boolean; parsed: Fraction | null; misconception?: string } {
  const parsed = parseStudentInput(studentInput);
  if (parsed === null) {
    return {
      correct: false,
      parsed: null,
      misconception: 'Could not parse input as a fraction',
    };
  }
  const correct = areEquivalent(parsed, target);
  return { correct, parsed };
}

function extractWorkspaceState(lessonState: LessonState): Record<string, unknown> {
  return {
    phase: lessonState.phase,
    stepIndex: lessonState.stepIndex,
    blocks: lessonState.blocks,
    score: lessonState.score,
    conceptsDiscovered: lessonState.conceptsDiscovered,
  };
}

export function executeToolCall(
  name: string,
  input: Record<string, unknown>,
  lessonState: LessonState
): Record<string, unknown> {
  try {
    switch (name) {
      case 'check_equivalence': {
        const a = input.a as Fraction;
        const b = input.b as Fraction;
        return { equivalent: areEquivalent(a, b) };
      }
      case 'simplify_fraction': {
        const fraction = input.fraction as Fraction;
        return { simplified: simplify(fraction) };
      }
      case 'split_fraction': {
        const fraction = input.fraction as Fraction;
        const parts = input.parts as number;
        return { pieces: split(fraction, parts) };
      }
      case 'combine_fractions': {
        const fractions = input.fractions as Fraction[];
        return { combined: combine(fractions) };
      }
      case 'find_common_denominator': {
        const a = input.a as Fraction;
        const b = input.b as Fraction;
        return { result: toCommonDenominator(a, b) };
      }
      case 'validate_fraction': {
        const fraction = input.fraction as Fraction;
        return { valid: isValidFraction(fraction) };
      }
      case 'parse_student_input': {
        const raw = input.raw as string;
        return { parsed: parseStudentInput(raw) };
      }
      case 'check_answer': {
        const student_input = input.student_input as string;
        const target = input.target as Fraction;
        return executeCheckAnswer(student_input, target);
      }
      case 'get_workspace_state':
        return extractWorkspaceState(lessonState);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Tool execution failed',
    };
  }
}
