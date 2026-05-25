// src/utils/recommendation.ts
// Client-side content-based recommendation engine using TF-IDF cosine similarity.

import { supabase } from '../services/supabase';
import type { ProductWithRating } from '../types/database';

/** ---------- FIX: Explicit RPC return types ---------- */
type ReviewedProduct = {
  product_id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  comment: string;
};

type CandidateProduct = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  stock: number;
};

/** Tokenize and clean text for TF-IDF */
function tokenize(text: string): string[] {
  const stopWords = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'by','from','is','are','was','were','be','been','being','have','has',
    'had','do','does','did','will','would','could','should','may','might',
    'this','that','these','those','it','its','very','much','more','most',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/** Build term-frequency map */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();

  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }

  const total = tokens.length || 1;

  tf.forEach((v, k) => tf.set(k, v / total));
  return tf;
}

/** TF-IDF */
function buildTfIdf(documents: string[]): Array<Map<string, number>> {
  const tokenized = documents.map(tokenize);
  const docCount = documents.length;

  const df = new Map<string, number>();

  for (const tokens of tokenized) {
    new Set(tokens).forEach((t) =>
      df.set(t, (df.get(t) ?? 0) + 1)
    );
  }

  return tokenized.map((tokens) => {
    const tf = termFrequency(tokens);
    const tfidf = new Map<string, number>();

    tf.forEach((tfVal, term) => {
      const idf = Math.log((docCount + 1) / ((df.get(term) ?? 0) + 1)) + 1;
      tfidf.set(term, tfVal * idf);
    });

    return tfidf;
  });
}

/** Cosine similarity */
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>
): number {
  let dot = 0,
    normA = 0,
    normB = 0;

  a.forEach((val, term) => {
    dot += val * (b.get(term) ?? 0);
    normA += val * val;
  });

  b.forEach((val) => {
    normB += val * val;
  });

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** Weighted vector addition */
function addWeightedVector(
  target: Map<string, number>,
  source: Map<string, number>,
  weight: number
) {
  source.forEach((val, term) => {
    target.set(term, (target.get(term) ?? 0) + val * weight);
  });
}

/** Normalize vector */
function normalizeVector(vec: Map<string, number>, scalar: number) {
  if (scalar === 0) return;

  vec.forEach((val, term) => {
    vec.set(term, val / scalar);
  });
}

/**
 * MAIN RECOMMENDER
 */
export async function getRecommendations(
  userId: string,
  topK = 6
): Promise<ProductWithRating[]> {

  /** FIX 1: Typed RPC result */
  const { data: reviewedRaw } = await supabase.rpc(
    'get_user_reviewed_products',
    { p_user_id: userId } as any
  );

  const reviewed = (reviewedRaw ?? []) as ReviewedProduct[];

  if (reviewed.length === 0) {
    const { data } = await supabase
      .from('products_with_ratings')
      .select('*')
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(topK);

    return (data as ProductWithRating[]) ?? [];
  }

  /** FIX 2: Typed candidates */
  const { data: candidatesRaw } = await supabase.rpc(
    'get_products_for_recommendation',
    { p_user_id: userId } as any
  );

  const candidates = (candidatesRaw ?? []) as CandidateProduct[];

  if (candidates.length === 0) return [];

  /** Build corpus */
  const reviewedCorpus = reviewed.map(
    (r) => `${r.title} ${r.description} ${r.category} ${r.comment ?? ''}`
  );

  const candidateCorpus = candidates.map(
    (c) => `${c.title} ${c.description} ${c.category}`
  );

  const allCorpus = [...reviewedCorpus, ...candidateCorpus];

  const tfidfVecs = buildTfIdf(allCorpus);

  /** User profile */
  const userProfile = new Map<string, number>();
  let totalWeight = 0;

  reviewed.forEach((r, idx) => {
    addWeightedVector(userProfile, tfidfVecs[idx], r.rating);
    totalWeight += r.rating;
  });

  normalizeVector(userProfile, totalWeight);

  /** Score candidates */
  const candidateVecs = tfidfVecs.slice(reviewed.length);

  const scored = candidates.map((product, i) => ({
    product,
    score: cosineSimilarity(userProfile, candidateVecs[i]),
  }));

  scored.sort((a, b) => b.score - a.score);

  const topProducts = scored
    .slice(0, topK)
    .map((s) => s.product.id);

  const { data: fullProducts } = await supabase
    .from('products_with_ratings')
    .select('*')
    .in('id', topProducts);

  const productMap = new Map(
    (fullProducts ?? []).map((p) => [(p as any).id, p] )
  );

 const result: ProductWithRating[] = [];

for (const id of topProducts) {
  const product = productMap.get(id);
  if (product) {
    result.push(product);
  }
}

return result as ProductWithRating[];}