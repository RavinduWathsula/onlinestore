import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartApi, ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, CreditCard, Wallet, Smartphone, ShieldCheck, Lock, ChevronRight, ArrowLeft, Map, Truck, Info, Cpu } from 'lucide-react';

const DELIVERY_FEE = 450;

export default function CheckoutPage() {
  const { user, coupons, removeCoupon } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [loadingCart, setLoadingCart] = useState(true);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Start at step 1 (Logistics/Address)
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [invoice, setInvoice] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoadingCart(true);
    try {
      const res = await cartApi.list();
      setCartItems(res.data.data || []);
      setSummary(res.data.summary || { total: 0, count: 0 });
    } catch {
      showToast('Could not synchronize vault for checkout', 'error');
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const subtotal = Number(summary.total || 0);
  const tax = subtotal * 0.08;
  const totalPayable = subtotal + DELIVERY_FEE + tax;

  const placeOrder = async () => {
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\D/g, '').length !== 16) {
        showToast('Card number must be 16 digits', 'error');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        showToast('Expiry must be MM/YY', 'error');
        return;
      }
      if (pin.length < 3) {
        showToast('Invalid Security Key', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        payment_method: paymentMethod === 'card' ? 'card' : 'cash_on_delivery',
        card_type: 'visa', // Defaulting to visa as required by backend
        coupon_code: selectedCoupon || undefined,
        card_number: cardNumber.replace(/\D/g, ''),
        expiry_date: expiryDate,
        pin,
        phone: phone.replace(/\D/g, ''),
      };

      const res = await ordersApi.checkout(payload);
      setInvoice({
        orderId: res.data.order_id,
        total: res.data?.order?.total_amount ?? totalPayable,
        date: new Date().toISOString(),
      });
      if (selectedCoupon) removeCoupon(selectedCoupon);
      setStep(3);
      showToast('Transaction Authorized');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Authorization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart) return <div className="p-24 text-center text-slate-500 font-black uppercase tracking-[0.4em] animate-pulse">Initializing Secure Session...</div>;

  if (step === 3 && invoice) {
    return (
      <div className="container mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mb-12 flex justify-center">
           <div className="relative">
              <div className="absolute inset-0 scale-150 animate-pulse bg-emerald-500/20 blur-3xl rounded-full" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-slate-950 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                 <CheckCircle2 size={56} className="text-emerald-500" />
              </div>
           </div>
        </div>

        <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">Authorized</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-16">Protocol ID: #{String(invoice.orderId).slice(0, 12)}</p>

        <div className="rounded-[3rem] border border-white/5 bg-slate-950 p-12 mb-16 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
           <div className="flex items-center justify-between">
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">EXPECTED ARRIVAL</p>
                 <p className="text-2xl font-black text-white uppercase tracking-tight">24-48 Hours</p>
              </div>
              <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 shadow-2xl">
                 <Truck size={32} />
              </div>
           </div>
           <div className="mt-12 pt-12 border-t border-white/5 flex items-center justify-between">
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">VALUATION</p>
                 <p className="text-2xl font-black text-white uppercase tracking-tight">LKR {Number(invoice.total).toLocaleString()}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">MANIFEST</p>
                 <p className="text-2xl font-black text-white uppercase tracking-tight">{summary.count} Assets</p>
              </div>
           </div>
        </div>

        <div className="space-y-6 max-w-md mx-auto">
           <Link to="/products" className="btn-premium w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em]">Return to Marketplace</Link>
           <Link to="/dashboard" className="flex items-center justify-center h-14 w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Review Order History</Link>
        </div>

        <div className="mt-20 text-center">
           <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/5">
              <ShieldCheck size={16} className="text-blue-500" /> 
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Transaction secured by NeoCart Vault</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Steps */}
      <div className="mx-auto mb-20 flex max-w-xl items-center justify-between">
        <div className="flex flex-col items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <CheckCircle2 size={24} />
           </div>
           <span className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase">Logistics</span>
        </div>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-600 via-blue-600 to-slate-800 mx-4" />
        <div className="flex flex-col items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-600/50 bg-slate-900 text-blue-400">
              <span className="text-sm font-black">02</span>
           </div>
           <span className="text-[9px] font-black tracking-[0.2em] text-blue-400 uppercase">Authorization</span>
        </div>
        <div className="h-[2px] flex-1 bg-slate-800 mx-4" />
        <div className="flex flex-col items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-700">
              <span className="text-sm font-black">03</span>
           </div>
           <span className="text-[9px] font-black tracking-[0.2em] text-slate-700 uppercase">Review</span>
        </div>
      </div>

      <div className="grid gap-16 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {/* Shipping Address */}
          <div className="rounded-[3rem] border border-white/5 bg-slate-950 p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 blur-3xl rounded-full" />
             <div className="mb-10 flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/10 shadow-xl">
                   <Map size={28} />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Destination</h2>
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Logistics Routing Protocol</p>
                </div>
             </div>
             
             <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Assignee First Name</label>
                   <input type="text" defaultValue="Ravindu" className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Assignee Last Name</label>
                   <input type="text" defaultValue="Wathsula" className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="sm:col-span-2 space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Physical Coordinates (Address)</label>
                   <input type="text" defaultValue="123 Future Avenue, Sector 7" className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">City Hub</label>
                   <input type="text" defaultValue="Colombo" className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Neural/Postal Code</label>
                   <input type="text" defaultValue="10100" className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                </div>
             </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-[3rem] border border-white/5 bg-slate-950 p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/5 blur-3xl rounded-full" />
             <div className="mb-10 flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-500 border border-purple-500/10 shadow-xl">
                   <CreditCard size={28} />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Authorization</h2>
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Secure Value Transfer</p>
                </div>
             </div>

             <div className="grid gap-6 sm:grid-cols-3 mb-10">
                {[
                  { id: 'card', icon: CreditCard, label: 'Neural Card' },
                  { id: 'crypto', icon: Wallet, label: 'Web3 Wallet' },
                  { id: 'paypal', icon: Smartphone, label: 'PayPal Link' }
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-4 rounded-3xl border h-32 transition-all group ${paymentMethod === method.id ? 'border-blue-600 bg-blue-600/10 text-white' : 'border-white/5 bg-slate-900 text-slate-500 hover:text-white'}`}
                  >
                     <method.icon size={28} className={paymentMethod === method.id ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'} />
                     <span className="text-[9px] font-black tracking-[0.2em] uppercase">{method.label}</span>
                  </button>
                ))}
             </div>

             {paymentMethod === 'card' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Card Identifier</label>
                      <div className="relative">
                         <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                         <input 
                           type="text" 
                           placeholder="0000 0000 0000 0000" 
                           value={cardNumber}
                           onChange={(e) => setCardNumber(e.target.value)}
                           className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 pl-14 pr-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" 
                         />
                      </div>
                   </div>
                   <div className="grid gap-8 sm:grid-cols-2">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Expiry Sync</label>
                         <input 
                           type="text" 
                           placeholder="MM / YY" 
                           value={expiryDate}
                           onChange={(e) => setExpiryDate(e.target.value)}
                           className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" 
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Security Key (CVV)</label>
                         <input 
                           type="password" 
                           placeholder="***" 
                           value={pin}
                           onChange={(e) => setPin(e.target.value)}
                           className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" 
                         />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase ml-1">Neural Contact (Mobile)</label>
                      <input 
                        type="text" 
                        placeholder="+94 7X XXX XXXX" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-14 w-full rounded-2xl border border-white/5 bg-slate-900 px-6 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" 
                      />
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          <div className="rounded-[3rem] border border-white/5 bg-slate-950 p-10 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-10">Valuation</h2>
             
             <div className="space-y-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                   <span className="text-slate-600">Assets Total</span>
                   <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                   <span className="text-slate-600">Logistics Fee</span>
                   <span className="text-blue-500">LKR {DELIVERY_FEE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                   <span className="text-slate-600">Tax Protocol</span>
                   <span className="text-white">LKR {tax.toLocaleString()}</span>
                </div>
                <div className="pt-8 mt-4 border-t border-white/5 flex justify-between items-baseline">
                   <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Total Amount</span>
                   <span className="text-3xl font-black text-white tracking-tighter">LKR {totalPayable.toLocaleString()}</span>
                </div>
             </div>

             <button 
               onClick={placeOrder}
               disabled={loading || cartItems.length === 0}
               className="btn-premium w-full mt-12 py-5 rounded-2xl gap-4 text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:translate-y-[-4px] transition-all"
             >
                {loading ? 'Decrypting...' : 'Review & Authorize'} <ChevronRight size={18} />
             </button>

             <button 
               onClick={() => navigate('/cart')}
               className="w-full mt-8 py-3 flex items-center justify-center gap-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors group"
             >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Inventory
             </button>

             <div className="mt-12 pt-12 border-t border-white/5 text-center">
                <div className="flex items-center justify-center gap-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                   <ShieldCheck size={16} className="text-emerald-500" /> SSL_ENCRYPTED_LINK
                </div>
             </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/5 bg-slate-950 p-8 flex items-start gap-6 group hover:border-blue-500/20 transition-colors">
             <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 shadow-xl">
                <Info size={24} />
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                You're <span className="text-white">150 Credits</span> away from <span className="text-purple-500 italic">VANGUARD STATUS</span> on your next acquisition.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
