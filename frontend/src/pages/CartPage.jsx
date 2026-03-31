import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadCart = () => {
    setLoading(true);
    cartApi
      .list()
      .then((res) => {
        setItems(res.data.data || []);
        setSummary(res.data.summary || { total: 0, count: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const onQuantity = async (cartId, quantity) => {
    await cartApi.update({ cart_id: cartId, quantity: Number(quantity) });
    loadCart();
  };

  const onRemove = async (cartId) => {
    await cartApi.remove(cartId);
    showToast('Item removed');
    loadCart();
  };

  if (loading) return <LoadingSpinner label="Loading cart" />;

  return (
    <div className="space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Your cart</h1>
        <p className="mt-2 text-slate-400">Update quantities and proceed to checkout.</p>
      </section>
      <section className="glass p-6">
        {items.length === 0 ? (
          <p className="text-slate-400">Cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <img src={item.image || 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=200&q=80'} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-44 flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-slate-400">LKR {Number(item.price).toFixed(2)}</p>
                </div>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  defaultValue={item.quantity}
                  className="input-field w-28"
                  onBlur={(e) => onQuantity(item.id, e.target.value)}
                />
                <button type="button" className="btn-secondary" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="glass flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-slate-400">Items: {summary.count}</p>
          <h2 className="text-2xl font-bold">LKR {Number(summary.total || 0).toFixed(2)}</h2>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/checkout')} disabled={items.length === 0}>
          Proceed to checkout
        </button>
      </section>
    </div>
  );
}
