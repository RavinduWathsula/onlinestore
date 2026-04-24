import { ShoppingCart, Star, Shield, Zap, RotateCcw, ArrowLeft, Heart, Share2, Cpu, Globe, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cartApi, productsApi, reviewsApi } from '../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([productsApi.detail(id), reviewsApi.list(id)])
      .then(([productRes, reviewRes]) => {
        if (!mounted) return;
        setProduct(productRes.data.data || null);
        setReviews(reviewRes.data.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setProduct(null);
        setReviews([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const onAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }
    try {
      await cartApi.add({ product_id: product.id, quantity: 1 });
      showToast('Asset integrated with personal link');
    } catch {
      showToast('Neural integration failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Accessing Secure Specifications..." />;

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Asset Offline</h1>
        <p className="mt-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">The requested protocol is no longer active in this timeline.</p>
        <Link to="/products" className="btn-premium mt-12 px-10 py-4 inline-block rounded-2xl">Return to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Link to="/products" className="mb-12 flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase hover:text-white transition-colors group">
         <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Marketplace Hub
      </Link>

      <div className="grid gap-20 lg:grid-cols-2">
        {/* Product Visual */}
        <div className="space-y-8">
           <div className="group relative aspect-square overflow-hidden rounded-[3.5rem] border border-white/5 bg-slate-950 p-16 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 transition-opacity group-hover:opacity-100 duration-700" />
              <img
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                className="h-full w-full object-contain transition-transform duration-[2s] group-hover:scale-110"
              />
              <div className="absolute right-10 top-10 flex flex-col gap-4">
                 <button className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-900/80 text-slate-400 backdrop-blur-xl border border-white/10 hover:text-red-500 transition-all hover:scale-110 shadow-2xl">
                    <Heart size={24} />
                 </button>
                 <button className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-900/80 text-slate-400 backdrop-blur-xl border border-white/10 hover:text-blue-500 transition-all hover:scale-110 shadow-2xl">
                    <Share2 size={24} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`aspect-square rounded-[1.5rem] border ${i === 0 ? 'border-blue-500/30' : 'border-white/5'} bg-slate-950 p-4 transition-all hover:border-blue-500/20 cursor-pointer`}>
                   <img src={product.image || FALLBACK_IMAGE} className={`h-full w-full object-contain ${i === 0 ? 'opacity-100' : 'opacity-20'} group-hover:opacity-100 transition-opacity`} />
                </div>
              ))}
           </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
           <div className="mb-6 flex items-center gap-4">
              <span className="rounded-full bg-blue-600/10 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase border border-blue-500/20">
                 {product.category_name || 'GENERAL_ASSET'}
              </span>
              <div className="h-1 w-8 bg-slate-800 rounded-full" />
              <div className="flex items-center gap-2">
                 <Star size={14} className="fill-emerald-400 text-emerald-400" />
                 <span className="text-xs font-black text-white">4.9 RANK</span>
              </div>
           </div>

           <h1 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">{product.name}</h1>
           
           <p className="text-xl text-slate-400 leading-relaxed mb-12 font-medium">
              {product.description || 'Experience the future of personal augmentation with this premium asset. Engineered for maximum performance and seamless neural integration.'}
           </p>

           <div className="mb-12 space-y-8">
              <div className="flex items-baseline gap-6">
                 <span className="text-6xl font-black text-white tracking-tighter">LKR {Number(product.price).toLocaleString()}</span>
                 <span className="text-2xl text-slate-600 line-through font-bold">LKR {(Number(product.price) * 1.2).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className={`h-2 w-2 rounded-full ${Number(product.stock) > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    {Number(product.stock) > 0 ? `Inventory Check: ${product.stock} Units Nominal` : 'Stock Depleted - Protocol Backorder'}
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-8 mb-12 py-10 border-y border-white/5">
              {[
                { icon: Shield, label: 'Secured Link', color: 'text-blue-500' },
                { icon: Zap, label: 'Instant Sync', color: 'text-purple-500' },
                { icon: RotateCcw, label: 'Rollback Auth', color: 'text-emerald-500' }
              ].map((feature, i) => (
                <div key={i} className="text-center group">
                   <feature.icon className={`mx-auto mb-3 ${feature.color} group-hover:scale-110 transition-transform`} size={28} />
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">{feature.label}</p>
                </div>
              ))}
           </div>

           <div className="mt-auto flex gap-6">
              <button
                onClick={onAddToCart}
                disabled={Number(product.stock) < 1}
                className="btn-premium flex-1 py-6 gap-4 text-xs font-black uppercase tracking-[0.3em] rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.2)]"
              >
                INITIALIZE INTEGRATION <ShoppingCart size={20} />
              </button>
              <button className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/5 bg-slate-900 text-slate-500 hover:text-red-500 transition-all hover:bg-slate-800">
                 <Heart size={28} />
              </button>
           </div>
        </div>
      </div>

      {/* Reviews & Specs Section */}
      <div className="mt-32 grid gap-20 lg:grid-cols-3">
         <div className="lg:col-span-2 space-y-16">
            <div>
               <div className="flex items-center gap-4 mb-10">
                  <Cpu className="text-blue-500" size={28} />
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Technical Matrix</h2>
               </div>
               <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    { label: 'Neural Throughput', value: '1.2 GB/s' },
                    { label: 'Sync Latency', value: '0.04 ms' },
                    { label: 'Neural Battery', value: '72 Hours' },
                    { label: 'Mass Matrix', value: '240g' },
                    { label: 'Core Material', value: 'Carbon Polymer' },
                    { label: 'OS Protocol', value: 'NeoOS 4.0+' },
                  ].map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center p-6 rounded-3xl border border-white/5 bg-slate-950 group hover:border-blue-500/20 transition-all">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400">{spec.label}</span>
                       <span className="text-sm font-black text-white tracking-tight">{spec.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div>
               <div className="mb-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Globe className="text-purple-500" size={28} />
                     <h2 className="text-3xl font-black text-white uppercase tracking-tight">Neural Feedback</h2>
                  </div>
                  <button className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">Broadcast Review</button>
               </div>
               
               <div className="space-y-6">
                  {reviews.length ? (
                    reviews.map((review) => (
                      <div key={review.id} className="rounded-[2.5rem] border border-white/5 bg-slate-950 p-10 transition-all hover:bg-slate-900 group">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black text-white shadow-xl">
                                  {review.user_name?.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-white uppercase tracking-tight">{review.user_name}</p>
                                  <p className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-black">Verified Link Enabled</p>
                               </div>
                            </div>
                            <div className="flex gap-1.5 text-emerald-400">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={12} className={i < Number(review.rating) ? 'fill-current' : 'opacity-10'} />
                               ))}
                            </div>
                         </div>
                         <p className="text-slate-400 leading-relaxed font-medium italic text-lg group-hover:text-slate-300 transition-colors">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[2.5rem] border border-white/5 bg-slate-950 p-16 text-center">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">No neural records found.</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Trust Factors */}
         <div className="space-y-8">
            <div className="rounded-[3rem] border border-white/5 bg-slate-950 p-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
               <div className="flex items-center gap-4 mb-10 relative z-10">
                  <Lock className="text-blue-500" size={24} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Audit</h3>
               </div>
               <div className="space-y-8 relative z-10">
                  {[
                    { label: 'PERFORMANCE', val: '98%', color: 'bg-blue-500' },
                    { label: 'DURABILITY', val: '85%', color: 'bg-purple-500' },
                    { label: 'INTEGRATION', val: '100%', color: 'bg-emerald-500' }
                  ].map((stat, i) => (
                    <div key={i}>
                       <div className="flex justify-between mb-3">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${stat.color.replace('bg-', 'text-')}`}>{stat.val}</span>
                       </div>
                       <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: stat.val }} />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5 italic text-xs text-slate-400 leading-relaxed">
                  "Exceeds all standard protocols for consumer-grade neural hardware. Stability rating: S-TIER."
               </div>
            </div>
         </div>
      </div>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
