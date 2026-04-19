import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseSrc = path.join(__dirname, 'apps/web/src/components');

const mkdir = (dir) => fs.mkdirSync(path.join(baseSrc, dir), { recursive: true });

const files = {};

// -------- LAYOUT -------- //

files['layout/Header.jsx'] = `
import { useState } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
import { navConfig } from '../../config/nav.config';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useScrollHeader } from '../../hooks/useScrollHeader';

export function Header() {
  const isScrolled = useScrollHeader(80);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={\`fixed top-0 inset-x-0 z-50 transition-all duration-300 \${isScrolled ? 'bg-white shadow-soft py-4' : 'bg-transparent py-6'}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white">
            <Leaf size={20} />
          </div>
          <span className="font-display font-bold text-2xl text-brand-green">{navConfig.brand}</span>
          <Badge className="hidden sm:inline-flex ml-2">{navConfig.badge}</Badge>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navConfig.links.map((link) => (
            <a key={link.label} href={link.href} className="text-brand-text font-medium hover:text-brand-green transition-colors">
              {link.label}
            </a>
          ))}
          <Badge color="green" className="border-brand-greenMid/30">{navConfig.abdmBadge}</Badge>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Button variant="ghost" size="sm">{navConfig.ctas[0].label}</Button>
          <Button variant="primary" size="sm">{navConfig.ctas[1].label}</Button>
        </div>

        <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-soft py-6 px-4 flex flex-col gap-6">
          <nav className="flex flex-col gap-4">
            {navConfig.links.map((link) => (
              <a key={link.label} href={link.href} className="text-lg font-bold" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-brand-border">
            <Button variant="outline" className="w-full">{navConfig.ctas[0].label}</Button>
            <Button variant="primary" className="w-full">{navConfig.ctas[1].label}</Button>
          </div>
        </div>
      )}
    </header>
  );
}
`;

files['layout/Footer.jsx'] = `
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';
import { SectionWrapper } from '../ui/SectionWrapper';

export function Footer() {
  return (
    <footer className="bg-brand-text text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Leaf size={20} />
              </div>
              <span className="font-display font-bold text-2xl">CareSync</span>
            </div>
            <p className="text-brand-muted/80 leading-relaxed">
              Hospital Management Software for Bharat. Built in India, for India.
            </p>
            <div className="text-sm text-brand-muted/60">Made with ❤️ in Patna</div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 font-display">Product</h4>
            <ul className="space-y-4 text-brand-muted/80">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">ABDM Compliance</a></li>
              <li><a href="#" className="hover:text-white">Security & Privacy</a></li>
              <li><a href="#" className="hover:text-white">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 font-display">Company</h4>
            <ul className="space-y-4 text-brand-muted/80">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Hindi Resources</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 font-display">Contact</h4>
            <ul className="space-y-4 text-brand-muted/80">
              <li className="flex items-center gap-3"><Phone size={18} className="text-brand-gold" /> +91 98765 43210</li>
              <li className="flex items-center gap-3"><Mail size={18} className="text-brand-gold" /> hello@caresync.in</li>
              <li className="flex items-start gap-3"><MapPin size={18} className="text-brand-gold shrink-0 mt-1" /> Patna, Bihar • Lucknow, UP</li>
            </ul>
            <p className="mt-6 text-sm text-brand-gold bg-brand-gold/10 px-4 py-2 rounded-lg inline-block">
              Support in Hindi: Mon–Sat 9AM–8PM
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-brand-muted/60 text-sm">
          <p>© 2024 CareSync Technologies Pvt. Ltd. • GST: 10ABCD1234E1Z5</p>
          <div className="flex gap-4">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <span>ABDM HFR Registered • Startup India Recognized</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
`;

// -------- SECTIONS -------- //

