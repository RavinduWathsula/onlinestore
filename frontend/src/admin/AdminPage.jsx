import { useEffect, useState } from 'react';
import { adminApi, ordersApi, productsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const initialForm = {
  name: '',
  price: '',
  stock: '',
  description: '',
  image: '',
  category_id: '0',
};

export default function AdminPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);

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
    await productsApi.remove(id);
    showToast('Product removed');
    loadAll();
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

  if (loading) return <LoadingSpinner label="Loading admin panel" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="glass h-fit p-4">
        <h1 className="text-xl font-bold">Admin panel</h1>
        <p className="mt-2 text-sm text-slate-400">Manage users, products and orders.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li>Total users: {stats?.total_users || 0}</li>
          <li>Total products: {stats?.total_products || 0}</li>
          <li>Total orders: {stats?.total_orders || 0}</li>
          <li>Revenue: LKR {Number(stats?.total_revenue || 0).toFixed(2)}</li>
        </ul>
      </aside>

      <div className="space-y-6">
        <section className="glass p-6">
          <h2 className="text-xl font-bold">Add product</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={addProduct}>
            <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <input className="input-field" placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
            <input className="input-field" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} required />
            <select className="input-field" value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}>
              <option value="0">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
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
                      <div className="flex gap-2">
                        <button type="button" className="rounded-xl border border-blue-300/30 px-3 py-1 text-blue-200" onClick={() => editProduct(product)}>
                          Edit
                        </button>
                        <button type="button" className="rounded-xl border border-red-300/30 px-3 py-1 text-red-200" onClick={() => deleteProduct(product.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass p-6">
          <h2 className="text-xl font-bold">Users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="py-2">{user.id}</td>
                    <td className="py-2">{user.name}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2 capitalize">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass p-6">
          <h2 className="text-xl font-bold">Orders</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5">
                    <td className="py-2">#{order.id}</td>
                    <td className="py-2">{order.customer_name || '-'}</td>
                    <td className="py-2">LKR {Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-2 capitalize">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
