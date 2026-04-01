import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthBackground3D from '../components/AuthBackground3D';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(form);
      showToast('Admin login successful');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <AuthBackground3D />
      <div className="auth-grid auth-grid--single">
        <div className="auth-form-panel auth-form-panel--login">
          <p className="auth-eyebrow">Restricted Access</p>
          <h2 className="text-3xl font-bold">Admin Login</h2>
          <p className="mt-2 text-slate-300">Only authorized admin credentials can access this panel.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Admin Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="admin@neocart.lk"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Enter admin password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Open Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
