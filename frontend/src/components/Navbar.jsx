import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Search, ShoppingBag, User, LogOut, Bell, CreditCard } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      showToast('Session terminated');
      navigate('/home');
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const itemClass = ({ isActive }) =>
    `px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-white ${
      isActive ? 'text-white' : 'text-slate-500'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Brand */}
        <Link to="/home" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20">
            <ShoppingBag className="text-white" size={18} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">NeoCart</span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/home" className={itemClass}>Home</NavLink>
          <NavLink to="/products" className={itemClass}>Marketplace</NavLink>
          {isAuthenticated ? <NavLink to="/cart" className={itemClass}>Cart</NavLink> : null}
          {isAuthenticated ? <NavLink to="/dashboard" className={itemClass}>Vault</NavLink> : null}
          {isAuthenticated ? <NavLink to="/checkout" className={itemClass}>Checkout</NavLink> : null}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search the void..."
              className="h-10 w-48 rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest text-white focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <button className="text-slate-400 hover:text-white transition-colors p-2" title="Notifications">
              <Bell size={20} />
            </button>
            <button onClick={toggleTheme} className="text-slate-400 hover:text-white transition-colors p-2">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isAuthenticated ? (
              <Link to="/cart" className="relative text-slate-400 hover:text-white transition-colors p-2">
                <ShoppingBag size={20} />
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white ring-2 ring-slate-950">!</span>
              </Link>
            ) : null}
            
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200 transition-all hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-all hover:brightness-110"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={18} />
                </button>
                <Link to="/dashboard" className="h-9 w-9 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 hover:border-blue-500 transition-all">
                   <div className="flex h-full w-full items-center justify-center text-xs font-bold text-blue-400 uppercase">
                     {user.name.charAt(0)}
                   </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-white text-center uppercase tracking-tight">Terminate Session?</h3>
            <p className="mt-4 text-slate-400 text-center font-medium">Are you sure you want to log out of the NeoCart ecosystem?</p>
            <div className="mt-8 flex gap-4">
              <button
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
