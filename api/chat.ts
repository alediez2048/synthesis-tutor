/**
 * Vercel Edge Function: Claude API proxy with SSE streaming.
 * ENG-011: Accepts POST { messages, lessonState }, streams text_delta and done.
 * Tools and full system prompt are stubbed until ENG-012 / ENG-013.
 */

import Anthropic from '@anthropic-ai/sdk';

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

/** Minimal request shape; lessonState is passed through for future tool/prompt use. */
interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  lessonState?: Record<string, unknown>;
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

  const { messages, lessonState: _lessonState } = body;
  void _lessonState; // Reserved for ENG-012 (tools) and ENG-013 (system prompt)
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const anthropic = new Anthropic({ apiKey });
  const model = 'claude-sonnet-4-20250514';

  /** Stub system prompt until ENG-013. */
  const systemPrompt = 'You are Sam, a friendly math tutor for kids learning fractions. Keep responses short and encouraging.';

  const streamBody = new ReadableStream({
    start(controller) {
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

      const stream = anthropic.messages.stream({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        // No tools until ENG-012
      });

      stream.on('text', (textDelta: string) => {
        enqueue('text_delta', { content: textDelta });
      });

      stream.on('end', () => {
        enqueue('done', {});
        close();
      });

      stream.on('error', () => {
        enqueue('error', { message: 'Upstream API error' });
        close();
      });

      void stream.done().catch(() => {
        // end/error already handled
      });
    },
  });

  return new Response(streamBody, {
    headers: SSE_HEADERS,
  });
}
