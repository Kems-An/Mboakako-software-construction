// src/pages/Home/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { Spinner } from '../../components/ui/index';
import hero from "../../assets/hero.png"

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
  {/* Ambient background glow elements */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(251,191,36,0.15),transparent_60%)]" />
  <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-orange-100/40 rounded-full blur-2xl pointer-events-none" />

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 relative">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
      
      {/* Left Content Column */}
      <div className="max-w-2xl z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6 backdrop-blur-sm border border-amber-200/50 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Cameroon&apos;s Favourite Marketplace
        </span>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">
          Shop
          <span className="text-amber-500 relative inline-block mx-2">
            Anywhere,
            <span className="absolute bottom-2 left-0 w-full h-2 bg-amber-200 -z-10 transform -rotate-1 rounded" />
          </span>
          <br />Anytime
        </h1>
        
        <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
          Discover thousands of products — fashion, electronics, beauty and more.
          {user && profile && ` Welcome back, ${profile.username}!`}
        </p>
        
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/market"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold
                       rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300
                       hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/30 active:translate-y-0"
          >
            Browse Products
          </Link>
          {!user && (
            <Link
              to="/signup"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold
                         rounded-xl border border-gray-200 shadow-sm transition-all duration-300
                         hover:-translate-y-1 hover:shadow-md active:translate-y-0"
            >
              Create Account
            </Link>
          )}
        </div>

        {/* Quick Trust Badges underneath actions */}
        <div className="mt-12 pt-8 border-t border-gray-200/60 flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Fast Logistics</span>
          </div>
        </div>
      </div>

      {/* Right Image Showcase Column */}
      <div className="relative w-full h-full min-h-[350px] md:min-h-[450px] flex items-center justify-center lg:justify-end z-10">
        <div className="relative w-full max-w-[500px] lg:max-w-none aspect-square lg:aspect-auto lg:h-[500px]">
          
          {/* Decorative Backdrops */}
          <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-300 shadow-2xl transform rotate-3 scale-95 opacity-20 animate-pulse duration-4000" />
          <div className="absolute inset-4 rounded-3xl bg-gradient-to-bl from-orange-400 to-amber-300 shadow-xl transform -rotate-3 scale-95 opacity-15" />
          
          {/* Main Content Container Container */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white bg-white/40 backdrop-blur-md shadow-xl flex items-center justify-center">
            <img 
              src={hero}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Soft edge vignette mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>

          {/* Modern Floating Card 1: Live Stats / Trend */}
          <div className="absolute -left-6 top-1/4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce duration-3000 max-w-[200px]">
            <div className="p-2.5 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Trending Now</p>
              <p className="text-sm font-black text-gray-800">Top Brands active</p>
            </div>
          </div>

          {/* Modern Floating Card 2: Promo / Discount Tag */}
          <div className="absolute -right-4 bottom-12 bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-xl text-white flex flex-col items-center justify-center min-w-[110px] transform hover:scale-105 transition-transform">
            <span className="text-2xl font-black tracking-tight">Up To</span>
            <span className="text-3xl font-black tracking-tight -mt-1">50%</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100 mt-0.5">Discount</span>
          </div>

        </div>
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