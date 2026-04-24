import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Eye, EyeOff, Lock, ShoppingCart, Wallet } from 'lucide-react';
import authVisual from '../assets/auth-visual.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await login(form);
      const nextUser = res?.data?.user;
      showToast('Authentication successful');
      navigate(nextUser?.role === 'admin' ? '/admin' : '/home', { replace: true });
    } catch (error) {
      const response = error?.response?.data;
      setErrors(response?.errors || { form: response?.message || 'Identity verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showToast('Redirecting to secure Google Cloud auth...');
    // In a real app, window.location.href = '/api/auth/google';
  };

  return (
    <section className="flex min-h-screen w-full flex-col bg-[#101112] text-slate-100 md:flex-row">
      <section className="relative min-h-[46vh] w-full items-center justify-center overflow-hidden bg-[#05070b] md:flex md:min-h-screen md:w-1/2">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.2)_0%,rgba(5,7,11,0.94)_45%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2)_0%,rgba(5,7,11,0.95)_42%)]" />

        <img
          src={authVisual}
          alt="Colorful futuristic commerce visual"
          className="auth-visual-image"
        />
        <div className="auth-visual-overlay" />

        <div className="relative z-10 max-w-lg px-8 py-10 md:px-10">
          <div className="mb-4 inline-block rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Virtual Asset Vault</span>
          </div>
          <h1 className="mb-5 text-4xl font-black tracking-tight text-white md:text-[3.15rem] md:leading-[1.02]">Secure your digital legacy.</h1>
          <p className="max-w-md text-[15px] leading-relaxed text-slate-300">
            NeoCart bridges the gap between traditional commerce and the decentralized future. Experience tactile precision in every transaction.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {['A', 'B', 'C'].map((char) => (
                <div
                  key={char}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#0b1220] bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-slate-100 shadow-[0_0_18px_rgba(10,211,255,0.08)]"
                >
                  {char}
                </div>
              ))}
            </div>
            <span className="text-sm italic text-slate-400">Joined by 12k+ curators</span>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center bg-[#131315] px-6 py-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_22px_rgba(59,130,246,0.28)]">
              <ShoppingCart className="text-white" size={20} />
            </div>
            <span className="text-[1.6rem] font-black tracking-tight text-white">NeoCart</span>
          </div>

          <header className="mb-8">
            <h2 className="mb-1 text-[2.05rem] font-semibold text-slate-100">Welcome back</h2>
            <p className="text-sm text-slate-400">Access your encrypted ecosystem dashboard.</p>
          </header>

          <form onSubmit={onSubmit} autoComplete="off" className="space-y-5">
            <div className="space-y-3.5">
              <div className="group">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 group-focus-within:text-blue-300">Email Address</label>
                <div className="flex h-12 items-center rounded-[10px] border border-transparent bg-[#1b1b1d] px-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.05)] transition-all group-focus-within:border-blue-500/50">
                  <span className="mr-2 text-slate-500">@</span>
                  <input
                    type="email"
                    className="w-full border-none bg-transparent text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none"
                    placeholder="curator@neocart.io"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                {errors.email ? <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-red-400">{errors.email}</p> : null}
              </div>

              <div className="group">
                <div className="mb-1.5 flex items-end justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 group-focus-within:text-blue-300">Password</label>
                  <Link className="text-[10px] font-bold uppercase tracking-[0.08em] text-purple-400 hover:text-purple-300" to="#">
                    Lost Access?
                  </Link>
                </div>
                <div className="flex h-12 items-center rounded-[10px] border border-transparent bg-[#1b1b1d] px-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.05)] transition-all group-focus-within:border-blue-500/50">
                  <Lock size={16} className="mr-2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border-none bg-transparent text-sm text-slate-100 placeholder:text-slate-700 focus:outline-none"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 transition-colors hover:text-slate-200">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password ? <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-red-400">{errors.password}</p> : null}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input className="h-4 w-4 rounded border-white/10 bg-slate-900 text-blue-600" type="checkbox" />
              Maintain persistent session (30 days)
            </label>

            {errors.form ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs font-bold uppercase tracking-[0.08em] text-red-400">{errors.form}</p>
            ) : null}

            <button
              disabled={loading}
              type="submit"
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-[12px] font-bold uppercase tracking-[0.22em] text-white transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              {loading ? 'Authorizing...' : 'Authorize Identity'}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-600">Or connect via</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-slate-100 backdrop-blur-xl transition-all hover:bg-white/10"
                type="button"
              >
                <span className="text-xs font-bold">G</span>
                Google Cloud
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-slate-100 backdrop-blur-xl transition-all hover:bg-white/10"
                type="button"
              >
                <Wallet size={16} />
                Web3 Wallet
              </button>
            </div>
          </form>

          <footer className="mt-9 text-center text-[13px] text-slate-500">
            New to the ecosystem?{' '}
            <Link className="font-bold text-blue-400 hover:underline" to="/register">
              Apply for membership
            </Link>
          </footer>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-slate-900/70 px-4 py-2 backdrop-blur-xl">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">System Operational: 14ms Latency</span>
        </div>
      </div>
    </section>
  );
}
