// src/context/CartContext.tsx
// Real-time cart state management backed by Supabase

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { CartItemWithProduct } from '../types/database';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItemWithProduct[];
  totalPrice: number;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems]     = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all cart items with product details for the current user
  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      // Get or create the user's cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id } as any)
          .select('id')
          .single();
        cart = newCart;
      }

      if (!cart) return;

      const { data } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('cart_id', (cart as any).id);

      setItems((data as CartItemWithProduct[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // Helper: get or create user cart, returns cart id
  const getCartId = async (): Promise<string | null> => {
    if (!user) return null;
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id } as any)
        .select('id')
        .single();
      cart = newCart;
    }
    return (cart as any)?.id ?? null;
  };

  const addToCart = async (productId: string) => {
    if (!user) return;
    const cartId = await getCartId();
    if (!cartId) return;

    // Get product price
    const { data: product } = await supabase
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();
    if (!product) return;

    // Check if already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      const newQty = (existing as any).quantity + 1;
      await (supabase
  .from('cart_items') as any)
  .update({
    quantity: newQty,
    subtotal: newQty * (product as any).price,
  })
  .eq('id', (existing as any).id);
    } else {
      await supabase
        .from('cart_items')
        .insert({
  cart_id: cartId,
  product_id: productId,
  quantity: 1,
  subtotal: (product as any).price,
} as any);
    }

    // Track activity
    await (supabase.from('user_activity') as any).insert({
      user_id: user.id,
      product_id: productId,
      event_type: 'add_to_cart',
    });

    await fetchCart();
  };

  const removeFromCart = async (cartItemId: string) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    await fetchCart();
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    // Get price for subtotal recalculation
    const item = items.find((i) => i.id === cartItemId);
    if (!item) return;
    await (supabase
  .from('cart_items') as any)
  .update({
    quantity,
    subtotal: quantity * (item as any).product.price,
  })
  .eq('id', cartItemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    const { data: cart } = await supabase 
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!cart) return;
    await (supabase.from('cart_items') as any)
  .delete()
  .eq('cart_id', (cart as any).id);
    setItems([]);
  };

  const totalPrice = items.reduce((acc, i) => acc + i.subtotal, 0);
  const itemCount  = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalPrice,
        itemCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refetch: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
