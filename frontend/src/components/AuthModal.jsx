import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="glass w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Welcome to NeoCart</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <p className="mb-6 text-sm text-slate-300">Login or create an account to add products to cart and place orders.</p>
        <div className="grid gap-3">
          <Link to="/login" className="btn-primary" onClick={onClose}>
            Go to Login
          </Link>
          <Link to="/register" className="btn-secondary" onClick={onClose}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
