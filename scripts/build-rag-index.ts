/**
 * Build-time script: reads pedagogy docs, embeds them, writes knowledge-base.json.
 *
 * Usage: npx tsx scripts/build-rag-index.ts
 *
 * Requires OPENAI_API_KEY in environment (or .env.local).
 * Uses OpenAI text-embedding-3-small (1536 dimensions).
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const DOCS_DIR = join(import.meta.dirname, '..', 'api', 'rag', 'docs');
const OUTPUT_PATH = join(import.meta.dirname, '..', 'api', 'rag', 'knowledge-base.json');
const EMBEDDING_MODEL = 'text-embedding-3-small';

// Load API key from environment or .env.local
function getApiKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  // Try reading from .env.local
  try {
    const envContent = readFileSync(join(import.meta.dirname, '..', '.env.local'), 'utf-8');
    const match = envContent.match(/^OPENAI_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch { /* ignore */ }

  throw new Error('OPENAI_API_KEY not found in environment or .env.local');
}

interface ParsedDoc {
  id: string;
  content: string;
  tags: string[];
  phases: string[];
  lessons: string[];
  concepts: string[];
}

function parseFrontmatter(raw: string): { meta: Record<string, string[]>; body: string } {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { meta: {}, body: raw };

  const meta: Record<string, string[]> = {};
  for (const line of fmMatch[1].split('\n')) {
    const kvMatch = line.match(/^(\w+):\s*\[(.+)\]$/);
    if (kvMatch) {
      meta[kvMatch[1]] = kvMatch[2].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    }
  }
  return { meta, body: fmMatch[2].trim() };
}

function readDocs(): ParsedDoc[] {
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} pedagogy documents`);

  return files.map((file) => {
    const raw = readFileSync(join(DOCS_DIR, file), 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    return {
      id: basename(file, '.md'),
      content: body,
      tags: meta.tags ?? [],
      phases: meta.phases ?? [],
      lessons: meta.lessons ?? [],
      concepts: meta.concepts ?? [],
    };
  });
}

async function embed(texts: string[], apiKey: string): Promise<number[][]> {
  console.log(`Embedding ${texts.length} texts with ${EMBEDDING_MODEL}...`);

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json() as {
    data: Array<{ embedding: number[]; index: number }>;
  };

  // Sort by index to maintain order
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

async function main() {
  const apiKey = getApiKey();
  const docs = readDocs();

  // Embed all document bodies
  const docEmbeddings = await embed(
    docs.map((d) => d.content),
    apiKey
  );

  // Pre-compute query embeddings for all (lessonId, phase) combinations
  const lessons = ['fractions-101', 'adding'];
  const phases = ['intro', 'tutorial', 'explore', 'guided', 'assess', 'complete'];
  const queryTexts: string[] = [];
  const queryKeys: string[] = [];

  for (const lesson of lessons) {
    for (const phase of phases) {
      queryKeys.push(`${lesson}:${phase}`);
      queryTexts.push(
        `Teaching fractions in ${lesson} lesson during ${phase} phase. ` +
        `Strategies for fraction ${phase === 'assess' ? 'assessment' : 'instruction'} ` +
        `with students ages 8-12.`
      );
    }
  }

  const queryEmbeddings = await embed(queryTexts, apiKey);

  // Build knowledge base
  const knowledgeBase = {
    chunks: docs.map((doc, i) => ({
      ...doc,
      embedding: docEmbeddings[i],
    })),
    queryEmbeddings: Object.fromEntries(
      queryKeys.map((key, i) => [key, queryEmbeddings[i]])
    ),
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(knowledgeBase, null, 2));
  console.log(`\nKnowledge base written to ${OUTPUT_PATH}`);
  console.log(`  ${knowledgeBase.chunks.length} chunks`);
  console.log(`  ${queryKeys.length} pre-computed query embeddings`);
  console.log(`  Embedding dimensions: ${docEmbeddings[0]?.length ?? 0}`);
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
