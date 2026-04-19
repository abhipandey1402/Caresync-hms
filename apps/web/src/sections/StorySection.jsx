import { SectionIntro } from "../components/SectionIntro.jsx";
import { SurfaceCard } from "../components/SurfaceCard.jsx";

export function StorySection({ id, eyebrow, title, points }) {
  return (
    <section className="story-grid" id={id}>
      <SectionIntro eyebrow={eyebrow} title={title} />
      <SurfaceCard className="story-card">
        <ul className="story-list">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </SurfaceCard>
    </section>
  );
}
