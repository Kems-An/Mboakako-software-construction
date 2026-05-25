// src/pages/Success.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export const SuccessPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="text-center max-w-sm">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-8">
        Thank you for your purchase. You can track your order in your dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/dashboard"
          className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
        >
          View Orders
        </Link>
        <Link
          to="/market"
          className="px-6 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  </div>
);

// src/pages/Cancel.tsx
export const CancelPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="text-center max-w-sm">
      <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Cancelled</h1>
      <p className="text-gray-500 mb-8">
        Your order was not completed. Your cart is still saved.
      </p>
      <Link
        to="/cart"
        className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
      >
        Return to Cart
      </Link>
    </div>
  </div>
);
