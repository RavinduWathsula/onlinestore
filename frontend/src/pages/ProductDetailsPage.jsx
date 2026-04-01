import { ShoppingCart, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cartApi, productsApi, reviewsApi } from '../services/api';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} star rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={`review-star-${star}`}
          size={16}
          className={star <= value ? 'fill-amber-300 text-amber-300' : 'text-slate-600'}
        />
      ))}
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([productsApi.detail(id), reviewsApi.list(id)])
      .then(([productRes, reviewRes]) => {
        if (!mounted) return;
        setProduct(productRes.data.data || null);
        setReviews(reviewRes.data.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setProduct(null);
        setReviews([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const onAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }

    try {
      await cartApi.add({ product_id: product.id, quantity: 1 });
      showToast('Item added to cart');
    } catch {
      showToast('Failed to add item', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading product details" />;
  }

  if (!product) {
    return (
      <section className="glass mx-auto max-w-3xl p-8 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p className="mt-3 text-slate-300">This item may have been removed.</p>
        <Link to="/products" className="btn-secondary mt-6">
          Back to products
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="glass grid gap-6 p-6 lg:grid-cols-[1.1fr_1fr] lg:p-8">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            className="h-full min-h-[320px] w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-300/75">{product.category_name || 'General'}</p>
          <h1 className="text-3xl font-black md:text-4xl">{product.name}</h1>
                    <div className="flex gap-6 text-sm text-slate-300">
                      {product.brand && <p><span className="font-semibold text-blue-300">Brand:</span> {product.brand}</p>}
                      {product.color && <p><span className="font-semibold text-blue-300">Color:</span> {product.color}</p>}
                    </div>
          <p className="text-slate-300">{product.description || 'No product description available.'}</p>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-3xl font-black text-blue-300">LKR {Number(product.price).toFixed(2)}</p>
            <p className={Number(product.stock) > 0 ? 'text-emerald-300' : 'text-red-300'}>
              {Number(product.stock) > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </p>
                    {product.options && Object.keys(product.options).length > 0 && (
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-semibold text-slate-100">Customization:</p>
                        {Object.entries(product.options).map(([optionType, values]) => (
                          <div key={optionType}>
                            <label className="block text-sm text-slate-300 mb-2">{optionType}</label>
                            <div className="flex flex-wrap gap-2">
                              {values.map((value) => (
                                <button
                                  key={`${optionType}-${value}`}
                                  onClick={() => setSelectedOptions((prev) => ({ ...prev, [optionType]: value }))}
                                  className={`px-3 py-2 rounded-lg border transition-colors ${
                                    selectedOptions[optionType] === value
                                      ? 'border-blue-400 bg-blue-500/20 text-blue-200'
                                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                                  }`}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={Number(product.stock) < 1}
              className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={16} /> Add to cart
            </button>
            <Link to="/products" className="btn-secondary w-full text-center">
              Continue shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="glass p-6 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Customer reviews</h2>
          {reviews.length ? (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <StarRating value={Math.round(averageRating)} />
              <span>{averageRating.toFixed(1)} / 5 ({reviews.length} reviews)</span>
            </div>
          ) : null}
        </div>

        {reviews.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">{review.user_name}</p>
                  <StarRating value={Number(review.rating || 0)} />
                </div>
                <p className="mt-3 text-slate-300">{review.comment}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-slate-300">
            No reviews yet for this item.
          </p>
        )}
      </section>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
