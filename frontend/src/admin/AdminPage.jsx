import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, couponsApi, ordersApi, productsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import brandLogo from '../assets/neocart-logo.svg';
import adminAvatar from '../assets/admin-avatar.svg';

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
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, ordersRes, productsRes, categoryRes, couponRes] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        ordersApi.list(),
        productsApi.list({ page: 1, limit: 100 }),
        productsApi.categories(),
        couponsApi.list({ all: 1 }),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setCategories(categoryRes.data.data || []);
      setCouponList(couponRes.data.data || []);
    } catch {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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

  // Generate continuous last 7 days to avoid gaps in the line chart
  const chartRows = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
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
  const lastDayAmount = chartRows[chartRows.length - 1][1];
  const prevDayAmount = chartRows[chartRows.length - 2][1];
  const trendDiff = lastDayAmount - prevDayAmount;
  const trendPercent = prevDayAmount > 0 ? (trendDiff / prevDayAmount) * 100 : 0;
  const adminUser = users.find((user) => user.role === 'admin');
  const customerUsers = users.filter((user) => user.role !== 'admin');
  const recentOrders = filteredOrders.slice(0, 7);
  const customersWithPhone = customerUsers.filter((user) => String(user.phone || '').trim()).length;
  const customersWithoutPhone = customerUsers.length - customersWithPhone;

  if (loading) return <LoadingSpinner label="Loading admin panel" />;

  return (
    <div className="admin-shell relative">
      <div className="admin-layout relative z-10">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <img src={brandLogo} alt="NeoCart" className="admin-brand__logo" />
            <div>
              <p className="admin-brand__name">NeoCart</p>
              <p className="admin-brand__sub">Admin console</p>
            </div>
          </div>

          <nav className="admin-nav">
            <button type="button" className={`admin-nav-btn ${activeSection === 'dashboard' ? 'admin-nav-btn--active' : ''}`} onClick={() => setActiveSection('dashboard')}>
              <span>Dashboard</span>
            </button>
            <button type="button" className={`admin-nav-btn ${activeSection === 'customers' ? 'admin-nav-btn--active' : ''}`} onClick={() => setActiveSection('customers')}>
              <span>Customers</span>
            </button>
            <button type="button" className={`admin-nav-btn ${activeSection === 'analytics' ? 'admin-nav-btn--active' : ''}`} onClick={() => setActiveSection('analytics')}>
              <span>Analytics</span>
            </button>
            <button type="button" className={`admin-nav-btn ${activeSection === 'messages' ? 'admin-nav-btn--active' : ''}`} onClick={() => setActiveSection('messages')}>
              <span>Messages</span>
            </button>
            <button type="button" className={`admin-nav-btn ${activeSection === 'products' ? 'admin-nav-btn--active' : ''}`} onClick={() => setActiveSection('products')}>
              <span>Add product</span>
            </button>
            <button type="button" className={`admin-nav-btn ${activeSection === 'coupons' ? 'admin-nav-btn--active' : ''}`} onClick={() => setActiveSection('coupons')}>
              <span>Coupons</span>
            </button>
          </nav>

          <button type="button" className="admin-logout" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="admin-main">
          {activeSection === 'dashboard' ? (
            <>
              <section className="admin-header-card">
                <div>
                  <h1 className="admin-title">Dashboard</h1>
                  <p className="admin-subtitle">Track catalog performance and order activity in one place.</p>
                  <input
                    className="admin-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div className="admin-user-card">
                  <div>
                    <p className="admin-user-card__name">{adminUser?.name || 'Admin'}</p>
                    <p className="admin-user-card__role">Admin</p>
                  </div>
                  <img src={adminAvatar} alt="Admin profile" className="admin-user-card__avatar" />
                </div>
              </section>

              <section className="admin-dashboard-grid">
                <div className="admin-dashboard-main">
                  <div className="admin-kpi-row">
                    <article className="admin-kpi-card">
                      <p className="admin-kpi-card__label">Total Sales</p>
                      <p className="admin-kpi-card__value">LKR {Number(stats?.total_revenue || 0).toFixed(2)}</p>
                      <div className="admin-kpi-card__ring admin-kpi-card__ring--violet">{Math.min(100, Math.round(((stats?.total_orders || 0) / Math.max(1, stats?.total_products || 1)) * 100))}%</div>
                    </article>
                    <article className="admin-kpi-card">
                      <p className="admin-kpi-card__label">Items Sold</p>
                      <p className="admin-kpi-card__value">{stats?.items_sold || 0}</p>
                      <div className="admin-kpi-card__ring admin-kpi-card__ring--teal">{Math.min(100, Math.round(((stats?.items_sold || 0) / Math.max(1, stats?.items_in_stock || 1)) * 100))}%</div>
                    </article>
                    <article className="admin-kpi-card">
                      <p className="admin-kpi-card__label">Products</p>
                      <p className="admin-kpi-card__value">{stats?.total_products || 0}</p>
                      <div className="admin-kpi-card__ring admin-kpi-card__ring--blue">{Math.min(100, Math.round(((stats?.low_stock_products || 0) / Math.max(1, stats?.total_products || 1)) * 100))}%</div>
                    </article>
                  </div>

                  <section className="admin-orders-card">
                    <h2 className="text-3xl font-bold">Recent Orders</h2>
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400">
                            <th className="py-2">Product</th>
                            <th className="py-2">Order ID</th>
                            <th className="py-2">Payment</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b border-white/5">
                              <td className="py-3">{order.customer_name || 'Customer order'}</td>
                              <td className="py-3">#{order.id}</td>
                              <td className="py-3 capitalize">{order.payment_method || 'card'}</td>
                              <td className="py-3 capitalize text-fuchsia-300">{order.status || 'pending'}</td>
                              <td className="py-3">LKR {Number(order.total_amount || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <aside className="admin-dashboard-side">
                  <section className="admin-side-card">
                    <h2 className="admin-side-card__title">Recent Update</h2>
                    <div className="admin-update-list">
                      {recentOrders.slice(0, 4).map((order) => (
                        <article key={order.id} className="admin-update-item">
                          <span className="admin-update-avatar" />
                          <p>
                            <span className="font-semibold text-white">{order.customer_name || 'Customer'}</span>{' '}
                            placed order #{order.id}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="admin-side-card">
                    <h2 className="admin-side-card__title">Sales Analytics</h2>
                    <div className="space-y-3">
                      <article className="admin-analytic-chip">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Online orders</p>
                        <p className="text-2xl font-bold text-emerald-300">{stats?.total_orders || 0}</p>
                        <p className="text-sm text-slate-300">Live order count</p>
                      </article>
                      <article className="admin-analytic-chip">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">In stock items</p>
                        <p className="text-2xl font-bold text-sky-300">{stats?.items_in_stock || 0}</p>
                        <p className="text-sm text-slate-300">Total available quantity</p>
                      </article>
                    </div>
                  </section>
                </aside>
              </section>
            </>
          ) : null}

          {activeSection === 'customers' ? (
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
                            <span className="admin-customer-avatar" aria-hidden="true">
                              {String(user.name || 'U').trim().charAt(0).toUpperCase()}
                            </span>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">
                          {user.phone ? (
                            <span className="admin-phone-badge">{user.phone}</span>
                          ) : (
                            <span className="admin-phone-badge admin-phone-badge--empty">Not set</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === 'messages' ? (
            <section className="admin-panel admin-panel--messages">
              <div className="admin-panel__head">
                <h2 className="admin-panel__title">Customer Messages</h2>
                <p className="admin-panel__meta">Auto-prioritized support queue</p>
              </div>
              <div className="admin-message-grid">
                {customerUsers.slice(0, 8).map((user) => (
                  <article key={user.id} className="admin-message-card">
                    <p className="admin-message-card__name">{user.name}</p>
                    <p className="admin-message-card__email">{user.email}</p>
                    <p className="admin-message-card__tag">Customer support request open</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeSection === 'products' ? (
            <>
              <section className="admin-panel admin-panel--products">
                <div className="admin-panel__head">
                  <h2 className="admin-panel__title">Add Product</h2>
                  <p className="admin-panel__meta">Create new stock entries for your storefront</p>
                </div>
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={addProduct}>
                  <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                  <input className="input-field" placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
                  <input className="input-field" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} required />
                  <select className="input-field" value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}>
                    <option value="0">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
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
                          <td className="py-2">LKR {Number(product.price).toFixed(2)}</td>
                          <td className="py-2">{product.stock}</td>
                          <td className="py-2">
                            {Number(product.stock) <= 5 ? (
                              <span className="rounded-full border border-amber-300/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">Low stock</span>
                            ) : (
                              <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">In stock</span>
                            )}
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
          ) : null}

          {activeSection === 'coupons' ? (
            <>
              <section className="admin-panel admin-panel--products">
                <div className="admin-panel__head">
                  <h2 className="admin-panel__title">Create Coupon</h2>
                  <p className="admin-panel__meta">Add coupon codes that will appear on the website</p>
                </div>
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveCoupon}>
                  <input
                    className="input-field"
                    placeholder="Code (e.g. SAVE10)"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Title"
                    value={couponForm.title}
                    onChange={(e) => setCouponForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <select
                    className="input-field"
                    value={couponForm.type}
                    onChange={(e) => setCouponForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="percent">Percent discount</option>
                    <option value="fixed">Fixed amount</option>
                    <option value="free_delivery">Free delivery</option>
                  </select>
                  <input
                    className="input-field"
                    placeholder={couponForm.type === 'percent' ? 'Percent (e.g. 10)' : 'Amount (LKR)'}
                    type="number"
                    step="0.01"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm((prev) => ({ ...prev, value: e.target.value }))}
                    required
                  />
                  <textarea
                    className="input-field md:col-span-2"
                    rows="3"
                    placeholder="Description"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={couponForm.is_active}
                      onChange={(e) => setCouponForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    />
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
                          <td className="py-2">
                            {coupon.type === 'percent'
                              ? `${Number(coupon.value || 0).toFixed(2)}%`
                              : `LKR ${Number(coupon.value || 0).toFixed(2)}`}
                          </td>
                          <td className="py-2">
                            {coupon.is_active ? (
                              <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">Active</span>
                            ) : (
                              <span className="rounded-full border border-slate-300/30 bg-slate-500/10 px-2 py-1 text-xs text-slate-300">Inactive</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}

          {activeSection === 'analytics' ? (
            <section className="admin-panel admin-panel--analytics">
              <div className="admin-panel__head">
                <h2 className="admin-panel__title">Sales Analytics</h2>
                <p className="admin-panel__meta">Day-by-day increase and decrease trend</p>
              </div>

              <div className="admin-analytics-hero">
                <article className="admin-trend-stat">
                  <p className="admin-trend-stat__label">Latest day sales</p>
                  <p className="admin-trend-stat__value">LKR {Number(lastDayAmount || 0).toFixed(2)}</p>
                </article>
                <article className={`admin-trend-stat ${trendDiff >= 0 ? 'admin-trend-stat--up' : 'admin-trend-stat--down'}`}>
                  <p className="admin-trend-stat__label">Day-over-day change</p>
                  <p className="admin-trend-stat__value">
                    {trendDiff >= 0 ? '+' : '-'}{Math.abs(trendPercent).toFixed(1)}%
                  </p>
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
                      return (
                        <g key={date}>
                          <circle cx={x} cy={y} r="2" className={isUp ? 'admin-line-dot admin-line-dot--up' : 'admin-line-dot admin-line-dot--down'} />
                        </g>
                      );
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
                        <span className={isUp ? 'admin-chart-meta__up' : 'admin-chart-meta__down'}>
                          {isUp ? 'Up' : 'Down'}
                        </span>
                      </div>
                      <div className="admin-chart-track">
                        <div className="admin-chart-bar" style={{ width: `${Math.max(8, (amount / maxDayAmount) * 100)}%` }} />
                      </div>
                      <p className="admin-chart-value">LKR {Number(amount).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </main>
      </div>

      {editOpen ? (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit product">
          <div className="admin-modal-card">
            <div className="admin-modal-head">
              <h3>Edit product</h3>
              <button type="button" className="admin-modal-close" onClick={() => setEditOpen(false)}>
                Close
              </button>
            </div>
            <form className="admin-modal-form" onSubmit={saveEditedProduct}>
              <input className="input-field" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="input-field" placeholder="Price" type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))} required />
              <input className="input-field" placeholder="Stock" type="number" value={editForm.stock} onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))} required />
              <select className="input-field" value={editForm.category_id} onChange={(e) => setEditForm((prev) => ({ ...prev, category_id: e.target.value }))}>
                <option value="0">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input className="input-field md:col-span-2" placeholder="Image URL" value={editForm.image} onChange={(e) => setEditForm((prev) => ({ ...prev, image: e.target.value }))} />
              <textarea className="input-field md:col-span-2" rows="3" placeholder="Description" value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} />
              <div className="admin-modal-actions md:col-span-2">
                <button type="button" className="admin-action-btn" onClick={() => setEditOpen(false)}>Cancel</button>
                <button type="submit" className="admin-action-btn admin-action-btn--edit">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Delete product confirmation">
          <div className="admin-confirm-card">
            <p className="admin-confirm-card__eyebrow">Delete product</p>
            <h3>Are you sure you want to delete this item?</h3>
            <p className="admin-confirm-card__name">{deleteTarget.name}</p>
            <p className="admin-confirm-card__hint">This action cannot be undone.</p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="admin-action-btn admin-action-btn--delete" onClick={() => deleteProduct(deleteTarget.id)}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
