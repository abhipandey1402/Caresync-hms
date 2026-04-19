export function AppShell({ theme, children }) {
  const style = {
    "--accent": theme.accent,
    "--accent-strong": theme.accentStrong,
    "--accent-soft": theme.accentSoft,
    "--ink": theme.ink,
    "--muted": theme.muted,
    "--line": theme.line,
    "--canvas": theme.canvas,
    "--surface": theme.surface,
    "--surface-strong": theme.surfaceStrong,
    "--glow": theme.glow,
  };

  return (
    <main className="page-shell" style={style}>
      <div className="page-backdrop" aria-hidden="true" />
      <div className="page-content">{children}</div>
    </main>
  );
}