files['sections/Hero.jsx'] = `
import { motion } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden mesh-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Col */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <Badge>🇮🇳 Built for UP & Bihar • ABDM Compliant</Badge>
          
          <h1 className="mt-8 mb-6">
            <span className="block text-brand-gold text-2xl md:text-3xl font-display italic mb-2">आपके क्लीनिक के लिए</span>
            <span className="block text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-brand-green leading-[1.1]">
              The HMS Your Clinic Actually Needs
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-brand-textSec mb-8 leading-relaxed max-w-xl">
            Hindi-first. Works offline. WhatsApp billing in 30 seconds. Built for nursing homes and clinics in Tier-2 India — not Bangalore.
          </p>

          <div className="flex flex-wrap gap-4 mb-10 text-sm font-bold text-brand-green">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={18} /> No English required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={18} /> Works without internet</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={18} /> ₹999/month</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg">Start 90-Day Free Trial</Button>
            <Button variant="ghost" size="lg">Watch 3-min Demo →</Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-brand-textSec">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-muted flex items-center justify-center font-bold text-xs text-brand-green">
                  {['RS','PS','AK','MV'][i-1]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex text-brand-gold mb-1">
                {[...Array(5)].map((_,i)=><Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p>Trusted by 200+ clinics in Patna, Lucknow, Varanasi</p>
            </div>
          </div>
        </motion.div>

        {/* Right Col: Mockup */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 hidden md:block"
        >
          <div className="bg-white rounded-[2rem] shadow-soft border border-brand-border p-6 transform -rotate-2 relative">
            <div className="absolute -top-4 -right-4 bg-[#FF4B4B] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Offline: 3 syncs pending
            </div>
            
            {/* Mockup Header */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-muted">
              <div>
                <h3 className="font-bold text-lg">Sharma Nursing Home</h3>
                <p className="text-sm text-brand-textSec">आज की OPD: 42</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-brand-textSec">Revenue</p>
                <p className="font-bold text-brand-green">₹84,500</p>
              </div>
            </div>

            {/* Mockup Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-brand-bg p-4 rounded-xl text-center border border-brand-muted">
                <div className="text-2xl font-bold text-brand-green">42</div>
                <div className="text-xs text-brand-textSec">OPD Today</div>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl text-center border border-brand-muted">
                <div className="text-2xl font-bold text-brand-gold">12/20</div>
                <div className="text-xs text-brand-textSec">Beds</div>
              </div>
              <div className="bg-brand-bg p-4 rounded-xl text-center border border-brand-muted">
                <div className="text-xl font-bold text-[#FF4B4B]">₹12.5k</div>
                <div className="text-xs text-brand-textSec">Pending</div>
              </div>
            </div>

            {/* Mockup Queue */}
            <div className="space-y-3 mb-8">
              <div className="p-3 rounded-lg border border-brand-gold bg-brand-gold/5 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="font-bold text-brand-gold w-6">T7</span>
                  <span>Ramesh Kumar</span>
                </div>
                <Badge color="saffron">Waiting</Badge>
              </div>
              <div className="p-3 rounded-lg border border-brand-green bg-brand-green/5 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="font-bold text-brand-green w-6">T8</span>
                  <span>Sunita Devi</span>
                </div>
                <Badge color="green">In Progress</Badge>
              </div>
            </div>

            <Button className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white">
              Send Bill via WhatsApp
            </Button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
`;

files['sections/SocialProofBar.jsx'] = `
import { statsConfig } from '../../config/stats.config';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export function SocialProofBar() {
  return (
    <section className="bg-brand-muted py-16 border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl md:text-2xl text-brand-textSec font-medium mb-12">
          Clinics across UP & Bihar are switching from paper to CareSync
        </h2>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-brand-green font-bold text-sm md:text-base opacity-70 mb-16">
          <span>IMA Patna Partner</span>
          <span>ABDM Registered</span>
          <span>90-Day Free Trial</span>
          <span>24/7 Hindi Support</span>
          <span>₹999/month</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 text-center">
          {statsConfig.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-brand-green mb-2">
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-brand-textSec">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseSrc, file), content.trim() + '\\n');
});

console.log('Layout and Intro UI sections generated successfully!');
