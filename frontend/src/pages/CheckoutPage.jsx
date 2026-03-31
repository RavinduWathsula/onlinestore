import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const placeOrder = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.checkout();
      showToast(`Order #${res.data.order_id} created`);
      navigate('/dashboard');
    } catch {
      showToast('Checkout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl glass p-6">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-slate-300">Confirm your order to complete purchase.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold">Payment method</h2>
        <p className="mt-1 text-sm text-slate-400">Cash on delivery (default for demo).</p>
      </div>
      <button type="button" className="btn-primary mt-6 w-full" disabled={loading} onClick={placeOrder}>
        {loading ? 'Placing order...' : 'Place order'}
      </button>
    </div>
  );
}
