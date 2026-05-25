// src/services/products.ts
import { supabase } from './supabase';
import type { ProductWithRating } from '../types/database';

/** Fetch all active products with average ratings */
export async function getAllProducts(): Promise<ProductWithRating[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      reviews(rating)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllProducts error:', error);
    throw new Error(error.message);
  }

  // Calculate average rating client-side
  return (data ?? []).map((p: any) => {
    const ratings = p.reviews?.map((r: any) => r.rating) ?? [];
    const average_rating = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0;
    return {
      ...p,
      reviews: undefined,
      average_rating: parseFloat(average_rating.toFixed(2)),
      review_count: ratings.length,
    };
  });
}

/** Fetch products filtered by category */
export async function getProductsByCategory(
  category: string
): Promise<ProductWithRating[]> {
  let query = supabase
    .from('products')
    .select(`*, reviews(rating)`)
    .eq('is_active', true);

  if (category !== 'All') {
    query = query.ilike('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('getProductsByCategory error:', error);
    throw new Error(error.message);
  }

  return (data ?? []).map((p: any) => {
    const ratings = p.reviews?.map((r: any) => r.rating) ?? [];
    const average_rating = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0;
    return {
      ...p,
      reviews: undefined,
      average_rating: parseFloat(average_rating.toFixed(2)),
      review_count: ratings.length,
    };
  });
}

/** Fetch a single product by id */
export async function getProductById(
  id: string
): Promise<ProductWithRating | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, reviews(rating)`)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('getProductById error:', error);
    return null;
  }

  const ratings = (data as any)?.reviews?.map((r: any) => r.rating) ?? [];
  const average_rating = ratings.length > 0
    ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
    : 0;

  return {
    ...(data as any),
    reviews: undefined,
    average_rating: parseFloat(average_rating.toFixed(2)),
    review_count: ratings.length,
  } as ProductWithRating;
}

/** Full-text search on products */
export async function searchProducts(query: string): Promise<ProductWithRating[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, reviews(rating)`)
    .eq('is_active', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

  if (error) {
    console.error('searchProducts error:', error);
    throw new Error(error.message);
  }

  return (data ?? []).map((p: any) => {
    const ratings = p.reviews?.map((r: any) => r.rating) ?? [];
    const average_rating = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0;
    return {
      ...p,
      reviews: undefined,
      average_rating: parseFloat(average_rating.toFixed(2)),
      review_count: ratings.length,
    };
  });
}

/** Admin: create a product */
export async function createProduct(
  product: Omit<ProductWithRating, 'id' | 'created_at' | 'updated_at' | 'average_rating' | 'review_count'>
): Promise<ProductWithRating> {
  const { data, error } = await supabase
    .from('products')
    .insert(product as any)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { ...(data as any), average_rating: 0, review_count: 0 };
}

/** Admin: soft-delete a product */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await (supabase
    .from('products') as any)
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/** Get admin's own products */
export async function getAdminProducts(adminId: string): Promise<ProductWithRating[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, reviews(rating)`)
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p: any) => {
    const ratings = p.reviews?.map((r: any) => r.rating) ?? [];
    const average_rating = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0;
    return {
      ...p,
      reviews: undefined,
      average_rating: parseFloat(average_rating.toFixed(2)),
      review_count: ratings.length,
    };
  });
}