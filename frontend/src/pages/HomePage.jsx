import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Box,
  Cpu,
  Gem,
  Layers,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { couponsApi, productsApi } from '../services/api';
import { circuitArt, heroArt, orbArt } from '../utils/visualArt';
import globalBgV2 from '../assets/global-bg-v2.png';

const fallbackProducts = [
  {
    id: 'fallback-1',
    name: 'NeuralLink X1',
    category_name: 'Augmented Reality Interface',
    price: 1299,
    image_url: heroArt('cyan'),
  },
  {
    id: 'fallback-2',
    name: 'Chronos V',
    category_name: 'Quantum Sync Timepiece',
    price: 850,
    image_url: heroArt('violet'),
  },
  {
    id: 'fallback-3',
    name: 'Ether Core',
    category_name: 'Modular Processing Unit',
    price: 2400,
    image_url: circuitArt(),
  },
  {
    id: 'fallback-4',
    name: 'Prism Orb',
    category_name: 'Kinetic Desktop Art',
    price: 420,
    image_url: orbArt(),
  },
];

const realms = [
  { name: 'Electronics', icon: Cpu },
  { name: 'Digital Assets', icon: Layers },
  { name: 'Aesthetics', icon: Shirt },
  { name: 'Collections', icon: Gem },
  { name: 'Components', icon: Box },
  { name: 'Energy', icon: Zap },
];

const fallbackCoupons = [
  { code: 'WELCOME15', label: '15% OFF' },
  { code: 'WATCH20', label: '20% OFF' },
  { code: 'SHIPFREE', label: 'FREE DELIVERY' },
];

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    Promise.all([productsApi.list({ limit: 8 }), couponsApi.list({ limit: 4 })])
      .then(([productsRes, couponsRes]) => {
        setFeatured(productsRes.data.data || []);
        setCoupons(couponsRes.data.data || []);
      })
      .catch(() => {
        setFeatured([]);
        setCoupons([]);
      });
  }, []);

  const showcaseItems = featured.length >= 4 ? featured.slice(0, 4) : fallbackProducts;

  const couponChips = useMemo(() => {
    if (!coupons.length) return fallbackCoupons;
    return coupons.slice(0, 3).map((coupon, index) => {
      const value = Number(coupon.discount_value || coupon.value || 10);
      const type = String(coupon.discount_type || 'percent').toLowerCase();
      const label = type.includes('flat') ? `LKR ${value} OFF` : `${value}% OFF`;
      return {
        code: coupon.code || `SAVE${index + 10}`,
        label,
      };
    });
  }, [coupons]);

  return (
    <div className="space-y-14 pb-20">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-950 shadow-[0_28px_80px_rgba(2,6,23,0.55)]">
        <img src={globalBgV2} alt="NeoCart Hero" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090c1b] via-[#071426]/55 to-[#081222]/20" />

        <div className="relative z-10 min-h-[560px] p-6 md:p-10 lg:p-12">
          <div className="max-w-xl pt-20 md:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/35 bg-sky-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-200">
              <Sparkles size={12} /> New Frontier Arrived
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">Shop the Future</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-200/90">
              Experience the next evolution of commerce. Hyper-curated digital and physical assets secured by the vault.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                Explore Marketplace
              </button>
              <Link
                to="/products"
                className="rounded-xl border border-white/25 bg-black/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Collections
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {couponChips.map((chip) => (
                <span
                  key={chip.code}
                  className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100"
                >
                  {chip.code} {chip.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Featured Innovations</h2>
            <p className="mt-1 text-sm text-slate-400">Hand-picked selections for the modern pioneer.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-sky-300 hover:text-sky-200">
            Browse all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {showcaseItems.map((item, index) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#1b203f] to-[#10142d] p-2.5 transition-all hover:-translate-y-1 hover:border-sky-300/50"
            >
              <div className="relative aspect-[4/4] overflow-hidden rounded-[1.1rem] bg-black/30">
                <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/20 bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-100">
                  {index === 0 ? 'Premium' : index === 3 ? 'Rare' : 'New'}
                </span>
                <img
                  src={item.image_url || item.image || fallbackProducts[index % fallbackProducts.length].image_url}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="px-1 pb-1 pt-3">
                <h3 className="text-lg font-semibold text-slate-100">{item.name}</h3>
                <p className="text-xs text-slate-400">{item.category_name || 'Featured Category'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-black text-sky-300">{formatPrice(item.price)}</span>
                  <button
                    type="button"
                    onClick={() => navigate(String(item.id).startsWith('fallback-') ? '/products' : `/products/${item.id}`)}
                    className="rounded-lg border border-sky-300/25 bg-sky-500/10 p-2 text-sky-200 transition-all hover:bg-sky-500/20"
                    aria-label={`Open ${item.name}`}
                  >
                    <ShoppingBag size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-7 text-center text-4xl font-black tracking-tight text-slate-100">Browse by Realm</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {realms.map((realm) => (
            <button
              key={realm.name}
              type="button"
              onClick={() => navigate('/products')}
              className="group rounded-[1.35rem] border border-white/10 bg-gradient-to-b from-[#1d223f] to-[#12162f] p-5 text-center transition-all hover:-translate-y-1 hover:border-sky-300/45"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition-all group-hover:bg-sky-400/20 group-hover:text-sky-200">
                <realm.icon size={22} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">{realm.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1d223f] via-[#151a36] to-[#11162d] p-7 shadow-[0_20px_60px_rgba(33,25,83,0.45)] lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">The NeoCart Ecosystem Vault</h2>
            <p className="mt-4 max-w-xl text-slate-300">
              Every purchase you make is backed by secure checkout, trusted logistics, and certified authenticity across modern product collections.
            </p>

            <div className="mt-6 space-y-2.5 text-sm text-slate-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-sky-200" /> Biometric Authenticity Checks
              </div>
              <div className="flex items-center gap-2.5">
                <Wallet size={16} className="text-sky-200" /> Multi-channel Wallet Support
              </div>
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-sky-200" /> Global Priority Logistics
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900 transition-all hover:bg-slate-200"
            >
              Learn About Security <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center backdrop-blur-lg">
                <p className="text-5xl font-black text-blue-300">99.9%</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-300">Uptime Protocol</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center backdrop-blur-lg">
                <p className="text-5xl font-black text-purple-300">256bit</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-300">Encryption Level</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25">
              <img src={circuitArt()} alt="Security vault" className="h-44 w-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-transparent to-transparent" />
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
                Active Defense Grid: Live
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
