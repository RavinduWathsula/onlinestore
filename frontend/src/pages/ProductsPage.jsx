import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { cartApi, productsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthModal from '../components/AuthModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('0');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1 });
  const [modalOpen, setModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const params = useMemo(() => ({ search, category, sort, page, limit: 8 }), [search, category, sort, page]);

  useEffect(() => {
    setLoading(true);
    Promise.all([productsApi.list(params), productsApi.categories()])
      .then(([productRes, categoryRes]) => {
        setProducts(productRes.data.data || []);
        setMeta(productRes.data.pagination || { pages: 1 });
        setCategories(categoryRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [params]);

  const onAddToCart = async (product) => {
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

  return (
    <div className="space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">All products</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Browse products with search, filters and sorting.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <input className="input-field" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="0">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select className="input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="price_low">Price low to high</option>
            <option value="price_high">Price high to low</option>
            <option value="name">Name</option>
          </select>
          <button className="btn-secondary" type="button" onClick={() => setPage(1)}>
            Apply
          </button>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner label="Loading products" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button className="btn-secondary" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span className="text-sm text-[var(--text-secondary)]">
              Page {page} / {meta.pages || 1}
            </span>
            <button className="btn-secondary" type="button" disabled={page >= (meta.pages || 1)} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
