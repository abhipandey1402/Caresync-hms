import { SectionIntro } from "../components/SectionIntro.jsx";
import { SurfaceCard } from "../components/SurfaceCard.jsx";

export function FeatureGridSection({ id, eyebrow, title, description, items }) {
  return (
    <section className="content-section" id={id}>
      <SectionIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="feature-grid">
        {items.map((item) => (
          <SurfaceCard key={item.title} className="feature-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
