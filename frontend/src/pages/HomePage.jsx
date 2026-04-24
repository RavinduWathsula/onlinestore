import { ArrowRight, Box, Cpu, Gem, Layers, Shirt, ShieldCheck, ShoppingBag, Sparkles, Tag, TicketPercent, Wallet, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { couponsApi, productsApi } from '../services/api';
import { circuitArt, heroArt, orbArt } from '../utils/visualArt';
import heroHologram from '../assets/hero-hologram.png';
import globalBgV2 from '../assets/global-bg-v2.png';

const innovationFallback = [
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
    image_url: circuitArt(),
  },
  {
    id: 'fallback-3',
    name: 'Ether Core',
    category_name: 'Modular Processing Unit',
    price: 2400,
    image_url: heroArt('violet'),
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
  {
    id: 'coupon-fallback-1',
    code: 'WELCOME15',
    label: '15% OFF',
    description: 'New customer discount for first checkout',
    minOrder: 'Min order LKR 5,000',
    expires: 'Limited time',
  },
  {
    id: 'coupon-fallback-2',
    code: 'WATCH20',
    label: '20% OFF',
    description: 'Smart watches and wearables sale',
    minOrder: 'Selected products',
    expires: 'This week',
  },
  {
    id: 'coupon-fallback-3',
    code: 'SHIPFREE',
    label: 'Free Delivery',
    description: 'Get islandwide delivery at no extra cost',
    minOrder: 'Orders above LKR 7,500',
    expires: 'Weekend deal',
  },
  {
    id: 'coupon-fallback-4',
    code: 'MEGA30',
    label: '30% OFF',
    description: 'Mega discount for featured collections',
    minOrder: 'Min order LKR 12,000',
    expires: 'Flash offer',
  },
];

const promoSlides = [
  {
    id: 'promo-1',
    title: 'Smart Watch Carnival',
    subtitle: 'Track your fitness and style with up to 20% discount.',
    image: heroArt('violet'),
    cta: 'Explore Watches',
  },
  {
    id: 'promo-2',
    title: 'Weekend Tech Festival',
    subtitle: 'Autoplay deals every few seconds on top gadgets.',
    image: heroHologram,
    cta: 'See Hot Deals',
  },
  {
    id: 'promo-3',
    title: 'Coupon Drop Active',
    subtitle: 'Apply coupon codes and save instantly at checkout.',
    image: globalBgV2,
    cta: 'Unlock Coupons',
  },
];

const discountRates = [10, 15, 20, 25];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [adIndex, setAdIndex] = useState(0);

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setAdIndex((prev) => (prev + 1) % promoSlides.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  const innovationItems = featured.length > 0 ? featured : innovationFallback;
  const moreItems = featured.length > 4 ? featured.slice(4, 8) : innovationFallback;
  const discountItems = [...innovationItems, ...moreItems].slice(0, 4).map((item, index) => {
    const discount = discountRates[index % discountRates.length];
    const currentPrice = Number(item.price || 0);
    const oldPrice = Math.round(currentPrice / (1 - discount / 100));

    return {
      ...item,
      discount,
      currentPrice,
      oldPrice,
    };
  });

  const couponItems = (coupons.length ? coupons : fallbackCoupons).map((coupon, index) => {
    if (coupon.label && coupon.minOrder) {
      return coupon;
    }

    const value = Number(coupon.discount_value || coupon.value || 10);
    const type = String(coupon.discount_type || 'percent').toLowerCase();
    const label = type.includes('flat') ? `LKR ${value} OFF` : `${value}% OFF`;

    return {
      id: coupon.id || `coupon-${index}`,
      code: coupon.code || `SAVE${10 + index * 5}`,
      label,
      description: coupon.description || 'Save instantly on checkout',
      minOrder: coupon.min_order ? `Min order LKR ${Number(coupon.min_order).toLocaleString()}` : 'Selected products',
      expires: coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Limited time',
    };
  });

  return (
    <div className="space-y-14 pb-20">
      <section className="relative overflow-hidden rounded-[28px] border border-[#8f8fd1]/30 bg-[#6365b3] shadow-[0_24px_80px_rgba(44,31,107,0.45)]">
        <div className="absolute inset-0">
          <img
            src={globalBgV2}
            alt="Online shopping visual"
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_52%,rgba(73,76,175,0.95)_0%,rgba(73,76,175,0.74)_26%,transparent_27%),radial-gradient(circle_at_78%_20%,rgba(77,79,174,0.72)_0%,transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#5f63b3]/85 via-[#5f63b3]/40 to-[#4e52a4]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_86%,rgba(168,157,220,0.35)_0%,transparent_20%),radial-gradient(circle_at_91%_24%,rgba(167,157,218,0.25)_0%,transparent_16%)]" />
        </div>

        <div className="relative z-10 grid min-h-[620px] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center px-6 py-10 md:px-12 lg:px-14">
            <div className="max-w-xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#7c7ec8]/25 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                <Sparkles size={13} /> E-Commerce Platform
              </span>
              <h1 className="max-w-lg text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                Online
                <br />
                Shopping
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#e8e8ff] md:text-[17px]">
                Discover a colorful storefront for electronics, lifestyle products, and exclusive digital goods. Fast checkout, trusted delivery, and premium support.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="rounded-full bg-[#d7b0d8] px-8 py-3 text-base font-black uppercase tracking-[0.04em] text-[#4d499f] transition-all hover:brightness-110"
                >
                  Shop Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-slate-100 backdrop-blur-lg transition-all hover:bg-white/20"
                >
                  View Collections
                </button>
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
                <div className="flex -space-x-2.5">
                  {['A', 'B', 'C'].map((char) => (
                    <div
                      key={char}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0f1118] bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-white"
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <span className="italic text-[#dddaf9]">Trusted by 12k+ shoppers</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-end justify-center overflow-hidden px-6 pb-10 pt-4 md:px-12 lg:px-10 lg:pb-12">
            <div className="relative w-full max-w-[500px]">
              <div className="absolute -left-8 top-12 h-56 w-56 rounded-full bg-[#a99ce0]/20 blur-3xl" />
              <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#8c76d4]/25 blur-3xl" />

              <div
                className="relative mx-auto h-[430px] w-[310px] overflow-hidden rounded-[2.4rem] border border-white/20 bg-[#6c70ba]/50 shadow-[0_30px_60px_rgba(52,42,115,0.55)]"
                style={{ transform: 'perspective(1200px) rotateY(-12deg) rotateX(7deg) translateY(-8px)', animation: 'floatCard 7s ease-in-out infinite' }}
              >
                <img
                  src={heroHologram}
                  alt="Shopping hologram"
                  className="h-full w-full object-cover object-top saturate-125 opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3c3a86]/40 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(222,206,255,0.2)_0%,transparent_34%),linear-gradient(to_top,rgba(62,52,125,0.2),transparent_60%)]" />
              </div>

              <div
                className="absolute -right-2 top-10 h-36 w-36 rounded-[1.6rem] border border-white/20 bg-[#6568b7]/75 p-4 shadow-[0_20px_40px_rgba(58,50,120,0.35)] backdrop-blur-lg"
                style={{ transform: 'perspective(900px) rotateX(18deg) rotateY(-12deg)' }}
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#e7e4ff]">Deals</p>
                <p className="mt-2 text-4xl font-black text-white">54</p>
                <p className="mt-1 text-xs text-[#efecff]">Live Offers</p>
              </div>

              <div
                className="absolute -left-3 bottom-2 h-36 w-36 rounded-[1.6rem] border border-white/20 bg-[#6568b7]/75 p-4 shadow-[0_20px_40px_rgba(58,50,120,0.35)] backdrop-blur-lg"
                style={{ transform: 'perspective(900px) rotateX(-16deg) rotateY(12deg)' }}
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#e7e4ff]">Shipping</p>
                <p className="mt-2 text-4xl font-black text-white">24h</p>
                <p className="mt-1 text-xs text-[#efecff]">Fast Dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-white/10 bg-gradient-to-r from-[#161a3b] via-[#24295f] to-[#1a1f47] p-4 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">Auto Play Deals</h2>
          <span className="rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-violet-100">Live Ads</span>
        </div>

        <div className="relative h-[230px] overflow-hidden rounded-[1.35rem] border border-white/10 md:h-[280px]">
          {promoSlides.map((slide, index) => (
            <article
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${adIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070b1d]/90 via-[#070b1d]/55 to-[#070b1d]/35" />
              <div className="relative z-10 flex h-full flex-col justify-center px-5 md:px-8">
                <h3 className="text-2xl font-black text-white md:text-4xl">{slide.title}</h3>
                <p className="mt-2 max-w-xl text-sm text-violet-100 md:text-base">{slide.subtitle}</p>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#1b1f45] transition-all hover:bg-white"
                >
                  {slide.cta} <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}

          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            {promoSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setAdIndex(index)}
                className={`h-2.5 rounded-full transition-all ${adIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
                aria-label={`View ${slide.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Trending Products And Watches</h2>
            <p className="mt-1 text-sm text-violet-200/75">See other products, smart watches, and latest arrivals.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-violet-300 hover:text-violet-200">
            Browse all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {moreItems.slice(0, 4).map((item, index) => (
            <article
              key={`more-${item.id}`}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#1f2248] to-[#151833] p-2.5 transition-all hover:-translate-y-1 hover:border-violet-300/50"
            >
              <div className="relative aspect-[4/4] overflow-hidden rounded-[1.1rem] bg-black/30">
                <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/20 bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-violet-100">
                  {index === 1 ? 'Watch' : 'Trending'}
                </span>
                <img
                  src={(featured.length > 4 ? item.image_url || item.image : innovationFallback[index].image_url) || innovationFallback[index].image_url}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="px-1 pb-1 pt-3">
                <h3 className="text-lg font-semibold text-slate-100">{item.name}</h3>
                <p className="text-xs text-slate-400">{item.category_name || 'Featured Category'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-black text-violet-200">${Number(item.price || 0).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => navigate(item.id.toString().startsWith('fallback-') ? '/products' : `/products/${item.id}`)}
                    className="rounded-lg border border-violet-300/25 bg-violet-500/10 p-2 text-violet-200 transition-all hover:bg-violet-500/20"
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
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Coupons And Discounts</h2>
            <p className="mt-1 text-sm text-violet-200/75">Use these coupon codes at checkout and save more.</p>
          </div>
          <span className="rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-100">Coupon Vault</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {couponItems.slice(0, 4).map((coupon) => (
            <article key={coupon.id} className="rounded-[1.3rem] border border-white/10 bg-gradient-to-b from-[#25295b] to-[#171b3e] p-4 shadow-[0_10px_25px_rgba(18,20,55,0.4)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-300/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-violet-100">
                  <TicketPercent size={11} /> {coupon.label}
                </span>
                <Tag size={14} className="text-violet-200" />
              </div>
              <p className="mt-3 text-xl font-black text-white">{coupon.code}</p>
              <p className="mt-2 text-xs text-slate-300">{coupon.description}</p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-200/90">{coupon.minOrder}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-400">Expires: {coupon.expires}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Featured Collections</h2>
            <p className="mt-1 text-sm text-violet-200/75">Hand-picked products in your new colorful storefront.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-violet-300 hover:text-violet-200">
            View all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {innovationItems.slice(0, 4).map((item, index) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#23264f] to-[#171a37] p-2.5 transition-all hover:-translate-y-1 hover:border-violet-300/50"
            >
              <div className="relative aspect-[4/4] overflow-hidden rounded-[1.1rem] bg-black/30">
                <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/20 bg-[#5e60b8]/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-violet-100">
                  {index % 2 === 0 ? 'Premium' : 'New'}
                </span>
                <img
                  src={innovationFallback[index].image_url}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="px-1 pb-1 pt-3">
                <h3 className="text-lg font-semibold text-slate-100">{item.name}</h3>
                <p className="text-xs text-slate-400">{item.category_name || 'Curated Category'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-black text-violet-200">${Number(item.price || 0).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => navigate(item.id.toString().startsWith('fallback-') ? '/products' : `/products/${item.id}`)}
                    className="rounded-lg border border-violet-300/25 bg-violet-500/10 p-2 text-violet-200 transition-all hover:bg-violet-500/20"
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
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Discount Drop Zone</h2>
            <p className="mt-1 text-sm text-violet-200/75">Scroll down and catch these markdown prices on home page.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {discountItems.map((item) => (
            <article key={`discount-${item.id}`} className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-gradient-to-b from-[#232652] to-[#171a37] p-2.5">
              <div className="relative aspect-[4/4] overflow-hidden rounded-[1.1rem] bg-black/30">
                <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-rose-500/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                  -{item.discount}%
                </span>
                <img
                  src={item.image_url || item.image || heroArt('cyan')}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="px-1 pb-1 pt-3">
                <h3 className="text-lg font-semibold text-slate-100">{item.name}</h3>
                <p className="mt-2 text-xs text-slate-400">Limited discount item</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-black text-violet-200">LKR {item.currentPrice.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-slate-500 line-through">LKR {item.oldPrice.toLocaleString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-7 text-center text-4xl font-black tracking-tight text-slate-100">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {realms.map((realm) => (
            <button
              key={realm.name}
              type="button"
              onClick={() => navigate('/products')}
              className="group rounded-[1.35rem] border border-white/10 bg-gradient-to-b from-[#23264d] to-[#181b39] p-5 text-center transition-all hover:-translate-y-1 hover:border-violet-300/45"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition-all group-hover:bg-violet-400/20 group-hover:text-violet-200">
                <realm.icon size={22} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">{realm.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#25295a] via-[#1c2147] to-[#171c3b] p-7 shadow-[0_20px_60px_rgba(33,25,83,0.5)] lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Your colorful commerce ecosystem</h2>
            <p className="mt-4 max-w-xl text-slate-300">
              Every purchase is protected with secure checkout, flexible payment options, and trusted delivery tracking. Manage modern products in one seamless shopping experience.
            </p>

            <div className="mt-6 space-y-2.5 text-sm text-slate-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-violet-200" /> Secure Purchase Protection
              </div>
              <div className="flex items-center gap-2.5">
                <Wallet size={16} className="text-violet-200" /> Multiple Payment Methods
              </div>
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-violet-200" /> Fast Regional Logistics
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
              <img
                src={circuitArt()}
                alt="Security vault"
                className="h-44 w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-transparent to-transparent" />
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
                Active Defense Grid: Live
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-violet-300/20 bg-[#141835] py-4">
        <div className="discount-ticker-track">
          {[...couponItems, ...couponItems].map((coupon, index) => (
            <span key={`${coupon.id}-${index}`} className="discount-ticker-item">
              {coupon.code} {coupon.label} {coupon.minOrder}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
