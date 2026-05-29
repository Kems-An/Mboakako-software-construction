// src/pages/Checkout/Checkout.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeOrder, updateOrderStatus } from '../../services/orders';
import { processCamPayPayment } from '../../services/campay';
import { formatPrice } from '../../utils/helpers';
import { Button } from '../../components/ui/Button';

// Payment steps for UI feedback
type PaymentStep =
  | 'idle'
  | 'creating_order'
  | 'requesting_payment'
  | 'waiting_approval'
  | 'success'
  | 'failed';

const STEP_MESSAGES: Record<PaymentStep, string> = {
  idle:              '',
  creating_order:    'Creating your order...',
  requesting_payment:'Sending payment request to your phone...',
  waiting_approval:  'Waiting for you to approve on your phone. Check your MTN/Orange Money prompt...',
  success:           'Payment successful! Order confirmed.',
  failed:            '',
};

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [phone, setPhone]         = useState('');
  const [error, setError]         = useState('');
  const [step, setStep]           = useState<PaymentStep>('idle');
  const [loading, setLoading]     = useState(false);

  // CamPay credentials — in production store these in a backend
  // For class project we use the demo credentials directly
  const CAMPAY_USERNAME = 'AeEM-F7LzMTEO8slXZZ-6pgI23GlevjOM3e4dlBuzyCNErr5J1BfjC70QUhvWJC5TSpXvJgysnHYgnROPzfWtw';
  const CAMPAY_PASSWORD = 'qNSXPBl8RK-K1XSQznRN6HX894cwevuSLggYVSNFqH17vA1zMAR5_BPSbmxC5T1Ee7IgSbMNW0h9FWTlDvztaQ';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to check out.</p>
          <Link to="/login" className="text-amber-600 font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link to="/market" className="text-amber-600 font-medium hover:underline">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Format phone number to CamPay format (237XXXXXXXXX)
  const formatPhone = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    if (digits.startsWith('237')) return digits;
    if (digits.startsWith('0'))   return `237${digits.slice(1)}`;
    return `237${digits}`;
  };

  const handleCheckout = async () => {
    setError('');

    // Validate phone number
    if (!phone.trim()) {
      setError('Please enter your MTN or Orange Money phone number.');
      return;
    }

    const formattedPhone = formatPhone(phone);
    if (formattedPhone.length < 12) {
      setError('Please enter a valid Cameroonian phone number.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the order in Supabase
      setStep('creating_order');
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity:   item.quantity,
        price:      item.product.price,
      }));

      const order = await placeOrder(user.id, orderItems, totalPrice);

      // Step 2: Send payment request to customer phone
      setStep('requesting_payment');
      setStep('waiting_approval');

      const result = await processCamPayPayment(
        CAMPAY_USERNAME,
        CAMPAY_PASSWORD,
        formattedPhone,
        totalPrice,
        order.id,
        `Mboakako order #${order.id.slice(0, 8).toUpperCase()}`
      );

      if (result.success) {
        // Payment approved — update order status to paid
        await updateOrderStatus(order.id, 'paid', result.reference);
        await clearCart();
        setStep('success');

        // Redirect to success page after 2 seconds
        setTimeout(() => navigate('/success'), 2000);
      } else {
        // Payment failed — update order to cancelled
        await updateOrderStatus(order.id, 'cancelled');
        setStep('failed');
        setError(result.message);
      }

    } catch (err: unknown) {
      setStep('failed');
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Payment step feedback */}
        {step !== 'idle' && step !== 'failed' && (
          <div className={`rounded-xl px-4 py-4 mb-6 text-sm font-medium flex items-center gap-3 ${
            step === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-amber-50 border border-amber-200 text-amber-700'
          }`}>
            {step !== 'success' && (
              <svg className="animate-spin h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {step === 'success' && <span className="text-xl">✅</span>}
            {STEP_MESSAGES[step]}
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.product.image_url}
                  alt={item.product.title}
                  className="h-12 w-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.product.title}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Phone number input */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">
            Mobile Money Payment
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter your MTN or Orange Money number. You will receive a payment
            prompt on your phone to approve.
          </p>

          {/* Network logos */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-sm font-bold text-yellow-700">MTN</span>
              <span className="text-xs text-yellow-600">MoMo</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-sm font-bold text-orange-700">Orange</span>
              <span className="text-xs text-orange-600">Money</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-l-lg text-sm font-medium text-gray-600">
              🇨🇲 +237
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="6XXXXXXXX"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-r-lg
                         focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400
                         disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Example: 670000000 or 690000000
          </p>
        </div>

        {/* Pay button */}
        <Button
          onClick={handleCheckout}
          loading={loading}
          disabled={loading || step === 'success'}
          size="lg"
          className="w-full"
        >
          {loading ? 'Processing Payment...' : `Pay ${formatPrice(totalPrice)} via Mobile Money`}
        </Button>

        {!loading && (
          <Link
            to="/cart"
            className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            ← Back to Cart
          </Link>
        )}
      </div>
    </main>
  );
};

export default Checkout;