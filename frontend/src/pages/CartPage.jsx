import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trash2, Plus, Minus, ArrowLeft, Lock, Truck, ShieldCheck, Cpu } from 'lucide-react';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.list();
      setItems(res.data.data || []);
      setSummary(res.data.summary || { total: 0, count: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const onQuantity = async (item, nextQty) => {
    const quantity = Number(nextQty);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > Number(item.stock || 1)) {
      showToast('Quantity restricted by inventory protocol', 'error');
      return;
    }

    setUpdatingId(item.id);
    try {
      await cartApi.update({ cart_id: item.id, quantity });
      await loadCart();
    } catch {
      showToast('Neural update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const onRemove = async (cartId) => {
    setUpdatingId(cartId);
    try {
      await cartApi.remove(cartId);
      showToast('Asset decoupled from inventory');
      await loadCart();
    } catch {
      showToast('Decoupling failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Accessing Inventory Vault..." />;

  const subtotal = Number(summary.total || 0);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Inventory Check</span>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mt-2">Active Cart</h1>
        <p className="mt-2 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Current Session: 0xNEOCART_SYNC</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.length === 0 ? (
            <div className="rounded-[3rem] border border-white/5 bg-slate-950 p-24 text-center">
               <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-white/5 text-slate-600 shadow-xl">
                  <Cpu size={32} />
               </div>
               <h2 className="text-2xl font-black text-white uppercase tracking-tight">Vault is Empty</h2>
               <p className="mt-4 text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">The NeoCart void awaits your digital and physical selection.</p>
               <Link to="/products" className="btn-premium mt-10 px-10 py-4 inline-block rounded-2xl">Initialize Marketplace</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-950 p-8 transition-all hover:bg-slate-900/50">
                 <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                    <div className="h-40 w-48 overflow-hidden rounded-3xl border border-white/5 bg-slate-900 shadow-2xl">
                       <img
                         src={item.image || 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=400&q=80'}
                         alt={item.name}
                         className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                       />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-start justify-between">
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Authenticated Asset</p>
                             <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{item.name}</h3>
                             <div className="mt-6 flex items-center gap-6">
                                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5">NOMINAL STATUS</span>
                                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">SYNC_ID: {String(item.id).slice(0, 8)}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-3xl font-black text-white tracking-tighter">LKR {Number(item.price).toLocaleString()}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">UNIT_VAL_LKR</p>
                          </div>
                       </div>

                       <div className="mt-8 flex items-center justify-between">
                          <div className="flex items-center rounded-2xl border border-white/5 bg-slate-900 p-1.5 shadow-inner">
                             <button
                               onClick={() => onQuantity(item, Number(item.quantity) - 1)}
                               disabled={updatingId === item.id || Number(item.quantity) <= 1}
                               className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition-all"
                             >
                               <Minus size={16} />
                             </button>
                             <span className="w-14 text-center text-sm font-black text-white">{item.quantity}</span>
                             <button
                               onClick={() => onQuantity(item, Number(item.quantity) + 1)}
                               disabled={updatingId === item.id || Number(item.quantity) >= Number(item.stock)}
                               className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition-all"
                             >
                               <Plus size={16} />
                             </button>
                          </div>
                          
                          <button
                            onClick={() => onRemove(item.id)}
                            disabled={updatingId === item.id}
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl hover:shadow-red-500/20"
                          >
                             <Trash2 size={20} />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            ))
          )}

          {items.length > 0 && (
             <div className="flex items-center justify-between pt-10 px-4">
                <Link to="/products" className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase hover:text-white transition-colors group">
                   <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Continue Discovery
                </Link>
                <button className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase hover:text-red-400 transition-colors">
                   PURGE CART
                </button>
             </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-8">
          <div className="rounded-[3rem] border border-white/5 bg-slate-950 p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-10">Summary</h2>
             
             <div className="space-y-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                   <span className="text-slate-500">Gross Valuation</span>
                   <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                   <span className="text-slate-500">Secure Logistics</span>
                   <span className="text-blue-400">NOMINAL_VAL</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                   <span className="text-slate-500">Protocol Tax (8%)</span>
                   <span className="text-white">LKR {tax.toLocaleString()}</span>
                </div>
                <div className="pt-8 mt-4 border-t border-white/5 flex justify-between items-baseline">
                   <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Valuation</span>
                   <span className="text-3xl font-black text-white tracking-tighter">LKR {grandTotal.toLocaleString()}</span>
                </div>
             </div>

             <button 
               onClick={() => navigate('/checkout')}
               disabled={items.length === 0}
               className="btn-premium w-full mt-12 py-5 rounded-2xl gap-4 text-xs font-black uppercase tracking-[0.2em]"
             >
                INITIALIZE CHECKOUT <Lock size={18} />
             </button>

             <div className="mt-12 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                   <ShieldCheck className="text-blue-500" size={20} />
                   <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">AES-256 SECURED TRANSACTION</p>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                    <Truck className="text-purple-500" size={20} />
                    <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">HYPER-SPEED LOGISTICS ACTIVE</p>
                </div>
             </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/5 bg-slate-950 p-8">
             <p className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase mb-6">Protocol Discount Code</p>
             <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="CODE_SYNC" 
                  className="h-14 flex-1 rounded-2xl border border-white/5 bg-slate-900 px-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-500 transition-all"
                />
                <button className="h-14 rounded-2xl bg-white/5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/10 hover:text-white transition-all">
                  SYNC
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
