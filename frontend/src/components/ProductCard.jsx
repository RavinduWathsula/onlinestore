import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

export default function ProductCard({ product, onAdd }) {
  const image = product.image || FALLBACK_IMAGE;

  return (
    <article className="glass group overflow-hidden transition hover:-translate-y-1">
      <Link to={`/products/${product.id}`} className="block">
        <img
          src={image}
          alt={product.name}
          className="h-52 w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-widest text-blue-500/80">{product.category_name || 'General'}</p>
        <Link to={`/products/${product.id}`} className="block line-clamp-2 text-lg font-semibold text-[var(--text-primary)] hover:text-blue-500">
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-blue-500">LKR {Number(product.price).toFixed(2)}</p>
          <p className={`text-xs ${Number(product.stock) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {Number(product.stock) > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
        {typeof onAdd === 'function' ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={Number(product.stock) < 1}
              className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={16} /> Add to cart
            </button>
            <Link to={`/products/${product.id}`} className="btn-secondary w-full text-center">
              View details
            </Link>
          </div>
        ) : (
          <Link to={`/products/${product.id}`} className="btn-secondary w-full text-center">
            Explore in shop
          </Link>
        )}
      </div>
    </article>
  );
}
