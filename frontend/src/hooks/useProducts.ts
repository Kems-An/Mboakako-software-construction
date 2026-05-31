// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import type { ProductWithRating } from '../types/database';
import { supabase } from '../services/supabase';

// Helper adds default rating fields
const addRatingDefaults = (p: Record<string, unknown>): ProductWithRating => ({
  ...(p as ProductWithRating),
  average_rating: 0,
  review_count: 0,
});

export function useProducts(category = 'All') {
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (category !== 'All') {
          query = query.ilike('category', `%${category}%`);
        }

        const { data, error: sbError } = await query;

        if (sbError) throw new Error(sbError.message);
        if (!cancelled) setProducts((data ?? []).map(addRatingDefaults));
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };

  // Products fetch is completely independent of auth
  }, [category]);

  return { products, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<ProductWithRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

 useEffect(() => {
  if (!id) {
    setLoading(false);
    return;
  }

  let cancelled = false;
  setLoading(true);

  supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
    .then((response: any) => {
      const { data, error: sbError } = response;

      if (cancelled) return;

      if (sbError) {
        setError(sbError.message);
      } else {
        setProduct(
          data
            ? {
                ...data,
                average_rating: 0,
                review_count: 0,
              }
            : null
        );
      }

      setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [id]);
  return { product, loading, error };
}