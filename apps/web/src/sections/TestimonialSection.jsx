import { SurfaceCard } from "../components/SurfaceCard.jsx";

export function TestimonialSection({ quote, author, role }) {
  return (
    <section className="content-section">
      <SurfaceCard className="testimonial-card">
        <p className="testimonial-quote">“{quote}”</p>
        <div className="testimonial-meta">
          <strong>{author}</strong>
          <span>{role}</span>
        </div>
      </SurfaceCard>
    </section>
  );
}
