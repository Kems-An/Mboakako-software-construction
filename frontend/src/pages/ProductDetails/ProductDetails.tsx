// src/pages/ProductDetails/ProductDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getProductReviews } from '../../services/reviews';
import { supabase } from '../../services/supabase';
import type { ReviewWithUser } from '../../services/reviews';
import { formatPrice, formatDate } from '../../utils/helpers';
import { StarRating, Spinner } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';

const ProductDetails: React.FC = () => {
  const { id }         = useParams<{ id: string }>();
  const { product, loading } = useProduct(id);
  const { addToCart }  = useCart();
  const { user }       = useAuth();
  const navigate       = useNavigate();

  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [adding, setAdding]   = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductReviews(id).then(setReviews).catch(console.error);

    // Track view activity
    if (user) {
      (supabase.from('user_activity') as any).insert({
        user_id: user.id, 
        product_id: id,
        event_type: 'view',
      }).then(() => {});
    }
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!product) return;
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-4">Product not found.</p>
          <Link to="/market" className="text-amber-600 hover:underline">Back to Market</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link to="/market" className="hover:text-gray-700">Market</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
            {imgError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <svg className="h-20 w-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <span className="text-sm text-amber-600 font-semibold uppercase tracking-wide">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-3">
              <StarRating rating={product.average_rating} size="md" />
              <span className="text-sm text-gray-500">
                {product.average_rating.toFixed(1)} · {product.review_count} review{product.review_count !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</p>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full font-medium ${
                product.stock > 10 ? 'bg-green-50 text-green-700' :
                product.stock > 0  ? 'bg-amber-50 text-amber-700' :
                                     'bg-red-50 text-red-700'
              }`}>
                {product.stock > 10 ? 'In Stock' :
                 product.stock > 0  ? `Only ${product.stock} left` :
                                      'Out of Stock'}
              </span>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                onClick={handleAddToCart}
                loading={adding}
                disabled={product.stock === 0}
                size="lg"
                className="flex-1"
              >
                Add to Cart
              </Button>

              {user && (
                <Link
                  to={`/products/${product.id}/review`}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium
                             text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Write Review
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Customer Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-700">
                          {review.profiles?.username?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.profiles?.username ?? 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProductDetails;
