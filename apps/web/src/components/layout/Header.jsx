import { useState } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
import { navConfig } from '../../config/nav.config';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import { Link } from 'react-router-dom';

export function Header() {
  const isScrolled = useScrollHeader(80);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderLink = (link, className) => {
    if (link.href.startsWith('/')) {
      return (
        <Link key={link.label} to={link.href} className={className} onClick={() => setMobileMenuOpen(false)}>
          {link.label}
        </Link>
      );
    }
    return (
      <a key={link.label} href={link.href} className={className} onClick={() => setMobileMenuOpen(false)}>
        {link.label}
      </a>
    );
  };

  const renderCTA = (cta, size = "sm") => {
    if (cta.href.startsWith('/')) {
      return (
        <Link key={cta.label} to={cta.href}>
          <Button variant={cta.variant} size={size}>{cta.label}</Button>
        </Link>
      );
    }
    return (
      <a key={cta.label} href={cta.href}>
        <Button variant={cta.variant} size={size}>{cta.label}</Button>
      </a>
    );
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-soft py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white">
            <Leaf size={20} />
          </div>
          <span className="font-display font-bold text-2xl text-brand-green">{navConfig.brand}</span>
          <Badge className="hidden sm:inline-flex ml-2">{navConfig.badge}</Badge>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navConfig.links.map((link) => renderLink(link, "text-brand-text font-medium hover:text-brand-green transition-colors"))}
          <Badge color="green" className="border-brand-greenMid/30">{navConfig.abdmBadge}</Badge>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {navConfig.ctas.map(cta => renderCTA(cta))}
        </div>

        <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-soft py-6 px-4 flex flex-col gap-6">
          <nav className="flex flex-col gap-4">
            {navConfig.links.map((link) => renderLink(link, "text-lg font-bold"))}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-brand-border">
            {navConfig.ctas.map(cta => renderCTA(cta, "default"))}
          </div>
        </div>
      )}
    </header>
  );
}
