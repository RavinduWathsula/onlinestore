import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthBackground3D from '../components/AuthBackground3D';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(form);
      showToast('Welcome back');
      navigate('/dashboard');
    } catch (error) {
      const response = error?.response?.data;
      setErrors(response?.errors || { form: response?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <AuthBackground3D />
      <div className="auth-grid">
        <aside className="auth-feature-panel">
          <p className="auth-eyebrow">NeoCart Access</p>
          <h1 className="auth-title">Sign in to continue your shopping journey.</h1>
          <p className="auth-subtitle">
            Fast checkout, saved carts, and personalized picks all in one secure account.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-chip">
              <p className="text-sm font-semibold text-blue-100">One-tap reorder</p>
              <p className="text-xs text-blue-100/70">Repeat previous purchases instantly.</p>
            </div>
            <div className="auth-feature-chip">
              <p className="text-sm font-semibold text-blue-100">Live order tracking</p>
              <p className="text-xs text-blue-100/70">Real-time delivery updates to your dashboard.</p>
            </div>
            <div className="auth-feature-chip">
              <p className="text-sm font-semibold text-blue-100">Secure wallet support</p>
              <p className="text-xs text-blue-100/70">Protected payments and account verification.</p>
            </div>
          </div>
        </aside>

        <div className="auth-form-panel">
          <p className="auth-eyebrow">Welcome Back</p>
          <h2 className="text-3xl font-bold">Login</h2>
          <p className="mt-2 text-slate-300">Access your NeoCart account.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
            </div>
            {errors.form && <p className="text-sm text-red-300">{errors.form}</p>}
            <button disabled={loading} className="btn-primary w-full" type="submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-300">
            New user?{' '}
            <Link to="/register" className="text-blue-300 hover:text-blue-200">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
