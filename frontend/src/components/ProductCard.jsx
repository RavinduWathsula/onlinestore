import { useEffect, useState } from 'react';
import { ShoppingCart, Star, Zap, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productArt } from '../utils/visualArt';

export default function ProductCard({ product, onAdd }) {
  const [image, setImage] = useState(product.image_url || product.image || productArt(product.id));

  useEffect(() => {
    setImage(product.image_url || product.image || productArt(product.id));
  }, [product]);

  return (
    <article className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-950 p-5 transition-all hover:border-blue-500/30 hover:bg-slate-900/50 hover:translate-y-[-8px] duration-500 shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-600/5 blur-[80px] group-hover:bg-blue-600/10 transition-all duration-700" />
      
      <div className="absolute right-8 top-8 z-10 flex flex-col gap-2">
        {Number(product.stock) < 5 && Number(product.stock) > 0 && (
           <span className="rounded-full bg-orange-500/10 px-4 py-1.5 text-[8px] font-black tracking-[0.2em] text-orange-400 border border-orange-500/20 uppercase shadow-xl backdrop-blur-md">
             LIMITED_SYNC
           </span>
        )}
        {Number(product.stock) === 0 && (
           <span className="rounded-full bg-red-500/10 px-4 py-1.5 text-[8px] font-black tracking-[0.2em] text-red-400 border border-red-500/20 uppercase shadow-xl backdrop-blur-md">
             OUT_OF_PROTO
           </span>
        )}
      </div>

      <Link to={`/products/${product.id}`} className="block aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          loading="lazy"
          onError={() => setImage(productArt(product.id))}
        />
      </Link>

      <div className="mt-8 px-2">
        <div className="flex items-center gap-2 mb-3">
           <Cpu size={12} className="text-blue-500/50" />
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{product.category_name || 'GENERAL_ASSET'}</p>
        </div>

        <Link to={`/products/${product.id}`} className="block text-xl font-black text-white uppercase tracking-tighter transition-colors hover:text-blue-400 line-clamp-1 leading-tight">
          {product.name}
        </Link>
        
        <div className="mt-4 flex items-center gap-3">
           <div className="flex items-center gap-1 text-emerald-400">
              <Zap size={10} className="fill-current" />
              <span className="text-[9px] font-black tracking-[0.1em] uppercase">VERIFIED</span>
           </div>
           <div className="h-1 w-1 rounded-full bg-slate-700" />
           <div className="flex items-center gap-1.5 text-slate-600">
              <Star size={10} className="fill-current" />
              <span className="text-[9px] font-black tracking-[0.1em] uppercase">4.9 RANK</span>
           </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div>
             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">VALUATION</p>
             <span className="text-2xl font-black text-white tracking-tighter">LKR {Number(product.price).toLocaleString()}</span>
          </div>
          {typeof onAdd === 'function' && (
            <button
              onClick={() => onAdd(product)}
              disabled={Number(product.stock) < 1}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400 transition-all hover:bg-blue-600 hover:text-white hover:shadow-[0_10px_30px_rgba(59,130,246,0.4)] hover:translate-y-[-2px] disabled:opacity-20 shadow-xl border border-white/5"
            >
              <ShoppingCart size={22} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
