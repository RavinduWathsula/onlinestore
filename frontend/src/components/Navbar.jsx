import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import logoMark from '../assets/neocart-logo.svg';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      showToast('Logged out successfully');
      navigate('/home');
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const itemClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link--active' : ''}`;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto max-w-[98%]">
        <div className="nav-shell">
          <Link to="/" className="nav-brand">
            <img src={logoMark} alt="NeoCart logo" className="nav-brand__logo" />
            <span>NeoCart</span>
          </Link>
          <nav className="nav-main">
          <NavLink to="/" className={itemClass}>
            Home
          </NavLink>
          {!isAdmin && (
            <NavLink to="/products" className={itemClass}>
              Products
            </NavLink>
          )}
          {user && (
            <>
              <NavLink to="/dashboard" className={itemClass}>
                Dashboard
              </NavLink>
              <NavLink to="/cart" className={itemClass}>
                Cart
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={itemClass}>
              Admin
            </NavLink>
          )}
          </nav>
          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-all hover:bg-white/10 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 light:border-slate-200 light:bg-slate-100 light:text-slate-600"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--glass-bg)',
                color: 'var(--text-secondary)'
              }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {!user ? (
              <>
                <Link className="btn-secondary text-sm" to="/login">
                  Login
                </Link>
                <Link className="btn-primary text-sm" to="/register">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="hidden rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 md:block">
                  {user.name}
                </span>
                <button type="button" className="btn-secondary text-sm" onClick={() => setShowLogoutConfirm(true)}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/70">Confirm Action</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Logout now?</h3>
            <p className="mt-2 text-sm text-slate-300">You will be signed out from your NeoCart account.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
