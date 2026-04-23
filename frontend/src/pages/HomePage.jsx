import { ArrowRight, Compass, Rocket, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SupportAgentWidget from '../components/SupportAgentWidget';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { couponsApi, productsApi } from '../services/api';

const fallbackFeatured = [
  {
    id: 'fallback-1',
    name: 'Nova Pulse Smartwatch',
    category_name: 'Electronics',
    price: 24990,
    stock: 18,
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'fallback-2',
    name: 'AeroTune Wireless Earbuds',
    category_name: 'Electronics',
    price: 12990,
    stock: 31,
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'fallback-3',
    name: 'NeoFit Active Sneaker',
    category_name: 'Fashion',
    price: 10950,
    stock: 26,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'fallback-4',
    name: 'Aura Lamp Pro',
    category_name: 'Home & Living',
    price: 8990,
    stock: 15,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'fallback-5',
    name: 'Vertex Urban Backpack',
    category_name: 'Lifestyle',
    price: 7490,
    stock: 21,
    image:
      'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'fallback-6',
    name: 'Hydra Steel Bottle',
    category_name: 'Lifestyle',
    price: 3890,
    stock: 42,
    image:
      'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?auto=format&fit=crop&w=1000&q=80',
  },
];

const categories = [
  {
    name: 'Electronics',
    icon: Sparkles,
    blurb: 'Audio, gadgets, and premium accessories from top brands.',
    tone: 'category-card--cyan',
  },
  {
    name: 'Fashion',
    icon: ShieldCheck,
    blurb: 'Streetwear, essentials, and trend collections updated daily.',
    tone: 'category-card--violet',
  },
  {
    name: 'Home & Living',
    icon: Truck,
    blurb: 'Smart decor, kitchen gear, and comfort-first home picks.',
    tone: 'category-card--teal',
  },
  {
    name: 'Lifestyle',
    icon: Compass,
    blurb: 'Fitness, travel, and hobby products curated for modern living.',
    tone: 'category-card--rose',
  },
];

const testimonials = [
  { name: 'Anjula S.', text: 'NeoCart is fast, elegant, and very easy to use. Great shopping experience.' },
  { name: 'Ravindu W.', text: 'The checkout flow is smooth and product discovery feels premium.' },
  { name: 'Kavindu M.', text: 'Best local marketplace design I have used so far.' },
];

const customerReviews = [
  {
    name: 'Nethmi K.',
    location: 'Colombo',
    rating: 5,
    title: 'Super fast delivery',
    text: 'Ordered at night and got my package the next day. Product quality was exactly as shown.',
    tone: 'review-card--aqua',
  },
  {
    name: 'Isuru P.',
    location: 'Kandy',
    rating: 5,
    title: 'Checkout is really smooth',
    text: 'I liked how simple the payment flow is. Discounts and coupons worked without any issue.',
    tone: 'review-card--violet',
  },
  {
    name: 'Hashini F.',
    location: 'Galle',
    rating: 4,
    title: 'Great support and tracking',
    text: 'Support team replied quickly and order tracking updates were clear from start to finish.',
    tone: 'review-card--blue',
  },
];

const spotlightFeatures = [
  {
    title: 'Live deals',
    subtitle: 'Updated every hour with trending discounts.',
    value: 'Up to 55%',
    tone: 'deal-card--blue',
  },
  {
    title: 'Fast shipping',
    subtitle: 'Island-wide delivery with real-time tracking.',
    value: '24-48h',
    tone: 'deal-card--aqua',
  },
  {
    title: 'Protected checkout',
    subtitle: 'Encrypted payment and fraud detection always on.',
    value: '100%',
    tone: 'deal-card--violet',
  },
];

const fallbackCouponDrops = [
  {
    code: 'FREESHIP01',
    title: 'Free Delivery Coupon #1',
    description: 'Removes LKR 450 delivery fee at checkout for all products.',
    type: 'free_delivery',
    value: 450,
  },
  {
    code: 'FREESHIP02',
    title: 'Free Delivery Coupon #2',
    description: 'Second free-delivery coupon valid for any checkout.',
    type: 'free_delivery',
    value: 450,
  },
  {
    code: 'SAVE5ALL',
    title: '5% Off Coupon',
    description: 'Get 5% discount on product subtotal for all products.',
    type: 'percent',
    value: 5,
  },
];

export default function HomePage() {
  const { user, coupons, addCoupon } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [featured, setFeatured] = useState([]);
  const [couponDrops, setCouponDrops] = useState(fallbackCouponDrops);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const canvasRef = useRef(null);
  const displayFeatured = featured.length ? featured : fallbackFeatured;

  useEffect(() => {
    productsApi
      .list({ page: 1, limit: 12 })
      .then((res) => setFeatured(res.data.data || []))
      .catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    couponsApi
      .list()
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        setCouponDrops(rows.length ? rows : fallbackCouponDrops);
      })
      .catch(() => setCouponDrops(fallbackCouponDrops));
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame;
    let width = 0;
    let height = 0;
    const pointer = { x: 0.5, y: 0.5 };

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.002 + 0.0006,
      radius: Math.random() * 1.8 + 0.5,
    }));

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(height * window.devicePixelRatio));
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(
        width * pointer.x,
        height * pointer.y,
        30,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      gradient.addColorStop(0, 'rgba(80,140,255,0.16)');
      gradient.addColorStop(1, 'rgba(3,7,18,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > 1.04) {
          star.y = -0.04;
          star.x = Math.random();
        }

        const depth = 1 + star.z * 1.8;
        const offsetX = (pointer.x - 0.5) * 44 * star.z;
        const offsetY = (pointer.y - 0.5) * 28 * star.z;
        const x = star.x * width + offsetX;
        const y = star.y * height * depth + offsetY;

        context.beginPath();
        context.arc(x, y, star.radius * star.z, 0, Math.PI * 2);
        context.fillStyle = `rgba(164, 194, 255, ${0.24 + star.z * 0.48})`;
        context.fill();
      });

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', onMove);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTestimonial((value) => (value + 1) % testimonials.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="home-shell relative space-y-14">
      <section className="home-hero home-section relative overflow-hidden rounded-3xl border border-[var(--border-color)] p-8 md:p-12">
        <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-16 top-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="hero-eyebrow mb-3 inline-flex rounded-full border border-blue-300/40 bg-blue-400/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-blue-200">
              NeoCart premium marketplace
            </p>
            <h1 className="hero-title hero-title--glow text-4xl font-extrabold leading-tight md:text-6xl">
              Experience shopping in a more immersive way.
            </h1>
            <p className="mt-4 max-w-xl text-[var(--text-secondary)] md:text-lg">
              NeoCart blends curated products, smart discovery, and secure checkout in one futuristic storefront.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary gap-2 shadow-[0_10px_40px_rgba(37,99,235,0.3)]">
                Start shopping <ArrowRight size={16} />
              </Link>
              {!user && (
                <Link to="/register" className="btn-secondary">
                  Join NeoCart
                </Link>
              )}
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
              <div className="stat-chip stat-chip--animated">
                <p className="text-xl font-bold text-[var(--text-primary)]">12K+</p>
                <p className="text-xs text-[var(--text-muted)]">Products</p>
              </div>
              <div className="stat-chip stat-chip--animated stat-chip--delay-1">
                <p className="text-xl font-bold text-[var(--text-primary)]">850+</p>
                <p className="text-xs text-[var(--text-muted)]">Vendors</p>
              </div>
              <div className="stat-chip stat-chip--animated stat-chip--delay-2">
                <p className="text-xl font-bold text-[var(--text-primary)]">4.9</p>
                <p className="text-xs text-[var(--text-muted)]">User rating</p>
              </div>
            </div>
          </div>
          <div className="holo-showcase">
            <div className="holo-container">
              <div className="holo-glow" />
              <div className="holo-ring" />
              <div className="holo-ring holo-ring--small" />
              <img 
                src="/src/assets/hero-hologram.png" 
                alt="Futuristic Showcase" 
                className="holo-image" 
              />
              
              {/* Creative Idea: Interactive Data Nodes */}
              <div className="holo-data-node holo-data-node--1">
                <Sparkles size={14} className="text-blue-400" />
                <span>Next-Gen Audio</span>
              </div>
              <div className="holo-data-node holo-data-node--2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Verified Tech</span>
              </div>
              <div className="holo-data-node holo-data-node--3">
                <Rocket size={14} className="text-indigo-400" />
                <span>Fast Launch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section--featured space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">Highlighted now</p>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Featured products</h2>
            {!featured.length ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Live products are loading. Showing curated picks now.</p>
            ) : null}
          </div>
          <Link to="/products" className="text-sm text-blue-500 hover:text-blue-400">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayFeatured.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-section grid gap-4 md:grid-cols-3">
        {spotlightFeatures.map((feature) => (
          <article key={feature.title} className={`deal-card ${feature.tone}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">{feature.title}</p>
            <p className="mt-2 text-3xl font-black text-white">{feature.value}</p>
            <p className="mt-2 text-sm text-slate-100">{feature.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="home-section home-section--featured space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">Coupon drops</p>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Collect discounts for checkout</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Coupons are now managed by admins. Collect one and apply it at checkout.
            </p>
          </div>
          <Link to="/dashboard" className="text-sm text-blue-500 hover:text-blue-400">
            View in dashboard
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {couponDrops.map((coupon) => {
            const collected = coupons.some((item) => item.code === coupon.code);
            return (
              <article key={coupon.code} className="deal-card deal-card--blue">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-100/90">{coupon.code}</p>
                <h3 className="mt-2 text-lg font-bold text-white">{coupon.title}</h3>
                <p className="mt-2 text-sm text-slate-100">{coupon.description}</p>
                <p className="mt-2 text-xs text-blue-100/80">
                  {coupon.type === 'percent'
                    ? `${Number(coupon.value || 0)}% off`
                    : coupon.type === 'free_delivery'
                      ? 'Free delivery'
                      : `LKR ${Number(coupon.value || 0).toFixed(2)} off`}
                </p>
                <button
                  type="button"
                  className="btn-primary mt-4 w-full"
                  disabled={collected}
                  onClick={() => {
                    if (!user) {
                      showToast('Login to collect coupons', 'error');
                      return;
                    }
                    const ok = addCoupon(coupon);
                    showToast(ok ? `${coupon.code} collected` : `${coupon.code} already collected`);
                  }}
                >
                  {collected ? 'Collected' : 'Collect coupon'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-section space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">Discover more</p>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Featured categories</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              to={`/products?category=${category.name}`} 
              className={`category-card ${category.tone} block transition-transform hover:scale-[1.02]`}
            >
              <category.icon className="mb-3 text-blue-500" size={22} />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{category.name}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{category.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="glass home-subpanel p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">Why NeoCart</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Built for speed, trust, and better buying.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="mb-2 text-emerald-300" size={18} />
              <p className="text-sm font-semibold">Protected payments</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Truck className="mb-2 text-blue-300" size={18} />
              <p className="text-sm font-semibold">Smart logistics</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Star className="mb-2 text-amber-300" size={18} />
              <p className="text-sm font-semibold">Quality rated</p>
            </div>
          </div>
        </div>

        <div className="glass home-subpanel p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">Customer voices</p>
          <blockquote className="mt-3 min-h-[120px] text-lg text-[var(--text-primary)] transition-all duration-500">
            "{testimonials[activeTestimonial].text}"
          </blockquote>
          <p className="mt-3 text-sm text-blue-500">{testimonials[activeTestimonial].name}</p>
          <div className="mt-5 flex gap-2">
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveTestimonial(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeTestimonial ? 'w-8 bg-blue-300' : 'w-3 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="glass home-section overflow-hidden p-6 md:p-8">
        <div className="review-head">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">Trusted by shoppers</p>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Customer reviews and ratings</h2>
          </div>
          <div className="review-score">
            <p className="text-3xl font-black text-[var(--text-primary)]">4.9/5</p>
            <div className="review-stars" aria-label="Average rating 4.9 out of 5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={`avg-star-${star}`} size={16} className="fill-amber-300 text-amber-300" />
              ))}
            </div>
            <p className="text-xs text-blue-200">Based on 2,400+ verified purchases</p>
          </div>
        </div>

        <div className="review-grid">
          {customerReviews.map((review) => (
            <article key={review.name} className={`review-card ${review.tone}`}>
              <div className="review-stars" aria-label={`${review.rating} star rating`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={`${review.name}-star-${star}`}
                    size={15}
                    className={star <= review.rating ? 'fill-amber-300 text-amber-300' : 'text-slate-500'}
                  />
                ))}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{review.title}</h3>
              <p className="mt-2 text-sm text-slate-100">{review.text}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-blue-100/90">
                {review.name} • {review.location}
              </p>
            </article>
          ))}
        </div>
      </section>

      <SupportAgentWidget />
    </div>
  );
}
