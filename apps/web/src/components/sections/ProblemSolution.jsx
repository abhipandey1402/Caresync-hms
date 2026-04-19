import { SectionWrapper } from '../ui/SectionWrapper';
import { ArrowDown } from 'lucide-react';

export function ProblemSolution() {
  return (
    <SectionWrapper id="problem-solution" bgClass="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Running a clinic shouldn't feel like this</h2>
        <p className="text-xl text-brand-textSec">Every day without CareSync looks the same</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-2xl bg-[#FFF5F5] border-l-4 border-l-[#FF4B4B] shadow-sm">
          <div className="text-2xl mb-4">🗒️</div>
          <h3 className="font-bold text-lg mb-2">Lost prescription? Rewrite from scratch — again.</h3>
          <p className="text-brand-textSec text-sm">Doctor rewrites the same Rx for the same patient every visit because records are on paper.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#FFF5F5] border-l-4 border-l-[#FF4B4B] shadow-sm">
          <div className="text-2xl mb-4">💸</div>
          <h3 className="font-bold text-lg mb-2">GST notice coming because your bills aren't compliant.</h3>
          <p className="text-brand-textSec text-sm">Handwritten bills with no GSTIN, no serial numbers, no tax breakdown.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#FFF5F5] border-l-4 border-l-[#FF4B4B] shadow-sm">
          <div className="text-2xl mb-4">💊</div>
          <h3 className="font-bold text-lg mb-2">Expired medicines discovered — ₹40,000 loss.</h3>
          <p className="text-brand-textSec text-sm">No expiry tracking, no alerts, no FIFO stock management.</p>
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="w-12 h-12 bg-brand-muted rounded-full flex items-center justify-center text-brand-green">
          <ArrowDown size={24} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-brand-muted border-l-4 border-l-brand-green shadow-sm">
          <div className="text-2xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2">Patient history in 3 seconds, forever.</h3>
          <p className="text-brand-textSec text-sm">UHID-tagged records, ABHA-linked, searchable by name or phone.</p>
        </div>
        <div className="p-6 rounded-2xl bg-brand-muted border-l-4 border-l-brand-green shadow-sm">
          <div className="text-2xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2">GST-compliant invoice sent to WhatsApp instantly.</h3>
          <p className="text-brand-textSec text-sm">Auto-calculated CGST/SGST, sequential invoice numbers, PDF on WhatsApp.</p>
        </div>
        <div className="p-6 rounded-2xl bg-brand-muted border-l-4 border-l-brand-green shadow-sm">
          <div className="text-2xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2">Expiry alerts 90 days before — never lose money.</h3>
          <p className="text-brand-textSec text-sm">Batch tracking, FIFO deduction, daily alerts on WhatsApp.</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
