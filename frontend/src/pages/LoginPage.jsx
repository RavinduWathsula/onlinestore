import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Scroll to top when page loads
  const [scrolled] = useState(() => {
    window.scrollTo(0, 0);
    return true;
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await login(form);
      const nextUser = res?.data?.user;
      showToast('Welcome back');
      navigate(nextUser?.role === 'admin' ? '/admin' : '/home');
    } catch (error) {
      const response = error?.response?.data;
      setErrors(response?.errors || { form: response?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-grid auth-grid--single">
        <div className="auth-form-panel auth-form-panel--login">
          <p className="auth-eyebrow">NeoCart Access</p>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Login</h2>
          <p className="mt-2 text-[var(--text-secondary)]">Access your NeoCart account.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} autoComplete="off">
            <div>
              <label className="mb-1 block text-sm text-[var(--text-secondary)]">Email</label>
              <input
                className="input-field"
                type="email"
                autoComplete="off"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--text-secondary)]">Password</label>
              <input
                className="input-field"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
            </div>
            <div className="auth-meta-row">
              <label className="auth-meta-check">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/register" className="auth-meta-link">
                Need an account?
              </Link>
            </div>
            {errors.form && <p className="text-sm text-red-300">{errors.form}</p>}
            <button disabled={loading} className="btn-primary w-full" type="submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="auth-helper-grid">
            <div className="auth-helper-chip">
              <strong>Fast checkout</strong>
              <span>Saved details and quick payments.</span>
            </div>
            <div className="auth-helper-chip">
              <strong>Live order updates</strong>
              <span>Track all your orders in one place.</span>
            </div>
          </div>
          <p className="mt-5 text-sm text-[var(--text-secondary)]">
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
