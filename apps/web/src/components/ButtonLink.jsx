export function ButtonLink({ href, children, variant = "primary" }) {
  return (
    <a className={`button-link button-link--${variant}`} href={href}>
      {children}
    </a>
  );
}
