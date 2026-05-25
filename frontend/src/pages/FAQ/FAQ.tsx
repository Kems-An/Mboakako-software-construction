// src/pages/FAQ/FAQ.tsx
import React, { useState } from 'react';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Browse our marketplace, add items to your cart, and proceed to checkout. You will receive an order confirmation in your dashboard.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards through our secure Stripe payment gateway. Mobile money support is coming soon.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Delivery typically takes 2–5 business days within major Cameroonian cities. Remote areas may take up to 7 business days.',
  },
  {
    q: 'Can I return a product?',
    a: 'Yes, we have a 30-day return policy. Products must be in original condition with packaging intact. Contact us to initiate a return.',
  },
  {
    q: 'How do I become a seller?',
    a: 'Contact our team to apply for an admin/seller account. Once approved, you can list products directly from the Admin Panel.',
  },
  {
    q: 'How does the recommendation system work?',
    a: 'Our AI-powered recommendation engine analyses your product reviews and ratings to suggest items you are likely to enjoy. The more you review, the better the recommendations become.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payments are processed by Stripe, a PCI-DSS-compliant payment provider. We never store your card details on our servers.',
  },
  {
    q: 'How do I track my order?',
    a: 'You can track all your orders from the Dashboard page. Order statuses update in real time as your package progresses.',
  },
];

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-500 mt-3">Everything you need to know about Mboakako.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                <svg
                  className={`h-5 w-5 text-gray-400 flex-shrink-0 ml-4 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FAQ;
