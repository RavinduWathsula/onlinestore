import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { Shield, Package, CreditCard, Clock, ChevronDown, Edit3, Download, Ticket, Cpu, Zap, Box, CheckCircle2 } from 'lucide-react';

function statusClass(status) {
  const map = {
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return map[String(status || '').toLowerCase()] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

function formatMoney(amount) {
  return `LKR ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
          <td style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);">${item.name}</td>
          <td style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;">${item.quantity}</td>
          <td style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">${formatMoney(item.price)}</td>
          <td style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;color:#60a5fa;">${formatMoney(Number(item.price) * Number(item.quantity))}</td>
        </tr>
      `
      )
      .join('');

    const paymentLabel = order.payment_method === 'card' ? 'Neural Card Link' : 'Physical Transfer (COD)';

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>NeoCart Manifest #${order.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { margin: 0; display: grid; place-items: center; background: #020617; color: #f8fafc; padding: 40px; }
    .container { width: 100%; max-width: 800px; background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 40px; padding: 60px; position: relative; overflow: hidden; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
    .brand { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #3b82f6; }
    .manifest-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4em; color: #64748b; margin-top: 8px; }
    .meta { display: flex; gap: 40px; margin-bottom: 60px; padding: 30px; background: rgba(255,255,255,0.02); border-radius: 24px; }
    .meta-item label { display: block; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b; margin-bottom: 8px; }
    .meta-item span { font-size: 14px; font-weight: 700; color: #f1f5f9; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 60px; }
    th { text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    td { font-size: 13px; }
    .summary { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
    .summary-item { display: flex; justify-content: space-between; width: 300px; font-size: 12px; font-weight: 700; }
    .summary-total { font-size: 32px; font-weight: 900; color: #3b82f6; margin-top: 20px; }
    .footer { margin-top: 60px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
    .footer p { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand">NeoCart</div>
        <div class="manifest-label">Transaction Manifest</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; font-weight: 900; color: #64748b;">MANIFEST_NO</div>
        <div style="font-size: 18px; font-weight: 900;">#${order.id}</div>
      </div>
    </div>
    
    <div class="meta">
      <div class="meta-item">
        <label>Operator</label>
        <span>${order.customer_name || 'NEOCART_USER'}</span>
      </div>
      <div class="meta-item">
        <label>Timestamp</label>
        <span>${new Date(order.created_at).toLocaleString()}</span>
      </div>
      <div class="meta-item">
        <label>Method</label>
        <span>${paymentLabel}</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Asset Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Val</th>
          <th style="text-align:right;">Line Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="summary">
      <div class="summary-item">
        <span style="color:#64748b;">GROSS_VALUATION</span>
        <span>${formatMoney(order.subtotal_amount ?? order.total_amount)}</span>
      </div>
      <div class="summary-item">
        <span style="color:#64748b;">PROTOCOL_REDUCTION</span>
        <span style="color:#10b981;">-${formatMoney(order.discount_amount ?? 0)}</span>
      </div>
      <div class="summary-total">
        ${formatMoney(order.total_amount)}
      </div>
    </div>

    <div class="footer">
      <p>Authorized via NeoCart Neural Network</p>
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
      showToast('Neural profile updated');
      setShowProfileEditor(false);
    } catch (error) {
      const message =
        error?.response?.data?.errors?.phone ||
        error?.response?.data?.errors?.name ||
        error?.response?.data?.message ||
        'Update failed';
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
      if (!order) return;

      const html = buildReceiptHtml(order, items);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neocart-manifest-${order.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Accessing Personal Vault..." />;

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-slate-950 p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="flex flex-wrap items-start justify-between gap-8 relative z-10">
          <div className="flex items-center gap-8">
             <div className="h-24 w-24 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-black text-white">{user?.name?.charAt(0)}</span>
             </div>
             <div>
                <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase mb-2 block">Operator Vault</span>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter">{user?.name}</h1>
                <p className="mt-3 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">ID: 0x{user?.id?.slice(0, 8)} | {user?.email}</p>
             </div>
          </div>
          <div className="flex gap-4">
             <button
               onClick={() => setShowProfileEditor((v) => !v)}
               className="h-14 px-8 rounded-2xl border border-white/5 bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-3"
             >
               <Edit3 size={16} /> Edit Profile
             </button>
             <button
               className="h-14 w-14 rounded-2xl border border-white/5 bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"
               onClick={() => setShowCoupons(!showCoupons)}
             >
               <Ticket size={20} />
             </button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
          {[
            { label: 'MANIFESTS', value: totalOrders, icon: Package, color: 'text-white' },
            { label: 'VALUATION', value: formatMoney(totalSpent), icon: CreditCard, color: 'text-blue-500' },
            { label: 'AUTHORIZED', value: completedOrders, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'IN_TRANSIT', value: processingOrders, icon: Clock, color: 'text-purple-500' }
          ].map((stat, i) => (
            <article key={i} className="rounded-3xl border border-white/5 bg-slate-900/50 p-8 hover:bg-slate-900 transition-all group">
               <div className={`mb-6 h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
               </div>
               <p className="text-[10px] font-black tracking-widest text-slate-600 uppercase mb-2">{stat.label}</p>
               <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
            </article>
          ))}
        </div>

        {showProfileEditor && (
          <form className="mt-12 rounded-[2.5rem] border border-white/10 bg-slate-900/50 p-10 animate-in fade-in slide-in-from-top-4 duration-500" onSubmit={submitProfile}>
             <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
                   <Shield size={20} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Security Credentials</h2>
             </div>
             <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Full Name</label>
                   <input className="h-14 w-full rounded-2xl border border-white/5 bg-slate-950 px-6 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Email Access (Read Only)</label>
                   <input className="h-14 w-full rounded-2xl border border-white/5 bg-slate-950 px-6 text-sm font-bold text-slate-600 outline-none" value={user?.email} readOnly />
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Neural Phone Link</label>
                   <input className="h-14 w-full rounded-2xl border border-white/5 bg-slate-950 px-6 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="md:col-span-2 space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Primary Routing Hub (Address)</label>
                   <textarea className="h-24 w-full rounded-2xl border border-white/5 bg-slate-950 p-6 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all resize-none" value={profileForm.address} onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))} />
                </div>
             </div>
             <div className="mt-10 flex gap-4">
                <button type="submit" className="btn-premium px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]" disabled={savingProfile}>
                   {savingProfile ? 'SYNCHRONIZING...' : 'SAVE CHANGES'}
                </button>
                <button type="button" className="h-14 px-8 rounded-2xl border border-white/5 bg-slate-950 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-all" onClick={() => setShowProfileEditor(false)}>
                   ABORT
                </button>
             </div>
          </form>
        )}
      </section>

      {/* Coupons Section */}
      {showCoupons && (
        <section className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 p-10 animate-in zoom-in-95 duration-500">
           <div className="flex items-center gap-6 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-xl">
                 <Ticket size={28} />
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Discounts</h2>
                 <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1">Available for Transaction Sync</p>
              </div>
           </div>
           {coupons.length === 0 ? (
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No protocol codes active in current session.</p>
           ) : (
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="rounded-2xl border border-emerald-500/20 bg-slate-950 p-6 flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-pointer">
                    <div>
                       <p className="text-xl font-black text-white tracking-tighter">{coupon.code}</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{coupon.title}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Zap size={18} />
                    </div>
                  </div>
                ))}
             </div>
           )}
        </section>
      )}

      {/* Orders Section */}
      <section className="rounded-[3rem] border border-white/5 bg-slate-950 p-12">
        <div className="flex items-end justify-between gap-8 mb-12">
           <div>
              <span className="text-[10px] font-black tracking-[0.3em] text-purple-500 uppercase mb-2 block">History Log</span>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Manifest Stream</h2>
           </div>
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-right">Latest {orders.length} syncs recorded</p>
        </div>

        {orders.length === 0 ? (
          <div className="py-24 text-center">
             <div className="mx-auto mb-8 h-20 w-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700">
                <Box size={40} />
             </div>
             <p className="text-xl font-black text-white uppercase tracking-tight">No Manifests Found</p>
             <p className="mt-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Marketplace activity required to generate history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">VALUATION</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">HUB_AUTH</th>
                  <th className="px-6 py-4">TIMESTAMP</th>
                  <th className="px-6 py-4 text-right">MANIFEST</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="group transition-all">
                    <td className="px-6 py-6 rounded-l-[1.5rem] bg-slate-900/50 border-y border-l border-white/5 text-sm font-black text-white">#{String(order.id).slice(0, 8)}</td>
                    <td className="px-6 py-6 bg-slate-900/50 border-y border-white/5 text-lg font-black text-blue-500 tracking-tight">{formatMoney(order.total_amount)}</td>
                    <td className="px-6 py-6 bg-slate-900/50 border-y border-white/5">
                      <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 bg-slate-900/50 border-y border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{String(order.payment_method || 'COD').replace('_', ' ')}</td>
                    <td className="px-6 py-6 bg-slate-900/50 border-y border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-6 rounded-r-[1.5rem] bg-slate-900/50 border-y border-r border-white/5 text-right">
                      <button
                        className="h-10 px-6 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-blue-600 hover:text-white transition-all inline-flex items-center gap-2"
                        disabled={downloadingId === order.id}
                        onClick={() => downloadReceipt(order.id)}
                      >
                        <Download size={14} /> {downloadingId === order.id ? 'DOWNLOADING...' : 'MANIFEST'}
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
