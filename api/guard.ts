/**
 * Request guards for /api/chat: who is calling, how often, and what they sent.
 *
 * Everything the browser sends is untrusted. The lesson state is
 * interpolated into the system prompt, so it is rebuilt here from known
 * fields with strict types and length caps rather than passed through.
 */

import { verifyToken } from '@clerk/backend';
import type { FractionBlock, LessonState, Phase } from '../src/state/types.js';

export const LIMITS = {
  maxMessages: 40,
  maxMessageChars: 6000,
  maxTotalChars: 60000,
  maxBlocks: 64,
  maxConcepts: 20,
  maxConceptChars: 60,
  maxDenominator: 1000,
  /** Requests per caller per window. */
  rateLimit: 20,
  rateWindowMs: 60_000,
} as const;

const PHASES: ReadonlySet<Phase> = new Set(['intro', 'tutorial', 'explore', 'guided', 'assess', 'complete']);
const LESSON_ID = /^[a-z0-9-]{1,40}$/;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export class GuardError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Identify the caller. When CLERK_SECRET_KEY is configured, a valid Clerk
 * session token is required and the caller is the Clerk user. Without it
 * (local development), the caller is the client IP.
 */
export async function identifyCaller(req: Request): Promise<string> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!secretKey) return `ip:${ip}`;

  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new GuardError(401, 'Sign in required');
  try {
    const claims = await verifyToken(token, { secretKey });
    return `user:${claims.sub}`;
  } catch {
    throw new GuardError(401, 'Sign in required');
  }
}

/**
 * Fixed-window rate limit per caller. This lives in the memory of one edge
 * instance, so it is a cost brake rather than a hard global quota; a shared
 * store (Upstash, Vercel KV) is the upgrade path.
 */
const windows = new Map<string, { start: number; count: number }>();

export function checkRateLimit(caller: string, now = Date.now()): void {
  const w = windows.get(caller);
  if (!w || now - w.start >= LIMITS.rateWindowMs) {
    windows.set(caller, { start: now, count: 1 });
    if (windows.size > 10_000) {
      for (const [key, value] of windows) {
        if (now - value.start >= LIMITS.rateWindowMs) windows.delete(key);
      }
    }
    return;
  }
  w.count += 1;
  if (w.count > LIMITS.rateLimit) throw new GuardError(429, 'Too many requests, slow down');
}

export function _resetRateLimitForTesting(): void {
  windows.clear();
}

export function validateMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new GuardError(400, 'Invalid request');
  if (raw.length > LIMITS.maxMessages) throw new GuardError(413, 'Conversation too long');
  let total = 0;
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== 'object') throw new GuardError(400, 'Invalid request');
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      throw new GuardError(400, 'Invalid request');
    }
    if (content.length > LIMITS.maxMessageChars) throw new GuardError(413, 'Message too long');
    total += content.length;
    out.push({ role, content });
  }
  if (total > LIMITS.maxTotalChars) throw new GuardError(413, 'Conversation too long');
  if (out[out.length - 1]!.role !== 'user') throw new GuardError(400, 'Invalid request');
  return out;
}

const int = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : fallback;

function sanitizeBlock(raw: unknown, index: number): FractionBlock | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as { fraction?: { numerator?: unknown; denominator?: unknown }; position?: unknown };
  const numerator = int(b.fraction?.numerator, 0, LIMITS.maxDenominator, -1);
  const denominator = int(b.fraction?.denominator, 1, LIMITS.maxDenominator, -1);
  if (numerator < 0 || denominator < 0) return null;
  const position = b.position === 'comparison' ? 'comparison' : 'workspace';
  return { id: `b${index}`, fraction: { numerator, denominator }, color: '', position, isSelected: false };
}

/**
 * Rebuild the lesson state from the fields the server actually reads
 * (lessonId, phase, blocks, score, conceptsDiscovered). Anything else the
 * client sent is dropped, and free text is limited to short plain tokens so
 * it cannot carry instructions into the system prompt.
 */
export function sanitizeLessonState(raw: unknown, base: LessonState): LessonState {
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Record<string, unknown>;

  const lessonId = typeof s.lessonId === 'string' && LESSON_ID.test(s.lessonId) ? s.lessonId : base.lessonId;
  const phase = typeof s.phase === 'string' && PHASES.has(s.phase as Phase) ? (s.phase as Phase) : base.phase;

  const blocks = Array.isArray(s.blocks)
    ? s.blocks
        .slice(0, LIMITS.maxBlocks)
        .map(sanitizeBlock)
        .filter((b): b is FractionBlock => b !== null)
    : base.blocks;

  const rawScore = (s.score ?? {}) as { correct?: unknown; total?: unknown };
  const total = int(rawScore.total, 0, 10_000, 0);
  const score = { correct: Math.min(int(rawScore.correct, 0, 10_000, 0), total), total };

  const conceptsDiscovered = Array.isArray(s.conceptsDiscovered)
    ? s.conceptsDiscovered
        .filter((c): c is string => typeof c === 'string')
        .map((c) => c.replace(/[^\w\s/-]/g, '').trim().slice(0, LIMITS.maxConceptChars))
        .filter((c) => c.length > 0)
        .slice(0, LIMITS.maxConcepts)
    : base.conceptsDiscovered;

  return { ...base, lessonId, phase, blocks, score, conceptsDiscovered };
}
