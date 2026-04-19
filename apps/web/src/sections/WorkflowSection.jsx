import { SectionIntro } from "../components/SectionIntro.jsx";
import { SurfaceCard } from "../components/SurfaceCard.jsx";

export function WorkflowSection({ id, eyebrow, title, steps }) {
  return (
    <section className="content-section" id={id}>
      <SectionIntro eyebrow={eyebrow} title={title} />
      <div className="workflow-grid">
        {steps.map((step) => (
          <SurfaceCard key={step.index} className="workflow-card">
            <span className="workflow-index">{step.index}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
