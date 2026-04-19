import { SectionWrapper } from '../ui/SectionWrapper';
import { comparisonConfig } from '../../config/comparison.config';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function ComparisonTable() {
  const getIcon = (pass) => {
    if (pass === true) return <CheckCircle2 className="w-5 h-5 text-brand-greenMid mx-auto md:mx-0" />;
    if (pass === false) return <XCircle className="w-5 h-5 text-[#FF4B4B] mx-auto md:mx-0" />;
    if (pass === 'warn') return <AlertCircle className="w-5 h-5 text-brand-gold mx-auto md:mx-0" />;
    return <span className="text-brand-textSec text-sm">-</span>;
  };

  return (
    <SectionWrapper id="compare" bgClass="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold">CareSync vs other HMS software</h2>
      </div>

      <div className="overflow-x-auto pb-8">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-border">
              <th className="text-left p-4 font-bold text-brand-textSec w-1/4">{comparisonConfig.headers[0]}</th>
              <th className="text-left p-4 font-bold text-brand-green bg-brand-muted rounded-t-xl w-1/4">{comparisonConfig.headers[1]}</th>
              <th className="text-left p-4 font-bold text-brand-textSec w-1/4">{comparisonConfig.headers[2]}</th>
              <th className="text-left p-4 font-bold text-brand-textSec w-1/4">{comparisonConfig.headers[3]}</th>
            </tr>
          </thead>
          <tbody>
            {comparisonConfig.rows.map((row, i) => (
              <tr key={i} className="border-b border-brand-border/50 hover:bg-brand-muted/20 transition-colors">
                <td className="p-4 font-bold text-brand-text">{row.feature}</td>
                <td className="p-4 font-bold text-brand-text bg-brand-muted/40">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {getIcon(row.caresync.pass)}
                    <span className="hidden md:inline">{row.caresync.val}</span>
                  </div>
                </td>
                <td className="p-4 text-brand-textSec text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {getIcon(row.comp.pass)}
                    <span className="hidden md:inline">{row.comp.val}</span>
                  </div>
                </td>
                <td className="p-4 text-brand-textSec text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {getIcon(row.paper.pass)}
                    <span className="hidden md:inline">{row.paper.val}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
