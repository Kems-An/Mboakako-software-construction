// src/context/CartContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

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
  updateQuantity: (
    cartItemId: string,
    quantity: number
  ) => Promise<void>;

  clearCart: () => Promise<void>;
  refetch: () => Promise<void>;
}

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

export const CartProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [items, setItems] =
    useState<CartItemWithProduct[]>([]);

  const [loading, setLoading] =
    useState(false);

  /*
    ==========================================================
    GET OR CREATE CART
    ==========================================================
  */

  const getCartId = async (): Promise<string | null> => {

    if (!user) return null;

    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    /*
      FIX:
      Prevent "never" type errors
    */
    const typedCart = cart as any;

    if (!typedCart) {

      const { data: newCart } = await supabase
        .from('carts')
        .insert({
          user_id: user.id,
        } as any)
        .select('id')
        .single();

      cart = newCart as any;
    }

    return typedCart?.id || (cart as any)?.id || null;
  };

  /*
    ==========================================================
    FETCH CART
    ==========================================================
  */

  const fetchCart = useCallback(async () => {

    if (authLoading) return;

    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);

    try {

      const cartId = await getCartId();

      if (!cartId) {
        setItems([]);
        return;
      }

      const { data } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('cart_id', cartId);

      setItems(
        ((data as any[]) ?? []) as CartItemWithProduct[]
      );

    } catch (error) {

      console.error(error);
      setItems([]);

    } finally {

      setLoading(false);
    }

  }, [user, authLoading]);

  /*
    ==========================================================
    REFETCH WHEN USER CHANGES
    ==========================================================
  */

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /*
    ==========================================================
    ADD TO CART
    ==========================================================
  */

  const addToCart = async (
    productId: string
  ) => {

    if (!user) return;

    const cartId = await getCartId();

    if (!cartId) return;

    /*
      GET PRODUCT
    */

    const { data: product } = await supabase
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();

    const typedProduct = product as any;

    if (!typedProduct) return;

    /*
      CHECK EXISTING ITEM
    */

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    const typedExisting = existing as any;

    /*
      UPDATE EXISTING
    */

    if (typedExisting) {

      const newQty =
        typedExisting.quantity + 1;

     await (supabase
  .from('cart_items') as any)
  .update({
    quantity: newQty,
    subtotal:
      newQty * typedProduct.price,
  })
  .eq('id', typedExisting.id);

    } else {

      /*
        INSERT NEW ITEM
      */

      await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity: 1,
          subtotal: typedProduct.price,
        } as any);
    }

    /*
      USER ACTIVITY
    */

    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        product_id: productId,
        event_type: 'add_to_cart',
      } as any);

    await fetchCart();
  };

  /*
    ==========================================================
    REMOVE ITEM
    ==========================================================
  */

  const removeFromCart = async (
    cartItemId: string
  ) => {

    await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    await fetchCart();
  };

  /*
    ==========================================================
    UPDATE QUANTITY
    ==========================================================
  */

  const updateQuantity = async (
    cartItemId: string,
    quantity: number
  ) => {

    if (quantity <= 0) {

      await removeFromCart(cartItemId);
      return;
    }

    const item = items.find(
      (i) => i.id === cartItemId
    );

    if (!item) return;

    await (supabase
      .from('cart_items') as any)
      .update({
        quantity,
        subtotal:
          quantity * item.product.price,
      } as any)
      .eq('id', cartItemId);

    await fetchCart();
  };

  /*
    ==========================================================
    CLEAR CART
    ==========================================================
  */

  const clearCart = async () => {

    if (!user) return;

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const typedCart = cart as any;

    if (!typedCart) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', typedCart.id);

    setItems([]);
  };

  /*
    ==========================================================
    TOTALS
    ==========================================================
  */

  const totalPrice = items.reduce(
    (acc, i) => acc + i.subtotal,
    0
  );

  const itemCount = items.reduce(
    (acc, i) => acc + i.quantity,
    0
  );

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

export const useCart =
  (): CartContextType => {

    const ctx = useContext(CartContext);

    if (!ctx) {
      throw new Error(
        'useCart must be used within CartProvider'
      );
    }

    return ctx;
  };