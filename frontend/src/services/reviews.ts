// src/services/reviews.ts
// Review CRUD operations against Supabase

import { supabase } from './supabase';
import type { Review } from '../types/database';

export interface ReviewWithUser extends Review {
  profiles: { username: string; avatar_url: string | null };
}

/** Get all reviews for a product */
export async function getProductReviews(productId: string): Promise<ReviewWithUser[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ReviewWithUser[]) ?? [];
}

/** Create a review (one per user per product enforced by DB UNIQUE constraint) */
export async function createReview(
  userId: string,
  productId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: userId, product_id: productId, rating, comment } as any) 
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Check if user already reviewed a product */
export async function hasUserReviewed(userId: string, productId: string): Promise<boolean> {
  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  return !!data;
}
