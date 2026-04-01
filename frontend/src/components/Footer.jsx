import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const links = [
  { icon: Facebook, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Linkedin, href: '#' },
];

const quickLinks = ['Home', 'Products', 'Dashboard', 'Cart'];
const supportLinks = ['Help Center', 'Shipping', 'Returns', 'Privacy'];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/85 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:items-start">
        <div>
          <h4 className="text-lg font-bold">NeoCart</h4>
          <p className="mt-2 text-sm text-slate-400">Modern marketplace for electronics, fashion, beauty, and home essentials.</p>
          <div className="mt-4 flex items-center justify-start gap-3">
            {links.map(({ icon: Icon, href }) => (
              <a key={href + Icon.name} href={href} className="rounded-xl border border-white/10 p-2 text-slate-200 hover:bg-white/10" aria-label={Icon.name}>
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Quick Links</h5>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {quickLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Support</h5>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {supportLinks.map((item) => (
              <li key={item}>{item}</li>
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
