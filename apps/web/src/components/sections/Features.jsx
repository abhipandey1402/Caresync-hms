import * as Icons from 'lucide-react';
import { SectionWrapper } from '../ui/SectionWrapper';
import { Badge } from '../ui/Badge';
import { featuresConfig } from '../../config/features.config';

export function Features() {
  return (
    <SectionWrapper id="features" bgClass="bg-brand-bg">
      <div className="space-y-32">
        {featuresConfig.map((feat) => {
          const Icon = Icons[feat.iconName];
          const isLeft = feat.imageAlign === 'left';
          
          return (
            <div key={feat.id} className={`grid lg:grid-cols-2 gap-16 items-center ${isLeft ? '' : 'lg:-scale-x-100'}`}>
              
              {/* Image / Mockup side */}
              <div className={`relative ${isLeft ? '' : 'lg:-scale-x-100'}`}>
                <div className="aspect-square md:aspect-video lg:aspect-square bg-brand-muted rounded-[2rem] p-8 border border-brand-border flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green bg-opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* Abstract placeholder for the mockup */}
                  <div className="bg-white p-6 rounded-2xl shadow-soft border border-brand-border z-10">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-brand-muted">
                        <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                          {Icon && <Icon size={24} />}
                        </div>
                        <div>
                          <p className="font-bold">{feat.badge} Dashboard</p>
                          <p className="text-xs text-brand-textSec">CareSync HMS • Live</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-brand-muted rounded-full w-3/4"></div>
                      <div className="h-4 bg-brand-muted rounded-full w-full"></div>
                      <div className="h-4 bg-brand-muted rounded-full w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className={`${isLeft ? '' : 'lg:-scale-x-100'}`}>
                <div className="inline-flex items-center gap-2 mb-6">
                  <Badge color="green">{feat.badge}</Badge>
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">{feat.heading}</h3>
                <p className="text-lg text-brand-textSec mb-8 leading-relaxed">{feat.body}</p>
                
                <ul className="space-y-4">
                  {feat.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-brand-text">
                      <Icons.CheckCircle2 className="w-6 h-6 text-brand-greenMid shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
