import { SectionWrapper } from '../ui/SectionWrapper';
import { Badge } from '../ui/Badge';
import { FileDigit, Banknote, Building2 } from 'lucide-react';

export function AbdmCompliance() {
  return (
    <SectionWrapper id="abdm" bgClass="bg-gradient-to-b from-[#E8F5EE] to-[#FAFDF9] border-y border-brand-border">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Badge className="mb-8">🏛️ ABDM Compliant • National Health Mission Partner</Badge>
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">ABHA-linked records. Ayushman Bharat ready.</h2>
        <p className="text-lg text-brand-textSec leading-relaxed">
          CareSync is registered on the Ayushman Bharat Digital Mission (ABDM) Health Facility Registry. Every patient can get an ABHA ID created right from the registration screen. This means your clinic is future-ready for cashless insurance, government health programs, and digital health incentives.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12 text-center mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-border flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center text-brand-green mb-6">
            <FileDigit size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">ABHA ID Creation</h3>
          <p className="text-sm text-brand-textSec">Create Ayushman Bharat Health Account IDs for patients during registration. One-tap OTP flow.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-border flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center text-brand-green mb-6">
            <Banknote size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">₹100/Year Incentive</h3>
          <p className="text-sm text-brand-textSec">Clinics earn ₹100 per new ABHA ID linked to their facility under NHA&apos;s incentive scheme.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-border flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center text-brand-green mb-6">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">HFR Registration</h3>
          <p className="text-sm text-brand-textSec">Your clinic gets registered on the Health Facility Registry — mandatory for Ayushman Bharat empanelment.</p>
        </div>
      </div>
      
      <p className="text-center text-sm font-bold text-brand-textSec">
        Note: ABDM registration typically takes 2–4 weeks. CareSync helps you through the entire process.
      </p>
    </SectionWrapper>
  );
}
