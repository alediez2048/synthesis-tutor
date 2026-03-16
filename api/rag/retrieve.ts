/**
 * RAG retrieval module — tag-based hybrid scoring over pre-indexed pedagogy chunks.
 * Zero external dependencies, zero runtime API calls, <1ms retrieval.
 */

import knowledgeBase from './knowledge-base.json' with { type: 'json' };

export interface RetrievalQuery {
  lessonId: string;
  phase: string;
  concepts: string[];
  misconceptionType?: string;
}

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
}

interface KBChunk {
  id: string;
  content: string;
  tags: string[];
  phases: string[];
  lessons: string[];
  concepts: string[];
  embedding: number[];
}

// Simple memoization for repeat calls within a single request
const cache = new Map<string, RetrievedChunk[]>();

function cacheKey(query: RetrievalQuery): string {
  return `${query.lessonId}:${query.phase}:${query.concepts.sort().join(',')}:${query.misconceptionType ?? ''}`;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function scoreChunk(chunk: KBChunk, query: RetrievalQuery): number {
  let score = 0;

  // Phase match: +3
  if (chunk.phases.includes(query.phase)) score += 3;

  // Lesson match: +2
  if (chunk.lessons.includes(query.lessonId)) score += 2;

  // Concept overlap: +2 per match
  for (const concept of query.concepts) {
    if (chunk.concepts.includes(concept)) score += 2;
  }

  // Misconception tag match: +5
  if (query.misconceptionType && chunk.tags.includes(query.misconceptionType)) {
    score += 5;
  }

  // General tag overlap with concepts: +1 per match
  for (const concept of query.concepts) {
    if (chunk.tags.includes(concept)) score += 1;
  }

  return score;
}

/**
 * Retrieve the top-K most relevant pedagogy chunks for the current lesson state.
 * Uses tag-based scoring with cosine similarity as tiebreaker.
 */
export function retrievePedagogy(query: RetrievalQuery, topK = 3): RetrievedChunk[] {
  const key = cacheKey(query);
  const cached = cache.get(key);
  if (cached) return cached;

  const chunks = knowledgeBase.chunks as KBChunk[];
  const queryKey = `${query.lessonId}:${query.phase}`;
  const queryEmbedding = (knowledgeBase.queryEmbeddings as Record<string, number[]>)?.[queryKey];

  const scored = chunks.map((chunk) => {
    let score = scoreChunk(chunk, query);

    // Cosine similarity tiebreaker when pre-computed query embedding exists
    if (queryEmbedding && chunk.embedding.length > 0) {
      score += cosineSimilarity(chunk.embedding, queryEmbedding) * 0.5;
    }

    return { id: chunk.id, content: chunk.content, score };
  });

  // Sort descending by score, take top K
  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, topK).filter((c) => c.score > 0);

  cache.set(key, results);
  return results;
}
