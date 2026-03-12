/**
 * Vercel Edge Function: Claude API proxy with SSE and tool use.
 * ENG-011: POST { messages, lessonState }, streams text_delta and done.
 * ENG-012: Passes toolDefinitions to Claude; executes tools and sends results back.
 */

import Anthropic from '@anthropic-ai/sdk';
import { toolDefinitions, executeToolCall } from './tools.js';
import { buildSystemPrompt } from './system-prompt.js';
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
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  lessonState?: Record<string, unknown>;
}

/** Minimal default so get_workspace_state never crashes if client omits lessonState. */
function defaultLessonState(): LessonState {
  return {
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
    isDragging: false,
    nextBlockId: 1,
    isLoading: false,
    isStreaming: false,
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

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, lessonState: rawLessonState } = body;
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lessonState: LessonState =
    rawLessonState && typeof rawLessonState === 'object'
      ? (rawLessonState as unknown as LessonState)
      : defaultLessonState();

  const anthropic = new Anthropic({ apiKey });
  const model = 'claude-sonnet-4-20250514';
  const systemPrompt = buildSystemPrompt(lessonState);

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
        let currentMessages: Array<UserMessage | AssistantMessage> = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })) as Array<UserMessage | AssistantMessage>;

        for (;;) {
          const response = await anthropic.messages.create({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: currentMessages as Parameters<Anthropic['messages']['create']>[0]['messages'],
            tools: toolDefinitions,
          });

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
            }
          }

          if (response.stop_reason === 'tool_use') {
            const toolBlocks = response.content
              .filter((b) => b.type === 'tool_use')
              .map((b) => b as unknown as { type: 'tool_use'; id: string; name: string; input: unknown });
            const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];
            for (const b of toolBlocks) {
              const toolResult = executeToolCall(b.name, b.input as Record<string, unknown>, lessonState) as Record<string, unknown>;
              toolResults.push({
                type: 'tool_result',
                tool_use_id: b.id,
                content: JSON.stringify(toolResult),
              });
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
        enqueue('error', {
          message: err instanceof Error ? err.message : 'Upstream API error',
        });
      } finally {
        close();
      }
    },
  });

  return new Response(streamBody, {
    headers: SSE_HEADERS,
  });
}
