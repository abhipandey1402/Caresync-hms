import { SectionIntro } from "../components/SectionIntro.jsx";
import { SurfaceCard } from "../components/SurfaceCard.jsx";

export function MetricsSection({ id, eyebrow, title, description, items }) {
  return (
    <section className="content-section metrics-section" id={id}>
      <SectionIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="metrics-grid">
        {items.map((item) => (
          <SurfaceCard key={item.label} className="metric-card">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
