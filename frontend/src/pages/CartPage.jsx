import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DotsBackground3D from '../components/DotsBackground3D';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.list();
      setItems(res.data.data || []);
      setSummary(res.data.summary || { total: 0, count: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const onQuantity = async (item, nextQty) => {
    const quantity = Number(nextQty);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > Number(item.stock || 1)) {
      showToast('Quantity is out of stock range', 'error');
      return;
    }

    setUpdatingId(item.id);
    try {
      await cartApi.update({ cart_id: item.id, quantity });
      await loadCart();
    } catch {
      showToast('Could not update quantity', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const onRemove = async (cartId) => {
    setUpdatingId(cartId);
    try {
      await cartApi.remove(cartId);
      showToast('Item removed');
      await loadCart();
    } catch {
      showToast('Could not remove item', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading cart" />;

  return (
    <div className="relative space-y-6 overflow-hidden rounded-3xl p-2">
      <DotsBackground3D />
      <section className="glass p-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Your Cart</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Increase or decrease quantity and see totals update automatically.</p>
      </section>
      <section className="glass p-6">
        {items.length === 0 ? (
          <p className="text-[var(--text-secondary)]">Cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.id} className="cart-item-card">
                <div className="flex flex-wrap items-center gap-4">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="min-w-44 flex-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Unit price: LKR {Number(item.price).toFixed(2)}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">In stock: {item.stock}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary h-11 w-11 p-0"
                      disabled={updatingId === item.id || Number(item.quantity) <= 1}
                      onClick={() => onQuantity(item, Number(item.quantity) - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      className="input-field h-11 w-24 text-center"
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setItems((prev) =>
                          prev.map((current) =>
                            current.id === item.id ? { ...current, quantity: Number.isNaN(next) ? 1 : next } : current
                          )
                        );
                      }}
                      onBlur={(e) => onQuantity(item, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-secondary h-11 w-11 p-0"
                      disabled={updatingId === item.id || Number(item.quantity) >= Number(item.stock)}
                      onClick={() => onQuantity(item, Number(item.quantity) + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="min-w-32 text-right">
                    <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Line total</p>
                    <p className="text-xl font-bold text-blue-500">LKR {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={updatingId === item.id}
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="cart-summary-total flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Items: {summary.count}</p>
          <h2 className="text-3xl font-bold text-blue-500">LKR {Number(summary.total || 0).toFixed(2)}</h2>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/checkout')} disabled={items.length === 0}>
          Proceed to checkout
        </button>
      </section>
    </div>
  );
}
