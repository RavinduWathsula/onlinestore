import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAdd }) {
  const image =
    product.image ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

  return (
    <article className="glass group overflow-hidden transition hover:-translate-y-1">
      <img src={image} alt={product.name} className="h-52 w-full object-cover" />
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-widest text-blue-200/80">{product.category_name || 'General'}</p>
        <h3 className="line-clamp-2 text-lg font-semibold">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-blue-300">LKR {Number(product.price).toFixed(2)}</p>
          <p className={`text-xs ${Number(product.stock) > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            {Number(product.stock) > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
        {typeof onAdd === 'function' ? (
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={Number(product.stock) < 1}
            className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart size={16} /> Add to cart
          </button>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm text-slate-300">
            Explore in shop
          </div>
        )}
      </div>
    </article>
  );
}
