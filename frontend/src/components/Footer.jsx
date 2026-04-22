import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

function handleNavClick() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
    <footer className="relative z-30 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] py-10 pointer-events-auto">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:items-start">
        <div>
          <h4 className="text-lg font-bold text-[var(--text-primary)]">NeoCart</h4>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Modern marketplace for electronics, fashion, beauty, and home essentials.</p>
          <div className="mt-4 flex items-center justify-start gap-3">
            {links.map(({ icon: Icon, href, label }) => (
              <a
                key={href + Icon.name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[var(--border-color)] p-2 text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">Quick Links</h5>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link to={item.to} onClick={handleNavClick} className="transition hover:text-[var(--text-primary)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">Support</h5>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            {supportLinks.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link to={item.to} onClick={handleNavClick} className="transition hover:text-[var(--text-primary)]">
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className="transition hover:text-[var(--text-primary)]">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">Stay Updated</h5>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Get weekly drops and special discounts.</p>
          <div className="mt-3 rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] px-3 py-2 text-sm text-[var(--text-secondary)]">
            support@neocart.local
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-[var(--border-color)] px-4 pt-4 text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} NeoCart. All rights reserved.
      </div>
    </footer>
  );
}
