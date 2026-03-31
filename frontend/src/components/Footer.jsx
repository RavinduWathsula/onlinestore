import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const links = [
  { icon: Facebook, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Linkedin, href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-10">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-2 md:items-center">
        <div>
          <h4 className="text-lg font-bold">NeoCart</h4>
          <p className="mt-2 text-sm text-slate-400">Modern marketplace for electronics, fashion, beauty, and home essentials.</p>
        </div>
        <div className="flex items-center justify-start gap-3 md:justify-end">
          {links.map(({ icon: Icon, href }) => (
            <a key={href + Icon.name} href={href} className="rounded-xl border border-white/10 p-2 text-slate-200 hover:bg-white/10" aria-label={Icon.name}>
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
