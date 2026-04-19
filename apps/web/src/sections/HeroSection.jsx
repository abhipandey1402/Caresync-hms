import { ButtonLink } from "../components/ButtonLink.jsx";
import { SurfaceCard } from "../components/SurfaceCard.jsx";

export function HeroSection({ hero, trustBar }) {
  return (
    <section className="hero-grid">
      <div className="hero-copy">
        <p className="section-eyebrow">{hero.eyebrow}</p>
        <h1>{hero.title}</h1>
        <p className="hero-description">{hero.description}</p>

        <div className="hero-actions">
          {hero.actions.map((action) => (
            <ButtonLink key={action.label} href={action.href} variant={action.variant}>
              {action.label}
            </ButtonLink>
          ))}
        </div>

        <ul className="hero-highlights">
          {hero.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="trust-strip" aria-label="Capabilities">
          {trustBar.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <SurfaceCard className="hero-panel">
        <p className="panel-label">{hero.panel.label}</p>
        <h2>{hero.panel.title}</h2>
        <div className="hero-panel-list">
          {hero.panel.items.map((item) => (
            <div key={item.title} className="hero-panel-item">
              <div>
                <span>{item.title}</span>
                <strong>{item.value}</strong>
              </div>
              <p>{item.meta}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </section>
  );
}
