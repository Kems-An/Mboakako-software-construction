// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import type { ProductWithRating } from '../types/database';
import { getAllProducts, getProductsByCategory, getProductById } from '../services/products';

export function useProducts(category = 'All') {
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fn = category === 'All' ? getAllProducts() : getProductsByCategory(category);
    fn
      .then((data) => { if (!cancelled) setProducts(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category]);

  return { products, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<ProductWithRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getProductById(id)
      .then((data) => { if (!cancelled) setProduct(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return { product, loading, error };
}
