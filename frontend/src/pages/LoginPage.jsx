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
    <div className="mx-auto max-w-md glass p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-2 text-slate-400">Access your NeoCart account.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
        </div>
        <div>
          <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
          {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
        </div>
        {errors.form && <p className="text-sm text-red-300">{errors.form}</p>}
        <button disabled={loading} className="btn-primary w-full" type="submit">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-400">
        New user? <Link to="/register" className="text-blue-300">Create account</Link>
      </p>
    </div>
  );
}
