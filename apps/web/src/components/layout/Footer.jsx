import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

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
