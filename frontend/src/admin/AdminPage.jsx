import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, ordersApi, productsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DotsBackground3D from '../components/DotsBackground3D';

const initialForm = {
  name: '',
  price: '',
  stock: '',
  description: '',
  image: '',
  category_id: '0',
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
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [activeSection, setActiveSection] = useState('dashboard');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, ordersRes, productsRes, categoryRes] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        ordersApi.list(),
        productsApi.list({ page: 1, limit: 100 }),
        productsApi.categories(),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setCategories(categoryRes.data.data || []);
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
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsApi.remove(id);
      showToast('Product removed');
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

  const editProduct = async (product) => {
    const name = window.prompt('Product name', product.name);
    if (!name) return;

    const priceInput = window.prompt('Product price', String(product.price));
    if (!priceInput) return;

    const stockInput = window.prompt('Product stock', String(product.stock));
    if (!stockInput) return;

    try {
      await productsApi.update({
        id: product.id,
        category_id: Number(product.category_id || 0),
        name,
        price: Number(priceInput),
        stock: Number(stockInput),
        description: product.description || '',
        image: product.image || '',
      });
      showToast('Product updated');
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

  const dailySales = orders.reduce((acc, order) => {
    const dateValue = order.created_at || order.createdAt || order.date;
    if (!dateValue) return acc;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return acc;

    const key = date.toISOString().slice(0, 10);
    const amount = Number(order.total_amount || 0);
    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {});

  const chartRows = Object.entries(dailySales)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);
  const maxDayAmount = chartRows.reduce((max, [, amount]) => Math.max(max, amount), 1);
  const adminUser = users.find((user) => user.role === 'admin');
  const customerUsers = users.filter((user) => user.role !== 'admin');
  const recentOrders = orders.slice(0, 7);

  if (loading) return <LoadingSpinner label="Loading admin panel" />;

  return (
    <div className="admin-shell relative">
      <DotsBackground3D />
      <div className="admin-layout relative z-10">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="admin-brand__logo">N</span>
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
                  <input className="admin-date" type="date" />
                </div>
                <div className="admin-user-card">
                  <p className="admin-user-card__name">{adminUser?.name || 'Admin'}</p>
                  <p className="admin-user-card__role">Admin</p>
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
            <section className="glass p-6">
              <h2 className="text-xl font-bold">Customers</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-2">ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5">
                        <td className="py-2">{user.id}</td>
                        <td className="py-2">{user.name}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">{user.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === 'messages' ? (
            <section className="glass p-6">
              <h2 className="text-xl font-bold">Customer messages</h2>
              <p className="mt-2 text-sm text-slate-400">This panel highlights active customers for follow-up.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {customerUsers.slice(0, 8).map((user) => (
                  <article key={user.id} className="admin-message-card">
                    <p className="font-semibold text-slate-100">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-sky-200">Customer support request open</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeSection === 'products' ? (
            <>
              <section className="glass p-6">
                <h2 className="text-xl font-bold">Add product</h2>
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

              <section className="glass p-6">
                <h2 className="text-xl font-bold">Products</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
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
                        <tr key={product.id} className="border-b border-white/5">
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
                            <div className="flex gap-2">
                              <button type="button" className="rounded-xl border border-emerald-300/30 px-3 py-1 text-emerald-200" onClick={() => restockProduct(product)}>Restock</button>
                              <button type="button" className="rounded-xl border border-blue-300/30 px-3 py-1 text-blue-200" onClick={() => editProduct(product)}>Edit</button>
                              <button type="button" className="rounded-xl border border-red-300/30 px-3 py-1 text-red-200" onClick={() => deleteProduct(product.id)}>Delete</button>
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

          {activeSection === 'analytics' ? (
            <section className="glass p-6">
              <h2 className="text-xl font-bold">Day-by-day sales analysis</h2>
              <div className="mt-4 space-y-3">
                {chartRows.length === 0 ? (
                  <p className="text-sm text-slate-400">No order data available yet.</p>
                ) : (
                  chartRows.map(([date, amount]) => (
                    <div key={date} className="admin-chart-row">
                      <div className="admin-chart-meta">
                        <span>{date}</span>
                        <span>LKR {Number(amount).toFixed(2)}</span>
                      </div>
                      <div className="admin-chart-track">
                        <div className="admin-chart-bar" style={{ width: `${Math.max(8, (amount / maxDayAmount) * 100)}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
