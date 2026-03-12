/**
 * Vercel Edge Function: Claude API proxy with SSE and tool use.
 * ENG-011: POST { messages, lessonState }, streams text_delta and done.
 * ENG-012: Passes toolDefinitions to Claude; executes tools and sends results back.
 * ENG-040: LangSmith tracing for Claude calls and tool executions.
 */

import Anthropic from '@anthropic-ai/sdk';
import { RunTree } from 'langsmith';
import { waitUntil } from '@vercel/functions';
import { toolDefinitions, executeToolCall } from './tools';
import { buildSystemPrompt } from './system-prompt';
import type { LessonState } from '../src/state/types';

const TRACING_ENABLED =
  process.env.LANGSMITH_TRACING === 'true' || !!process.env.LANGSMITH_API_KEY;

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
    conceptsDiscovered: [],
    isDragging: false,
    nextBlockId: 1,
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

      let parentRun: RunTree | null = null;
      try {
        if (TRACING_ENABLED) {
          try {
            parentRun = new RunTree({
              name: 'chat-request',
              run_type: 'chain',
              inputs: { messages, phase: lessonState.phase },
              serialized: {},
              extra: {
                phase: lessonState.phase,
                stepIndex: lessonState.stepIndex,
                blockCount: lessonState.blocks.length,
                conceptsDiscovered: lessonState.conceptsDiscovered,
              },
            });
            await parentRun.postRun();
          } catch {
            /* tracing init failed, continue without */
          }
        }

        type UserMessage = { role: 'user'; content: string | Array<{ type: 'tool_result'; tool_use_id: string; content: string }> };
        type AssistantMessage = { role: 'assistant'; content: Array<{ type: string; text?: string; id?: string; name?: string; input?: unknown }> };
        let currentMessages: Array<UserMessage | AssistantMessage> = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })) as Array<UserMessage | AssistantMessage>;

        for (;;) {
          let llmRun: RunTree | null = null;
          if (parentRun) {
            try {
              llmRun = await parentRun.createChild({
                name: 'claude-messages-create',
                run_type: 'llm',
                inputs: { model, messages: currentMessages },
              });
              await llmRun.postRun();
            } catch {
              /* llm span init failed */
            }
          }

          const startTime = Date.now();
          const response = await anthropic.messages.create({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: currentMessages as Parameters<Anthropic['messages']['create']>[0]['messages'],
            tools: toolDefinitions,
          });
          const latencyMs = Date.now() - startTime;

          if (llmRun) {
            try {
              llmRun.end({
                stop_reason: response.stop_reason,
                input_tokens: response.usage?.input_tokens ?? 0,
                output_tokens: response.usage?.output_tokens ?? 0,
                latencyMs,
              });
              await llmRun.patchRun();
            } catch {
              /* llm span flush failed */
            }
          }

          for (const block of response.content) {
            if (block.type === 'text') {
              enqueue('text_delta', { content: block.text });
            }
            if (block.type === 'tool_use') {
              enqueue('tool_use', { id: block.id, name: block.name, input: block.input });
              const result = executeToolCall(
                block.name,
                block.input as Record<string, unknown>,
                lessonState
              );
              enqueue('tool_result', { id: block.id, result });
            }
          }

          if (response.stop_reason === 'tool_use') {
            const toolBlocks = response.content.filter(
              (b): b is { type: 'tool_use'; id: string; name: string; input: unknown } => b.type === 'tool_use'
            );
            const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];
            for (const b of toolBlocks) {
              let toolResult: Record<string, unknown>;
              if (llmRun) {
                try {
                  const toolRun = llmRun.createChild({
                    name: `tool:${b.name}`,
                    run_type: 'tool',
                    inputs: b.input as Record<string, unknown>,
                  });
                  await toolRun.postRun();
                  const toolStart = Date.now();
                  toolResult = executeToolCall(b.name, b.input as Record<string, unknown>, lessonState) as Record<string, unknown>;
                  await toolRun.end({ result: toolResult, latencyMs: Date.now() - toolStart });
                  await toolRun.patchRun();
                } catch {
                  toolResult = executeToolCall(b.name, b.input as Record<string, unknown>, lessonState) as Record<string, unknown>;
                }
              } else {
                toolResult = executeToolCall(b.name, b.input as Record<string, unknown>, lessonState) as Record<string, unknown>;
              }
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
        if (parentRun) {
          try {
            parentRun.end({ status: 'complete' });
            const flushPromise = parentRun.patchRun().catch(() => {});
            try {
              waitUntil(flushPromise);
            } catch {
              void flushPromise;
            }
          } catch {
            /* parent run flush failed */
          }
        }
      }
    },
  });

  return new Response(streamBody, {
    headers: SSE_HEADERS,
  });
}
