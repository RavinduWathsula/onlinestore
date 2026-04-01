import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://x.com', label: 'X' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

const quickLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Products', to: '/products' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Cart', to: '/cart' },
];

const supportLinks = [
  { label: 'Help Center', href: 'mailto:support@neocart.local' },
  { label: 'Shipping', to: '/products' },
  { label: 'Returns', href: 'mailto:support@neocart.local?subject=Return%20Request' },
  { label: 'Privacy', to: '/home' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/85 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:items-start">
        <div>
          <h4 className="text-lg font-bold">NeoCart</h4>
          <p className="mt-2 text-sm text-slate-400">Modern marketplace for electronics, fashion, beauty, and home essentials.</p>
          <div className="mt-4 flex items-center justify-start gap-3">
            {links.map(({ icon: Icon, href, label }) => (
              <a
                key={href + Icon.name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 p-2 text-slate-200 hover:bg-white/10"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Quick Links</h5>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Support</h5>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {supportLinks.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link to={item.to} className="transition hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className="transition hover:text-white">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Stay Updated</h5>
          <p className="mt-3 text-sm text-slate-400">Get weekly drops and special discounts.</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            support@neocart.local
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-4 pt-4 text-xs text-slate-500">
        © {new Date().getFullYear()} NeoCart. All rights reserved.
      </div>
    </footer>
  );
}
