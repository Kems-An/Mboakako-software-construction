// src/hooks/useRecommendations.ts
import { useState, useEffect } from 'react';
import type { ProductWithRating } from '../types/database';
import { getRecommendations } from '../utils/recommendation';

export function useRecommendations(userId: string | undefined, topK = 6) {
  const [recommendations, setRecommendations] = useState<ProductWithRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    getRecommendations(userId, topK)
      .then((data) => { if (!cancelled) setRecommendations(data); })
      .catch((e)   => { if (!cancelled) setError(e.message); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, topK]);

  return { recommendations, loading, error };
}
