export function Badge({ children, color = 'saffron', className = '' }) {
  const colors = {
    saffron: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
    green: "bg-brand-green/10 text-brand-green border-brand-green/20"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}
