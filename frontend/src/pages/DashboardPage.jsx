import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .list()
      .then((res) => setOrders(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Customer dashboard</h1>
        <p className="mt-2 text-slate-300">Manage your account and order history.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Name</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Email</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Role</p>
            <p className="font-semibold capitalize">{user?.role}</p>
          </div>
        </div>
      </section>

      <section className="glass p-6">
        <h2 className="text-xl font-bold">Recent orders</h2>
        {loading ? (
          <div className="mt-4"><LoadingSpinner label="Loading orders" /></div>
        ) : orders.length === 0 ? (
          <p className="mt-3 text-slate-400">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5">
                    <td className="py-3">#{order.id}</td>
                    <td className="py-3">LKR {Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-3 capitalize">{order.status}</td>
                    <td className="py-3">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
