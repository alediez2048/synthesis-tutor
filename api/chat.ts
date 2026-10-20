/**
 * Vercel Edge Function: Claude API proxy with SSE and tool use.
 * POST { messages, lessonState }; streams text_delta, tool_use, tool_result and done.
 * Requests are authenticated, rate limited and validated in ./guard.ts first.
 */

import Anthropic from '@anthropic-ai/sdk';
import { getToolsForLesson, executeToolCall } from './tools.js';
import { buildSystemPrompt } from './system-prompt.js';
import { GuardError, checkRateLimit, identifyCaller, sanitizeLessonState, validateMessages } from './guard.js';
import type { LessonState } from '../src/state/types.js';

export const config = {
  runtime: 'edge',
};

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

function encodeSSE(event: string, data: object): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

interface ChatRequest {
  messages?: unknown;
  lessonState?: unknown;
}

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Minimal default so get_workspace_state never crashes if client omits lessonState. */
function defaultLessonState(): LessonState {
  return {
    lessonId: 'fractions-101',
    phase: 'intro',
    stepIndex: 0,
    blocks: [],
    score: { correct: 0, total: 0 },
    hintCount: 0,
    chatMessages: [],
    assessmentPool: [],
    assessmentStep: 0,
    assessmentAttempts: 0,
    assessmentResults: [],
    conceptsDiscovered: [],
    explorationRound: 1,
    isDragging: false,
    nextBlockId: 1,
    isLoading: false,
    isStreaming: false,
    tutorialComplete: false,
    tutorialStep: 0,
    isDemoActive: false,
    guidedProblemIndex: 0,
    guidedStep: 'problem',
    guidedAttempts: 0,
    guidedPrompt: null,
    guidedSolved: false,
    cfuQuestion: null,
    cfuExpectedAnswer: null,
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let messages: ReturnType<typeof validateMessages>;
  let lessonState: LessonState;
  try {
    const caller = await identifyCaller(req);
    checkRateLimit(caller);
    let body: ChatRequest;
    try {
      body = (await req.json()) as ChatRequest;
    } catch {
      throw new GuardError(400, 'Invalid request');
    }
    messages = validateMessages(body.messages);
    lessonState = sanitizeLessonState(body.lessonState, defaultLessonState());
  } catch (err) {
    if (err instanceof GuardError) return jsonError(err.status, err.message);
    throw err;
  }

  const anthropic = new Anthropic({ apiKey });
  const model = 'claude-sonnet-4-20250514';
  const systemPrompt = buildSystemPrompt(lessonState);
  const tools = getToolsForLesson(lessonState.lessonId ?? 'fractions-101');

  const streamBody = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      const enqueue = (event: string, data: object) => {
        if (closed) return;
        controller.enqueue(encoder.encode(encodeSSE(event, data)));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      try {
        type UserMessage = { role: 'user'; content: string | Array<{ type: 'tool_result'; tool_use_id: string; content: string }> };
        type AssistantMessage = { role: 'assistant'; content: Array<{ type: string; text?: string; id?: string; name?: string; input?: unknown }> };
        let currentMessages: Array<UserMessage | AssistantMessage> = messages as Array<UserMessage | AssistantMessage>;

        // Cap model round-trips so a model that keeps calling tools can't run up cost.
        const MAX_TOOL_ROUNDS = 5;
        for (let round = 0; ; round++) {
          const response = await anthropic.messages.create({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: currentMessages as Parameters<Anthropic['messages']['create']>[0]['messages'],
            tools,
          });

          // Execute each tool call exactly once; the same result goes to the client and back to the model.
          const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];
          for (const block of response.content) {
            if (block.type === 'text') {
              enqueue('text_delta', { content: block.text });
            }
            if (block.type === 'tool_use') {
              const tb = block as unknown as { type: 'tool_use'; id: string; name: string; input: unknown };
              enqueue('tool_use', { id: tb.id, name: tb.name, input: tb.input });
              const result = executeToolCall(
                tb.name,
                tb.input as Record<string, unknown>,
                lessonState
              );
              enqueue('tool_result', { id: tb.id, result });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: tb.id,
                content: JSON.stringify(result),
              });
            }
          }

          if (response.stop_reason === 'tool_use' && toolResults.length > 0) {
            if (round + 1 >= MAX_TOOL_ROUNDS) {
              enqueue('error', { message: 'Tool call limit reached' });
              break;
            }
            currentMessages = [
              ...currentMessages,
              { role: 'assistant' as const, content: response.content },
              { role: 'user' as const, content: toolResults },
            ];
            continue;
          }

          break;
        }

        enqueue('done', {});
      } catch (err) {
        // Log the detail server-side; the client gets a generic message.
        console.error('chat upstream error', err);
        enqueue('error', { message: 'Upstream API error' });
      } finally {
        close();
      }
    },
  });

  return new Response(streamBody, {
    headers: SSE_HEADERS,
  });
}
