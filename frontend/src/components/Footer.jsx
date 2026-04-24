import { Facebook, Instagram, Linkedin, Twitter, Globe, Cpu, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

function handleNavClick() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const socialLinks = [
  { icon: Twitter, href: 'https://x.com', label: 'X' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

const ecosystemLinks = [
  { label: 'Neural Store', to: '/products' },
  { label: 'Hardware Lab', to: '/products' },
  { label: 'Asset Vault', to: '/dashboard' },
  { label: 'Protocol Specs', to: '/home' },
];

const protocolLinks = [
  { label: 'Shipping Logistics', to: '/products' },
  { label: 'Return Interface', href: 'mailto:support@neocart.local' },
  { label: 'Privacy Cryptography', to: '/home' },
  { label: 'Security Audits', to: '/home' },
];

export default function Footer() {
  return (
    <footer className="relative z-30 border-t border-white/5 bg-slate-950 py-20 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
             <div className="flex items-center gap-2 mb-6">
                <Cpu className="text-blue-500" size={28} />
                <span className="text-2xl font-black tracking-tighter text-white">NEOCART</span>
             </div>
             <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                The world's most advanced marketplace for futuristic hardware and neural-integrated assets. Engineered for the next generation of digital operators.
             </p>
             <div className="mt-8 flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-slate-900 text-slate-500 hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-white transition-all"
                    aria-label={label}
                  >
                    <Icon size={18} />
                  </a>
                ))}
             </div>
          </div>

          <div>
             <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Ecosystem</h5>
             <ul className="space-y-4">
                {ecosystemLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} onClick={handleNavClick} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
             </ul>
          </div>

          <div>
             <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Protocols</h5>
             <ul className="space-y-4">
                {protocolLinks.map((item) => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to} onClick={handleNavClick} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
             </ul>
          </div>

          <div>
             <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Contact Node</h5>
             <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-500 group-hover:text-blue-400 transition-colors">
                      <Mail size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Support Email</p>
                      <p className="text-sm font-bold text-white">ops@neocart.io</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 group">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-500 group-hover:text-purple-400 transition-colors">
                      <Phone size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Link</p>
                      <p className="text-sm font-bold text-white">+94 77 123 4567</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              © {new Date().getFullYear()} NEOCART INTERACTIVE. ALL PROTOCOLS RESERVED.
           </p>
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                 <Globe size={14} /> STATUS: NOMINAL
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                 SECURE SESSION ENABLED
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
