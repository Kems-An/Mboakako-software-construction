// src/pages/Home/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { Spinner } from '../../components/ui/index';

import {  
  FiTruck, 
  FiShield, 
  FiRefreshCw, 
  FiCheckCircle 
} from 'react-icons/fi';

const CATEGORIES = ['Shoes', 'Bags', 'Jewelries', 'Gadget', 'Topwear', 'Afro'];

const Home: React.FC = () => {
  const { user, profile } = useAuth();

  // Products always load — no auth dependency
  const { products: newArrivals, loading } = useProducts();

  // Recommendations only load if user is logged in
  const { recommendations } = useRecommendations(user?.id);

  // Show recommendations if available, otherwise show new arrivals
  const displayProducts = (user && recommendations.length > 0)
    ? recommendations.slice(0, 8)
    : newArrivals.slice(0, 8);

  const sectionTitle = (user && recommendations.length > 0)
    ? 'Recommended for You'
    : 'New Arrivals';

  const sectionSubtitle = (user && recommendations.length > 0)
    ? 'Based on your reviews and preferences'
    : 'Fresh products just added to the store';

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(251,191,36,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Cameroon&apos;s Favourite Marketplace
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
              Shop
              <span className="text-amber-500"> Anywhere,</span>
              <br />Anytime
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
              Discover thousands of products — fashion, electronics, beauty and more.
              {user && profile && ` Welcome back, ${profile.username}!`}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/market"
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold
                           rounded-xl shadow-lg shadow-amber-200 transition-all duration-200
                           hover:-translate-y-0.5"
              >
                Browse Products
              </Link>
              {!user && (
                <Link
                  to="/signup"
                  className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold
                             rounded-xl border border-gray-200 shadow-sm transition-all duration-200"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/market?category=${cat}`}
              className="flex-shrink-0 px-5 py-2.5 rounded-full border border-gray-200 bg-white
                         text-sm font-medium text-gray-700 hover:border-amber-400 hover:text-amber-600
                         hover:bg-amber-50 transition-all duration-150 shadow-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{sectionTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">{sectionSubtitle}</p>
          </div>
          <Link
            to="/market"
            className="text-sm font-medium text-amber-600 hover:text-amber-700
                       flex items-center gap-1"
          >
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trust badges */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <FiTruck className="text-amber-500 w-7 h-7" />, title: 'Fast Delivery', desc: 'Reliable nationwide shipping networks' },
              { icon: <FiShield className="text-amber-500 w-7 h-7" />, title: 'Secure Payments', desc: 'Robust Stripe-powered checkouts' },
              { icon: <FiRefreshCw className="text-amber-500 w-7 h-7" />, title: 'Easy Returns', desc: 'Hassle-free 30-day return policy' },
              { icon: <FiCheckCircle className="text-amber-500 w-7 h-7" />, title: 'Verified Sellers', desc: 'Handpicked quality verification' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{icon}</span>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;