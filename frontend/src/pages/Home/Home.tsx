// src/pages/Home/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { Spinner } from '../../components/ui/index';
import hero from "../../assets/hero.png"
// Importing clean, modern React Icons
import { 
  FiArrowRight, 
  FiTruck, 
  FiShield, 
  FiRefreshCw, 
  FiCheckCircle 
} from 'react-icons/fi';

const CATEGORIES = ['Shoes', 'Bags', 'Jewelries', 'Gadget', 'Topwear', 'Afro'];

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const { recommendations, loading: recLoading } = useRecommendations(user?.id);
  const { products: newArrivals, loading: arrivalsLoading } = useProducts();

  // Always show new arrivals while recommendations load
  // Never block product display on auth state
  const displayProducts = (user && recommendations.length > 0)
    ? recommendations.slice(0, 8)
    : newArrivals.slice(0, 8);

  // Only block on arrivals loading, not recommendations
  const isLoading = arrivalsLoading;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(251,191,36,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10">
          
          {/* Two-Column Grid for Text and Image Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Cameroon&apos;s Favourite Marketplace
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight">
                Shop
                <span className="text-amber-500"> Anywhere,</span>
                <br />Anytime
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl font-normal">
                Discover thousands of premium products — fashion, electronics, beauty, and authentic local items.
                {user && profile && (
                  <span className="block mt-2 text-amber-600 font-medium">
                    Welcome back, {profile.username}!
                  </span>
                )}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/market"
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold
                             rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200
                             hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 flex items-center gap-2"
                >
                  Browse Products
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                {!user && (
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold
                               rounded-xl border border-gray-200 shadow-sm transition-all duration-200
                               hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>

            {/* Right Image Column */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative Background Card effect for premium depth */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-3xl transform rotate-3 scale-105" />
                
                
                <img
                  src={hero}
                  alt="Marketplace Showcase"
                  className="relative z-10 w-full h-[450px] object-cover rounded-3xl shadow-2xl border border-white/40 transition-transform duration-500 hover:scale-[1.01]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Pills Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase font-bold tracking-wider text-gray-400">Popular Categories</h3>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/market?category=${cat}`}
              className="flex-shrink-0 px-6 py-3 rounded-xl border border-gray-200 bg-white
                         text-sm font-semibold text-gray-700 hover:border-amber-400 hover:text-amber-600
                         hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Dynamic Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {user && recommendations.length > 0 ? 'Recommended for You' : 'New Arrivals'}
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-1.5">
              {user && recommendations.length > 0
                ? 'Tailored showcase based on your reviews and recent preferences'
                : 'Explore fresh and trending products just added to the platform'}
            </p>
          </div>
          <Link
            to="/market"
            className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 group self-start sm:self-auto transition-colors"
          >
            View all products
            <FiArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-24 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-500">
            <p className="font-medium text-lg text-gray-600">No products available yet.</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for fresh updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product) => (
              <div 
                key={product.id} 
                className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-md rounded-2xl"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges Showcase */}
      <section className="bg-white border-t border-gray-200/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { icon: <FiTruck className="text-amber-500 w-7 h-7" />, title: 'Fast Delivery', desc: 'Reliable nationwide shipping networks' },
              { icon: <FiShield className="text-amber-500 w-7 h-7" />, title: 'Secure Payments', desc: 'Robust Stripe-powered checkouts' },
              { icon: <FiRefreshCw className="text-amber-500 w-7 h-7" />, title: 'Easy Returns', desc: 'Hassle-free 30-day return policy' },
              { icon: <FiCheckCircle className="text-amber-500 w-7 h-7" />, title: 'Verified Sellers', desc: 'Handpicked quality verification' },
            ].map(({ icon, title, desc }) => (
              <div 
                key={title} 
                className="flex flex-col items-center text-center p-4 rounded-xl transition-all hover:bg-gray-50/50"
              >
                <div className="p-3 bg-amber-50 rounded-2xl mb-4 text-amber-600">
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
                <p className="text-xs text-gray-500 max-w-[200px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;