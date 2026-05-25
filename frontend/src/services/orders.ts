// src/services/orders.ts
// Order creation and retrieval via Supabase

import { supabase } from './supabase';
import type { Order, OrderWithItems } from '../types/database';
/** Place an order from the current cart contents */
export async function placeOrder(
  userId: string,
  items: Array<{ product_id: string; quantity: number; price: number }>, 
  totalAmount: number,
): Promise<Order> {
  // create order
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({ user_id: userId, total_amount: totalAmount, status: 'pending' } as any)
  .select()
  .single();

  if (orderError || !order) throw new Error(orderError?.message ?? 'Failed to create order');

  // 2. Insert order items
  const orderItems = items.map((item) => ({
    order_id: (order as any).id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems as any);
  if (itemsError) throw new Error(itemsError.message);

  // 3. Track purchase activity
  await (supabase.from('user_activity') as any).insert(
    items.map((i) => ({
      user_id: userId,
      product_id: i.product_id,
      event_type: 'purchase' as const,
    }))
  );

  return order;
}

/** Get all orders for a user */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Get a full order with items and product details */
export async function getOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data as OrderWithItems;
}

/** Update order status (admin or webhook) */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  stripeSessionId?: string,
): Promise<void> {
  const update: { status: Order['status']; stripe_session_id?: string } = { status };
  if (stripeSessionId) update.stripe_session_id = stripeSessionId;

  const { error } = await (supabase.from('orders') as any).update(update).eq('id', orderId);
  if (error) throw new Error(error.message);
}
