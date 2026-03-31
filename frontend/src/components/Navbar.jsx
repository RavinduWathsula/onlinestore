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
    `nav-link ${isActive ? 'nav-link--active' : ''}`;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto max-w-7xl">
        <div className="nav-shell">
          <Link to="/" className="nav-brand">
            <span className="nav-brand__orb" aria-hidden="true" />
            <span>NeoCart</span>
          </Link>
          <nav className="nav-main">
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
          <div className="nav-actions">
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
                <button type="button" className="btn-secondary text-sm" onClick={onLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
