// src/pages/Market/Market.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { Spinner } from '../../components/ui/index';
import { searchProducts } from '../../services/products';
import type { ProductWithRating } from '../../types/database';

const CATEGORIES = [
  'All','Shoes','Bags','Jewelries','Topwear','Bottomwear','Perfume','Fragrance',
  'Bodywash','Backpacks','Belts','Headwear','Innerwear','Wallets','Nails',
  'Eyewear','Ties','Gadget','Furniture','Afro','Flip',
];

const SORT_OPTIONS = [
  { label: 'Newest',        value: 'newest' },
  { label: 'Price: Low–High', value: 'price_asc' },
  { label: 'Price: High–Low', value: 'price_desc' },
  { label: 'Top Rated',    value: 'rating' },
];

const Market: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy]     = useState('newest');
  const [searchQuery, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ProductWithRating[] | null>(null);
  const [searching, setSearching] = useState(false);

  const { products, loading } = useProducts(activeCategory);

  // Sync URL param → state
  useEffect(() => {
    const cat = searchParams.get('category') ?? 'All';
    setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSearchResults(null);
    setSearch('');
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sort the display list
  const rawProducts = searchResults ?? products;
  const sorted = [...rawProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.average_rating - a.average_rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const isLoading = loading || searching;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-sm text-gray-500">
              {sorted.length} product{sorted.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </p>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white
                           focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400
                           w-48 sm:w-64"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">No products found.</p>
            <button
              onClick={() => handleCategoryChange('All')}
              className="mt-4 text-sm text-amber-600 hover:underline"
            >
              Browse all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Market;
