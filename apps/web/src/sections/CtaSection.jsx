import { ButtonLink } from "../components/ButtonLink.jsx";
import { SectionIntro } from "../components/SectionIntro.jsx";

export function CtaSection({
  id,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  return (
    <section className="cta-banner" id={id}>
      <SectionIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="cta-actions">
        <ButtonLink href={primaryAction.href}>{primaryAction.label}</ButtonLink>
        <ButtonLink href={secondaryAction.href} variant="ghost">
          {secondaryAction.label}
        </ButtonLink>
      </div>
    </section>
  );
}
