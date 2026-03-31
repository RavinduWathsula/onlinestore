import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthBackground3D from '../components/AuthBackground3D';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      showToast('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      const response = error?.response?.data;
      setErrors(response?.errors || { form: response?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <AuthBackground3D />
      <div className="auth-grid">
        <aside className="auth-feature-panel auth-feature-panel--register">
          <p className="auth-eyebrow">New on NeoCart</p>
          <h1 className="auth-title">Create your account and unlock member-only drops.</h1>
          <p className="auth-subtitle">
            Save favorites, track every order, and get tailored offers built around your style.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-chip">
              <p className="text-sm font-semibold text-blue-100">Smart recommendations</p>
              <p className="text-xs text-blue-100/70">Personalized picks based on your activity.</p>
            </div>
            <div className="auth-feature-chip">
              <p className="text-sm font-semibold text-blue-100">Deal alerts</p>
              <p className="text-xs text-blue-100/70">Be first to know when flash sales go live.</p>
            </div>
            <div className="auth-feature-chip">
              <p className="text-sm font-semibold text-blue-100">Faster checkout</p>
              <p className="text-xs text-blue-100/70">Auto-filled details for quick purchases.</p>
            </div>
          </div>
        </aside>

        <div className="auth-form-panel">
          <p className="auth-eyebrow">Start Shopping</p>
          <h2 className="text-3xl font-bold">Register</h2>
          <p className="mt-2 text-slate-300">Create your account to start shopping.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Full name</label>
              <input
                className="input-field"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <p className="mt-1 text-sm text-red-300">{errors.name}</p>}
            </div>
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
                placeholder="Choose a strong password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
            </div>
            {errors.form && <p className="text-sm text-red-300">{errors.form}</p>}
            <button disabled={loading} className="btn-primary w-full" type="submit">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-300">
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
