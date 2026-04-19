export function SurfaceCard({ className = "", children }) {
  return <article className={`surface-card ${className}`.trim()}>{children}</article>;
}
