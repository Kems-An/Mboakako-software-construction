// src/pages/Review/LeaveReview.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createReview, hasUserReviewed } from '../../services/reviews';
import { useProduct } from '../../hooks/useProducts';
import { Button } from '../../components/ui/Button';

const LeaveReview: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { product } = useProduct(id);

  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) { navigate('/login'); return; }
    if (rating === 0) { setError('Please select a rating.'); return; }

    setLoading(true);
    setError('');

    const alreadyReviewed = await hasUserReviewed(user.id, id);
    if (alreadyReviewed) {
      setError('You have already reviewed this product.');
      setLoading(false);
      return;
    }

    try {
      await createReview(user.id, id, rating, comment);
      navigate(`/product/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Link
            to={`/product/${id}`}
            className="text-sm text-amber-600 hover:underline flex items-center gap-1 mb-6"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Product
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h1>
          {product && (
            <p className="text-sm text-gray-500 mb-6">for <span className="font-medium text-gray-700">{product.title}</span></p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`h-8 w-8 transition-colors ${
                        star <= (hovered || rating) ? 'text-amber-400' : 'text-gray-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product…"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900
                           placeholder-gray-400 focus:border-amber-400 focus:outline-none
                           focus:ring-2 focus:ring-amber-200 resize-none"
                required
              />
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Submit Review
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LeaveReview;
