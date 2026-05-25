// src/components/product/ProductCard.tsx
// Reusable product card used on Home, Market, and Admin pages

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProductWithRating } from '../../types/database';
import { formatPrice } from '../../utils/helpers';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StarRating, PlaceholderImage } from '../ui/index';

interface ProductCardProps {
  product: ProductWithRating;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // don't navigate
    if (!user) return;
    setAdding(true);
    try {
      await addToCart(product.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imgError ? (
          <PlaceholderImage className="w-full h-full" />
        ) : (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Out of Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <span className="text-xs text-amber-600 font-medium uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {product.title}
        </h3>

        <div className="flex items-center gap-1.5 mt-auto">
          <StarRating rating={product.average_rating} size="sm" />
          <span className="text-xs text-gray-400">({product.review_count})</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>

          {user && (
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-150"
              title="Add to cart"
            >
              {adding ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
