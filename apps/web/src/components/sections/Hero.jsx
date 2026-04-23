import { motion } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

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
            <Link to="/register">
              <Button size="lg">Start 90-Day Free Trial</Button>
            </Link>
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
