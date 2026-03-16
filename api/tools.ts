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
  addFractions,
  subtractFractions,
  multiplyFractions,
  divideFractions,
} from '../src/engine/FractionEngine.js';
import type { Fraction } from '../src/engine/FractionEngine.js';
import { detectMisconception } from '../src/engine/MisconceptionDetector.js';
import type { LessonState } from '../src/state/types.js';
import { getLesson } from '../src/content/curriculum.js';
import { retrievePedagogy } from './rag/retrieve.js';

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
    name: 'add_fractions',
    description:
      'Add two fractions (handles same or different denominators). Use when the student adds fraction blocks on the workspace.',
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
    name: 'subtract_fractions',
    description:
      'Subtract fraction b from fraction a. Returns the difference, or an error if the result would be negative. Use when the student subtracts fraction blocks.',
    input_schema: {
      type: 'object',
      properties: {
        a: { ...fractionSchema, description: 'Fraction to subtract from (minuend)' },
        b: { ...fractionSchema, description: 'Fraction to subtract (subtrahend)' },
      },
      required: ['a', 'b'],
    },
  },
  {
    name: 'multiply_fractions',
    description:
      'Multiply two fractions together. Use when the student multiplies fraction blocks.',
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
    name: 'divide_fractions',
    description:
      'Divide fraction a by fraction b (multiply by reciprocal). Use when the student divides fraction blocks.',
    input_schema: {
      type: 'object',
      properties: {
        a: { ...fractionSchema, description: 'Dividend (fraction being divided)' },
        b: { ...fractionSchema, description: 'Divisor (fraction dividing by)' },
      },
      required: ['a', 'b'],
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

export function getToolsForLesson(lessonId: string): ToolDefinition[] {
  const lesson = getLesson(lessonId);
  const allowed = lesson?.tools ?? toolDefinitions.map((t) => t.name);
  return toolDefinitions.filter((t) => allowed.includes(t.name));
}

function executeCheckAnswer(
  studentInput: string,
  target: Fraction,
  lessonState: LessonState
): {
  correct: boolean;
  parsed: Fraction | null;
  misconception?: string;
  misconceptionType?: string;
  teachingStrategy?: string;
} {
  const parsed = parseStudentInput(studentInput);
  if (parsed === null) {
    return {
      correct: false,
      parsed: null,
      misconception: 'Could not parse input as a fraction',
      misconceptionType: 'parse_error',
    };
  }
  const correct = areEquivalent(parsed, target);
  if (correct) {
    return { correct: true, parsed };
  }
  const detection = detectMisconception(parsed, target);

  // RAG: retrieve misconception-specific teaching strategy
  let teachingStrategy: string | undefined;
  if (detection.type !== 'random_guess') {
    const chunks = retrievePedagogy({
      lessonId: lessonState.lessonId ?? 'fractions-101',
      phase: lessonState.phase ?? 'guided',
      concepts: lessonState.conceptsDiscovered ?? [],
      misconceptionType: detection.type,
    });
    if (chunks.length > 0) {
      teachingStrategy = chunks[0].content;
    }
  }

  return {
    correct: false,
    parsed,
    misconception: detection.description,
    misconceptionType: detection.type,
    teachingStrategy,
  };
}

function extractWorkspaceState(lessonState: LessonState): Record<string, unknown> {
  const blocks = lessonState.blocks ?? [];
  const workspace = blocks.filter((b) => b.position === 'workspace');
  const comparison = blocks.filter((b) => b.position === 'comparison');
  const fmt = (list: typeof blocks) =>
    list.map((b) => `${b.fraction.numerator}/${b.fraction.denominator}`);

  return {
    phase: lessonState.phase,
    crystals_on_spell_table: fmt(workspace),
    crystals_on_spell_altar: fmt(comparison),
    total_crystals: blocks.length,
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
      case 'add_fractions': {
        const a = input.a as Fraction;
        const b = input.b as Fraction;
        return { sum: addFractions(a, b) };
      }
      case 'subtract_fractions': {
        const a = input.a as Fraction;
        const b = input.b as Fraction;
        const diff = subtractFractions(a, b);
        if (diff === null) return { error: 'Result would be negative' };
        return { difference: diff };
      }
      case 'multiply_fractions': {
        const a = input.a as Fraction;
        const b = input.b as Fraction;
        return { product: multiplyFractions(a, b) };
      }
      case 'divide_fractions': {
        const a = input.a as Fraction;
        const b = input.b as Fraction;
        return { quotient: divideFractions(a, b) };
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
        return executeCheckAnswer(student_input, target, lessonState);
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
