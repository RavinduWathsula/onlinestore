import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DotsBackground3D from '../components/DotsBackground3D';
import { useToast } from '../context/ToastContext';

function statusClass(status) {
  const map = {
    delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    shipped: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    processing: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    pending: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
    cancelled: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  };
  return map[String(status || '').toLowerCase()] || 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30';
}

function formatMoney(amount) {
  return `LKR ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardPage() {
  const { user, coupons, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
  }, [user]);

  useEffect(() => {
    ordersApi
      .list()
      .then((res) => setOrders(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const completedOrders = orders.filter((order) =>
    ['delivered', 'shipped'].includes(String(order.status || '').toLowerCase())
  ).length;
  const processingOrders = orders.filter((order) =>
    ['pending', 'processing'].includes(String(order.status || '').toLowerCase())
  ).length;

  const buildReceiptHtml = (order, items) => {
    const rows = (items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #dbe4ff;">${item.name}</td>
          <td style="padding:10px;border-bottom:1px solid #dbe4ff;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #dbe4ff;text-align:right;">${formatMoney(item.price)}</td>
          <td style="padding:10px;border-bottom:1px solid #dbe4ff;text-align:right;">${formatMoney(Number(item.price) * Number(item.quantity))}</td>
        </tr>
      `
      )
      .join('');

    const paymentLabel = order.payment_method === 'card' ? 'Card Payment' : 'Cash on Delivery';

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>NeoCart Receipt #${order.id}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; min-height: 100vh; margin: 0; display: grid; place-items: center; background: radial-gradient(circle at 20% 15%, #3047a4 0%, #141d45 36%, #080b1f 78%, #05070f 100%); color: #e2e8f0; padding: 24px; }
    .stage { width: 100%; max-width: 1024px; }
    .paper { width: 100%; background: linear-gradient(160deg, rgba(18,28,62,0.98), rgba(10,15,38,0.98)); border: 1px solid rgba(147, 197, 253, 0.35); border-radius: 28px; padding: 30px; box-shadow: 0 24px 70px rgba(7, 11, 33, 0.65), inset 0 1px 0 rgba(255,255,255,0.18); position: relative; overflow: hidden; }
    .paper:before { content: ''; position: absolute; inset: -80px auto auto -60px; width: 280px; height: 280px; background: radial-gradient(circle, rgba(96,165,250,0.35), transparent 72%); pointer-events: none; }
    .paper:after { content: ''; position: absolute; inset: auto -80px -90px auto; width: 320px; height: 320px; background: radial-gradient(circle, rgba(167,139,250,0.25), transparent 72%); pointer-events: none; }
    .brand { position: relative; font-size: 30px; font-weight: 800; margin: 0; color: #dbeafe; letter-spacing: 0.6px; }
    .meta { position: relative; display:flex; justify-content: space-between; gap:20px; margin-top: 14px; }
    .meta p { margin: 8px 0; color: #cbd5e1; }
    .customer { position: relative; margin-top: 14px; border: 1px solid rgba(148,163,184,0.28); border-radius: 14px; padding: 12px 14px; background: rgba(15,23,42,0.38); }
    .customer p { margin: 6px 0; font-size: 13px; color: #cbd5e1; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    .totals { margin-top: 16px; text-align: right; font-weight: 800; font-size: 22px; color: #bfdbfe; }
    th { color: #cbd5e1; }
    td { color: #e2e8f0; }
    .note { margin-top: 12px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="stage">
  <div class="paper">
    <h1 class="brand">NeoCart Premium Receipt</h1>
    <div class="meta">
      <div>
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
      </div>
      <div>
        <p><strong>Payment:</strong> ${paymentLabel}</p>
        ${order.coupon_code ? `<p><strong>Coupon:</strong> ${order.coupon_code}</p>` : ''}
      </div>
    </div>
    <div class="customer">
      <p><strong>Customer:</strong> ${order.customer_name || 'Customer'}</p>
      <p><strong>Phone:</strong> ${order.customer_phone || 'Not provided'}</p>
      <p><strong>Address:</strong> ${order.customer_address || 'Not provided'}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #bfdbfe;">Item</th>
          <th style="text-align:center;padding:10px;border-bottom:2px solid #bfdbfe;">Qty</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #bfdbfe;">Unit Price</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #bfdbfe;">Line Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:12px;text-align:right;color:#bfdbfe;">Subtotal: ${formatMoney(order.subtotal_amount ?? order.total_amount)}</p>
    <p style="margin-top:6px;text-align:right;color:#86efac;">Discount: -${formatMoney(order.discount_amount ?? 0)}</p>
    <p class="totals">Total Paid: ${formatMoney(order.total_amount)}</p>
    <p class="note">Thanks for your order. This receipt was generated by NeoCart.</p>
  </div>
  </div>
</body>
</html>`;
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
      });
      showToast('Profile updated successfully');
      setShowProfileEditor(false);
    } catch (error) {
      const message =
        error?.response?.data?.errors?.phone ||
        error?.response?.data?.errors?.name ||
        error?.response?.data?.message ||
        'Profile update failed';
      showToast(message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const downloadReceipt = async (orderId) => {
    setDownloadingId(orderId);
    try {
      const res = await ordersApi.receipt(orderId);
      const data = res.data?.data || {};
      const order = data.order;
      const items = data.items || [];
      if (!order) {
        return;
      }

      const html = buildReceiptHtml(order, items);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neocart-receipt-${order.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="relative space-y-6 overflow-hidden rounded-3xl p-2">
      <DotsBackground3D />
      <section className="glass p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/70">Account Overview</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Welcome, {user?.name}</h1>
            <p className="mt-2 text-slate-300">Track your purchases, order status, and account activity in one place.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs text-slate-400">Member email</p>
            <p className="font-semibold">{user?.email}</p>
            <p className="mt-1 text-xs capitalize text-slate-400">Role: {user?.role}</p>
            <button
              type="button"
              className="btn-secondary mt-3 px-3 py-2 text-xs hover:border-cyan-400/60 hover:from-cyan-500/30 hover:to-blue-500/30"
              onClick={() => setShowProfileEditor((value) => !value)}
            >
              {showProfileEditor ? 'Hide Profile Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="dashboard-stat-card">
            <p className="text-xs text-slate-400">Total Orders</p>
            <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="text-xs text-slate-400">Total Spent</p>
            <p className="mt-2 text-2xl font-bold text-blue-300">{formatMoney(totalSpent)}</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="text-xs text-slate-400">Completed Orders</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{completedOrders}</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="text-xs text-slate-400">In Progress</p>
            <p className="mt-2 text-2xl font-bold text-amber-300">{processingOrders}</p>
          </article>
        </div>

        {showProfileEditor ? (
          <form className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4" onSubmit={submitProfile}>
            <h2 className="text-lg font-semibold">Profile Settings</h2>
            <p className="mt-1 text-sm text-slate-400">Update your customer profile. Email is fixed and cannot be changed.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-300">
                Name
                <input
                  className="input-field mt-1"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label className="text-sm text-slate-300">
                Email (read only)
                <input className="input-field mt-1 opacity-70" value={user?.email || ''} readOnly />
              </label>
              <label className="text-sm text-slate-300">
                Phone
                <input
                  className="input-field mt-1"
                  placeholder="07XXXXXXXX"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>
              <label className="text-sm text-slate-300 md:col-span-2">
                Address
                <textarea
                  className="input-field mt-1 min-h-[88px]"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowProfileEditor(false)}
                disabled={savingProfile}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="glass p-6 md:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Recent Orders</h2>
            <p className="mt-1 text-sm text-slate-400">Latest purchases and delivery progress.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => setShowCoupons((value) => !value)}>
            {showCoupons ? 'Hide coupons' : 'Coupons'}
          </button>
        </div>

        {showCoupons ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4">
            <h3 className="text-lg font-semibold">Collected coupons</h3>
            {coupons.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No coupons collected yet. Go to Home and collect coupons.</p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="rounded-xl border border-emerald-300/50 bg-emerald-500/15 p-3 hover:bg-emerald-500/25 hover:border-emerald-300/70 transition-all hover:scale-105 cursor-pointer">
                    <p className="text-sm font-semibold text-emerald-300">{coupon.code}</p>
                    <p className="text-sm text-slate-200">{coupon.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6">
            <LoadingSpinner label="Loading orders" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
            <p className="text-slate-300">No orders yet.</p>
            <p className="mt-1 text-sm text-slate-400">Place your first order to start tracking it here.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Payment</th>
                  <th className="py-3">Date</th>
                  <th className="py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 text-slate-200">
                    <td className="py-3 pr-4 font-medium">#{order.id}</td>
                    <td className="py-3 pr-4 font-semibold text-blue-300">{formatMoney(order.total_amount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 capitalize text-slate-300">{String(order.payment_method || 'cash_on_delivery').replaceAll('_', ' ')}</td>
                    <td className="py-3 text-slate-300">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="btn-secondary px-3 py-2 text-xs"
                        disabled={downloadingId === order.id}
                        onClick={() => downloadReceipt(order.id)}
                      >
                        {downloadingId === order.id ? 'Downloading...' : 'Download receipt'}
                      </button>
                    </td>
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
