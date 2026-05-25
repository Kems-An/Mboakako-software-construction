// src/types/database.ts
// Auto-generated types matching the Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null  
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          role: 'customer' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          role?: 'customer' | 'admin';
          avatar_url?: string | null;
        };
        Update: {
          username?: string;
          email?: string;
          role?: 'customer' | 'admin';
          avatar_url?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          stock: number;
          image_url: string;
          category: string;
          admin_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description: string;
          price: number;
          stock: number;
          image_url: string;
          category: string;
          admin_id: string;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          price?: number;
          stock?: number;
          image_url?: string;
          category?: string;
          is_active?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          rating: number;
          comment: string;
        };
        Update: {
          rating?: number;
          comment?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: { user_id: string };
        Update: Record<string, never>;
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          subtotal: number;
          updated_at: string;
        };
        Insert: {
          cart_id: string;
          product_id: string;
          quantity: number;
          subtotal: number;
        };
        Update: {
          quantity?: number;
          subtotal?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_session_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_amount: number;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_session_id?: string;
        };
        Update: {
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          stripe_session_id?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          subtotal: number;
        };
        Insert: {
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Update: Record<string, never>;
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          event_type: 'view' | 'add_to_cart' | 'purchase';
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          event_type: 'view' | 'add_to_cart' | 'purchase';
        };
        Update: Record<string, never>;
      };
      categories: {
        Row: { id: number; name: string; slug: string; created_at: string };
        Insert: { name: string; slug: string };
        Update: { name?: string; slug?: string };
      };
    };
    Views: {
      products_with_ratings: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          stock: number;
          image_url: string;
          category: string;
          admin_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          average_rating: number;
          review_count: number;
        };
      };
    };
    Functions: {
      get_user_reviewed_products: {
        Args: { p_user_id: string };
        Returns: Array<{
          product_id: string;
          title: string;
          description: string;
          category: string;
          rating: number;
          comment: string;
        }>;
      };
      get_products_for_recommendation: {
        Args: { p_user_id: string };
        Returns: Array<{
          id: string;
          title: string;
          description: string;
          category: string;
          price: number;
          image_url: string;
          stock: number;
        }>;
      };
    };
  };
}

// Convenience type aliases
export type Profile  = Database['public']['Tables']['profiles']['Row'];
export type Product  = Database['public']['Tables']['products']['Row'];
export type Review   = Database['public']['Tables']['reviews']['Row'];
export type Cart     = Database['public']['Tables']['carts']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Order    = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type ProductWithRating = Database['public']['Views']['products_with_ratings']['Row'];

// Composite types used in UI
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface OrderWithItems extends Order {
  items: Array<OrderItem & { product: Product }>;
}
