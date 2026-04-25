import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, couponsApi, ordersApi, productsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import brandLogo from '../assets/neocart-logo.svg';
import adminAvatar from '../assets/admin-avatar.svg';
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  Circle,
  Database,
  Globe,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  RefreshCcw,
  TrendingUp,
  Users,
  Warehouse,
} from 'lucide-react';

const initialForm = {
  name: '',
  price: '',
  stock: '',
  description: '',
  image: '',
  category_id: '0',
};

const initialEditForm = {
  id: 0,
  name: '',
  price: '',
  stock: '',
  description: '',
  image: '',
  category_id: '0',
};

const initialCouponForm = {
  code: '',
  title: '',
  description: '',
  type: 'percent',
  value: '',
  is_active: true,
};

function formatCurrency(value) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [couponForm, setCouponForm] = useState(initialCouponForm);
  const [couponList, setCouponList] = useState([]);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const resetToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    resetToTop();
    window.requestAnimationFrame(() => {
      resetToTop();
    });
  };

  const loadAll = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, usersRes, ordersRes, productsRes, categoryRes, couponRes, databaseRes] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        ordersApi.list(),
        productsApi.list({ page: 1, limit: 100 }),
        productsApi.categories(),
        couponsApi.list({ all: 1 }),
        adminApi.database(),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setCategories(categoryRes.data.data || []);
      setCouponList(couponRes.data.data || []);
      setDatabaseInfo(databaseRes.data.data || null);
      setLastSyncedAt(new Date().toISOString());
    } catch {
      if (!silent) {
        showToast('Failed to load admin data', 'error');
      }
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    let active = true;

    const sync = async (silent = false) => {
      if (!active) return;
      await loadAll({ silent });
    };

    sync(false);

    const intervalId = window.setInterval(() => {
      sync(true);
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    resetToTop();
  }, [activeSection]);

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await productsApi.add({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
      });
      showToast('Product added');
      setForm(initialForm);
      loadAll();
    } catch {
      showToast('Could not add product', 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productsApi.remove(id);
      showToast('Product removed');
      setDeleteTarget(null);
      loadAll();
    } catch {
      showToast('Could not delete product', 'error');
    }
  };

  const restockProduct = async (product) => {
    const qtyInput = window.prompt(`Add stock for ${product.name}`, '10');
    if (!qtyInput) return;

    const addQty = Number(qtyInput);
    if (!Number.isFinite(addQty) || addQty <= 0) {
      showToast('Enter a valid quantity', 'error');
      return;
    }

    try {
      await productsApi.update({
        id: product.id,
        category_id: Number(product.category_id || 0),
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock) + Math.floor(addQty),
        description: product.description || '',
        image: product.image || '',
      });
      showToast('Stock updated');
      loadAll();
    } catch {
      showToast('Could not restock product', 'error');
    }
  };

  const openEditProduct = (product) => {
    setEditForm({
      id: Number(product.id),
      name: product.name || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      description: product.description || '',
      image: product.image || '',
      category_id: String(product.category_id || 0),
    });
    setEditOpen(true);
  };

  const saveEditedProduct = async (e) => {
    e.preventDefault();
    const name = editForm.name.trim();
    const price = Number(editForm.price);
    const stock = Number(editForm.stock);
    if (!name) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      showToast('Enter a valid product price', 'error');
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      showToast('Enter a valid stock amount', 'error');
      return;
    }
    try {
      await productsApi.update({
        id: Number(editForm.id),
        category_id: Number(editForm.category_id || 0),
        name,
        price,
        stock: Math.floor(stock),
        description: editForm.description || '',
        image: editForm.image || '',
      });
      showToast('Product updated');
      setEditOpen(false);
      setEditForm(initialEditForm);
      loadAll();
    } catch {
      showToast('Could not update product', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      showToast('Could not logout', 'error');
    }
  };

  const saveCoupon = async (e) => {
    e.preventDefault();
    const code = couponForm.code.trim().toUpperCase();
    const title = couponForm.title.trim();
    const value = Number(couponForm.value);

    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      showToast('Coupon code must be 3-40 chars (A-Z, 0-9, _ or -)', 'error');
      return;
    }

    if (!title) {
      showToast('Coupon title is required', 'error');
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      showToast('Coupon value must be greater than 0', 'error');
      return;
    }

    if (couponForm.type === 'percent' && value > 100) {
      showToast('Percent coupon cannot exceed 100', 'error');
      return;
    }

    try {
      await couponsApi.create({
        code,
        title,
        description: couponForm.description || '',
        type: couponForm.type,
        value,
        is_active: couponForm.is_active,
      });
      showToast('Coupon saved');
      setCouponForm(initialCouponForm);
      loadAll();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Could not save coupon', 'error');
    }
  };

  const filteredOrders = selectedDate
    ? orders.filter((order) => {
        const dateValue = order.created_at || order.createdAt || order.date;
        if (!dateValue) return false;
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return false;
        return date.toISOString().slice(0, 10) === selectedDate;
      })
    : orders;

  const dailySales = filteredOrders.reduce((acc, order) => {
    const dateValue = order.created_at || order.createdAt || order.date;
    if (!dateValue) return acc;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return acc;
    const key = date.toISOString().slice(0, 10);
    const amount = Number(order.total_amount || 0);
    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {});

  const chartRows = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push([key, dailySales[key] || 0]);
    }
    return days;
  }, [dailySales]);

  const maxDayAmount = Math.max(...chartRows.map(([, amount]) => amount), 1);
  const minDayAmount = Math.min(...chartRows.map(([, amount]) => amount));
  const chartSpan = maxDayAmount - minDayAmount || 1;
  const linePoints = chartRows
    .map(([, amount], index) => {
      const x = (index / (chartRows.length - 1)) * 100;
      const normalized = (amount - minDayAmount) / chartSpan;
      const y = 88 - normalized * 64;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,94 ${linePoints} 100,94`;
  const lastDayAmount = chartRows[chartRows.length - 1]?.[1] || 0;
  const prevDayAmount = chartRows[chartRows.length - 2]?.[1] || 0;
  const trendDiff = lastDayAmount - prevDayAmount;
  const trendPercent = prevDayAmount > 0 ? (trendDiff / prevDayAmount) * 100 : 0;
  const adminUser = users.find((user) => user.role === 'admin');
  const customerUsers = users.filter((user) => user.role !== 'admin');
  const recentOrders = filteredOrders.slice(0, 7);
  const customersWithPhone = customerUsers.filter((user) => String(user.phone || '').trim()).length;
  const customersWithoutPhone = customerUsers.length - customersWithPhone;
  const totalRevenue = Number(stats?.total_revenue || 0);
  const priorRevenue = Number(stats?.yesterday_revenue || totalRevenue * 0.89 || 1);
  const salesChange = priorRevenue > 0 ? ((totalRevenue - priorRevenue) / priorRevenue) * 100 : 0;
  const customerChange = Number(stats?.customer_change_percent || 8.1);
  const conversionRate = Number(stats?.conversion_rate || 3.84);
  const coverageCount = Number(stats?.market_coverage || 142);
  const recentCustomerSignups = customerUsers.slice(0, 2);
  const latestOrders = filteredOrders.slice(0, 3);
  const liveItems = [
    latestOrders[0]
      ? {
          label: `New order #${latestOrders[0].id}`,
          meta: `${new Date(latestOrders[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${formatCurrency(latestOrders[0].total_amount)}`,
          icon: ShoppingCart,
          tone: 'blue',
          status: true,
        }
      : {
          label: 'Waiting for order activity',
          meta: 'Live feed will update when data changes',
          icon: Activity,
          tone: 'blue',
          status: true,
        },
    recentCustomerSignups[0]
      ? {
          label: `Customer ${recentCustomerSignups[0].name}`,
          meta: `Joined ${new Date(recentCustomerSignups[0].created_at).toLocaleDateString()}`,
          icon: Users,
          tone: 'purple',
        }
      : {
          label: 'Customer activity idle',
          meta: 'Waiting for new registrations',
          icon: Users,
          tone: 'purple',
        },
    latestOrders[1]
      ? {
          label: `Order #${latestOrders[1].id} ${String(latestOrders[1].status || 'pending')}`,
          meta: `${String(latestOrders[1].payment_method || 'cash_on_delivery').replaceAll('_', ' ')} • ${formatCurrency(latestOrders[1].total_amount)}`,
          icon: Circle,
          tone: 'rose',
        }
      : {
          label: 'No new fulfillment updates',
          meta: 'The feed will reflect new order states automatically',
          icon: Circle,
          tone: 'rose',
        },
    {
      label: 'Database snapshot ready',
      meta: `${databaseInfo?.table_count || 0} tables available • auto-refresh active`,
      icon: Database,
      tone: 'violet',
    },
  ];

  if (loading) return <LoadingSpinner label="Loading admin panel" />;

  const palette = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    rose: 'bg-rose-500/20 text-rose-300',
    violet: 'bg-violet-500/20 text-violet-300',
  };

  return (
    <div className="admin-executive-shell min-h-screen bg-[#131315] text-[#e4e2e4]">
      <div className="admin-executive-aurora admin-executive-aurora--one" aria-hidden="true" />
      <div className="admin-executive-aurora admin-executive-aurora--two" aria-hidden="true" />

      <aside className="admin-executive-sidebar fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950/80 py-6 backdrop-blur-[25px]">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="NeoCart" className="w-10 h-10 p-1 border rounded-full border-white/10 bg-slate-900" />
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-white">NeoCart Admin</h1>
              <p className="mt-1 text-sm text-slate-400">System Overview</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <button type="button" className={`admin-nav-btn ${activeSection === 'dashboard' ? 'admin-nav-btn--active' : ''}`} onClick={() => handleSectionChange('dashboard')}>
            <LayoutGrid size={16} />
            <span>Dashboard</span>
          </button>
          <button type="button" className={`admin-nav-btn ${activeSection === 'products' ? 'admin-nav-btn--active' : ''}`} onClick={() => handleSectionChange('products')}>
            <Warehouse size={16} />
            <span>Inventory</span>
          </button>
          <button type="button" className={`admin-nav-btn ${activeSection === 'analytics' ? 'admin-nav-btn--active' : ''}`} onClick={() => handleSectionChange('analytics')}>
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>
          <button type="button" className={`admin-nav-btn ${activeSection === 'customers' ? 'admin-nav-btn--active' : ''}`} onClick={() => handleSectionChange('customers')}>
            <Users size={16} />
            <span>Customers</span>
          </button>
          <button type="button" className={`admin-nav-btn ${activeSection === 'messages' ? 'admin-nav-btn--active' : ''}`} onClick={() => handleSectionChange('messages')}>
            <Package size={16} />
            <span>Orders</span>
          </button>
          <button type="button" className={`admin-nav-btn ${activeSection === 'coupons' ? 'admin-nav-btn--active' : ''}`} onClick={() => handleSectionChange('coupons')}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button type="button" className={`admin-nav-btn ${activeSection === 'database' ? 'admin-nav-btn--active' : ''}`} onClick={() => handleSectionChange('database')}>
            <span>Database</span>
          </button>
        </nav>

        <div className="px-4 mt-auto space-y-4">
          <button className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => handleSectionChange('dashboard')} type="button">
            Deploy Updates
          </button>
          <div className="pt-4 border-t border-white/5">
            <button type="button" className="admin-nav-btn" onClick={() => navigate('/home')}>
              <HelpCircle size={16} />
              <span>Help Center</span>
            </button>
            <button type="button" className="admin-nav-btn admin-nav-btn--logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-executive-main ml-64 min-h-screen bg-[#131315] px-8 pb-8 pt-0 lg:px-10 lg:pb-8 lg:pt-1">
        {activeSection === 'dashboard' ? (
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">Executive Dashboard</h2>
                <p className="mt-1 text-sm text-slate-400">Welcome back, Administrator. Here's what's happening today.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative hidden lg:block">
                  <Search className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-slate-500" size={16} />
                  <input className="py-3 pr-4 text-sm text-white border-none rounded-full outline-none neo-inset w-72 bg-slate-900/90 pl-11 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500" placeholder="Search parameters..." type="text" />
                </div>
                <button className="flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-slate-900 text-slate-400 hover:text-white" type="button" aria-label="Notifications">
                  <Bell size={18} />
                </button>
                <button className="flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-slate-900 text-slate-400 hover:text-white lg:hidden" type="button" aria-label="Open menu">
                  <Menu size={18} />
                </button>
                <button
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
                  type="button"
                  onClick={() => loadAll({ silent: true })}
                  aria-label="Refresh admin data"
                >
                  <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Syncing' : 'Refresh'}
                </button>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2">
                  <img src={adminAvatar} alt="Admin profile avatar" className="object-cover w-8 h-8 border rounded-full border-blue-500/50" />
                  <span className="font-medium text-white">{adminUser?.name || 'Alex Rivera'}</span>
                </div>
              </div>
            </header>

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">Live refresh active</span>
              <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1">Last sync: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'pending'}</span>
              <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1">Database: {databaseInfo?.database || 'novastore'}</span>
            </div>

            <section className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-4">
              <article className="flex flex-col justify-between p-6 transition-all duration-300 glass-card group rounded-xl hover:border-blue-500/30">
                <div className="flex items-start justify-between">
                  <div className="p-2 text-blue-400 rounded-lg bg-blue-500/10 glow-blue"><ShoppingCart size={18} /></div>
                  <span className="text-sm font-semibold text-emerald-300">{salesChange >= 0 ? '+' : '-'}{Math.abs(salesChange).toFixed(1)}%</span>
                </div>
                <div className="mt-12">
                  <p className="text-xs tracking-widest uppercase text-slate-400">Total Revenue</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">{formatCurrency(stats?.total_revenue || 0)}</h3>
                </div>
                <div className="flex items-end h-12 gap-1 mt-5">
                  {[16, 28, 36, 22, 42].map((height, index) => (
                    <div key={index} className="w-full transition-all duration-500 rounded-t-sm bg-blue-500/20 group-hover:brightness-125" style={{ height: `${height}px` }} />
                  ))}
                </div>
              </article>

              <article className="flex flex-col justify-between p-6 transition-all duration-300 glass-card group rounded-xl hover:border-purple-500/30">
                <div className="flex items-start justify-between">
                  <div className="p-2 text-purple-400 rounded-lg bg-purple-500/10 glow-purple"><Users size={18} /></div>
                  <span className="text-sm font-semibold text-emerald-300">{customerChange.toFixed(1)}%</span>
                </div>
                <div className="mt-12">
                  <p className="text-xs tracking-widest uppercase text-slate-400">Active Users</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">{customerUsers.length || 84209}</h3>
                </div>
                <div className="flex items-end h-12 gap-1 mt-5">
                  {[28, 18, 34, 46, 24].map((height, index) => (
                    <div key={index} className="w-full transition-all duration-500 rounded-t-sm bg-purple-500/20 group-hover:brightness-125" style={{ height: `${height}px` }} />
                  ))}
                </div>
              </article>

              <article className="flex flex-col justify-between p-6 transition-all duration-300 glass-card group rounded-xl hover:border-violet-400/35">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-violet-500/15 p-2 text-violet-300"><TrendingUp size={18} /></div>
                  <span className="text-sm font-semibold text-rose-300">-1.2%</span>
                </div>
                <div className="mt-12">
                  <p className="text-xs tracking-widest uppercase text-slate-400">Conversion Rate</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">{Number(conversionRate || 3.84).toFixed(2)}%</h3>
                </div>
                <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-800/80">
                  <div className="h-full rounded-full bg-violet-500 glow-purple" style={{ width: '75%' }} />
                </div>
              </article>

              <article className="flex flex-col justify-between p-6 transition-all duration-300 glass-card group rounded-xl hover:border-blue-300/35">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-blue-500/15 p-2 text-blue-300"><Globe size={18} /></div>
                  <span className="text-sm font-semibold uppercase text-blue-300">Global</span>
                </div>
                <div className="mt-12">
                  <p className="text-xs tracking-widest uppercase text-slate-400">Market Coverage</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">{coverageCount} Countries</h3>
                </div>
                <div className="flex mt-4 -space-x-2">
                  {['US', 'UK', 'DE', '+139'].map((code, index) => (
                    <div key={code} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-bold text-white ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : index === 2 ? 'bg-violet-500' : 'bg-slate-700'}`}>
                      {code}
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <section className="p-6 glass-card rounded-xl lg:col-span-2">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h4 className="text-lg font-semibold text-white">Network Performance</h4>
                  <div className="flex gap-2 text-xs font-semibold">
                    <button className="rounded-full bg-slate-800/70 px-4 py-1.5 text-slate-300 hover:text-white" type="button">Daily</button>
                    <button className="rounded-full border border-blue-500/30 bg-blue-600/20 px-4 py-1.5 text-blue-400" type="button">Weekly</button>
                    <button className="rounded-full bg-slate-800/70 px-4 py-1.5 text-slate-300 hover:text-white" type="button">Monthly</button>
                  </div>
                </div>

                <div className="relative flex items-end justify-between px-4 pb-10 border-b h-80 border-white/5">
                  {chartRows.map(([date, amount], index) => {
                    const maxBar = 72;
                    const height = Math.max(20, (amount / maxDayAmount) * maxBar);
                    const isPurple = index === 2 || index === 5;
                    return (
                      <div key={date} className="flex flex-col items-center justify-end w-full h-full gap-4">
                        <div className={`${isPurple ? 'bg-gradient-to-t from-purple-600/20 to-purple-500' : 'bg-gradient-to-t from-blue-600/20 to-blue-500'} glow-blue w-12 rounded-t-lg`} style={{ height: `${height * 3}px` }} />
                        <span className="text-xs text-slate-500">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index]}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="flex flex-col p-6 glass-card rounded-xl">
                <h4 className="mb-6 text-lg font-semibold text-white">Live Feed</h4>
                <div className="space-y-5">
                  {liveItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex gap-4 group">
                        <div className="relative flex-shrink-0">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${palette[item.tone]}`}>
                            <Icon size={16} />
                          </div>
                          {item.status ? <div className="absolute w-4 h-4 bg-green-500 border-2 rounded-full -bottom-1 -right-1 border-slate-900" /> : null}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white transition-colors group-hover:text-blue-400">{item.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="pt-6 mt-auto text-sm font-semibold text-blue-400 hover:underline" type="button">View Full Log</button>
              </section>
            </div>

            <section className="grid grid-cols-1 gap-5 mt-5 md:grid-cols-3">
              <article className="flex items-center gap-6 p-5 glass-card rounded-xl">
                <div className="relative flex items-center justify-center w-20 h-20 border-4 rounded-full border-slate-800">
                  <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(59,130,246,0.2)" strokeWidth="4" />
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" className="text-blue-500" strokeDasharray="226" strokeDashoffset="45" strokeWidth="4" />
                  </svg>
                  <span className="font-bold text-white">80%</span>
                </div>
                <div>
                  <h5 className="font-semibold text-white">CPU Load</h5>
                  <p className="mt-1 text-xs text-slate-500">Optimal Operating State</p>
                </div>
              </article>
              <article className="flex items-center gap-6 p-5 glass-card rounded-xl">
                <div className="relative flex items-center justify-center w-20 h-20 border-4 rounded-full border-slate-800">
                  <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(168,85,247,0.2)" strokeWidth="4" />
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" className="text-purple-500" strokeDasharray="226" strokeDashoffset="180" strokeWidth="4" />
                  </svg>
                  <span className="font-bold text-white">22%</span>
                </div>
                <div>
                  <h5 className="font-semibold text-white">Memory Usage</h5>
                  <p className="mt-1 text-xs text-slate-500">Low Consumption</p>
                </div>
              </article>
              <article className="flex items-center gap-6 p-5 glass-card rounded-xl">
                <div className="relative flex items-center justify-center w-20 h-20 border-4 rounded-full border-slate-800">
                  <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(221,183,255,0.2)" strokeWidth="4" />
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" className="text-violet-300" strokeDasharray="226" strokeDashoffset="20" strokeWidth="4" />
                  </svg>
                  <span className="font-bold text-white">94%</span>
                </div>
                <div>
                  <h5 className="font-semibold text-white">Uptime</h5>
                  <p className="mt-1 text-xs text-slate-500">Cluster 09 Stable</p>
                </div>
              </article>
            </section>

            <footer className="flex flex-col items-center justify-center gap-6 pt-8 mt-10 border-t border-white/5">
              <p className="text-xs tracking-widest uppercase text-slate-500">© 2024 NeoCart Ecosystem. All Rights Reserved.</p>
              <div className="flex flex-wrap justify-center gap-6">
                <button type="button" className="text-xs tracking-widest uppercase transition-colors text-slate-500 hover:text-blue-400">Terms of Service</button>
                <button type="button" className="text-xs tracking-widest uppercase transition-colors text-slate-500 hover:text-blue-400">Privacy Protocol</button>
                <button type="button" className="text-xs tracking-widest uppercase transition-colors text-slate-500 hover:text-blue-400">API Documentation</button>
                <button type="button" className="text-xs tracking-widest uppercase transition-colors text-slate-500 hover:text-blue-400">System Status</button>
              </div>
            </footer>
          </div>
        ) : activeSection === 'customers' ? (
          <section className="admin-panel admin-panel--customers">
            <div className="admin-panel__head">
              <h2 className="admin-panel__title">Customers</h2>
              <p className="admin-panel__meta">Total customers: {customerUsers.length}</p>
            </div>
            <div className="admin-customers-kpis">
              <article className="admin-customers-kpi admin-customers-kpi--total">
                <p className="admin-customers-kpi__label">Total customers</p>
                <p className="admin-customers-kpi__value">{customerUsers.length}</p>
              </article>
              <article className="admin-customers-kpi admin-customers-kpi--phone">
                <p className="admin-customers-kpi__label">With phone number</p>
                <p className="admin-customers-kpi__value">{customersWithPhone}</p>
              </article>
              <article className="admin-customers-kpi admin-customers-kpi--pending">
                <p className="admin-customers-kpi__label">Need profile update</p>
                <p className="admin-customers-kpi__value">{customersWithoutPhone}</p>
              </article>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th className="py-2">ID</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {customerUsers.map((user) => (
                    <tr key={user.id} className="admin-customer-row">
                      <td className="py-2">{user.id}</td>
                      <td className="py-2">
                        <div className="admin-customer-name">
                          <span className="admin-customer-avatar" aria-hidden="true">{String(user.name || 'U').trim().charAt(0).toUpperCase()}</span>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">{user.phone ? <span className="admin-phone-badge">{user.phone}</span> : <span className="admin-phone-badge admin-phone-badge--empty">Not set</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : activeSection === 'messages' ? (
          <section className="admin-panel admin-panel--messages">
            <div className="admin-panel__head">
              <h2 className="admin-panel__title">Orders</h2>
              <p className="admin-panel__meta">Recent order activity</p>
            </div>
            <div className="admin-message-grid">
              {recentOrders.map((order) => (
                <article key={order.id} className="admin-message-card">
                  <p className="admin-message-card__name">Order #{order.id}</p>
                  <p className="admin-message-card__email">{order.customer_name || 'Customer'}</p>
                  <p className="admin-message-card__tag">{order.payment_method || 'card'} • {order.status || 'pending'} • {formatCurrency(order.total_amount)}</p>
                </article>
              ))}
            </div>
          </section>
        ) : activeSection === 'analytics' ? (
          <section className="admin-panel admin-panel--analytics">
            <div className="admin-panel__head">
              <h2 className="admin-panel__title">Sales Analytics</h2>
              <p className="admin-panel__meta">Day-by-day increase and decrease trend</p>
            </div>
            <div className="admin-analytics-hero">
              <article className="admin-trend-stat">
                <p className="admin-trend-stat__label">Latest day sales</p>
                <p className="admin-trend-stat__value">{formatCurrency(lastDayAmount)}</p>
              </article>
              <article className={`admin-trend-stat ${trendDiff >= 0 ? 'admin-trend-stat--up' : 'admin-trend-stat--down'}`}>
                <p className="admin-trend-stat__label">Day-over-day change</p>
                <p className="admin-trend-stat__value">{trendDiff >= 0 ? '+' : '-'}{Math.abs(trendPercent).toFixed(1)}%</p>
              </article>
            </div>
            <div className="admin-line-chart-card">
              {chartRows.length === 0 ? (
                <p className="text-sm text-slate-400">No order data available yet.</p>
              ) : (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="admin-line-chart" aria-label="Day by day sales chart">
                  <line x1="0" y1="20" x2="100" y2="20" className="admin-line-grid" />
                  <line x1="0" y1="40" x2="100" y2="40" className="admin-line-grid" />
                  <line x1="0" y1="60" x2="100" y2="60" className="admin-line-grid" />
                  <line x1="0" y1="80" x2="100" y2="80" className="admin-line-grid" />
                  <polyline points={areaPoints} className="admin-line-area" />
                  <polyline points={linePoints} className="admin-line-path" />
                  {chartRows.map(([date, amount], index) => {
                    const x = (index / (chartRows.length - 1)) * 100;
                    const normalized = (amount - minDayAmount) / chartSpan;
                    const y = 88 - normalized * 64;
                    const prevAmount = index > 0 ? chartRows[index - 1][1] : amount;
                    const isUp = amount >= prevAmount;
                    return <circle key={date} cx={x} cy={y} r="2" className={isUp ? 'admin-line-dot admin-line-dot--up' : 'admin-line-dot admin-line-dot--down'} />;
                  })}
                </svg>
              )}
            </div>
            <div className="admin-chart-summary">
              {chartRows.map(([date, amount], index) => {
                const prev = index > 0 ? chartRows[index - 1][1] : amount;
                const isUp = amount >= prev;
                return (
                  <div key={date} className="admin-chart-row">
                    <div className="admin-chart-meta">
                      <span>{date}</span>
                      <span className={isUp ? 'admin-chart-meta__up' : 'admin-chart-meta__down'}>{isUp ? 'Up' : 'Down'}</span>
                    </div>
                    <div className="admin-chart-track">
                      <div className="admin-chart-bar" style={{ width: `${Math.max(8, (amount / maxDayAmount) * 100)}%` }} />
                    </div>
                    <p className="admin-chart-value">{formatCurrency(amount)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : activeSection === 'products' ? (
          <>
            <section className="admin-panel admin-panel--products">
              <div className="admin-panel__head">
                <h2 className="admin-panel__title">Add Product</h2>
                <p className="admin-panel__meta">Create new stock entries for your storefront</p>
              </div>
              <form className="grid gap-3 mt-4 md:grid-cols-2" onSubmit={addProduct}>
                <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                <input className="input-field" placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
                <input className="input-field" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} required />
                <select className="input-field" value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}>
                  <option value="0">No category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <input className="input-field md:col-span-2" placeholder="Image URL" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
                <textarea className="input-field md:col-span-2" placeholder="Description" rows="3" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                <button className="btn-primary md:col-span-2" type="submit">Add product</button>
              </form>
            </section>

            <section className="admin-panel admin-panel--products">
              <div className="admin-panel__head">
                <h2 className="admin-panel__title">Products</h2>
                <p className="admin-panel__meta">Manage prices, stock and product availability</p>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th className="py-2">ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Stock</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="py-2">{product.id}</td>
                        <td className="py-2">{product.name}</td>
                        <td className="py-2">{formatCurrency(product.price)}</td>
                        <td className="py-2">{product.stock}</td>
                        <td className="py-2">
                          {Number(product.stock) <= 5 ? <span className="px-2 py-1 text-xs border rounded-full border-amber-300/40 bg-amber-500/10 text-amber-200">Low stock</span> : <span className="px-2 py-1 text-xs border rounded-full border-emerald-300/30 bg-emerald-500/10 text-emerald-200">In stock</span>}
                        </td>
                        <td className="py-2">
                          <div className="admin-table-actions">
                            <button type="button" className="admin-action-btn admin-action-btn--restock" onClick={() => restockProduct(product)}>Restock</button>
                            <button type="button" className="admin-action-btn admin-action-btn--edit" onClick={() => openEditProduct(product)}>Edit</button>
                            <button type="button" className="admin-action-btn admin-action-btn--delete" onClick={() => setDeleteTarget(product)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : activeSection === 'coupons' ? (
          <>
            <section className="admin-panel admin-panel--products">
              <div className="admin-panel__head">
                <h2 className="admin-panel__title">Create Coupon</h2>
                <p className="admin-panel__meta">Add coupon codes that will appear on the website</p>
              </div>
              <form className="grid gap-3 mt-4 md:grid-cols-2" onSubmit={saveCoupon}>
                <input className="input-field" placeholder="Code (e.g. SAVE10)" value={couponForm.code} onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} required />
                <input className="input-field" placeholder="Title" value={couponForm.title} onChange={(e) => setCouponForm((prev) => ({ ...prev, title: e.target.value }))} required />
                <select className="input-field" value={couponForm.type} onChange={(e) => setCouponForm((prev) => ({ ...prev, type: e.target.value }))}>
                  <option value="percent">Percent discount</option>
                  <option value="fixed">Fixed amount</option>
                  <option value="free_delivery">Free delivery</option>
                </select>
                <input className="input-field" placeholder={couponForm.type === 'percent' ? 'Percent (e.g. 10)' : 'Amount (LKR)'} type="number" step="0.01" value={couponForm.value} onChange={(e) => setCouponForm((prev) => ({ ...prev, value: e.target.value }))} required />
                <textarea className="input-field md:col-span-2" rows="3" placeholder="Description" value={couponForm.description} onChange={(e) => setCouponForm((prev) => ({ ...prev, description: e.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
                  <input type="checkbox" checked={couponForm.is_active} onChange={(e) => setCouponForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
                  Active coupon
                </label>
                <button className="btn-primary md:col-span-2" type="submit">Save coupon</button>
              </form>
            </section>

            <section className="admin-panel admin-panel--products">
              <div className="admin-panel__head">
                <h2 className="admin-panel__title">Coupon List</h2>
                <p className="admin-panel__meta">Visible and scheduled coupon codes</p>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th className="py-2">Code</th>
                      <th className="py-2">Title</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Value</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponList.map((coupon) => (
                      <tr key={coupon.code}>
                        <td className="py-2 font-semibold">{coupon.code}</td>
                        <td className="py-2">{coupon.title}</td>
                        <td className="py-2 capitalize">{String(coupon.type || '').replace('_', ' ')}</td>
                        <td className="py-2">{coupon.type === 'percent' ? `${Number(coupon.value || 0).toFixed(2)}%` : formatCurrency(coupon.value)}</td>
                        <td className="py-2">{coupon.is_active ? <span className="px-2 py-1 text-xs border rounded-full border-emerald-300/30 bg-emerald-500/10 text-emerald-200">Active</span> : <span className="px-2 py-1 text-xs border rounded-full border-slate-300/30 bg-slate-500/10 text-slate-300">Inactive</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : activeSection === 'database' ? (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase mb-2 block">Database Viewer</p>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Live database snapshot</h2>
                <p className="mt-2 text-sm text-slate-400">Inspect tables, columns and recent rows directly from the admin panel.</p>
              </div>
              <button
                type="button"
                onClick={() => loadAll({ silent: true })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-500/20"
              >
                <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh snapshot
              </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="rounded-[2rem] border border-white/5 bg-slate-950/80 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Database size={20} className="text-cyan-300" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">{databaseInfo?.database || 'novastore'}</p>
                    <p className="text-2xl font-black text-white">{databaseInfo?.table_count || 0} tables</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
                  {(databaseInfo?.tables || []).map((table) => (
                    <button
                      key={table.name}
                      type="button"
                      className="w-full rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-left transition-all hover:border-cyan-500/30 hover:bg-slate-900"
                      onClick={() => setSelectedDate('')}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-white">{table.name}</p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{table.rows} rows • {table.engine || 'InnoDB'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-cyan-300">{table.size_mb} MB</p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">size</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {(databaseInfo?.tables || []).length === 0 ? <p className="text-sm text-slate-500">No tables found.</p> : null}
                </div>
              </aside>

              <div className="space-y-5">
                {(databaseInfo?.tables || []).map((table) => (
                  <article key={table.name} className="rounded-[2rem] border border-white/5 bg-slate-950/80 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase mb-2 block">Table</p>
                        <h3 className="text-2xl font-black text-white">{table.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{table.rows} rows • {table.engine || 'InnoDB'} • {table.size_mb} MB</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Columns: {table.columns.length}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Sample rows: {table.sample_rows.length}</span>
                      </div>
                    </div>

                    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900/90 text-slate-400">
                          <tr>
                            <th className="px-4 py-3">Field</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Null</th>
                            <th className="px-4 py-3">Key</th>
                            <th className="px-4 py-3">Default</th>
                            <th className="px-4 py-3">Extra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((column) => (
                            <tr key={`${table.name}-${column.field}`} className="border-t border-white/5">
                              <td className="px-4 py-3 font-semibold text-white">{column.field}</td>
                              <td className="px-4 py-3 text-slate-300">{column.type}</td>
                              <td className="px-4 py-3 text-slate-400">{column.null}</td>
                              <td className="px-4 py-3 text-slate-400">{column.key || '-'}</td>
                              <td className="px-4 py-3 text-slate-400">{column.default === null || column.default === undefined ? '-' : String(column.default)}</td>
                              <td className="px-4 py-3 text-slate-400">{column.extra || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900/90 text-slate-400">
                          <tr>
                            {table.sample_rows[0]
                              ? Object.keys(table.sample_rows[0]).map((field) => (
                                  <th key={`${table.name}-${field}`} className="px-4 py-3">{field}</th>
                                ))
                              : <th className="px-4 py-3">No sample data</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {table.sample_rows.length > 0 ? (
                            table.sample_rows.map((row, rowIndex) => (
                              <tr key={`${table.name}-row-${rowIndex}`} className="border-t border-white/5">
                                {Object.values(row).map((value, valueIndex) => (
                                  <td key={`${table.name}-row-${rowIndex}-value-${valueIndex}`} className="px-4 py-3 text-slate-300">
                                    {value === null || value === undefined || value === '' ? '-' : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr className="border-t border-white/5">
                              <td className="px-4 py-4 text-slate-500" colSpan={6}>No rows available.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Edit product">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#10131a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Edit product</h3>
              <button type="button" className="px-4 py-2 text-sm border rounded-full border-white/10 text-slate-300" onClick={() => setEditOpen(false)}>
                Close
              </button>
            </div>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={saveEditedProduct}>
              <input className="input-field" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="input-field" placeholder="Price" type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))} required />
              <input className="input-field" placeholder="Stock" type="number" value={editForm.stock} onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))} required />
              <select className="input-field" value={editForm.category_id} onChange={(e) => setEditForm((prev) => ({ ...prev, category_id: e.target.value }))}>
                <option value="0">No category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <input className="input-field md:col-span-2" placeholder="Image URL" value={editForm.image} onChange={(e) => setEditForm((prev) => ({ ...prev, image: e.target.value }))} />
              <textarea className="input-field md:col-span-2" rows="3" placeholder="Description" value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} />
              <div className="flex justify-end gap-3 pt-2 md:col-span-2">
                <button type="button" className="px-4 py-2 text-sm border rounded-xl border-white/10 text-slate-300" onClick={() => setEditOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Delete product confirmation">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#10131a] p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Delete product</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Are you sure you want to delete this item?</h3>
            <p className="mt-3 text-slate-400">{deleteTarget.name}</p>
            <p className="mt-2 text-sm text-slate-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" className="px-4 py-2 text-sm border rounded-xl border-white/10 text-slate-300" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl" onClick={() => deleteProduct(deleteTarget.id)}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
