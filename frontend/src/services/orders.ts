// src/services/orders.ts
import { supabase } from './supabase';

// ── Simple local types to avoid database type conflicts ──────
export interface OrderItem {
  id:         string;
  order_id:   string;
  product_id: string;
  quantity:   number;
  price:      number;
  subtotal:   number;
}

export interface Order {
  id:               string;
  user_id:          string;
  total_amount:     number;
  status:           'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  stripe_session_id: string | null;
  created_at:       string;
  updated_at:       string;
}

export interface OrderWithItems extends Order {
  items: Array<OrderItem & { product: Record<string, unknown> }>;
}

// ── Place an order ───────────────────────────────────────────
export async function placeOrder(
  userId:      string,
  items:       Array<{ product_id: string; quantity: number; price: number }>,
  totalAmount: number,
): Promise<Order> {

  // Step 1 — Create the order as paid immediately
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id:      userId,
      total_amount: totalAmount,
      status:       'paid',
    } as never)
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? 'Failed to create order');
  }

  const createdOrder = order as unknown as Order;

  // Step 2 — Insert order items
  const orderItems = items.map((item) => ({
    order_id:   createdOrder.id,
    product_id: item.product_id,
    quantity:   item.quantity,
    price:      item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems as never);

  if (itemsError) throw new Error(itemsError.message);

  // Step 3 — Track activity for recommendation engine
  const activityItems = items.map((i) => ({
    user_id:    userId,
    product_id: i.product_id,
    event_type: 'purchase',
  }));

  await supabase
    .from('user_activity')
    .insert(activityItems as never);

  return createdOrder;
}

// ── Get all orders for a user ────────────────────────────────
export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Order[];
}

// ── Get one order with all items and product details ─────────
export async function getOrderWithItems(
  orderId: string
): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data as unknown as OrderWithItems;
}

// ── Update order status ──────────────────────────────────────
export async function updateOrderStatus(
  orderId:         string,
  status:          Order['status'],
  stripeSessionId?: string,
): Promise<void> {
  const updateData: Record<string, string> = { status };
  if (stripeSessionId) {
    updateData.stripe_session_id = stripeSessionId;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData as never)
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}