import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    showToast('Logged out successfully');
    navigate('/');
  };

  const itemClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
          NeoCart
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={itemClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={itemClass}>
            Products
          </NavLink>
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
        <div className="flex items-center gap-2">
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
              <span className="hidden rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 md:block">
                {user.name}
              </span>
              <button type="button" className="btn-secondary text-sm" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
