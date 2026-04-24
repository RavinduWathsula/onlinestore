import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { cartApi, productsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthModal from '../components/AuthModal';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Grid, List, Cpu, Globe, Zap } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('0');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const params = useMemo(() => ({ search, category, sort, page, limit: 9 }), [search, category, sort, page]);

  useEffect(() => {
    setLoading(true);
    Promise.all([productsApi.list(params), productsApi.categories()])
      .then(([productRes, categoryRes]) => {
        setProducts(productRes.data.data || []);
        setMeta(productRes.data.pagination || { pages: 1 });
        setCategories(categoryRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [params]);

  const onAddToCart = async (product) => {
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }

    try {
      await cartApi.add({ product_id: product.id, quantity: 1 });
      showToast('Asset synchronized with inventory');
    } catch {
      showToast('Synchronization failed', 'error');
    }
  };

  return (
    <div className="container mx-auto flex gap-12 px-6 py-12">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-shrink-0 lg:block">
        <div className="sticky top-28 space-y-12">
          <div>
             <h3 className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-white uppercase mb-8">
                <Filter size={18} className="text-blue-500" /> Realms
             </h3>
             <div className="space-y-4">
                <label className="flex items-center gap-4 cursor-pointer group">
                   <div className="relative flex h-5 w-5 items-center justify-center rounded-lg border border-white/10 bg-slate-900 group-hover:border-blue-500 transition-all">
                      <input 
                        type="radio" 
                        name="realm"
                        className="peer absolute opacity-0 cursor-pointer" 
                        checked={category === '0'}
                        onChange={() => setCategory('0')}
                      />
                      <div className="h-2 w-2 rounded-full bg-blue-500 opacity-0 peer-checked:opacity-100 transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${category === '0' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>All Realms</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex h-5 w-5 items-center justify-center rounded-lg border border-white/10 bg-slate-900 group-hover:border-blue-500 transition-all">
                       <input 
                         type="radio" 
                         name="realm"
                         className="peer absolute opacity-0 cursor-pointer" 
                         checked={category === String(cat.id)}
                         onChange={() => setCategory(String(cat.id))}
                       />
                       <div className="h-2 w-2 rounded-full bg-blue-500 opacity-0 peer-checked:opacity-100 transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${category === String(cat.id) ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{cat.name}</span>
                  </label>
                ))}
             </div>
          </div>

          <div className="pt-10 border-t border-white/5">
             <h3 className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-white uppercase mb-8">
                <SlidersHorizontal size={18} className="text-purple-500" /> Valuation
             </h3>
             <div className="px-2">
                <input type="range" min="0" max="1000000" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div className="mt-6 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                   <span>0 LKR</span>
                   <span>1M+ LKR</span>
                </div>
             </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-950 p-6 flex flex-col gap-4">
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vault Status: Nominal</span>
             </div>
             <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-widest">Protocol 4.0 active. All assets are verified by the NeoCart Neural Link.</p>
          </div>

          <button 
            className="w-full py-4 rounded-2xl border border-white/5 bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-800 hover:text-white transition-all shadow-xl"
            onClick={() => {
              setSearch('');
              setCategory('0');
              setSort('latest');
            }}
          >
            Reset Matrix
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
           <div>
              <div className="flex items-center gap-3 mb-3">
                 <Zap size={14} className="text-blue-400" />
                 <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Nexus Marketplace</span>
              </div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Current Batch</h1>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex rounded-2xl bg-slate-950 p-1.5 border border-white/5 shadow-2xl">
                 <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-600 hover:text-white'}`}
                 >
                   <Grid size={20} />
                 </button>
                 <button 
                   onClick={() => setViewMode('list')}
                   className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-600 hover:text-white'}`}
                 >
                   <List size={20} />
                 </button>
              </div>

              <div className="relative">
                 <select 
                   className="h-14 w-56 rounded-2xl border border-white/5 bg-slate-950 px-6 text-[10px] font-black uppercase tracking-widest text-white focus:border-blue-500 outline-none appearance-none shadow-2xl"
                   value={sort}
                   onChange={(e) => setSort(e.target.value)}
                 >
                   <option value="latest">Latest Entries</option>
                   <option value="price_low">Valuation: ASC</option>
                   <option value="price_high">Valuation: DESC</option>
                 </select>
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <SlidersHorizontal size={14} />
                 </div>
              </div>
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
             <div className="h-16 w-16 rounded-3xl border border-white/10 bg-slate-950 flex items-center justify-center animate-spin">
                <Cpu size={32} className="text-blue-500" />
             </div>
             <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Synchronizing Assets...</p>
          </div>
        ) : (
          <div className="space-y-16">
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 pt-12 border-t border-white/5">
               <button 
                 className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-slate-950 text-slate-600 hover:text-white hover:border-blue-500/50 transition-all disabled:opacity-10"
                 disabled={page <= 1}
                 onClick={() => setPage(p => p - 1)}
               >
                 <ChevronLeft size={20} />
               </button>
               
               {[...Array(meta.pages || 1)].map((_, i) => (
                 <button
                   key={i + 1}
                   onClick={() => setPage(i + 1)}
                   className={`h-12 w-12 rounded-2xl text-xs font-black transition-all ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                 >
                   {(i + 1).toString().padStart(2, '0')}
                 </button>
               ))}

               <button 
                 className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-slate-950 text-slate-600 hover:text-white hover:border-blue-500/50 transition-all disabled:opacity-10"
                 disabled={page >= (meta.pages || 1)}
                 onClick={() => setPage(p => p + 1)}
               >
                 <ChevronRight size={20} />
               </button>
            </div>
          </div>
        )}
      </main>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
