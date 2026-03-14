/**
 * ENG-044: Evaluation runner for Fraction Quest tutor.
 * Runs dataset.json against /api/chat and checks:
 *   - Tool selection: Did Claude call the expected tool?
 *   - Math correctness: Did the tool return the expected result?
 *   - Persona adherence: Does the response follow Sam's voice rules?
 *
 * Usage:
 *   npx tsx eval/run-eval.ts [--url http://localhost:5173] [--category math_correctness]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface EvalCase {
  id: string;
  category: string;
  description: string;
  input: { message: string; phase: string };
  expectedToolCall?: string;
  expectedResult?: Record<string, unknown>;
  assertions?: string[];
  context?: Record<string, unknown>;
}

interface EvalResult {
  id: string;
  passed: boolean;
  failures: string[];
  toolCalls: string[];
  responseText: string;
  durationMs: number;
}

const NEGATIVE_WORDS = ['wrong', 'incorrect', 'mistake', 'error', 'fail', 'failure', 'no,'];
const THEMED_WORDS = ['crystal', 'spell', 'wizard', 'magic', 'altar', 'apprentice', 'shard'];

function parseArgs() {
  const args = process.argv.slice(2);
  let url = 'http://localhost:5173';
  let category: string | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) url = args[++i];
    if (args[i] === '--category' && args[i + 1]) category = args[++i];
  }
  return { url, category };
}

function buildLessonState(phase: string, context?: Record<string, unknown>) {
  return {
    phase,
    stepIndex: 0,
    blocks: [],
    score: context?.score ?? { correct: 0, total: 0 },
    hintCount: 0,
    chatMessages: [],
    assessmentPool: [],
    assessmentStep: 0,
    assessmentAttempts: 0,
    assessmentResults: [],
    conceptsDiscovered: [],
    isDragging: false,
    nextBlockId: 1,
    isLoading: false,
    isStreaming: false,
  };
}

async function callChat(
  url: string,
  message: string,
  phase: string,
  context?: Record<string, unknown>
): Promise<{ text: string; toolCalls: string[]; toolResults: Record<string, unknown>[] }> {
  const endpoint = `${url}/api/chat`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      lessonState: buildLessonState(phase, context),
    }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const body = await res.text();
  const lines = body.split('\n');

  let text = '';
  const toolCalls: string[] = [];
  const toolResults: Record<string, unknown>[] = [];

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const eventLine = lines[lines.indexOf(line) - 1];
        const eventType = eventLine?.replace('event: ', '').trim();
        const data = JSON.parse(line.slice(6));

        if (eventType === 'text_delta') {
          text += data.content ?? '';
        } else if (eventType === 'tool_use') {
          toolCalls.push(data.name);
        } else if (eventType === 'tool_result') {
          toolResults.push(data.result);
        }
      } catch {
        // Skip unparseable lines
      }
    }
  }

  return { text, toolCalls, toolResults };
}

function checkAssertions(
  text: string,
  toolCalls: string[],
  assertions: string[]
): string[] {
  const failures: string[] = [];

  for (const assertion of assertions) {
    switch (assertion) {
      case 'response_uses_contractions': {
        const contractions = ["'re", "'s", "'t", "'ll", "'ve", "'m", "'d"];
        if (!contractions.some((c) => text.toLowerCase().includes(c))) {
          failures.push('Response does not use contractions');
        }
        break;
      }
      case 'max_3_sentences': {
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        if (sentences.length > 3) {
          failures.push(`Response has ${sentences.length} sentences (max 3)`);
        }
        break;
      }
      case 'max_15_words_per_sentence': {
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        for (const s of sentences) {
          const words = s.trim().split(/\s+/).length;
          if (words > 15) {
            failures.push(`Sentence has ${words} words (max 15): "${s.trim().slice(0, 50)}..."`);
          }
        }
        break;
      }
      case 'no_negative_words': {
        const lower = text.toLowerCase();
        for (const word of NEGATIVE_WORDS) {
          if (lower.includes(word)) {
            failures.push(`Response contains negative word: "${word}"`);
          }
        }
        break;
      }
      case 'uses_themed_vocabulary': {
        const lower = text.toLowerCase();
        if (!THEMED_WORDS.some((w) => lower.includes(w))) {
          failures.push('Response does not use themed vocabulary');
        }
        break;
      }
      case 'celebratory_tone': {
        if (!text.includes('!')) {
          failures.push('Response lacks celebratory tone (no exclamation marks)');
        }
        break;
      }
      case 'scaffolds_hint': {
        const hintMarkers = ['try', 'look', 'think', 'notice', 'what if', 'how about', 'hint', 'close', 'almost'];
        const lower = text.toLowerCase();
        if (!hintMarkers.some((m) => lower.includes(m))) {
          failures.push('Response does not scaffold with a hint');
        }
        break;
      }
      case 'redirects_warmly': {
        const warmMarkers = ['help', 'try', "let's", 'here', 'can', 'how about'];
        const lower = text.toLowerCase();
        if (!warmMarkers.some((m) => lower.includes(m))) {
          failures.push('Response does not redirect warmly');
        }
        break;
      }
      case 'no_error_message': {
        const errorMarkers = ['invalid', 'not a fraction', 'parse error'];
        const lower = text.toLowerCase();
        if (errorMarkers.some((m) => lower.includes(m))) {
          failures.push('Response shows technical error message');
        }
        break;
      }
      case 'no_correction': {
        const correctionMarkers = ['actually', 'but that', 'not quite', 'instead'];
        const lower = text.toLowerCase();
        if (correctionMarkers.some((m) => lower.includes(m))) {
          failures.push('Response corrects during explore phase');
        }
        break;
      }
      case 'uses_tool_for_math': {
        if (toolCalls.length === 0) {
          failures.push('Response computed math without using tools');
        }
        break;
      }
    }
  }

  return failures;
}

async function runCase(url: string, evalCase: EvalCase): Promise<EvalResult> {
  const start = Date.now();
  const failures: string[] = [];

  try {
    const { text, toolCalls, toolResults } = await callChat(
      url,
      evalCase.input.message,
      evalCase.input.phase,
      evalCase.context
    );

    // Check tool selection
    if (evalCase.expectedToolCall) {
      if (!toolCalls.includes(evalCase.expectedToolCall)) {
        failures.push(
          `Expected tool "${evalCase.expectedToolCall}" but got: [${toolCalls.join(', ')}]`
        );
      }
    }

    // Check expected result
    if (evalCase.expectedResult && toolResults.length > 0) {
      const resultStr = JSON.stringify(toolResults[0]);
      const expectedStr = JSON.stringify(evalCase.expectedResult);
      if (!resultStr.includes(expectedStr.slice(1, -1))) {
        // Loose check: expected keys should be in result
        const expected = evalCase.expectedResult;
        for (const [key, val] of Object.entries(expected)) {
          const resultVal = (toolResults[0] as Record<string, unknown>)[key];
          if (JSON.stringify(resultVal) !== JSON.stringify(val)) {
            failures.push(
              `Tool result mismatch for "${key}": expected ${JSON.stringify(val)}, got ${JSON.stringify(resultVal)}`
            );
          }
        }
      }
    }

    // Check persona assertions
    if (evalCase.assertions) {
      failures.push(...checkAssertions(text, toolCalls, evalCase.assertions));
    }

    return {
      id: evalCase.id,
      passed: failures.length === 0,
      failures,
      toolCalls,
      responseText: text.slice(0, 200),
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      id: evalCase.id,
      passed: false,
      failures: [`Error: ${err instanceof Error ? err.message : String(err)}`],
      toolCalls: [],
      responseText: '',
      durationMs: Date.now() - start,
    };
  }
}

async function main() {
  const { url, category } = parseArgs();
  const datasetPath = resolve(import.meta.dirname ?? '.', 'dataset.json');
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf-8'));

  let cases: EvalCase[] = dataset.cases;
  if (category) {
    cases = cases.filter((c) => c.category === category);
  }

  console.log(`\nFraction Quest Eval Runner`);
  console.log(`========================`);
  console.log(`Target: ${url}`);
  console.log(`Cases:  ${cases.length}${category ? ` (category: ${category})` : ''}\n`);

  const results: EvalResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const evalCase of cases) {
    process.stdout.write(`  ${evalCase.id}: ${evalCase.description}... `);
    const result = await runCase(url, evalCase);
    results.push(result);

    if (result.passed) {
      passed++;
      console.log(`PASS (${result.durationMs}ms)`);
    } else {
      failed++;
      console.log(`FAIL (${result.durationMs}ms)`);
      for (const f of result.failures) {
        console.log(`    - ${f}`);
      }
    }
  }

  console.log(`\n========================`);
  console.log(`Results: ${passed}/${cases.length} passed, ${failed} failed`);

  // Write results JSON
  const outPath = resolve(import.meta.dirname ?? '.', 'results.json');
  writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log(`Results written to: ${outPath}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
