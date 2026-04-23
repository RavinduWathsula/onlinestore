import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await register(form);
      showToast('Account created. Please login to continue.');
      navigate('/login');
    } catch (error) {
      const response = error?.response?.data;
      setErrors(response?.errors || { form: response?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-grid auth-grid--single">
        <div className="auth-form-panel auth-form-panel--register">
          <p className="auth-eyebrow">Start Shopping</p>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Register</h2>
          <p className="mt-2 text-[var(--text-secondary)]">Create your account to start shopping.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} autoComplete="off">
            <div>
              <label className="mb-1 block text-sm text-[var(--text-secondary)]">Full name</label>
              <input
                className="input-field"
                type="text"
                autoComplete="off"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <p className="mt-1 text-sm text-red-300">{errors.name}</p>}
            </div>
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
                placeholder="Choose a strong password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
            </div>
            <div className="auth-meta-row">
              <p className="text-xs text-slate-400">Use at least 8 characters with letters and numbers.</p>
            </div>
            {errors.form && <p className="text-sm text-red-300">{errors.form}</p>}
            <button disabled={loading} className="btn-primary w-full" type="submit">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div className="auth-helper-grid">
            <div className="auth-helper-chip">
              <strong>Member-only drops</strong>
              <span>Get first access to weekly releases.</span>
            </div>
            <div className="auth-helper-chip">
              <strong>Smart recommendations</strong>
              <span>Products tailored to your interests.</span>
            </div>
          </div>
          <p className="mt-5 text-sm text-[var(--text-secondary)]">
            Already registered?{' '}
            <Link to="/login" className="text-blue-300 hover:text-blue-200">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
